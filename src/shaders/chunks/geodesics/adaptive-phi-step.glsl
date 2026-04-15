float adaptivePhiStep(float u, float uPrime, float radialRate) {
  const float PI = 3.14159265359;
  const float PHI_BUDGET = 24.0 * PI;
  const float MIN_STEP_RATIO = 0.01;

  float baseStep = PHI_BUDGET / uMaxSteps;
  float safeU = max(abs(u), EPS);

  float hU = uStepAdapt * safeU / (abs(uPrime) + EPS);
  float hCurv = sqrt(
    2.0 * uStepAdapt * safeU / (abs(d2u_dphi2(u, uRs)) + EPS)
  );

  float step = min(baseStep, min(hU, hCurv));

  float radialGate = smoothstep(0.05, 0.9, abs(radialRate));
  float boost = 1.0 + 1.0 * radialGate;
  step = boost * step;

  float minStep = baseStep * MIN_STEP_RATIO;

  return clamp(step, minStep, baseStep);
}
