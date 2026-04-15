import { createBendUniformDefaults } from "./materials/bend-uniforms";

export type BendRenderSettings = {
  uRs: number;
  uMaxSteps: number;
  uStepAdapt: number;
  uUseDebugColorOnTerminate: number;
  uDiscInnerRadius: number;
  uDiscOuterRadius: number;
  uDiscHalfHeight: number;
  uDiscDensity: number;
  uDiscAbsorption: number;
  uDiscEmissionStrength: number;
  uDiscEmissionColor: [number, number, number];
  uEnvExposure: number;
};

export function createBendRenderSettingsDefaults(): BendRenderSettings {
  const bendDefaults = createBendUniformDefaults();

  return {
    uRs: bendDefaults.uRs,
    uMaxSteps: bendDefaults.uMaxSteps,
    uStepAdapt: bendDefaults.uStepAdapt,
    uUseDebugColorOnTerminate: bendDefaults.uUseDebugColorOnTerminate,
    uDiscInnerRadius: bendDefaults.uDiscInnerRadius,
    uDiscOuterRadius: bendDefaults.uDiscOuterRadius,
    uDiscHalfHeight: bendDefaults.uDiscHalfHeight,
    uDiscDensity: bendDefaults.uDiscDensity,
    uDiscAbsorption: bendDefaults.uDiscAbsorption,
    uDiscEmissionStrength: bendDefaults.uDiscEmissionStrength,
    uDiscEmissionColor: [
      bendDefaults.uDiscEmissionColor.x,
      bendDefaults.uDiscEmissionColor.y,
      bendDefaults.uDiscEmissionColor.z,
    ],
    uEnvExposure: 1.0,
  };
}
