import { createBendUniformDefaults } from "./materials/bend-uniforms";

export type BendRenderSettings = {
  uRs: number;
  uPhiStepMin: number;
  uPhiStepMax: number;
  uMaxSteps: number;
  uEnvExposure: number;
};

export function createBendRenderSettingsDefaults(): BendRenderSettings {
  const bendDefaults = createBendUniformDefaults();

  return {
    uRs: bendDefaults.uRs,
    uPhiStepMin: bendDefaults.uPhiStepMin,
    uPhiStepMax: bendDefaults.uPhiStepMax,
    uMaxSteps: bendDefaults.uMaxSteps,
    uEnvExposure: 1.0,
  };
}
