import { Vector3 } from "three";

export type BendUniformDefaults = {
  uRs: number;
  uMaxSteps: number;
  uStepAdapt: number;
  uPhiBudget: number;
  uMinStepRatio: number;
  uRadialStepBoost: number;
  uEnableDiscAccumulation: number;
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
  uDiscInnerSoftness: number;
  uDiscOuterSoftness: number;
  uDiscVerticalFalloffPower: number;
  uCaptureColor: Vector3;
  uMaxIterColor: Vector3;
};

// OSOT: canonical shared defaults for bend-debug and bend-env uniforms.
export function createBendUniformDefaults(): BendUniformDefaults {
  const PI = 3.14159265359;

  return {
    uRs: 1.0,
    uMaxSteps: 100.0,
    uStepAdapt: 0.1,
    uPhiBudget: 24.0 * PI,
    uMinStepRatio: 0.01,
    uRadialStepBoost: 0.0,
    uEnableDiscAccumulation: 1.0,
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
    uDiscInnerSoftness: 0.6,
    uDiscOuterSoftness: 1.5,
    uDiscVerticalFalloffPower: 1.5,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  };
}
