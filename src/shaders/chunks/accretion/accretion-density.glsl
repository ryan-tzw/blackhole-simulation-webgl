float discDensityFactor(vec3 p) {
  // Clamp geometry and shaping controls to safe ranges
  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  float innerRadius = clamp(uDiscInnerRadius, 0.0, outerRadius - ACCRETION_EPS);
  float radialSpan = max(outerRadius - innerRadius, ACCRETION_EPS);
  float innerSoftness = max(uDiscInnerSoftness, ACCRETION_EPS);
  float outerSoftness = max(uDiscOuterSoftness, ACCRETION_EPS);
  float verticalPower = max(uDiscVerticalFalloffPower, ACCRETION_EPS);
  float densityRadialPower = max(uDiscDensityRadialPower, 0.0);

  float r = length(p.xz);
  float innerEnd = min(innerRadius + innerSoftness, outerRadius);
  float outerStart = max(innerRadius, outerRadius - outerSoftness);

  // annulus mask between inner and outer disc radii
  float innerGate = smoothstep(innerRadius, innerEnd, r);
  float outerGate = 1.0 - smoothstep(outerStart, outerRadius, r);

  // Vertical profile across disc thickness
  float verticalBase = clamp(
    1.0 - abs(p.y) / max(uDiscHalfHeight, ACCRETION_EPS),
    0.0,
    1.0
  );
  float verticalGate = pow(verticalBase, verticalPower);

  // Radial density decay from inner to outer disc
  float rNorm = clamp((r - innerRadius) / radialSpan, 0.0, 1.0);
  float inward = max(1.0 - rNorm, 0.0);
  float radialFalloff =
    densityRadialPower <= ACCRETION_EPS ? 1.0 : pow(inward, densityRadialPower);

  return innerGate * outerGate * verticalGate * radialFalloff;
}
