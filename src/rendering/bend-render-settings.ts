import { createBendUniformDefaults } from "./materials/bend-uniforms";

export type BendRenderSettings = {
  uRs: number;
  uMaxSteps: number;
  uStepAdapt: number;
  uUseDebugColorOnTerminate: number;
  uEnvExposure: number;
};

export function createBendRenderSettingsDefaults(): BendRenderSettings {
  const bendDefaults = createBendUniformDefaults();

  return {
    uRs: bendDefaults.uRs,
    uMaxSteps: bendDefaults.uMaxSteps,
    uStepAdapt: bendDefaults.uStepAdapt,
    uUseDebugColorOnTerminate: bendDefaults.uUseDebugColorOnTerminate,
    uEnvExposure: 1.0,
  };
}
