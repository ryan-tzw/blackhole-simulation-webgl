vec2 directionToEquirectUv(vec3 dir) {
  const float INV_PI = 0.31830988618; // 1/pi
  const float INV_TWO_PI = 0.15915494309; // 1/(2*pi)

  float u = atan(dir.z, dir.x) * INV_TWO_PI + 0.5;
  float v = asin(clamp(dir.y, -1.0, 1.0)) * INV_PI + 0.5;
  return vec2(u, v);
}
