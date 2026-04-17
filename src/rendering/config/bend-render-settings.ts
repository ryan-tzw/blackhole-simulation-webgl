import { createBendUniformDefaults } from "@/rendering/materials/bend-uniforms";

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
  uDiscDensityRadialPower: number;
  uDiscAbsorption: number;
  uDiscEmissionStrength: number;
  uDiscEmissionInnerColor: [number, number, number];
  uDiscEmissionOuterColor: [number, number, number];
  uDiscEmissionRadialPower: number;
  uDiscEmissionColorCurve: number;
  uDiscInnerSoftness: number;
  uDiscOuterSoftness: number;
  uDiscVerticalFalloffPower: number;
  uDiscIntegrationQuality: number;
  uDiscNoiseScale: number;
  uDiscNoiseStrength: number;
  uDiscSpinSpeed: number;
  uDiscSpinMaxOmega: number;
  uDiscAdvectionCycleSeconds: number;
  uDiscAdvectionBlendFraction: number;
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
    uDiscDensityRadialPower: bendDefaults.uDiscDensityRadialPower,
    uDiscAbsorption: bendDefaults.uDiscAbsorption,
    uDiscEmissionStrength: bendDefaults.uDiscEmissionStrength,
    uDiscEmissionInnerColor: [
      bendDefaults.uDiscEmissionInnerColor.x,
      bendDefaults.uDiscEmissionInnerColor.y,
      bendDefaults.uDiscEmissionInnerColor.z,
    ],
    uDiscEmissionOuterColor: [
      bendDefaults.uDiscEmissionOuterColor.x,
      bendDefaults.uDiscEmissionOuterColor.y,
      bendDefaults.uDiscEmissionOuterColor.z,
    ],
    uDiscEmissionRadialPower: bendDefaults.uDiscEmissionRadialPower,
    uDiscEmissionColorCurve: bendDefaults.uDiscEmissionColorCurve,
    uDiscInnerSoftness: bendDefaults.uDiscInnerSoftness,
    uDiscOuterSoftness: bendDefaults.uDiscOuterSoftness,
    uDiscVerticalFalloffPower: bendDefaults.uDiscVerticalFalloffPower,
    uDiscIntegrationQuality: bendDefaults.uDiscIntegrationQuality,
    uDiscNoiseScale: bendDefaults.uDiscNoiseScale,
    uDiscNoiseStrength: bendDefaults.uDiscNoiseStrength,
    uDiscSpinSpeed: bendDefaults.uDiscSpinSpeed,
    uDiscSpinMaxOmega: bendDefaults.uDiscSpinMaxOmega,
    uDiscAdvectionCycleSeconds: bendDefaults.uDiscAdvectionCycleSeconds,
    uDiscAdvectionBlendFraction: bendDefaults.uDiscAdvectionBlendFraction,
    uEnvExposure: 1.0,
  };
}
