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
    uUseDebugColorOnTerminate: uUseDebugColorOnTerminate ? 1.0 : 0.0,
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
