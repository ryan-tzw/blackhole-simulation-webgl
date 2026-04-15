varying vec2 vUv;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uAspect;

uniform float uRs;
uniform float uMaxSteps;
uniform float uStepAdapt;
uniform float uUseDebugColorOnTerminate;
uniform float uEscapeRadius;
uniform float uEscapeRadiusScale;
uniform vec3 uCaptureColor;
uniform vec3 uMaxIterColor;
uniform float uDiscInnerRadius;
uniform float uDiscOuterRadius;
uniform float uDiscHalfHeight;
uniform float uDiscDensity;
uniform float uDiscAbsorption;
uniform float uDiscEmissionStrength;
uniform vec3 uDiscEmissionColor;

uniform samplerCube uEnvMap;
uniform float uEnvExposure;

const int MAX_STEPS = 1024;
const float EPS = 1e-6;
const float LARGE_VALUE = 1e8;
const float RADIAL_BLEND_IN = 0.002;
const float RADIAL_BLEND_OUT = 0.02;

#include ./chunks/geodesics/schwarzschild-rk4.glsl;
#include ./chunks/geodesics/adaptive-phi-step.glsl;
#include ./chunks/geodesics/geodesic-state.glsl;
#include ./chunks/accretion/accretion-disc.glsl;
#include ./chunks/color/aces-tonemap.glsl;
#include ./chunks/env/env-render.glsl;
#include ./chunks/termination/termination-env.glsl;

void renderNearRadialFallback(vec3 rayDirection, float radialRate) {
  // todo: add straight-line medium accumulation here.
  if (radialRate < 0.0) {
    gl_FragColor = vec4(uCaptureColor, 1.0);
    return;
  }

  renderEnv(rayDirection);
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
  vec3 mediumRadiance = vec3(0.0);
  float mediumTransmittance = 1.0;

  if (r0 <= uRs) {
    renderCaptureWithMedium(mediumRadiance, mediumTransmittance);
    return;
  }

  vec3 eRadial0 = cameraPos / r0; // e means unit vector, so this = unit radial vector
  float radialRate = dot(rayDirection, eRadial0); // radial component of ray velocity
  vec3 tangent = rayDirection - radialRate * eRadial0; // tangent component of ray velocity
  float tangentLen = length(tangent);

  // near-radial trajectory fallback for the singular limit.
  if (tangentLen < RADIAL_BLEND_IN) {
    renderNearRadialFallback(rayDirection, radialRate);
    return;
  }

  float radialBlend = smoothstep(RADIAL_BLEND_IN, RADIAL_BLEND_OUT, tangentLen);
  float tangentLenSafe = mix(RADIAL_BLEND_IN, tangentLen, radialBlend);
  vec3 ePhi0 = tangent / tangentLen;

  // initial conditions for the ODE (lambda = path parameter)
  float angularMomentum = r0 * tangentLen;
  float u = 1.0 / r0;
  float uPrime = -(u * radialRate) / tangentLenSafe; // du/dphi (scale-invariant form)
  float phi = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (float(i) >= uMaxSteps) { break; }

    float uPrev = u;
    float uPrimePrev = uPrime;
    float phiPrev = phi;
    float phiStep = adaptivePhiStep(u, uPrime, radialRate);
    rk4StepSecondOrder(u, uPrime, phiStep, uRs);
    phi += phiStep;

    if (uPrev > EPS && u > EPS) {
      vec3 pPrev = geodesicPosition(uPrev, phiPrev, eRadial0, ePhi0);
      vec3 pCurr = geodesicPosition(u, phi, eRadial0, ePhi0);
      float dsInside = discSegmentLength(pPrev, pCurr);
      if (dsInside > 0.0) {
        accumulateBeerLambert(dsInside, mediumRadiance, mediumTransmittance);
      }
    }

    if (uPrev > EPS && u <= EPS && uPrimePrev < 0.0) {
      renderEnvWithMedium(
        bentRayDirection(
          uPrev,
          uPrimePrev,
          phiPrev,
          angularMomentum,
          eRadial0,
          ePhi0
        ),
        mediumRadiance,
        mediumTransmittance
      );
      return;
    }

    // if (abs(u) > LARGE_VALUE || abs(uPrime) > LARGE_VALUE) {
    //   renderTerminationResult(
    //     rayDirection,
    //     u,
    //     uPrime,
    //     phi,
    //     angularMomentum,
    //     eRadial0,
    //     ePhi0,
    //     false
    //   );
    //   return;
    // }

    // u <= 0 should be physically impossible (negative radius).
    // Treat as unresolved for debug visibility.
    if (u <= EPS) {
      renderTerminationResult(
        rayDirection,
        u,
        uPrime,
        phi,
        angularMomentum,
        eRadial0,
        ePhi0,
        false,
        mediumRadiance,
        mediumTransmittance
      );
      return;
    }

    float r = 1.0 / u;
    if (r <= uRs) {
      renderCaptureWithMedium(mediumRadiance, mediumTransmittance);
      return;
    }

    if (r >= effectiveEscapeRadius && uPrime < 0.0) {
      renderEnvWithMedium(
        bentRayDirection(u, uPrime, phi, angularMomentum, eRadial0, ePhi0),
        mediumRadiance,
        mediumTransmittance
      );
      return;
    }
  }

  renderTerminationResult(
    rayDirection,
    u,
    uPrime,
    phi,
    angularMomentum,
    eRadial0,
    ePhi0,
    true,
    mediumRadiance,
    mediumTransmittance
  );
}
