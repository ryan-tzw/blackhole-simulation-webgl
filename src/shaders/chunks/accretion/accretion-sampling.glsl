const int MAX_SPAN_SAMPLES = 32;
const float DISC_EMISSION_GAIN_FLOOR = 0.08;

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
  vec3 segmentDir = p1 - p0;
  float segmentDirLen = length(segmentDir);
  vec3 rayDir =
    segmentDirLen > ACCRETION_EPS ? (segmentDir / segmentDirLen) : vec3(0.0, 0.0, 1.0);

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
    float dopplerGain = 1.0;
    vec3 dopplerTint = vec3(1.0);
    float gravRedshiftGain = 1.0;
    vec3 gravRedshiftTint = vec3(1.0);
    discDopplerModulation(p, rayDir, dopplerGain, dopplerTint);
    discGravitationalRedshiftModulation(p, gravRedshiftGain, gravRedshiftTint);
    localEmissionGain *= dopplerGain;
    localEmissionTint *= dopplerTint;
    localEmissionGain *= gravRedshiftGain;
    localEmissionTint *= gravRedshiftTint;
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
