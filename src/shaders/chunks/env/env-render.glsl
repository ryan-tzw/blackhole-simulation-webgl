vec3 sampleEnvLinear(vec3 worldDirection) {
  vec3 cubeDirection = normalize(worldDirection);
  cubeDirection.x *= -1.0;
  return textureCube(uEnvMap, cubeDirection).rgb * uEnvExposure;
}

void writeLinearColor(vec3 linearColor) {
  gl_FragColor = vec4(linearColor, 1.0);
}

void renderEnv(vec3 worldDirection) {
  writeLinearColor(sampleEnvLinear(worldDirection));
}

void renderCaptureWithMedium(vec3 mediumRadiance, float mediumTransmittance) {
  writeLinearColor(mediumRadiance + mediumTransmittance * uCaptureColor);
}

void renderEnvWithMedium(
  vec3 worldDirection,
  vec3 mediumRadiance,
  float mediumTransmittance
) {
  vec3 envLinear = sampleEnvLinear(worldDirection);
  writeLinearColor(mediumRadiance + mediumTransmittance * envLinear);
}
