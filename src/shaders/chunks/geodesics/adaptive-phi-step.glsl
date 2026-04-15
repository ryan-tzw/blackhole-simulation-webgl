float adaptivePhiStep(float u, float uPrime) {
  const float PI = 3.14159265359;
  const float PHI_BUDGET = 24.0 * PI;
  const float MIN_STEP_RATIO = 0.05;
  float safeStepBudget = max(uMaxSteps, 1.0);
  float baseStep = PHI_BUDGET / safeStepBudget;
  float adaptiveStep = uStepAdapt * abs(u) / (abs(uPrime) + EPS);
  float minStep = baseStep * MIN_STEP_RATIO;

  return clamp(min(baseStep, adaptiveStep), minStep, baseStep);
}
