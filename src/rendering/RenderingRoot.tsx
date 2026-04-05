import { useCallback, useRef } from "react";
import { useControls } from "leva";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "./camera-state";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas";
import type { PassShaderMode } from "./FullscreenTriangle";
import { PerspectiveDebugCanvas } from "./PerspectiveDebugCanvas";
import "./rendering-root.css";

export function RenderingRoot() {
  const observerCameraStateRef = useRef<ObserverCameraState>(
    DEFAULT_OBSERVER_CAMERA_STATE,
  );

  const handleCameraUpdate = useCallback((cameraState: ObserverCameraState) => {
    observerCameraStateRef.current = cameraState;
  }, []);

  const PASS_SHADER_MODES = ["debug", "march"] as PassShaderMode[];

  const { passMode } = useControls("Render", {
    passMode: {
      value: "march" as PassShaderMode,
      options: PASS_SHADER_MODES,
    },
  });

  return (
    <div className="render-root">
      <FullscreenPassCanvas
        className="main-pass-canvas"
        observerCameraStateRef={observerCameraStateRef}
        mode={passMode}
      />
      <div className="debug-inset">
        <PerspectiveDebugCanvas
          className="debug-inset-canvas"
          onCameraUpdate={handleCameraUpdate}
        />
      </div>
    </div>
  );
}
