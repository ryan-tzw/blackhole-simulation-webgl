const int MAX_SPAN_SAMPLES = 32;

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

float averageDiscDensityFactorOnSpan(
  vec3 p0,
  vec3 p1,
  float t0,
  float t1
) {
  float dt = t1 - t0;
  if (dt <= ACCRETION_EPS) {
    return 0.0;
  }

  int samples = discAdaptiveSpanSamples(p0, p1, t0, t1);
  float invSamples = 1.0 / float(samples);
  float densitySum = 0.0;

  for (int i = 0; i < MAX_SPAN_SAMPLES; i++) {
    if (i >= samples) {
      break;
    }
    float u = (float(i) + 0.5) * invSamples;
    float t = t0 + u * dt;
    densitySum += discDensityFactor(mix(p0, p1, t));
  }

  return densitySum * invSamples;
}

void accumulateBeerLambertForDensity(
  float dsInside, // world-space length inside medium for this span
  float rho,      // effective average density for this span
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
  vec3 sigmaEColor = safeRho * uDiscEmissionStrength * uDiscEmissionColor; // emission coefficient

  // Beer-Lambert extinction and segment-integrated emission.
  float stepTransmittance = exp(-sigmaA * dsInside);
  float absorbedFraction = 1.0 - stepTransmittance;
  float transmittanceBefore = mediumTransmittance;

  mediumRadiance += transmittanceBefore *
                    absorbedFraction *
                    (sigmaEColor / max(sigmaA, ACCRETION_EPS));

  mediumTransmittance = transmittanceBefore * stepTransmittance;
}

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

  float densityFactorBar = averageDiscDensityFactorOnSpan(p0, p1, t0, t1);
  float rhoBar = uDiscDensity * densityFactorBar;
  accumulateBeerLambertForDensity(
    dsInside,
    rhoBar,
    mediumRadiance,
    mediumTransmittance
  );
}
