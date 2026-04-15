void accumulateBeerLambert(
  float dsInside, // world-space length of ray segment inside the disc
  float localDensityFactor,
  inout vec3 mediumRadiance,
  inout float mediumTransmittance
) {
  if (dsInside <= 0.0 || mediumTransmittance <= ACCRETION_EPS) {
    return;
  }

  float rho = uDiscDensity * max(localDensityFactor, 0.0);
  if (rho <= ACCRETION_EPS) {
    return;
  }

  float sigmaA = rho * uDiscAbsorption; // extinction/absorption coefficient
  vec3 sigmaEColor = rho * uDiscEmissionStrength * uDiscEmissionColor; // emission coefficient

  // Beer-Lambert extinction and segment-integrated emission.
  float stepTransmittance = exp(-sigmaA * dsInside);
  float absorbedFraction = 1.0 - stepTransmittance;
  float transmittanceBefore = mediumTransmittance;

  mediumRadiance += transmittanceBefore *
                    absorbedFraction *
                    (sigmaEColor / max(sigmaA, ACCRETION_EPS));

  mediumTransmittance = transmittanceBefore * stepTransmittance;
}
