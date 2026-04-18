import { Data3DTexture, Vector3 } from "three";
import { getSharedDiscNoiseTexture } from "@/rendering/environment/disc-noise-texture";

export type BendUniformDefaults = {
  uTime: number;
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
  uDiscDensityRadialPower: number;
  uDiscAbsorption: number;
  uDiscEmissionStrength: number;
  uDiscEmissionInnerColor: Vector3;
  uDiscEmissionOuterColor: Vector3;
  uDiscEmissionRadialPower: number;
  uDiscEmissionColorCurve: number;
  uDiscInnerSoftness: number;
  uDiscOuterSoftness: number;
  uDiscVerticalFalloffPower: number;
  uDiscIntegrationQuality: number;
  uDiscNoiseTex: Data3DTexture;
  uDiscNoiseScale: number;
  uDiscNoiseStrength: number;
  uDiscSpinSpeed: number;
  uDiscSpinMaxOmega: number;
  uDiscAdvectionCycleSeconds: number;
  uDiscAdvectionBlendFraction: number;
  uDiscDopplerStrength: number;
  uDiscDopplerTintStrength: number;
  uDiscDopplerMaxBeta: number;
  uDiscGravRedshiftStrength: number;
  uDiscGravRedshiftTintStrength: number;
  uCaptureColor: Vector3;
  uMaxIterColor: Vector3;
};

// OSOT: canonical shared defaults for bend-debug and bend-env uniforms.
export function createBendUniformDefaults(): BendUniformDefaults {
  const PI = 3.14159265359;

  return {
    uTime: 0.0,
    uRs: 1.0,
    uMaxSteps: 100.0,
    uStepAdapt: 0.1,
    uPhiBudget: 24.0 * PI,
    uMinStepRatio: 0.01,
    uRadialStepBoost: 0.0,
    uEnableDiscAccumulation: 1.0,
    uUseDebugColorOnTerminate: 0.0,
    uEscapeRadius: 50.0,
    uEscapeRadiusScale: 1.5,
    uDiscInnerRadius: 3.0,
    uDiscOuterRadius: 12.0,
    uDiscHalfHeight: 0.35,
    uDiscDensity: 5.0,
    uDiscDensityRadialPower: 1.5,
    uDiscAbsorption: 1.2,
    uDiscEmissionStrength: 6.0,
    uDiscEmissionInnerColor: new Vector3(0.949, 0.431, 0.173),
    uDiscEmissionOuterColor: new Vector3(0.922, 0.686, 0.686),
    uDiscEmissionRadialPower: 2.0,
    uDiscEmissionColorCurve: 0.5,
    uDiscInnerSoftness: 2.5,
    uDiscOuterSoftness: 0.01,
    uDiscVerticalFalloffPower: 4.0,
    uDiscIntegrationQuality: 2.0,
    uDiscNoiseTex: getSharedDiscNoiseTexture(),
    uDiscNoiseScale: 0.06,
    uDiscNoiseStrength: 0.85,
    uDiscSpinSpeed: 2.0,
    uDiscSpinMaxOmega: 10.0,
    uDiscAdvectionCycleSeconds: 5.0,
    uDiscAdvectionBlendFraction: 0.49,
    uDiscDopplerStrength: 1.0,
    uDiscDopplerTintStrength: 2.0,
    uDiscDopplerMaxBeta: 0.35,
    uDiscGravRedshiftStrength: 1.0,
    uDiscGravRedshiftTintStrength: 0.75,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  };
}
