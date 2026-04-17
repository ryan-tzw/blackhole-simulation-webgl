import { useRef } from "react";
import { folder, useControls } from "leva";
import { Color } from "three";
import {
  createBendRenderSettingsDefaults,
  type BendRenderSettings,
} from "../config/bend-render-settings";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "../camera/camera-state";
import { DebugInsetCanvas } from "./DebugInsetCanvas";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas";
import {
  PASS_SHADER_MODES,
  type PassShaderMode,
} from "../config/pass-shader-mode";
import { StartupLoadingOverlay } from "./StartupLoadingOverlay";
import "./rendering-root.css";

const DEFAULT_BEND_RENDER_SETTINGS = createBendRenderSettingsDefaults();

function colorArrayToHex(color: [number, number, number]): string {
  return `#${new Color(color[0], color[1], color[2]).getHexString()}`;
}

export function RenderingRoot() {
  const observerCameraStateRef = useRef<ObserverCameraState>(
    DEFAULT_OBSERVER_CAMERA_STATE,
  );

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
    uEnvExposure,
  } = useControls({
    passMode: {
      value: "bend-env" as PassShaderMode,
      options: PASS_SHADER_MODES,
    },
    showDebugView: {
      value: true,
    },
    showPerf: {
      value: true,
    },
    Bending: folder({
      uRs: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uRs,
        min: 0.1,
        max: 4.0,
        step: 0.05,
      },
      uMaxSteps: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uMaxSteps,
        min: 16,
        max: 1024,
        step: 1,
      },
      uStepAdapt: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uStepAdapt,
        min: 0.02,
        max: 0.2,
        step: 0.01,
      },
      uUseDebugColorOnTerminate: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uUseDebugColorOnTerminate >= 0.5,
      },
    }),
    DebugNarrowing: folder({
      uPhiBudget: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uPhiBudget,
        min: 2.0,
        max: 200.0,
        step: 1.0,
      },
      uMinStepRatio: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uMinStepRatio,
        min: 0.0,
        max: 0.5,
        step: 0.001,
      },
      uRadialStepBoost: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uRadialStepBoost,
        min: 0.0,
        max: 2.0,
        step: 0.01,
      },
    }),
    AccretionDisc: folder({
      uEnableDiscAccumulation: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uEnableDiscAccumulation >= 0.5,
      },
      Geometry: folder({
        uDiscInnerRadius: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscInnerRadius,
          min: 0.0,
          max: 20.0,
          step: 0.1,
        },
        uDiscOuterRadius: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscOuterRadius,
          min: 0.5,
          max: 40.0,
          step: 0.1,
        },
        uDiscHalfHeight: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscHalfHeight,
          min: 0.01,
          max: 2.0,
          step: 0.01,
        },
      }),
      Medium: folder({
        uDiscDensity: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscDensity,
          min: 0.0,
          max: 5.0,
          step: 0.05,
        },
        uDiscAbsorption: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscAbsorption,
          min: 0.0,
          max: 5.0,
          step: 0.05,
        },
        uDiscInnerSoftness: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscInnerSoftness,
          min: 0.01,
          max: 8.0,
          step: 0.01,
        },
        uDiscOuterSoftness: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscOuterSoftness,
          min: 0.01,
          max: 8.0,
          step: 0.01,
        },
        uDiscVerticalFalloffPower: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscVerticalFalloffPower,
          min: 0.1,
          max: 8.0,
          step: 0.05,
        },
      }),
      Emission: folder({
        uDiscEmissionStrength: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionStrength,
          min: 0.0,
          max: 15.0,
          step: 0.05,
        },
        uDiscEmissionInnerColor: {
          value: colorArrayToHex(
            DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionInnerColor,
          ),
        },
        uDiscEmissionOuterColor: {
          value: colorArrayToHex(
            DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionOuterColor,
          ),
        },
        uDiscEmissionRadialPower: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionRadialPower,
          min: 0.0,
          max: 8.0,
          step: 0.05,
        },
        uDiscEmissionColorCurve: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionColorCurve,
          min: 0.0,
          max: 8.0,
          step: 0.05,
        },
      }),
      Integration: folder({
        uDiscIntegrationQuality: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscIntegrationQuality,
          min: 1,
          max: 3,
          step: 1,
        },
      }),
      Noise: folder({
        uDiscNoiseScale: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscNoiseScale,
          min: 0.01,
          max: 0.2,
          step: 0.001,
        },
        uDiscNoiseStrength: {
          value: DEFAULT_BEND_RENDER_SETTINGS.uDiscNoiseStrength,
          min: 0.0,
          max: 2.0,
          step: 0.01,
        },
      }),
    }),
    Environment: folder({
      uEnvExposure: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uEnvExposure,
        min: 0.0,
        max: 4.0,
        step: 0.05,
      },
    }),
  });

  const discEmissionInnerColor = new Color(uDiscEmissionInnerColor);
  const discEmissionOuterColor = new Color(uDiscEmissionOuterColor);

  const bendSettings: BendRenderSettings = {
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
    uEnvExposure,
  };

  return (
    <StartupLoadingOverlay>
      {({ onMainFirstFrame }) => (
        <div className="render-root">
          <FullscreenPassCanvas
            bendSettings={bendSettings}
            className="main-pass-canvas"
            observerCameraStateRef={observerCameraStateRef}
            mode={passMode}
            showPerf={showPerf}
            onFirstFrame={onMainFirstFrame}
          />
          {showDebugView ? (
            <DebugInsetCanvas observerCameraStateRef={observerCameraStateRef} />
          ) : null}
        </div>
      )}
    </StartupLoadingOverlay>
  );
}
