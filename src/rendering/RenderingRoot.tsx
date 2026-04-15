import { useRef } from "react";
import { folder, useControls } from "leva";
import {
  createBendRenderSettingsDefaults,
  type BendRenderSettings,
} from "./bend-render-settings";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "./camera-state";
import { DebugInsetCanvas } from "./DebugInsetCanvas";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas";
import { PASS_SHADER_MODES, type PassShaderMode } from "./pass-shader-mode";
import { StartupLoadingOverlay } from "./StartupLoadingOverlay";
import "./rendering-root.css";

const DEFAULT_BEND_RENDER_SETTINGS = createBendRenderSettingsDefaults();

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
    uDiscEmissionColorR,
    uDiscEmissionColorG,
    uDiscEmissionColorB,
    uEnvExposure,
  } = useControls("Render", {
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
      uDiscEmissionStrength: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionStrength,
        min: 0.0,
        max: 8.0,
        step: 0.05,
      },
      uDiscEmissionColorR: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionColor[0],
        min: 0.0,
        max: 5.0,
        step: 0.05,
      },
      uDiscEmissionColorG: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionColor[1],
        min: 0.0,
        max: 5.0,
        step: 0.05,
      },
      uDiscEmissionColorB: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uDiscEmissionColor[2],
        min: 0.0,
        max: 5.0,
        step: 0.05,
      },
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
    uDiscEmissionColor: [
      uDiscEmissionColorR,
      uDiscEmissionColorG,
      uDiscEmissionColorB,
    ],
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
