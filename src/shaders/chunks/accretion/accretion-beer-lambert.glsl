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
