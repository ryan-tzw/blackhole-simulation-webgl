// Accretion Disk Configuration
const float ADISK_INNER_RADIUS = 2.6;
const float ADISK_OUTER_RADIUS = 12.0;
const float ADISK_HEIGHT = 0.2;
const float ADISK_LIT = 0.5; // Overall brightness multiplier
const float ADISK_DENSITY_V = 1.0; // Vertical falloff (thinner at edges)
const float ADISK_DENSITY_H = 1.0; // Horizontal falloff
const float ADISK_NOISE_SCALE = 1.0;
const float ADISK_NOISE_LOD = 5.0; // How detailed the clouds are
const float ADISK_SPEED = 0.5;

// Fake time for testing
uniform float uTime;

// Simplex 3D Noise by Ian McEwan, Ashima Arts
vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  //  x0 = x0 - 0. + 0.0 * C
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y +
    vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0 / 7.0; // N=7
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_); // mod(j,N)

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  // Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 *
    dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Convert Cartesian to Spherical for noise sampling
vec3 toSpherical(vec3 p) {
  float rho = length(p);
  float theta = atan(p.z, p.x);
  float phi = asin(p.y / rho);
  return vec3(rho, theta, phi);
}

// Procedural colour map
vec3 getDiskColor(float radius) {
  // Normalize radius between inner (0.0) and outer (1.0)
  float t = clamp((radius - ADISK_INNER_RADIUS) / (ADISK_OUTER_RADIUS - ADISK_INNER_RADIUS), 0.0, 1.0);
  vec3 hotColor = vec3(1.0, 0.9, 0.5); // Yellow-white near black hole
  vec3 coolColor = vec3(0.8, 0.2, 0.0); // Deep orange/red at edges
  return mix(hotColor, coolColor, t);
}

// Accretion Disk Sampler
// stepDist is the RK4 step distance
// Glow multiplied by distance traveled, otherwise tiny steps near 
// the black hole will incorrectly explode the brightness.
void accumulateDiskColor(vec3 pos, float stepDist, inout vec3 accumulatedColor) {
  // 1. Boundary check: Are we inside the squashed cylinder?
  float density = max(0.0, 1.0 - length(pos.xyz / vec3(ADISK_OUTER_RADIUS, ADISK_HEIGHT, ADISK_OUTER_RADIUS)));
  if(density < 0.001)
    return; // Outside the disk, do nothing

  // 2. Vertical and Horizontal Density Falloff
  density *= pow(1.0 - abs(pos.y) / ADISK_HEIGHT, ADISK_DENSITY_V);
  density *= smoothstep(ADISK_INNER_RADIUS, ADISK_INNER_RADIUS * 1.1, length(pos));
  if(density < 0.001)
    return;

  // 3. Coordinate conversion for noise rotation
  vec3 sphericalCoord = toSpherical(pos);
  sphericalCoord.y *= 2.0;
  sphericalCoord.z *= 4.0;

  density *= 1.0 / pow(sphericalCoord.x, ADISK_DENSITY_H);
  density *= 16000.0; // Base density multiplier from reference

  // 4. Cloud Noise Generation
  float noise = 1.0;
  for(int i = 0; i < int(ADISK_NOISE_LOD); i++) {
    noise *= 0.5 * snoise(sphericalCoord * pow(float(i), 2.0) * ADISK_NOISE_SCALE) + 0.5;
    // Alternate rotation direction for different noise layers
    if(i % 2 == 0)
      sphericalCoord.y += uTime * ADISK_SPEED;
    else
      sphericalCoord.y -= uTime * ADISK_SPEED;
  }

  // 5. Get procedural color based on distance from center
  vec3 dustColor = getDiskColor(length(pos));

  // 6. Accumulate into the main color tracker
  // We multiply by stepDist so adaptive ODE steps don't break the volumetric math
  accumulatedColor += density * ADISK_LIT * dustColor * abs(noise) * stepDist;
}