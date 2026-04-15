import { createBendUniformDefaults } from "./materials/bend-uniforms";

export type BendRenderSettings = {
  uRs: number;
  uMaxSteps: number;
  uStepAdapt: number;
  uPhiBudget: number;
  uMinStepRatio: number;
  uRadialStepBoost: number;
  uEnableDiscAccumulation: number;
  uUseDebugColorOnTerminate: number;
  uDiscInnerRadius: number;
  uDiscOuterRadius: number;
  uDiscHalfHeight: number;
  uDiscDensity: number;
  uDiscAbsorption: number;
  uDiscEmissionStrength: number;
  uDiscEmissionColor: [number, number, number];
  uDiscInnerSoftness: number;
  uDiscOuterSoftness: number;
  uDiscVerticalFalloffPower: number;
  uDiscIntegrationQuality: number;
  uDiscNoiseScale: number;
  uDiscNoiseStrength: number;
  uEnvExposure: number;
};

export function createBendRenderSettingsDefaults(): BendRenderSettings {
  const bendDefaults = createBendUniformDefaults();

  return {
    uRs: bendDefaults.uRs,
    uMaxSteps: bendDefaults.uMaxSteps,
    uStepAdapt: bendDefaults.uStepAdapt,
    uPhiBudget: bendDefaults.uPhiBudget,
    uMinStepRatio: bendDefaults.uMinStepRatio,
    uRadialStepBoost: bendDefaults.uRadialStepBoost,
    uEnableDiscAccumulation: bendDefaults.uEnableDiscAccumulation,
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
    uDiscInnerSoftness: bendDefaults.uDiscInnerSoftness,
    uDiscOuterSoftness: bendDefaults.uDiscOuterSoftness,
    uDiscVerticalFalloffPower: bendDefaults.uDiscVerticalFalloffPower,
    uDiscIntegrationQuality: bendDefaults.uDiscIntegrationQuality,
    uDiscNoiseScale: bendDefaults.uDiscNoiseScale,
    uDiscNoiseStrength: bendDefaults.uDiscNoiseStrength,
    uEnvExposure: 1.0,
  };
}
