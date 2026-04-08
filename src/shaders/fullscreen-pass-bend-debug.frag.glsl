varying vec2 vUv;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uAspect;

uniform float uRs;
uniform float uPhiStepMin;
uniform float uPhiStepMax;
uniform float uMaxRelUChange;
uniform float uMaxAbsUPrimeChange;
uniform float uEscapeRadius;
uniform float uEscapeRadiusScale;
uniform vec3 uCaptureColor;
uniform vec3 uEscapeColor;
uniform vec3 uMaxIterColor;

const int MAX_STEPS = 2048;
const float EPS = 1e-6;
const float LARGE_VALUE = 1e8;

#include ./chunks/geodesics/schwarzschild-rk4.glsl;
#include ./chunks/geodesics/adaptive-phi-step.glsl;

void main() {
  // Convert from NDC to world space ray direction
  vec2 ndc = vUv * 2.0 - 1.0;
  float tanHalfFov = tan(uFovY * 0.5);
  vec2 rayPlane = vec2(ndc.x * uAspect * tanHalfFov, ndc.y * tanHalfFov);
  vec3 rayDirection = normalize(
    uCameraForward + rayPlane.x * uCameraRight + rayPlane.y * uCameraUp
  );

  vec3 cameraPos = uCameraPos;
  float r0 = length(cameraPos);
  float effectiveEscapeRadius = max(uEscapeRadius, uEscapeRadiusScale * r0);

  if (r0 <= uRs) {
    gl_FragColor = vec4(uCaptureColor, 1.0);
    return;
  }

  vec3 eRadial = cameraPos / r0; // e means unit vector, so this = unit radial vector
  float radialRate = dot(rayDirection, eRadial); // radial component of ray velocity
  vec3 tangent = rayDirection - radialRate * eRadial; // tangent component of ray velocity
  float tangentLen = length(tangent);

  // near-radial trajectory -> ray goes straight in or out so no need to solve ODE
  if (tangentLen < EPS) {
    gl_FragColor = vec4(radialRate < 0.0 ? uCaptureColor : uEscapeColor, 1.0);
    return;
  }

  // initial conditions for the ODE (lambda = path parameter)
  float u = 1.0 / r0;
  float uPrime = -(u * radialRate) / tangentLen; // du/dphi (scale-invariant form)

  for (int i = 0; i < MAX_STEPS; i++) {
    float phiStep = adaptivePhiStep(u, uPrime, uRs);
    rk4StepSecondOrder(u, uPrime, phiStep, uRs);

    if (abs(u) > LARGE_VALUE || abs(uPrime) > LARGE_VALUE) {
      gl_FragColor = vec4(uMaxIterColor, 1.0);
      return;
    }

    // u <= 0 should be physically impossible (negative radius),
    // but if it happens due to numerical issues we treat it as escape
    if (u <= 0.0) {
      gl_FragColor = vec4(uEscapeColor, 1.0);
      return;
    }

    float r = 1.0 / u;
    if (r <= uRs) {
      gl_FragColor = vec4(uCaptureColor, 1.0);
      return;
    }

    if (r >= effectiveEscapeRadius) {
      gl_FragColor = vec4(uEscapeColor, 1.0);
      return;
    }
  }

  gl_FragColor = vec4(uMaxIterColor, 1.0);
}
