float adaptivePhiStep(float u, float uPrime, float radialRate) {
  float safeMaxSteps = max(uMaxSteps, 1.0);
  float baseStep = uPhiBudget / safeMaxSteps;
  float safeU = max(abs(u), EPS);

  // step limit from first and second order change (u' and u'')
  float hU = uStepAdapt * safeU / (abs(uPrime) + EPS);
  float hCurv = sqrt(
    2.0 * uStepAdapt * safeU / (abs(d2u_dphi2(u, uRs)) + EPS)
  );

  float step = min(baseStep, min(hU, hCurv));

  float radialGate = smoothstep(0.05, 0.9, abs(radialRate));
  float boost = 1.0 + uRadialStepBoost * radialGate;
  step = boost * step;

  float minStep = baseStep * clamp(uMinStepRatio, 0.0, 1.0);

  return clamp(step, minStep, baseStep);
}
