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
uniform vec3 uMaxIterColor;

uniform sampler2D uEnvMap;
uniform float uEnvExposure;

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

vec2 directionToEquirectUv(vec3 dir) {
  const float INV_PI = 0.31830988618;
  const float INV_TWO_PI = 0.15915494309;

  float u = atan(dir.z, dir.x) * INV_TWO_PI + 0.5;
  float v = asin(clamp(dir.y, -1.0, 1.0)) * INV_PI + 0.5;
  return vec2(u, v);
}

vec3 acesTonemap(vec3 v) {
  const float a = 2.51;
  const float b = 0.03;
  const float c = 2.43;
  const float d = 0.59;
  const float e = 0.14;
  return clamp((v * (a * v + b)) / (v * (c * v + d) + e), 0.0, 1.0);
}

vec3 linearToSrgb(vec3 color) {
  return pow(clamp(color, 0.0, 1.0), vec3(1.0 / 2.2));
}

// Converts integrated 2D geodesic state back to world-space ray direction
vec3 bentRayDirection(
  float u,
  float uPrime,
  float phi,
  float angularMomentum,
  vec3 eRadial0,
  vec3 ePhi0
) {
  // eRadial0/ePhi0 = initial radial and azimuthal unit vectors at the camera position
  // rotate by azimuthal angle phi to get current radial and azimuthal unit vectors
  float cosPhi = cos(phi);
  float sinPhi = sin(phi);
  vec3 eRadial = cosPhi * eRadial0 + sinPhi * ePhi0;
  vec3 ePhi = -sinPhi * eRadial0 + cosPhi * ePhi0;

  float safeU = max(u, EPS);

  float dphi_dlambda = angularMomentum * safeU * safeU;
  float du_dlambda = uPrime * dphi_dlambda;
  float dr_dlambda = -du_dlambda / (safeU * safeU);
  float r = 1.0 / safeU;

  return normalize(dr_dlambda * eRadial + (r * dphi_dlambda) * ePhi);
}

void renderEnv(vec3 worldDirection) {
  vec2 envUv = directionToEquirectUv(normalize(worldDirection));
  vec3 envColor = texture2D(uEnvMap, envUv).rgb * uEnvExposure;
  vec3 toneMapped = acesTonemap(envColor);
  gl_FragColor = vec4(linearToSrgb(toneMapped), 1.0);
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

  vec3 eRadial0 = cameraPos / r0; // e means unit vector, so this = unit radial vector
  float radialRate = dot(rayDirection, eRadial0); // radial component of ray velocity
  vec3 tangent = rayDirection - radialRate * eRadial0; // tangent component of ray velocity
  float tangentLen = length(tangent);

  // near-radial trajectory -> ray goes straight in or out so no need to solve ODE
  if (tangentLen < EPS) {
    if (radialRate < 0.0) {
      gl_FragColor = vec4(uCaptureColor, 1.0);
      return;
    }

    renderEnv(rayDirection);
    return;
  }

  vec3 ePhi0 = tangent / tangentLen;
  float dphi_dlambda0 = dot(rayDirection, ePhi0) / r0; // rate of change of azimuthal angle phi wrt. path param lambda
  if (abs(dphi_dlambda0) < EPS) {
    gl_FragColor = vec4(uMaxIterColor, 1.0);
    return;
  }

  // initial conditions for the ODE (lambda = path parameter)
  float angularMomentum = (r0 * r0) * dphi_dlambda0;
  float u = 1.0 / r0;
  float du_dlambda = -u * u * radialRate;
  float uPrime = du_dlambda / dphi_dlambda0; // du/dphi
  float phi = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    rk4StepSecondOrder(u, uPrime, uPhiStep, uRs);
    phi += uPhiStep;

    if (abs(u) > LARGE_VALUE || abs(uPrime) > LARGE_VALUE) {
      gl_FragColor = vec4(uMaxIterColor, 1.0);
      return;
    }

    // u <= 0 should be physically impossible (negative radius),
    // but if it happens due to numerical issues we treat it as escape
    if (u <= EPS) {
      renderEnv(bentRayDirection(max(u, EPS), uPrime, phi, angularMomentum, eRadial0, ePhi0));
      return;
    }

    float r = 1.0 / u;
    if (r <= uRs) {
      gl_FragColor = vec4(uCaptureColor, 1.0);
      return;
    }

    if (r >= uEscapeRadius) {
      renderEnv(bentRayDirection(u, uPrime, phi, angularMomentum, eRadial0, ePhi0));
      return;
    }
  }

  gl_FragColor = vec4(uMaxIterColor, 1.0);
}
