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
uniform float uPhiBudget;
uniform float uMinStepRatio;
uniform float uRadialStepBoost;
uniform float uEnableDiscAccumulation;
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
uniform float uDiscInnerSoftness;
uniform float uDiscOuterSoftness;
uniform float uDiscVerticalFalloffPower;

uniform samplerCube uEnvMap;
uniform float uEnvExposure;

const int MAX_STEPS = 1024;
const float EPS = 1e-6;
const float LARGE_VALUE = 1e8;

#include ./chunks/geodesics/schwarzschild-rk4.glsl;
#include ./chunks/geodesics/adaptive-phi-step.glsl;
#include ./chunks/geodesics/geodesic-state.glsl;
#include ./chunks/accretion/accretion-geometry.glsl;
#include ./chunks/accretion/accretion-density.glsl;
#include ./chunks/accretion/accretion-optics.glsl;
#include ./chunks/color/aces-tonemap.glsl;
#include ./chunks/env/env-render.glsl;
#include ./chunks/termination/termination-env.glsl;

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

  float tangentLenSafe = max(tangentLen, EPS);
  vec3 ePhiFallback = normalize(
    cross(
      abs(eRadial0.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0),
      eRadial0
    )
  );
  vec3 ePhi0 = tangentLen > EPS ? (tangent / tangentLen) : ePhiFallback;

  // initial conditions for the ODE (lambda = path parameter)
  float angularMomentum = r0 * tangentLen;
  float u = 1.0 / r0;
  float uPrimeRaw = -(u * radialRate) / tangentLenSafe; // du/dphi (scale-invariant form)
  float uPrime = uPrimeRaw;
  float phi = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    if (float(i) >= uMaxSteps) { break; }

    float uPrev = u;
    float uPrimePrev = uPrime;
    float phiPrev = phi;
    float phiStep = adaptivePhiStep(u, uPrime, radialRate);
    rk4StepSecondOrder(u, uPrime, phiStep, uRs);
    phi += phiStep;

    if (uEnableDiscAccumulation >= 0.5 && uPrev > EPS && u > EPS) {
      vec3 pPrev = geodesicPosition(uPrev, phiPrev, eRadial0, ePhi0);
      vec3 pCurr = geodesicPosition(u, phi, eRadial0, ePhi0);
      float dsInside = 0.0;
      vec3 pMidInside = pPrev;
      if (discSegmentProperties(pPrev, pCurr, dsInside, pMidInside)) {
        float localDensityFactor = discDensityFactor(pMidInside);
        accumulateBeerLambert(
          dsInside,
          localDensityFactor,
          mediumRadiance,
          mediumTransmittance
        );
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
