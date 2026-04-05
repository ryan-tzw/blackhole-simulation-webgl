varying vec2 vUv;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uAspect;

uniform vec3 uBlackHolePosition;
uniform float uBlackHoleRadius;
uniform sampler2D uEnvMap;
uniform float uEnvExposure;

const int MAX_STEPS = 128;
const float STEP_SIZE = 0.1;

bool isInsideBlackHole(vec3 worldPosition) {
  return distance(worldPosition, uBlackHolePosition) <= uBlackHoleRadius;
}

vec2 directionToEquirectUv(vec3 dir) {
  const float INV_PI = 0.31830988618;
  const float INV_TWO_PI = 0.15915494309;

  float u = atan(dir.z, dir.x) * INV_TWO_PI + 0.5;
  float v = asin(clamp(dir.y, -1.0, 1.0)) * INV_PI + 0.5;
  return vec2(u, v);
}

vec3 acesTonemap(vec3 color) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((color * (a * color + b)) / (color * (c * color + d) + e), 0.0, 1.0);
}

vec3 linearToSrgb(vec3 color) {
  return pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;

  float tanHalfFov = tan(uFovY * 0.5);
  vec2 rayPlane = vec2(ndc.x * uAspect * tanHalfFov, ndc.y * tanHalfFov);

  vec3 rayDirection = normalize(
    uCameraForward + rayPlane.x * uCameraRight + rayPlane.y * uCameraUp
  );

  vec3 rayPosition = uCameraPos;
  for (int i = 0; i < MAX_STEPS; i++) {
    rayPosition += rayDirection * STEP_SIZE;
    if (isInsideBlackHole(rayPosition)) {
      gl_FragColor = vec4(vec3(0.0), 1.0);
      return;
    }
  }

  vec2 envUv = directionToEquirectUv(rayDirection);
  vec3 envColor = texture2D(uEnvMap, envUv).rgb * uEnvExposure;
  vec3 toneMapped = acesTonemap(envColor);
  gl_FragColor = vec4(linearToSrgb(toneMapped), 1.0);
}
