const float ACCRETION_EPS = 1e-6;

// Returns interval [intervalStart, intervalEnd] along p(t)=p0+t*d that lies
// inside an infinite Y-aligned cylinder with given radius, clipped to [tMin, tMax].
bool cylinderInsideInterval(
  vec3 p0,
  vec3 d,
  float radius,
  float tMin,
  float tMax,
  out float intervalStart,
  out float intervalEnd
) {
  intervalStart = tMin;
  intervalEnd = tMin;

  if (tMax <= tMin) {
    return false;
  }

  float rr = radius * radius;
  float a = d.x * d.x + d.z * d.z;
  float b = 2.0 * (p0.x * d.x + p0.z * d.z);
  float c = p0.x * p0.x + p0.z * p0.z - rr;

  if (a < ACCRETION_EPS) {
    if (c <= 0.0) {
      intervalStart = tMin;
      intervalEnd = tMax;
      return true;
    }
    return false;
  }

  float discriminant = b * b - 4.0 * a * c;
  if (discriminant < 0.0) {
    return false;
  }

  float sqrtDiscriminant = sqrt(max(discriminant, 0.0));
  float invTwoA = 0.5 / a;
  float t0 = (-b - sqrtDiscriminant) * invTwoA;
  float t1 = (-b + sqrtDiscriminant) * invTwoA;

  intervalStart = max(tMin, min(t0, t1));
  intervalEnd = min(tMax, max(t0, t1));
  return intervalEnd > intervalStart;
}

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

// Returns segment length inside the disc and a representative midpoint for
// density sampling. Volume = slab |y| <= uDiscHalfHeight intersect annulus
// uDiscInnerRadius <= sqrt(x^2+z^2) <= uDiscOuterRadius.
bool discSegmentProperties(
  vec3 p0,
  vec3 p1,
  out float dsInside,
  out vec3 pMidInside
) {
  dsInside = 0.0;
  pMidInside = p0;

  vec3 d = p1 - p0;
  float segmentLength = length(d);
  if (segmentLength <= ACCRETION_EPS) {
    return false;
  }

  float tEnter = 0.0;
  float tExit = 1.0;

  // Clip against slab.
  if (abs(d.y) < ACCRETION_EPS) {
    if (abs(p0.y) > uDiscHalfHeight) {
      return false;
    }
  } else {
    float slabT0 = (-uDiscHalfHeight - p0.y) / d.y;
    float slabT1 = (uDiscHalfHeight - p0.y) / d.y;
    float slabEnter = min(slabT0, slabT1);
    float slabExit = max(slabT0, slabT1);
    tEnter = max(tEnter, slabEnter);
    tExit = min(tExit, slabExit);
    if (tEnter >= tExit) {
      return false;
    }
  }

  // Clip against annulus and return remaining span.
  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  float innerRadius = clamp(uDiscInnerRadius, 0.0, outerRadius - ACCRETION_EPS);
  float outerStart;
  float outerEnd;
  if (!cylinderInsideInterval(p0, d, outerRadius, tEnter, tExit, outerStart, outerEnd)) {
    return false;
  }

  float annulusStartA = outerStart;
  float annulusEndA = outerEnd;
  float annulusStartB = outerStart;
  float annulusEndB = outerStart;
  float annulusSpanA = max(annulusEndA - annulusStartA, 0.0);
  float annulusSpanB = 0.0;

  if (innerRadius > ACCRETION_EPS) {
    float innerStart;
    float innerEnd;
    bool hasInner = cylinderInsideInterval(
      p0,
      d,
      innerRadius,
      outerStart,
      outerEnd,
      innerStart,
      innerEnd
    );

    if (hasInner) {
      annulusStartA = outerStart;
      annulusEndA = min(innerStart, outerEnd);
      annulusStartB = max(innerEnd, outerStart);
      annulusEndB = outerEnd;
      annulusSpanA = max(annulusEndA - annulusStartA, 0.0);
      annulusSpanB = max(annulusEndB - annulusStartB, 0.0);
    }
  }

  float annulusSpan = annulusSpanA + annulusSpanB;
  if (annulusSpan <= ACCRETION_EPS) {
    return false;
  }

  float tMid = annulusSpanA >= annulusSpanB
    ? 0.5 * (annulusStartA + annulusEndA)
    : 0.5 * (annulusStartB + annulusEndB);
  pMidInside = mix(p0, p1, tMid);
  dsInside = segmentLength * annulusSpan;
  return true;
}

void accumulateBeerLambert(
  float dsInside, // world-space length of ray segment inside the disc
  float localDensityFactor,
  inout vec3 mediumRadiance,
  inout float mediumTransmittance
) {
  if (dsInside <= 0.0 || mediumTransmittance <= ACCRETION_EPS) {
    return;
  }

  float rho = uDiscDensity * max(localDensityFactor, 0.0);
  if (rho <= ACCRETION_EPS) {
    return;
  }

  float sigmaA = rho * uDiscAbsorption; // extinction/absorption coefficient
  vec3 sigmaEColor = rho * uDiscEmissionStrength * uDiscEmissionColor; // emission coefficient

  // Beer-Lambert extinction and segment-integrated emission.
  float stepTransmittance = exp(-sigmaA * dsInside);
  float absorbedFraction = 1.0 - stepTransmittance;
  float transmittanceBefore = mediumTransmittance;

  mediumRadiance += transmittanceBefore *
                    absorbedFraction *
                    (sigmaEColor / max(sigmaA, ACCRETION_EPS));

  mediumTransmittance = transmittanceBefore * stepTransmittance;
}
