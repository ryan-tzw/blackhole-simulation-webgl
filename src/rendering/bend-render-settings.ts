import { createBendUniformDefaults } from "./materials/bend-uniforms";

export type BendRenderSettings = {
  uRs: number;
  uPhiStepMin: number;
  uPhiStepMax: number;
  uEnvExposure: number;
};

export function createBendRenderSettingsDefaults(): BendRenderSettings {
  const bendDefaults = createBendUniformDefaults();

  return {
    uRs: bendDefaults.uRs,
    uPhiStepMin: bendDefaults.uPhiStepMin,
    uPhiStepMax: bendDefaults.uPhiStepMax,
    uEnvExposure: 1.0,
  };
}
