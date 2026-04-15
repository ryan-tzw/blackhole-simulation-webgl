import {
  Data3DTexture,
  LinearFilter,
  RedFormat,
  RepeatWrapping,
  UnsignedByteType,
} from "three";

const DISC_NOISE_SIZE = 64;
const BASE_PERIOD = 8;
const OCTAVES = 4;
const PERSISTENCE = 0.5;

let sharedDiscNoiseTexture: Data3DTexture | null = null;

function positiveMod(value: number, divisor: number): number {
  const mod = value % divisor;
  return mod < 0 ? mod + divisor : mod;
}

function hash3(ix: number, iy: number, iz: number): number {
  let h =
    Math.imul(ix, 0x1f123bb5) ^
    Math.imul(iy, 0x0594d12d) ^
    Math.imul(iz, 0x1f3d5b79);
  h ^= h >>> 13;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 16;
  return (h >>> 0) / 0xffffffff;
}

function smoothstep01(t: number): number {
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function tileableValueNoise3D(
  x: number,
  y: number,
  z: number,
  period: number,
): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const z1 = z0 + 1;

  const tx = smoothstep01(x - x0);
  const ty = smoothstep01(y - y0);
  const tz = smoothstep01(z - z0);

  const px0 = positiveMod(x0, period);
  const py0 = positiveMod(y0, period);
  const pz0 = positiveMod(z0, period);
  const px1 = positiveMod(x1, period);
  const py1 = positiveMod(y1, period);
  const pz1 = positiveMod(z1, period);

  const n000 = hash3(px0, py0, pz0);
  const n100 = hash3(px1, py0, pz0);
  const n010 = hash3(px0, py1, pz0);
  const n110 = hash3(px1, py1, pz0);
  const n001 = hash3(px0, py0, pz1);
  const n101 = hash3(px1, py0, pz1);
  const n011 = hash3(px0, py1, pz1);
  const n111 = hash3(px1, py1, pz1);

  const nx00 = lerp(n000, n100, tx);
  const nx10 = lerp(n010, n110, tx);
  const nx01 = lerp(n001, n101, tx);
  const nx11 = lerp(n011, n111, tx);

  const nxy0 = lerp(nx00, nx10, ty);
  const nxy1 = lerp(nx01, nx11, ty);
  return lerp(nxy0, nxy1, tz);
}

function generateDiscNoiseData3D(size: number): Uint8Array {
  const voxelCount = size * size * size;
  const data = new Uint8Array(voxelCount);
  const invExtent = size > 1 ? 1 / (size - 1) : 0;

  for (let z = 0; z < size; z += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        // Sample inclusive endpoints so opposite texture faces are identical.
        const u = x * invExtent;
        const v = y * invExtent;
        const w = z * invExtent;

        let amplitude = 1.0;
        let amplitudeSum = 0.0;
        let value = 0.0;

        for (let octave = 0; octave < OCTAVES; octave += 1) {
          const octaveScale = 2 ** octave;
          const period = BASE_PERIOD * octaveScale;
          const sampleX = u * period;
          const sampleY = v * period;
          const sampleZ = w * period;

          value +=
            amplitude * tileableValueNoise3D(sampleX, sampleY, sampleZ, period);
          amplitudeSum += amplitude;
          amplitude *= PERSISTENCE;
        }

        const normalized = amplitudeSum > 0 ? value / amplitudeSum : 0.0;
        const idx = x + y * size + z * size * size;
        data[idx] = Math.round(
          Math.min(Math.max(normalized, 0.0), 1.0) * 255.0,
        );
      }
    }
  }

  return data;
}

export function getSharedDiscNoiseTexture(): Data3DTexture {
  if (sharedDiscNoiseTexture) {
    return sharedDiscNoiseTexture;
  }

  const data = generateDiscNoiseData3D(DISC_NOISE_SIZE);
  const texture = new Data3DTexture(
    data,
    DISC_NOISE_SIZE,
    DISC_NOISE_SIZE,
    DISC_NOISE_SIZE,
  );
  texture.format = RedFormat;
  texture.type = UnsignedByteType;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.wrapR = RepeatWrapping;
  texture.generateMipmaps = false;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;

  sharedDiscNoiseTexture = texture;
  return sharedDiscNoiseTexture;
}
