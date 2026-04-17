import { useCallback, useState, type RefObject } from "react";
import type { ObserverCameraState } from "@/rendering/camera/camera-state";
import { PerspectiveDebugCanvas } from "./PerspectiveDebugCanvas";

type DebugInsetCanvasProps = {
  observerCameraStateRef: RefObject<ObserverCameraState>;
};

export function DebugInsetCanvas({
  observerCameraStateRef,
}: DebugInsetCanvasProps) {
  const [isDebugInsetReady, setIsDebugInsetReady] = useState(false);

  const handleFirstFrame = useCallback(() => {
    if (!isDebugInsetReady) {
      setIsDebugInsetReady(true);
    }
  }, [isDebugInsetReady]);

  return (
    <div className="debug-inset">
      <PerspectiveDebugCanvas
        className="debug-inset-canvas"
        observerCameraStateRef={observerCameraStateRef}
        onFirstFrame={handleFirstFrame}
      />
      {!isDebugInsetReady ? (
        <div className="debug-inset-loader" aria-hidden="true">
          <div className="loading-spinner debug-inset-spinner" />
        </div>
      ) : null}
    </div>
  );
}
