varying vec2 vUv;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uAspect;

uniform float uRs;
uniform float uPhiStep;
uniform float uEscapeRadius;
uniform vec3 uCaptureColor;
uniform vec3 uEscapeColor;
uniform vec3 uMaxIterColor;

const int MAX_STEPS = 2048;
const float EPS = 1e-6;
const float LARGE_VALUE = 1e8;

float d2u_dphi2(float u, float rs) {
  return -u + 1.5 * rs * u * u;
}

// Performs a single RK4 step for the second-order ODE d2u/dphi2 = f(u) = - u + 1.5 * rs * u^2
// h = step size in phi (delta phi), uPrime = du/dphi, rs = Schwarzschild radius
// refer to: https://en.wikipedia.org/wiki/Schwarzschild_geodesics
void rk4StepSecondOrder(inout float u, inout float uPrime, float h, float rs) {
  float uPrime0 = uPrime;
  float k1 = d2u_dphi2(u, rs);
  float k2 = d2u_dphi2(u + 0.5 * h * uPrime0, rs);
  float k3 = d2u_dphi2(u + 0.5 * h * uPrime0 + 0.25 * h * h * k1, rs);
  float k4 = d2u_dphi2(u + h * uPrime0 + 0.5 * h * h * k2, rs);

  uPrime += (h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4);
  u += h * uPrime0 + (h * h / 6.0) * (k1 + k2 + k3);
}

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

  if (r0 <= uRs) {
    gl_FragColor = vec4(uCaptureColor, 1.0);
    return;
  }

  vec3 eRadial = cameraPos / r0; // e means unit vector, so this = unit radial vector
  float radialRate = dot(rayDirection, eRadial);
  vec3 tangent = rayDirection - radialRate * eRadial;
  float tangentLen = length(tangent);

  if (tangentLen < EPS) {
    gl_FragColor = vec4(radialRate < 0.0 ? uCaptureColor : uEscapeColor, 1.0);
    return;
  }

  vec3 ePhi = tangent / tangentLen;
  float dphi_dlambda = dot(rayDirection, ePhi) / r0;
  if (abs(dphi_dlambda) < EPS) {
    gl_FragColor = vec4(uMaxIterColor, 1.0);
    return;
  }

  // initial conditions for the ODE (lambda is a path parameter, not spacetime interval)
  float u = 1.0 / r0;
  float du_dlambda = -u * u * radialRate;
  float uPrime = du_dlambda / dphi_dlambda;

  for (int i = 0; i < MAX_STEPS; i++) {
    rk4StepSecondOrder(u, uPrime, uPhiStep, uRs);

    if (abs(u) > LARGE_VALUE || abs(uPrime) > LARGE_VALUE) {
      gl_FragColor = vec4(uMaxIterColor, 1.0);
      return;
    }

    if (u <= 0.0) {
      gl_FragColor = vec4(uEscapeColor, 1.0);
      return;
    }

    float r = 1.0 / u;
    if (r <= uRs) {
      gl_FragColor = vec4(uCaptureColor, 1.0);
      return;
    }

    if (r >= uEscapeRadius) {
      gl_FragColor = vec4(uEscapeColor, 1.0);
      return;
    }
  }

  gl_FragColor = vec4(uMaxIterColor, 1.0);
}
