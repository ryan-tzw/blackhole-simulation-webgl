import { Vector3 } from "three";

export type BendUniformDefaults = {
  uRs: number;
  uPhiStepMin: number;
  uPhiStepMax: number;
  uMaxRelUChange: number;
  uMaxAbsUPrimeChange: number;
  uEscapeRadius: number;
  uEscapeRadiusScale: number;
  uCaptureColor: Vector3;
  uMaxIterColor: Vector3;
};

// OSOT: canonical shared defaults for bend-debug and bend-env uniforms.
export function createBendUniformDefaults(): BendUniformDefaults {
  return {
    uRs: 1.0,
    uPhiStepMin: 0.005,
    uPhiStepMax: 0.5,
    uMaxRelUChange: 0.01,
    uMaxAbsUPrimeChange: 0.01,
    uEscapeRadius: 100.0,
    uEscapeRadiusScale: 4.0,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  };
}
