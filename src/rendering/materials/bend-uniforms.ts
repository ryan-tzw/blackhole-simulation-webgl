import { Vector3 } from "three";

export type BendUniformDefaults = {
  uRs: number;
  uMaxSteps: number;
  uStepAdapt: number;
  uEscapeRadius: number;
  uEscapeRadiusScale: number;
  uCaptureColor: Vector3;
  uMaxIterColor: Vector3;
};

// OSOT: canonical shared defaults for bend-debug and bend-env uniforms.
export function createBendUniformDefaults(): BendUniformDefaults {
  return {
    uRs: 1.0,
    uMaxSteps: 512.0,
    uStepAdapt: 0.02,
    uEscapeRadius: 100.0,
    uEscapeRadiusScale: 4.0,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  };
}
