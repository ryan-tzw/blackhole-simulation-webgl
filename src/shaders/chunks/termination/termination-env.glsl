void renderTerminationResult(
  vec3 fallbackDirection,
  float u,
  float uPrime,
  float phi,
  float angularMomentum,
  vec3 eRadial0,
  vec3 ePhi0,
  bool hasGeodesicState,
  vec3 mediumRadiance,
  float mediumTransmittance
) {
  if (uUseDebugColorOnTerminate >= 0.5) {
    gl_FragColor = vec4(uMaxIterColor, 1.0);
    return;
  }

  if (hasGeodesicState) {
    renderEnvWithMedium(
      bentRayDirection(u, uPrime, phi, angularMomentum, eRadial0, ePhi0),
      mediumRadiance,
      mediumTransmittance
    );
    return;
  }

  renderEnvWithMedium(fallbackDirection, mediumRadiance, mediumTransmittance);
}
