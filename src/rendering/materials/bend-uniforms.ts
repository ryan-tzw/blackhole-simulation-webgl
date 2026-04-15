import { Vector3 } from "three";

export type BendUniformDefaults = {
  uRs: number;
  uMaxSteps: number;
  uStepAdapt: number;
  uUseDebugColorOnTerminate: number;
  uEscapeRadius: number;
  uEscapeRadiusScale: number;
  uDiscInnerRadius: number;
  uDiscOuterRadius: number;
  uDiscHalfHeight: number;
  uDiscDensity: number;
  uDiscAbsorption: number;
  uDiscEmissionStrength: number;
  uDiscEmissionColor: Vector3;
  uCaptureColor: Vector3;
  uMaxIterColor: Vector3;
};

// OSOT: canonical shared defaults for bend-debug and bend-env uniforms.
export function createBendUniformDefaults(): BendUniformDefaults {
  return {
    uRs: 1.0,
    uMaxSteps: 100.0,
    uStepAdapt: 0.1,
    uUseDebugColorOnTerminate: 1.0,
    uEscapeRadius: 50.0,
    uEscapeRadiusScale: 1.5,
    uDiscInnerRadius: 3.0,
    uDiscOuterRadius: 12.0,
    uDiscHalfHeight: 0.15,
    uDiscDensity: 1.0,
    uDiscAbsorption: 1.2,
    uDiscEmissionStrength: 1.4,
    uDiscEmissionColor: new Vector3(2.6, 1.15, 0.35),
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  };
}
