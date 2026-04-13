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
uniform vec3 uMaxIterColor;

uniform samplerCube uEnvMap;
uniform float uEnvExposure;

const int MAX_STEPS = 512;
const float EPS = 1e-6;
const float LARGE_VALUE = 1e8;

#include ./chunks/geodesics/schwarzschild-rk4.glsl;
#include ./chunks/geodesics/adaptive-phi-step.glsl;
#include ./chunks/color/aces-tonemap.glsl;

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
  vec3 cubeDirection = normalize(worldDirection);
  cubeDirection.x *= -1.0;
  vec3 envColor = textureCube(uEnvMap, cubeDirection).rgb * uEnvExposure;
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
  float effectiveEscapeRadius = max(uEscapeRadius, uEscapeRadiusScale * r0);
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

  // initial conditions for the ODE (lambda = path parameter)
  float angularMomentum = r0 * tangentLen;
  float u = 1.0 / r0;
  float uPrime = -(u * radialRate) / tangentLen; // du/dphi (scale-invariant form)
  float phi = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    float phiStep = adaptivePhiStep(u, uPrime, uRs);
    rk4StepSecondOrder(u, uPrime, phiStep, uRs);
    phi += phiStep;

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

    if (r >= effectiveEscapeRadius) {
      renderEnv(bentRayDirection(u, uPrime, phi, angularMomentum, eRadial0, ePhi0));
      return;
    }
  }

  gl_FragColor = vec4(uMaxIterColor, 1.0);
}
