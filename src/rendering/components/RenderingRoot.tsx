import { useRef } from "react";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "@/rendering/camera/camera-state";
import { useRenderingControls } from "@/rendering/controls/useRenderingControls";
import { DebugInsetCanvas } from "./DebugInsetCanvas";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas";
import { StartupLoadingOverlay } from "./StartupLoadingOverlay";
import "./rendering-root.css";

export function RenderingRoot() {
  const observerCameraStateRef = useRef<ObserverCameraState>(
    DEFAULT_OBSERVER_CAMERA_STATE,
  );
  const {
    passMode,
    showDebugView,
    showPerf,
    bendSettings,
    postProcessingSettings,
  } = useRenderingControls();

  return (
    <StartupLoadingOverlay>
      {({ onMainFirstFrame }) => (
        <div className="render-root">
          <FullscreenPassCanvas
            bendSettings={bendSettings}
            className="main-pass-canvas"
            observerCameraStateRef={observerCameraStateRef}
            mode={passMode}
            bloomThreshold={postProcessingSettings.bloomThreshold}
            bloomSmoothing={postProcessingSettings.bloomSmoothing}
            bloomIntensity={postProcessingSettings.bloomIntensity}
            noiseOpacity={postProcessingSettings.noiseOpacity}
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
