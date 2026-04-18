import { folder, useControls } from "leva";
import { Color } from "three";
import {
  createBendRenderSettingsDefaults,
  type BendRenderSettings,
} from "@/rendering/config/bend-render-settings";
import {
  PASS_SHADER_MODES,
  type PassShaderMode,
} from "@/rendering/config/pass-shader-mode";

export type PostProcessingSettings = {
  bloomThreshold: number;
  bloomSmoothing: number;
  bloomIntensity: number;
  noiseOpacity: number;
};

type RenderingControlsState = {
  passMode: PassShaderMode;
  showDebugView: boolean;
  showPerf: boolean;
  bendSettings: BendRenderSettings;
  postProcessingSettings: PostProcessingSettings;
};

const DEFAULT_BEND_RENDER_SETTINGS = createBendRenderSettingsDefaults();
const DEFAULT_POSTPROCCESSING_SETTINGS = {
  bloomThreshold: 0.5,
  bloomSmoothing: 0.1,
  bloomIntensity: 0.4,
  noiseOpacity: 0.5,
} as const;

function colorArrayToHex(color: [number, number, number]): string {
  return `#${new Color(color[0], color[1], color[2]).getHexString()}`;
}

// Owns all Leva controls and maps raw values into render-friendly settings.
export function useRenderingControls(): RenderingControlsState {
  const {
    passMode,
    showDebugView,
    showPerf,
    uRs,
    uMaxSteps,
    uStepAdapt,
    uUseDebugColorOnTerminate,
    uPhiBudget,
    uMinStepRatio,
    uRadialStepBoost,
    uEnableDiscAccumulation,
    uDiscInnerRadius,
    uDiscOuterRadius,
    uDiscHalfHeight,
    uDiscDensity,
    uDiscDensityRadialPower,
    uDiscAbsorption,
    uDiscEmissionStrength,
    uDiscEmissionInnerColor,
    uDiscEmissionOuterColor,
    uDiscEmissionRadialPower,
    uDiscEmissionColorCurve,
    uDiscInnerSoftness,
    uDiscOuterSoftness,
    uDiscVerticalFalloffPower,
    uDiscIntegrationQuality,
    uDiscNoiseScale,
    uDiscNoiseStrength,
    uDiscSpinSpeed,
    uDiscSpinMaxOmega,
    uDiscAdvectionCycleSeconds,
    uDiscAdvectionBlendFraction,
    uDiscDopplerStrength,
    uDiscDopplerTintStrength,
    uDiscDopplerMaxBeta,
    uDiscGravRedshiftStrength,
    uDiscGravRedshiftTintStrength,
    uEnvExposure,
    bloomThreshold,
    bloomSmoothing,
    bloomIntensity,
    noiseOpacity,
  } = useControls({
    Geodesics: folder(
      {
        Core: folder({
          uRs: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uRs,
            label: "Schwarzschild Radius (Rs)",
            min: 0.1,
            max: 4.0,
            step: 0.05,
          },
          uMaxSteps: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uMaxSteps,
            label: "Max Steps",
            min: 16,
            max: 1024,
            step: 1,
          },
          uStepAdapt: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uStepAdapt,
            label: "Step Adaptivity",
            min: 0.02,
            max: 0.2,
            step: 0.01,
          },
          uUseDebugColorOnTerminate: {
            value:
              DEFAULT_BEND_RENDER_SETTINGS.uUseDebugColorOnTerminate >= 0.5,
            label: "Use Debug Color on Terminate",
          },
        }),
        Advanced: folder(
          {
            uPhiBudget: {
              value: DEFAULT_BEND_RENDER_SETTINGS.uPhiBudget,
              label: "Phi Budget",
              min: 2.0,
              max: 200.0,
              step: 1.0,
            },
            uMinStepRatio: {
              value: DEFAULT_BEND_RENDER_SETTINGS.uMinStepRatio,
              label: "Min Step Ratio",
              min: 0.0,
              max: 0.5,
              step: 0.001,
            },
            uRadialStepBoost: {
              value: DEFAULT_BEND_RENDER_SETTINGS.uRadialStepBoost,
              label: "Radial Step Boost",
              min: 0.0,
              max: 2.0,
              step: 0.01,
            },
          },
          { collapsed: true },
        ),
      },
      { collapsed: true },
    ),

    "Accretion Disc": folder({
      uEnableDiscAccumulation: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uEnableDiscAccumulation >= 0.5,
        label: "Enable",
      },
      Geometry: folder(
        {
          uDiscInnerRadius: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscInnerRadius,
            label: "Inner Radius",
            min: 0.0,
            max: 20.0,
            step: 0.1,
          },
          uDiscOuterRadius: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscOuterRadius,
            label: "Outer Radius",
            min: 0.5,
            max: 40.0,
            step: 0.1,
          },
          uDiscHalfHeight: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscHalfHeight,
            label: "Thickness/Height",
            min: 0.01,
            max: 2.0,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      Medium: folder(
        {
          uDiscDensity: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscDensity,
            label: "Density",
            min: 0.0,
            max: 10.0,
            step: 0.05,
          },
          uDiscDensityRadialPower: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscDensityRadialPower,
            label: "Density Radial Power",
            min: 0.0,
            max: 8.0,
            step: 0.05,
          },
          uDiscAbsorption: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscAbsorption,
            label: "Absorption",
            min: 0.0,
            max: 5.0,
            step: 0.05,
          },
          uDiscInnerSoftness: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscInnerSoftness,
            label: "Inner Softness",
            min: 0.01,
            max: 8.0,
            step: 0.01,
          },
          uDiscOuterSoftness: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscOuterSoftness,
            label: "Outer Softness",
            min: 0.01,
            max: 8.0,
            step: 0.01,
          },
          uDiscVerticalFalloffPower: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscVerticalFalloffPower,
            label: "Vertical Falloff Power",
            min: 0.1,
            max: 8.0,
            step: 0.05,
          },
        },
        { collapsed: true },
      ),
      Emission: folder({
        uDiscEmissionStrength: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionStrength,
          label: "Emission Strength",
          min: 0.0,
          max: 15.0,
          step: 0.05,
        },
        uDiscEmissionInnerColor: {
          value: colorArrayToHex(
            DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionInnerColor,
          ),
          label: "Inner Color",
        },
        uDiscEmissionOuterColor: {
          value: colorArrayToHex(
            DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionOuterColor,
          ),
          label: "Outer Color",
        },
        uDiscEmissionRadialPower: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionRadialPower,
          label: "Emission Radial Power",
          min: 0.0,
          max: 8.0,
          step: 0.05,
        },
        uDiscEmissionColorCurve: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionColorCurve,
          label: "Emission Color Curve",
          min: 0.0,
          max: 2.0,
          step: 0.01,
        },
      }),
      Integration: folder(
        {
          uDiscIntegrationQuality: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscIntegrationQuality,
            label: "Integration Quality",
            min: 1,
            max: 3,
            step: 1,
          },
        },
        { collapsed: true },
      ),
      Noise: folder(
        {
          uDiscNoiseScale: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscNoiseScale,
            label: "Noise Scale",
            min: 0.01,
            max: 0.2,
            step: 0.001,
          },
          uDiscNoiseStrength: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscNoiseStrength,
            label: "Noise Strength",
            min: 0.0,
            max: 2.0,
            step: 0.01,
          },
        },
        { collapsed: true },
      ),
      Motion: folder(
        {
          uDiscSpinSpeed: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscSpinSpeed,
            label: "Spin Speed",
            min: 0.0,
            max: 8.0,
            step: 0.1,
          },
          uDiscSpinMaxOmega: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscSpinMaxOmega,
            label: "Max Angular Velocity",
            min: 0.0,
            max: 40.0,
            step: 0.1,
          },
          uDiscAdvectionCycleSeconds: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscAdvectionCycleSeconds,
            label: "Advection Cycle Seconds",
            min: 2.0,
            max: 8.0,
            step: 0.01,
          },
          uDiscAdvectionBlendFraction: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscAdvectionBlendFraction,
            label: "Advection Blend Fraction",
            min: 0.01,
            max: 0.49,
            step: 0.01,
          },
          uDiscDopplerStrength: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscDopplerStrength,
            label: "Doppler Strength",
            min: 0.0,
            max: 2.0,
            step: 0.01,
          },
          uDiscDopplerTintStrength: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscDopplerTintStrength,
            label: "Doppler Tint Strength",
            min: 0.0,
            max: 6.0,
            step: 0.05,
          },
          uDiscDopplerMaxBeta: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscDopplerMaxBeta,
            label: "Max Beta",
            min: 0.01,
            max: 0.99,
            step: 0.01,
          },
          uDiscGravRedshiftStrength: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscGravRedshiftStrength,
            label: "Gravitational Redshift Strength",
            min: 0.0,
            max: 2.0,
            step: 0.01,
          },
          uDiscGravRedshiftTintStrength: {
            value: DEFAULT_BEND_RENDER_SETTINGS.uDiscGravRedshiftTintStrength,
            label: "Gravitational Redshift Tint Strength",
            min: 0.0,
            max: 3.0,
            step: 0.05,
          },
        },
        { collapsed: true },
      ),
    }),

    Environment: folder(
      {
        uEnvExposure: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uEnvExposure,
          label: "Environment Exposure",
          min: 0.0,
          max: 4.0,
          step: 0.05,
        },
      },
      { collapsed: true },
    ),

    Postprocessing: folder(
      {
        bloomThreshold: {
          value: DEFAULT_POSTPROCCESSING_SETTINGS.bloomThreshold,
          label: "Bloom Threshold",
          min: 0.0,
          max: 2.0,
          step: 0.01,
        },
        bloomSmoothing: {
          value: DEFAULT_POSTPROCCESSING_SETTINGS.bloomSmoothing,
          label: "Bloom Smoothing",
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
        bloomIntensity: {
          value: DEFAULT_POSTPROCCESSING_SETTINGS.bloomIntensity,
          label: "Bloom Intensity",
          min: 0.0,
          max: 3.0,
          step: 0.01,
        },
        noiseOpacity: {
          value: DEFAULT_POSTPROCCESSING_SETTINGS.noiseOpacity,
          label: "Noise Opacity",
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
      },
      { collapsed: true },
    ),

    Debug: folder({
      showDebugView: {
        value: false,
        label: "Show Debug View",
      },
      showPerf: {
        value: false,
        label: "Show Perf",
      },
      Advanced: folder(
        {
          passMode: {
            value: "bend-env" as PassShaderMode,
            label: "Pass Mode",
            options: PASS_SHADER_MODES,
          },
        },
        { collapsed: true },
      ),
    }),
  });

  const discEmissionInnerColor = new Color(uDiscEmissionInnerColor);
  const discEmissionOuterColor = new Color(uDiscEmissionOuterColor);

  return {
    passMode,
    showDebugView,
    showPerf,
    bendSettings: {
      uRs,
      uMaxSteps,
      uStepAdapt,
      uPhiBudget,
      uMinStepRatio,
      uRadialStepBoost,
      uEnableDiscAccumulation: uEnableDiscAccumulation ? 1.0 : 0.0,
      uUseDebugColorOnTerminate: uUseDebugColorOnTerminate ? 1.0 : 0.0,
      uDiscInnerRadius,
      uDiscOuterRadius,
      uDiscHalfHeight,
      uDiscDensity,
      uDiscDensityRadialPower,
      uDiscAbsorption,
      uDiscEmissionStrength,
      uDiscEmissionInnerColor: [
        discEmissionInnerColor.r,
        discEmissionInnerColor.g,
        discEmissionInnerColor.b,
      ],
      uDiscEmissionOuterColor: [
        discEmissionOuterColor.r,
        discEmissionOuterColor.g,
        discEmissionOuterColor.b,
      ],
      uDiscEmissionRadialPower,
      uDiscEmissionColorCurve,
      uDiscInnerSoftness,
      uDiscOuterSoftness,
      uDiscVerticalFalloffPower,
      uDiscIntegrationQuality,
      uDiscNoiseScale,
      uDiscNoiseStrength,
      uDiscSpinSpeed,
      uDiscSpinMaxOmega,
      uDiscAdvectionCycleSeconds,
      uDiscAdvectionBlendFraction,
      uDiscDopplerStrength,
      uDiscDopplerTintStrength,
      uDiscDopplerMaxBeta,
      uDiscGravRedshiftStrength,
      uDiscGravRedshiftTintStrength,
      uEnvExposure,
    },
    postProcessingSettings: {
      bloomThreshold,
      bloomSmoothing,
      bloomIntensity,
      noiseOpacity,
    },
  };
}
