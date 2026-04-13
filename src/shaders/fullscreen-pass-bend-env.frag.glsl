varying vec2 vUv;

uniform vec3 uCameraPos;
uniform vec3 uCameraRight;
uniform vec3 uCameraUp;
uniform vec3 uCameraForward;
uniform float uFovY;
uniform float uAspect;

uniform float uRs;
uniform float uPhiStepMin;
uniform float uPhiStepMax;
uniform float uMaxRelUChange;
uniform float uMaxAbsUPrimeChange;
uniform float uEscapeRadius;
uniform float uEscapeRadiusScale;
uniform vec3 uCaptureColor;
uniform vec3 uMaxIterColor;

uniform samplerCube uEnvMap;
uniform float uEnvExposure;

const int MAX_STEPS = 2048;
const float EPS = 1e-6;
const float LARGE_VALUE = 1e8;

#include ./chunks/geodesics/schwarzschild-rk4.glsl;
#include ./chunks/geodesics/adaptive-phi-step.glsl;
#include ./chunks/color/aces-tonemap.glsl;
#include ./chunks/env/accretion-disk.glsl;

// Converts integrated 2D geodesic state back to world-space ray direction
vec3 bentRayDirection(
  float u,
  float uPrime,
  float phi,
  float angularMomentum,
  vec3 eRadial0,
  vec3 ePhi0
) {
  // eRadial0/ePhi0 = initial radial and azimuthal unit vectors at the camera position
  // rotate by azimuthal angle phi to get current radial and azimuthal unit vectors
  float cosPhi = cos(phi);
  float sinPhi = sin(phi);
  vec3 eRadial = cosPhi * eRadial0 + sinPhi * ePhi0;
  vec3 ePhi = -sinPhi * eRadial0 + cosPhi * ePhi0;

  float safeU = max(u, EPS);

  float dphi_dlambda = angularMomentum * safeU * safeU;
  float du_dlambda = uPrime * dphi_dlambda;
  float dr_dlambda = -du_dlambda / (safeU * safeU);
  float r = 1.0 / safeU;

  return normalize(dr_dlambda * eRadial + (r * dphi_dlambda) * ePhi);
}

// Returns the RGB color sampled from the environment map in the given ray direction
vec3 sampleEnvColor(vec3 worldDirection) {
  vec3 cubeDirection = normalize(worldDirection);
  cubeDirection.x *= -1.0;
  vec3 envColor = textureCube(uEnvMap, cubeDirection).rgb * uEnvExposure;
  return envColor;
}

void renderFragColor(vec3 finalColor) {
  gl_FragColor = vec4(linearToSrgb(acesTonemap(finalColor)), 1.0);
}

void main() {
  // Convert the 0-to-1 pixel coordinates (vUv) to -1 to 1 Normalized Device Coordinates (NDC)
  vec2 ndc = vUv * 2.0 - 1.0;

  // NOTE: The black hole center is treated as the origin (0, 0, 0) of the world space
  // Use FOV data to compute the 2D offset of the image/view plane in front of the camera
  float tanHalfFov = tan(uFovY * 0.5);
  vec2 rayPlane = vec2(ndc.x * uAspect * tanHalfFov, ndc.y * tanHalfFov);

  // Shoot a ray from the camera towards the current pixel on the image/view plane
  // Camera's forward, right, and up vectors tell us the orientation of the camera, which by extension tells us the orientation of the image/view plane
  vec3 rayDirection = normalize(uCameraForward + rayPlane.x * uCameraRight + rayPlane.y * uCameraUp);

  // We use r to denote the ray's distance from the black hole center
  vec3 rayOrigin = uCameraPos; // the ray starts at the camera position
  float r0 = length(rayOrigin); // initial distance of the ray from the black hole

  // Define the escape radius for the rays (configurable)
  float effectiveEscapeRadius = max(uEscapeRadius, uEscapeRadiusScale * r0);

  // Ray already captured if it starts inside the blackhole Schwarzschild radius (uRs) i.e. event horizon
  if(r0 <= uRs) {
    gl_FragColor = vec4(uCaptureColor, 1.0);
    return;
  }

  // Unit radial vector (eRadial0) points from the black hole center to the ray origin (camera position)
  // Note: we use 'e' to denote unit vectors, and the '0' to indicate initial values
  vec3 eRadial0 = rayOrigin / r0;

  // Calculate how much the ray is moving directly toward or away from the black hole
  float radialRate = dot(rayDirection, eRadial0); // radial component of ray velocity (<0 means moving toward the black hole, >0 means moving away)
  vec3 tangent = rayDirection - radialRate * eRadial0; // tangent component of ray velocity
  float tangentLen = length(tangent);

  // Edge case: If the ray is near radial (tangent component is very small), 
  // it means that the ray is going almost directly toward or away from the black hole center,
  // in which case we do not need to solve the geodesic ODE as there is negligible ray bending
  if(tangentLen < EPS) {
    if(radialRate < 0.0) { // Ray is moving directly towards the black hole and will be captured
      gl_FragColor = vec4(uCaptureColor, 1.0);
      return;
    }

    // Else the ray moves directly away from the black hole, simply render the environment in that direction
    vec3 envColor = sampleEnvColor(rayDirection);
    renderFragColor(envColor);
    return;
  }

  /*
  [2D Geodesic Solving in the Radial-Azimuthal Plane]
  Gravity is a central force with the pull always toward the black hole center at (0, 0, 0).
  Imagine the 2D plane that intersects the black hole center (origin)
  where both the ray's initial direction and the radial direction (direction from black hole center to ray origin) lie.
  The ray will only travel and bend within/along this plane and never leave it, because there is no force component to push it out of this plane.
  Therefore, we can treat the ray's path as a 2D curve in this plane and solve for it using polar coordinates (r, phi),
  where r is the distance from the black hole center and phi is the angle around the black hole center (we simply initialize the ray origin's position as phi = 0).
  */

  // Unit vector in the initial tangential direction of the ray (ePhi0) is the "orbital" direction
  vec3 ePhi0 = tangent / tangentLen;

  // Angular momentum is how much the ray "orbits" around the black hole
  float angularMomentum = r0 * tangentLen;

  // For mathematical convenience, we solve the geodesic equation in terms of u = 1/r instead of r, and phi as the angular coordinate.
  float u = 1.0 / r0;

  // uPrime is du/dphi, the rate of change of u (distance from black hole) with respect to phi (angular position around the black hole)
  float uPrime = -(u * radialRate) / tangentLen; // scale-invariant form

  // phi is the "angle of travel" around the black hole, set to 0 at the ray's initial position
  float phi = 0.0;

  // Track the glowing gas color (accretion disk) accumulated along the ray's path
  vec3 accumulatedDiskColor = vec3(0.0); 

  // Track the ray's last position to compute distance travelled for accurate glow accumulation
  vec3 previousPos = rayOrigin;

  /*
  [Ray Marching]
  We iteratively take steps along the ray's path by incrementing phi. 
  Solving the geodesic ODE tells us how u (inverse distance from black hole) and uPrime (rate of change of that distance with respect to angle) change as we march along phi.
  As we march along the ray's path, we check whether the ray gets captured by or escapes the black hole at any point.
  */
  for(int i = 0; i < MAX_STEPS; i++) {
    // ODE is solved using RK4 with an adaptive phi step size
    float phiStep = adaptivePhiStep(u, uPrime, uRs); // small when u or uPrime are changing rapidly and vice versa

    // RK4 moves the ray forward
    rk4StepSecondOrder(u, uPrime, phiStep, uRs); // updates u and uPrime (inout parameters)

    // Update the total angle traveled around the black hole
    phi += phiStep;

    // Convert u back to r (distance from black hole) for simpler checks
    float r = 1.0 / u; 
    // float r = 1.0 / max(abs(u), EPS); 

    // Current position of the ray in world space
    vec3 currentPos = r * (cos(phi) * eRadial0 + sin(phi) * ePhi0);

    // Compute distance traveled by the ray since the last step for accurate glow accumulation
    float stepDist = length(currentPos - previousPos);

    // Sample accretion disk volume along this ray step and accumulate color contribution
    accumulateDiskColor(currentPos, stepDist, accumulatedDiskColor); // updates accumulatedDiskColor (inout parameter)

    // Update previous position for the next step
    previousPos = currentPos;

    // Error check: if values explode, we paint an error color (uMaxIterColor)
    if(abs(u) > LARGE_VALUE || abs(uPrime) > LARGE_VALUE) {
      vec3 finalColor = accumulatedDiskColor + uMaxIterColor;
      renderFragColor(finalColor);
      return;
    }

    // u should always be positive (since it's defined as 1/r), 
    // but if it becomes very small or negative due to numerical issues, 
    // we treat the ray as having escaped (ray is very far away from the black hole)
    if(u <= EPS) {
      vec3 finalRayDirection = bentRayDirection(max(u, EPS), uPrime, phi, angularMomentum, eRadial0, ePhi0);
      vec3 envColor = sampleEnvColor(finalRayDirection);
      vec3 finalColor = accumulatedDiskColor + envColor;
      renderFragColor(finalColor);
      return;
    }

    // If the ray gets too close i.e. within the Schwarzschild radius (uRs), it is captured by the black hole
    if(r <= uRs) {
      vec3 finalColor = accumulatedDiskColor + uCaptureColor;
      renderFragColor(finalColor);
      return;
    }

    // If distance is greater than the effective escape radius, the ray has escaped
    if(r >= effectiveEscapeRadius) {
      // Convert the final integrated state (u, uPrime, phi) back to a world-space ray direction to sample the environment map
      vec3 finalRayDirection = bentRayDirection(u, uPrime, phi, angularMomentum, eRadial0, ePhi0);
      vec3 envColor = sampleEnvColor(finalRayDirection);
      vec3 finalColor = accumulatedDiskColor + envColor;
      renderFragColor(finalColor);
      return;
    }
  }

  // Ray marching loop ends; render some fallback color
  renderFragColor(uMaxIterColor + accumulatedDiskColor);
}
