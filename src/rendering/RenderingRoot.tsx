import { useCallback, useRef } from "react";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "./camera-state.ts";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas.tsx";
import { PerspectiveDebugCanvas } from "./PerspectiveDebugCanvas.tsx";
import "./rendering-root.css";

export function RenderingRoot() {
  const observerCameraStateRef = useRef<ObserverCameraState>(
    DEFAULT_OBSERVER_CAMERA_STATE,
  );

  const handleCameraUpdate = useCallback((cameraState: ObserverCameraState) => {
    observerCameraStateRef.current = cameraState;
  }, []);

  return (
    <div className="render-root">
      <FullscreenPassCanvas
        className="main-pass-canvas"
        observerCameraStateRef={observerCameraStateRef}
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
