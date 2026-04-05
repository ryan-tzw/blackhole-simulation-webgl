varying vec2 vUv;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uAspect;

void main() {
  // map from [0, 1] to [-1, 1]
  vec2 ndc = vUv * 2.0 - 1.0;

  float tanHalfFov = tan(uFovY * 0.5);
  vec2 rayPlane = vec2(ndc.x * uAspect * tanHalfFov, ndc.y * tanHalfFov);

  vec3 rayDirection = normalize(
    uCameraForward + rayPlane.x * uCameraRight + rayPlane.y * uCameraUp
  );

  vec3 debugColor = 0.5 * (rayDirection + vec3(1.0));
  gl_FragColor = vec4(debugColor, 1.0);
}
