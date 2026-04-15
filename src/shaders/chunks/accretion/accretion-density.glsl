float discDensityFactor(vec3 p) {
  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  float innerRadius = clamp(uDiscInnerRadius, 0.0, outerRadius - ACCRETION_EPS);
  float innerSoftness = max(uDiscInnerSoftness, ACCRETION_EPS);
  float outerSoftness = max(uDiscOuterSoftness, ACCRETION_EPS);
  float verticalPower = max(uDiscVerticalFalloffPower, ACCRETION_EPS);

  float r = length(p.xz);
  float innerEnd = min(innerRadius + innerSoftness, outerRadius);
  float outerStart = max(innerRadius, outerRadius - outerSoftness);

  float innerGate = smoothstep(innerRadius, innerEnd, r);
  float outerGate = 1.0 - smoothstep(outerStart, outerRadius, r);

  float verticalBase = clamp(
    1.0 - abs(p.y) / max(uDiscHalfHeight, ACCRETION_EPS),
    0.0,
    1.0
  );
  float verticalGate = pow(verticalBase, verticalPower);

  return innerGate * outerGate * verticalGate;
}
