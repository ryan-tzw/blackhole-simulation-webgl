const float ACCRETION_EPS = 1e-6;

// returns how much of the ray segment from p0 to p1 lies inside
// an infinite cylinder of given radius, between tMin and tMax.
float cylinderInsideSpan(
  vec3 p0,
  vec3 d,
  float radius,
  float tMin,
  float tMax
) {
  if (tMax <= tMin) {
    return 0.0;
  }

  float rr = radius * radius;
  float a = d.x * d.x + d.z * d.z;
  float b = 2.0 * (p0.x * d.x + p0.z * d.z);
  float c = p0.x * p0.x + p0.z * p0.z - rr;

  if (a < ACCRETION_EPS) {
    return c <= 0.0 ? (tMax - tMin) : 0.0;
  }

  float discriminant = b * b - 4.0 * a * c;
  if (discriminant < 0.0) {
    return 0.0;
  }

  float sqrtDiscriminant = sqrt(max(discriminant, 0.0));
  float invTwoA = 0.5 / a;
  float t0 = (-b - sqrtDiscriminant) * invTwoA;
  float t1 = (-b + sqrtDiscriminant) * invTwoA;

  float enter = max(tMin, min(t0, t1));
  float exit = min(tMax, max(t0, t1));
  return max(exit - enter, 0.0);
}

// Returns world-space segment length that lies inside the disc volume.
// Volume = intersection of slab |y| <= uDiscHalfHeight and annulus
// uDiscInnerRadius <= sqrt(x^2+z^2) <= uDiscOuterRadius.
float discSegmentLength(vec3 p0, vec3 p1) {
  vec3 d = p1 - p0;
  float segmentLength = length(d);
  if (segmentLength <= ACCRETION_EPS) {
    return 0.0;
  }

  float tEnter = 0.0;
  float tExit = 1.0;

  // Clip against slab.
  if (abs(d.y) < ACCRETION_EPS) {
    if (abs(p0.y) > uDiscHalfHeight) {
      return 0.0;
    }
  } else {
    float slabT0 = (-uDiscHalfHeight - p0.y) / d.y;
    float slabT1 = (uDiscHalfHeight - p0.y) / d.y;
    float slabEnter = min(slabT0, slabT1);
    float slabExit = max(slabT0, slabT1);
    tEnter = max(tEnter, slabEnter);
    tExit = min(tExit, slabExit);
    if (tEnter >= tExit) {
      return 0.0;
    }
  }

  // Clip against annulus and return length of remaining segment
  float outerRadius = max(uDiscOuterRadius, ACCRETION_EPS);
  float innerRadius = clamp(uDiscInnerRadius, 0.0, outerRadius - ACCRETION_EPS);
  float outerSpan = cylinderInsideSpan(p0, d, outerRadius, tEnter, tExit);
  float innerSpan = cylinderInsideSpan(p0, d, innerRadius, tEnter, tExit);
  float annulusSpan = max(outerSpan - innerSpan, 0.0);
  return segmentLength * annulusSpan;
}

void accumulateBeerLambert(
  float dsInside, // world-space length of ray segment inside the disc
  inout vec3 mediumRadiance,
  inout float mediumTransmittance
) {
  if (dsInside <= 0.0 || mediumTransmittance <= ACCRETION_EPS) {
    return;
  }

  float sigmaA = uDiscDensity * uDiscAbsorption; // extinction/absorption coefficient
  vec3 sigmaEColor = uDiscDensity * uDiscEmissionStrength * uDiscEmissionColor; // emission coefficient

  // Beer-Lambert extinction and segment-integrated emission.
  float stepTransmittance = exp(-sigmaA * dsInside);
  float absorbedFraction = 1.0 - stepTransmittance;
  float transmittanceBefore = mediumTransmittance;

  mediumRadiance += transmittanceBefore *
                    absorbedFraction *
                    (sigmaEColor / max(sigmaA, ACCRETION_EPS));

  mediumTransmittance = transmittanceBefore * stepTransmittance;
}
