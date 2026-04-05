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
  vec3 envColor = texture2D(uEnvMap, envUv).rgb;
  gl_FragColor = vec4(envColor, 1.0);
}
