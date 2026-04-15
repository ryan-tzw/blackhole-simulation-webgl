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

bool clipYSlabInterval(vec3 p0, vec3 d, inout float tEnter, inout float tExit) {
  if (abs(d.y) < ACCRETION_EPS) {
    return abs(p0.y) <= uDiscHalfHeight;
  }

  float slabT0 = (-uDiscHalfHeight - p0.y) / d.y;
  float slabT1 = (uDiscHalfHeight - p0.y) / d.y;
  float slabEnter = min(slabT0, slabT1);
  float slabExit = max(slabT0, slabT1);
  tEnter = max(tEnter, slabEnter);
  tExit = min(tExit, slabExit);
  return tEnter < tExit;
}

bool clipOuterCylinderInterval(
  vec3 p0,
  vec3 d,
  float tEnter,
  float tExit,
  out float outerStart,
  out float outerEnd
) {
  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  return cylinderInsideInterval(p0, d, outerRadius, tEnter, tExit, outerStart, outerEnd);
}

void annulusSegmentsFromOuter(
  vec3 p0,
  vec3 d,
  float outerStart,
  float outerEnd,
  out float annulusStartA,
  out float annulusEndA,
  out float annulusSpanA,
  out float annulusStartB,
  out float annulusEndB,
  out float annulusSpanB
) {
  annulusStartA = outerStart;
  annulusEndA = outerEnd;
  annulusStartB = outerStart;
  annulusEndB = outerStart;
  annulusSpanA = max(annulusEndA - annulusStartA, 0.0);
  annulusSpanB = 0.0;

  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  float innerRadius = clamp(uDiscInnerRadius, 0.0, outerRadius - ACCRETION_EPS);
  if (innerRadius <= ACCRETION_EPS) {
    return;
  }

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
  if (!hasInner) {
    return;
  }

  annulusStartA = outerStart;
  annulusEndA = min(innerStart, outerEnd);
  annulusStartB = max(innerEnd, outerStart);
  annulusEndB = outerEnd;
  annulusSpanA = max(annulusEndA - annulusStartA, 0.0);
  annulusSpanB = max(annulusEndB - annulusStartB, 0.0);
}

float chooseAnnulusMidpoint(
  float annulusStartA,
  float annulusEndA,
  float annulusSpanA,
  float annulusStartB,
  float annulusEndB,
  float annulusSpanB
) {
  return annulusSpanA >= annulusSpanB
    ? 0.5 * (annulusStartA + annulusEndA)
    : 0.5 * (annulusStartB + annulusEndB);
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
  if (!clipYSlabInterval(p0, d, tEnter, tExit)) {
    return false;
  }

  // Clip against outer cylinder.
  float outerStart;
  float outerEnd;
  if (!clipOuterCylinderInterval(p0, d, tEnter, tExit, outerStart, outerEnd)) {
    return false;
  }

  // Subtract inner hole and keep up to two annulus spans.
  float annulusStartA = outerStart;
  float annulusEndA = outerEnd;
  float annulusSpanA = max(annulusEndA - annulusStartA, 0.0);
  float annulusStartB = outerStart;
  float annulusEndB = outerStart;
  float annulusSpanB = 0.0;
  annulusSegmentsFromOuter(
    p0,
    d,
    outerStart,
    outerEnd,
    annulusStartA,
    annulusEndA,
    annulusSpanA,
    annulusStartB,
    annulusEndB,
    annulusSpanB
  );

  float annulusSpan = annulusSpanA + annulusSpanB;
  if (annulusSpan <= ACCRETION_EPS) {
    return false;
  }

  float tMid = chooseAnnulusMidpoint(
    annulusStartA,
    annulusEndA,
    annulusSpanA,
    annulusStartB,
    annulusEndB,
    annulusSpanB
  );
  pMidInside = mix(p0, p1, tMid);
  dsInside = segmentLength * annulusSpan;
  return true;
}
