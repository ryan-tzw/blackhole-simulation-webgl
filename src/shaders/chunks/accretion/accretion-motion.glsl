const float DISC_SPIN_EXPONENT = -1.5;
const float DISC_MIN_CYCLE_SECONDS = 0.05;
const float DISC_MAX_BEAMING = 12.0;
const float DISC_MIN_BEAMING = 0.12;
const vec3 DISC_DOPPLER_BLUE_TINT = vec3(0.78, 0.90, 1.28);
const vec3 DISC_DOPPLER_RED_TINT = vec3(1.28, 0.84, 0.74);
const vec3 DISC_GRAV_BLUE_TINT = vec3(0.92, 0.96, 1.08);
const vec3 DISC_GRAV_RED_TINT = vec3(1.18, 0.86, 0.78);

// Rotates an XZ position around +Y by an angle in radians.
vec2 rotateXZ(vec2 xz, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * xz.x - s * xz.y, s * xz.x + c * xz.y);
}

// Computes local orbital angular speed from a clamped Kepler-like profile.
float discSpinOmega(vec3 p) {
  float spinSpeed = max(uDiscSpinSpeed, 0.0);
  float maxOmega = max(uDiscSpinMaxOmega, 0.0);
  if (spinSpeed <= ACCRETION_EPS || maxOmega <= ACCRETION_EPS) {
    return 0.0;
  }

  float rRef = max(uDiscInnerRadius, ACCRETION_EPS);
  float r = max(length(p.xz), rRef);
  float omegaKepler = spinSpeed * pow(max(r / rRef, ACCRETION_EPS), DISC_SPIN_EXPONENT);
  return min(omegaKepler, maxOmega);
}

// Computes relativistic Doppler beaming and a simple RGB warm/cool shift.
void discDopplerModulation(
  vec3 p,
  vec3 rayDir,
  out float beamingGain,
  out vec3 dopplerTint
) {
  beamingGain = 1.0;
  dopplerTint = vec3(1.0);

  float beamingStrength = max(uDiscDopplerStrength, 0.0);
  float tintStrength = max(uDiscDopplerTintStrength, 0.0);
  if (beamingStrength <= ACCRETION_EPS && tintStrength <= ACCRETION_EPS) {
    return;
  }

  float r = length(p.xz);
  if (r <= ACCRETION_EPS) {
    return;
  }

  float omega = discSpinOmega(p);
  float maxBeta = clamp(uDiscDopplerMaxBeta, 0.0, 0.99);
  float beta = min(omega * r, maxBeta);
  if (beta <= ACCRETION_EPS) {
    return;
  }

  vec3 flowDir = vec3(-p.z / r, 0.0, p.x / r);
  vec3 velocity = flowDir * beta;
  vec3 toObserver = -rayDir;

  float gamma = inversesqrt(max(1.0 - beta * beta, ACCRETION_EPS));
  float dopplerFactor = 1.0 / max(gamma * (1.0 - dot(velocity, toObserver)), ACCRETION_EPS);
  float beaming = clamp(dopplerFactor * dopplerFactor * dopplerFactor, DISC_MIN_BEAMING, DISC_MAX_BEAMING);
  if (beamingStrength > ACCRETION_EPS) {
    beamingGain = pow(beaming, beamingStrength);
  }

  float signedShift = clamp(log2(dopplerFactor), -1.0, 1.0);
  if (tintStrength > ACCRETION_EPS) {
    float tintAmount = clamp(abs(signedShift) * tintStrength, 0.0, 1.0);
    vec3 targetTint = signedShift >= 0.0 ? DISC_DOPPLER_BLUE_TINT : DISC_DOPPLER_RED_TINT;
    dopplerTint = mix(vec3(1.0), targetTint, tintAmount);
  }
}

// Computes gravitational redshift gain and tint from emitter radius to observer radius.
void discGravitationalRedshiftModulation(
  vec3 p,
  out float redshiftGain,
  out vec3 redshiftTint
) {
  redshiftGain = 1.0;
  redshiftTint = vec3(1.0);

  float gainStrength = max(uDiscGravRedshiftStrength, 0.0);
  float tintStrength = max(uDiscGravRedshiftTintStrength, 0.0);
  if (gainStrength <= ACCRETION_EPS && tintStrength <= ACCRETION_EPS) {
    return;
  }

  float rEmit = max(length(p), uRs + ACCRETION_EPS);
  float rObserver = max(length(uCameraPos), uRs + ACCRETION_EPS);
  float lapseEmit = sqrt(max(1.0 - uRs / rEmit, ACCRETION_EPS));
  float lapseObserver = sqrt(max(1.0 - uRs / rObserver, ACCRETION_EPS));
  float g = clamp(lapseEmit / lapseObserver, 0.05, 5.0);

  if (gainStrength > ACCRETION_EPS) {
    redshiftGain = pow(g, 3.0 * gainStrength);
  }

  if (tintStrength > ACCRETION_EPS) {
    float signedShift = clamp(log2(g), -1.0, 1.0);
    float tintAmount = clamp(abs(signedShift) * tintStrength, 0.0, 1.0);
    vec3 targetTint = signedShift >= 0.0 ? DISC_GRAV_BLUE_TINT : DISC_GRAV_RED_TINT;
    redshiftTint = mix(vec3(1.0), targetTint, tintAmount);
  }
}

// Samples disc noise with two-phase leapfrog advection and windowed cross-fades.
float sampleDiscNoiseLeapfrog(vec3 p) {
  float cycle = max(uDiscAdvectionCycleSeconds, DISC_MIN_CYCLE_SECONDS);
  float blendFrac = clamp(uDiscAdvectionBlendFraction, 0.0, 0.49);
  float phase = fract(uTime / cycle);
  float omega = discSpinOmega(p);

  float ageA = phase * cycle;
  float ageB = fract(phase + 0.5) * cycle;

  vec3 pA = vec3(rotateXZ(p.xz, -omega * ageA), p.y);
  vec3 pB = vec3(rotateXZ(p.xz, -omega * ageB), p.y);
  float noiseA = texture(uDiscNoiseTex, fract(pA * uDiscNoiseScale)).r;
  float noiseB = texture(uDiscNoiseTex, fract(pB * uDiscNoiseScale)).r;

  if (blendFrac <= ACCRETION_EPS) {
    return phase < 0.5 ? noiseB : noiseA;
  }

  float firstBlendStart = 0.5 - blendFrac;
  float secondBlendStart = 1.0 - blendFrac;
  if (phase < firstBlendStart) {
    return noiseB;
  }
  if (phase < 0.5) {
    float t = smoothstep(firstBlendStart, 0.5, phase);
    return mix(noiseB, noiseA, t);
  }
  if (phase < secondBlendStart) {
    return noiseA;
  }

  float t = smoothstep(secondBlendStart, 1.0, phase);
  return mix(noiseA, noiseB, t);
}
