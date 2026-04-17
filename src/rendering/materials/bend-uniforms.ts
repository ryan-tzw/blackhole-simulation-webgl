import { Data3DTexture, Vector3 } from "three";
import { getSharedDiscNoiseTexture } from "@/rendering/environment/disc-noise-texture";

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
    uDiscHalfHeight: 0.35,
    uDiscDensity: 1.0,
    uDiscDensityRadialPower: 1.5,
    uDiscAbsorption: 1.2,
    uDiscEmissionStrength: 6.0,
    uDiscEmissionInnerColor: new Vector3(1.0, 0.95, 0.88),
    uDiscEmissionOuterColor: new Vector3(1.0, 0.6, 0.28),
    uDiscEmissionRadialPower: 2.0,
    uDiscEmissionColorCurve: 2.5,
    uDiscInnerSoftness: 2.5,
    uDiscOuterSoftness: 3.9,
    uDiscVerticalFalloffPower: 4.0,
    uDiscIntegrationQuality: 2.0,
    uDiscNoiseTex: getSharedDiscNoiseTexture(),
    uDiscNoiseScale: 0.06,
    uDiscNoiseStrength: 1.0,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  };
}
