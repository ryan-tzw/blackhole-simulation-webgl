float adaptivePhiStep(float u, float uPrime, float rs) {
  float safeU = max(abs(u), EPS);
  float safeUPrime = max(abs(uPrime), EPS);
  float safeCurvature = max(abs(d2u_dphi2(u, rs)), EPS);

  float stepFromRelU = uMaxRelUChange * safeU / safeUPrime;
  float stepFromCurvature = uMaxAbsUPrimeChange / safeCurvature;
  float step = min(stepFromRelU, stepFromCurvature);

  return clamp(step, uPhiStepMin, uPhiStepMax);
}
