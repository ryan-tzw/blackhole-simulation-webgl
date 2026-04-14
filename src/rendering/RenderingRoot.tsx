import { useCallback, useRef } from "react";
import { folder, useControls } from "leva";
import {
  createBendRenderSettingsDefaults,
  type BendRenderSettings,
} from "./bend-render-settings";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "./camera-state";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas";
import { PASS_SHADER_MODES, type PassShaderMode } from "./pass-shader-mode";
import { PerspectiveDebugCanvas } from "./PerspectiveDebugCanvas";
import "./rendering-root.css";

const DEFAULT_BEND_RENDER_SETTINGS = createBendRenderSettingsDefaults();

export function RenderingRoot() {
  const observerCameraStateRef = useRef<ObserverCameraState>(
    DEFAULT_OBSERVER_CAMERA_STATE,
  );

  const handleCameraUpdate = useCallback((cameraState: ObserverCameraState) => {
    observerCameraStateRef.current = cameraState;
  }, []);

  const {
    passMode,
    showDebugView,
    showPerf,
    uRs,
    uPhiStepMin,
    uPhiStepMax,
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
      uPhiStepMin: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uPhiStepMin,
        min: 0.0005,
        max: 0.05,
        step: 0.0005,
      },
      uPhiStepMax: {
        value: DEFAULT_BEND_RENDER_SETTINGS.uPhiStepMax,
        min: 0.005,
        max: 0.5,
        step: 0.005,
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
    uPhiStepMin,
    uPhiStepMax,
    uEnvExposure,
  };

  return (
    <div className="render-root">
      <FullscreenPassCanvas
        bendSettings={bendSettings}
        className="main-pass-canvas"
        observerCameraStateRef={observerCameraStateRef}
        mode={passMode}
        showPerf={showPerf}
      />
      <div
        className={`debug-inset${showDebugView ? "" : " debug-inset-hidden"}`}
      >
        <PerspectiveDebugCanvas
          className="debug-inset-canvas"
          onCameraUpdate={handleCameraUpdate}
        />
      </div>
    </div>
  );
}
