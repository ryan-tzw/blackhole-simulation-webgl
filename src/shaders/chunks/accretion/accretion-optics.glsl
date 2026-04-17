const int MAX_SPAN_SAMPLES = 32;
const float DISC_EMISSION_GAIN_FLOOR = 0.08;
const float DISC_SPIN_EXPONENT = -1.5;
const float DISC_MIN_CYCLE_SECONDS = 0.05;

// Maps quality slider (1..3) to a base substep count per span.
int discBaseSamplesFromQuality() {
  int quality = int(clamp(floor(uDiscIntegrationQuality + 0.5), 1.0, 3.0));
  if (quality <= 1) {
    return 4;
  }
  if (quality == 2) {
    return 8;
  }
  return 16;
}

// Adapts span sample count using vertical travel to reduce under-sampling bands.
int discAdaptiveSpanSamples(vec3 p0, vec3 p1, float t0, float t1) {
  float tSpan = max(t1 - t0, 0.0);
  if (tSpan <= ACCRETION_EPS) {
    return 1;
  }

  float dySpan = abs((p1.y - p0.y) * tSpan);
  float maxDy = max(
    uDiscHalfHeight / (2.0 + 2.0 * uDiscVerticalFalloffPower),
    ACCRETION_EPS
  );
  int yDrivenSamples = int(ceil(dySpan / maxDy));
  int baseSamples = discBaseSamplesFromQuality();
  int n = max(baseSamples, yDrivenSamples);
  return clamp(n, 1, MAX_SPAN_SAMPLES);
}

vec2 rotateXZ(vec2 xz, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * xz.x - s * xz.y, s * xz.x + c * xz.y);
}

float discSpinOmega(vec3 p) {
  float spinSpeed = max(uDiscSpinSpeed, 0.0);
  float maxOmega = max(uDiscSpinMaxOmega, 0.0);
  if (spinSpeed <= ACCRETION_EPS || maxOmega <= ACCRETION_EPS) {
    return 0.0;
  }

  float rRef = max(uDiscInnerRadius, ACCRETION_EPS);
  float r = max(length(p.xz), rRef);
  float omegaKepler = spinSpeed * pow(max(r / rRef, ACCRETION_EPS), DISC_SPIN_EXPONENT);
  return min(omegaKepler, maxOmega);
}

float sampleDiscNoiseLeapfrog(vec3 p) {
  float cycle = max(uDiscAdvectionCycleSeconds, DISC_MIN_CYCLE_SECONDS);
  float blendFrac = clamp(uDiscAdvectionBlendFraction, 0.0, 0.49);
  float phase = fract(uTime / cycle);
  float omega = discSpinOmega(p);

  float ageA = phase * cycle;
  float ageB = fract(phase + 0.5) * cycle;

  vec3 pA = vec3(rotateXZ(p.xz, -omega * ageA), p.y);
  vec3 pB = vec3(rotateXZ(p.xz, -omega * ageB), p.y);
  float noiseA = texture(uDiscNoiseTex, fract(pA * uDiscNoiseScale)).r;
  float noiseB = texture(uDiscNoiseTex, fract(pB * uDiscNoiseScale)).r;

  if (blendFrac <= ACCRETION_EPS) {
    return phase < 0.5 ? noiseB : noiseA;
  }

  float firstBlendStart = 0.5 - blendFrac;
  float secondBlendStart = 1.0 - blendFrac;
  if (phase < firstBlendStart) {
    return noiseB;
  }
  if (phase < 0.5) {
    float t = smoothstep(firstBlendStart, 0.5, phase);
    return mix(noiseB, noiseA, t);
  }
  if (phase < secondBlendStart) {
    return noiseA;
  }

  float t = smoothstep(secondBlendStart, 1.0, phase);
  return mix(noiseA, noiseB, t);
}

// Samples local density from disc profile multiplied by leapfrog-advected noise.
float discLocalDensitySample(vec3 p) {
  float baseDensity = discDensityFactor(p);
  float noiseValue = sampleDiscNoiseLeapfrog(p);
  float noiseMod = mix(1.0, noiseValue, uDiscNoiseStrength);
  return baseDensity * noiseMod;
}

// Precomputes stable radial-emission parameters used for per-substep evaluation.
void discRadialEmissionParams(
  out float innerRadius,
  out float radialSpan,
  out float emissionRadialPower,
  out float emissionColorCurve
) {
  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  innerRadius = clamp(uDiscInnerRadius, 0.0, outerRadius - ACCRETION_EPS);
  radialSpan = max(outerRadius - innerRadius, ACCRETION_EPS);
  emissionRadialPower = max(uDiscEmissionRadialPower, 0.0);
  emissionColorCurve = max(uDiscEmissionColorCurve, 0.0);
}

// Computes local emission gain and tint from normalized radial position.
void discLocalEmissionProfile(
  vec3 p,
  float innerRadius,
  float radialSpan,
  float emissionRadialPower,
  float emissionColorCurve,
  out float localEmissionGain,
  out vec3 localEmissionTint
) {
  float r = length(p.xz);
  float rNorm = clamp((r - innerRadius) / radialSpan, 0.0, 1.0);
  float inwardFactor = max(1.0 - rNorm, 0.0);
  float rawEmissionGain =
    emissionRadialPower <= ACCRETION_EPS ?
    1.0 :
    pow(inwardFactor, emissionRadialPower);
  // Keep outer disc emissive even at extreme radial power (very dim, not black).
  localEmissionGain = mix(DISC_EMISSION_GAIN_FLOOR, 1.0, rawEmissionGain);
  float colorMix =
    emissionColorCurve <= ACCRETION_EPS ?
    1.0 :
    pow(inwardFactor, emissionColorCurve);
  localEmissionTint = mix(
    uDiscEmissionOuterColor,
    uDiscEmissionInnerColor,
    colorMix
  );
}

// Accumulates density-weighted sums used to build span-averaged optics.
void accumulateWeightedDiscOpticsSample(
  float localDensity,
  float localEmissionGain,
  vec3 localEmissionTint,
  inout float densitySum,
  inout float emissionGainWeightedSum,
  inout vec3 emissionTintWeightedSum
) {
  densitySum += localDensity;
  emissionGainWeightedSum += localDensity * localEmissionGain;
  emissionTintWeightedSum += localDensity * localEmissionTint;
}

// Averages density and radial emission terms over one clipped disc span.
void averageDiscOpticsOnSpan(
  vec3 p0,
  vec3 p1,
  float t0,
  float t1,
  out float densityFactorBar,
  out float emissionGainBar,
  out vec3 emissionTintBar
) {
  densityFactorBar = 0.0;
  emissionGainBar = 1.0;
  emissionTintBar = vec3(1.0);

  float dt = t1 - t0;
  if (dt <= ACCRETION_EPS) {
    return;
  }

  int samples = discAdaptiveSpanSamples(p0, p1, t0, t1);
  float invSamples = 1.0 / float(samples);
  float densitySum = 0.0;
  float emissionGainWeightedSum = 0.0;
  vec3 emissionTintWeightedSum = vec3(0.0);
  float innerRadius = 0.0;
  float radialSpan = 1.0;
  float emissionRadialPower = 0.0;
  float emissionColorCurve = 0.0;
  discRadialEmissionParams(
    innerRadius,
    radialSpan,
    emissionRadialPower,
    emissionColorCurve
  );

  for (int i = 0; i < MAX_SPAN_SAMPLES; i++) {
    if (i >= samples) {
      break;
    }
    float u = (float(i) + 0.5) * invSamples;
    float t = t0 + u * dt;
    vec3 p = mix(p0, p1, t);
    float localDensity = discLocalDensitySample(p);
    float localEmissionGain = 1.0;
    vec3 localEmissionTint = vec3(1.0);
    discLocalEmissionProfile(
      p,
      innerRadius,
      radialSpan,
      emissionRadialPower,
      emissionColorCurve,
      localEmissionGain,
      localEmissionTint
    );
    accumulateWeightedDiscOpticsSample(
      localDensity,
      localEmissionGain,
      localEmissionTint,
      densitySum,
      emissionGainWeightedSum,
      emissionTintWeightedSum
    );
  }

  densityFactorBar = densitySum * invSamples;

  if (densitySum > ACCRETION_EPS) {
    emissionGainBar = emissionGainWeightedSum / densitySum;
    emissionTintBar = emissionTintWeightedSum / densitySum;
  }
}

// Applies Beer-Lambert absorption + emission for one span-averaged medium segment.
void accumulateBeerLambertForDensity(
  float dsInside, // world-space length inside medium for this span
  float rho,      // effective average density for this span
  float emissionGainBar,
  vec3 emissionTintBar,
  inout vec3 mediumRadiance,
  inout float mediumTransmittance
) {
  if (dsInside <= 0.0 || mediumTransmittance <= ACCRETION_EPS) {
    return;
  }

  float safeRho = max(rho, 0.0);
  if (safeRho <= ACCRETION_EPS) {
    return;
  }

  float sigmaA = safeRho * uDiscAbsorption; // extinction/absorption coefficient
  vec3 sigmaEColor = safeRho * uDiscEmissionStrength * emissionGainBar *
                     emissionTintBar; // emission coefficient

  // Beer-Lambert extinction and segment-integrated emission.
  float stepTransmittance = exp(-sigmaA * dsInside);
  float absorbedFraction = 1.0 - stepTransmittance;
  float transmittanceBefore = mediumTransmittance;

  mediumRadiance += transmittanceBefore *
                    absorbedFraction *
                    (sigmaEColor / max(sigmaA, ACCRETION_EPS));

  mediumTransmittance = transmittanceBefore * stepTransmittance;
}

// Integrates one clipped annulus span and composites it front-to-back.
void accumulateBeerLambertSpan(
  vec3 p0,
  vec3 p1,
  float segmentLength,
  float t0,
  float t1,
  inout vec3 mediumRadiance,
  inout float mediumTransmittance
) {
  float tSpan = t1 - t0;
  if (tSpan <= ACCRETION_EPS) {
    return;
  }

  float dsInside = segmentLength * tSpan;
  if (dsInside <= ACCRETION_EPS || mediumTransmittance <= ACCRETION_EPS) {
    return;
  }

  float densityFactorBar = 0.0;
  float emissionGainBar = 1.0;
  vec3 emissionTintBar = vec3(1.0);
  averageDiscOpticsOnSpan(
    p0,
    p1,
    t0,
    t1,
    densityFactorBar,
    emissionGainBar,
    emissionTintBar
  );
  float rhoBar = uDiscDensity * densityFactorBar;
  accumulateBeerLambertForDensity(
    dsInside,
    rhoBar,
    emissionGainBar,
    emissionTintBar,
    mediumRadiance,
    mediumTransmittance
  );
}
