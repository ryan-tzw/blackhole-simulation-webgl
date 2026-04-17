import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "../camera/camera-state";
import type { BendRenderSettings } from "../config/bend-render-settings";
import { FullscreenTriangle } from "./FullscreenTriangle";
import { ObserverCameraController } from "../camera/ObserverCameraController";
import type { PassShaderMode } from "../config/pass-shader-mode";
import { FXAAPostProcess } from "../postprocessing/FXAAPostProcess";
import { Perf } from "r3f-perf";
import { FirstFrameSignal } from "./FirstFrameSignal";

type FullscreenPassCanvasProps = {
  className?: string;
  observerCameraStateRef: RefObject<ObserverCameraState>;
  bendSettings: BendRenderSettings;
  mode?: PassShaderMode;
  showPerf?: boolean;
  onFirstFrame?: () => void;
};

export function FullscreenPassCanvas({
  className,
  observerCameraStateRef,
  bendSettings,
  mode = "march",
  showPerf = true,
  onFirstFrame,
}: FullscreenPassCanvasProps) {
  return (
    <Canvas
      className={className}
      orthographic
      camera={{
        position: [0, 0, 1],
        left: -1,
        right: 1,
        top: 1,
        bottom: -1,
        near: 0.1,
        far: 100,
      }}
    >
      {showPerf ? <Perf position="bottom-left" /> : null}
      <ObserverCameraController
        observerCameraStateRef={observerCameraStateRef}
      />
      <FullscreenTriangle
        bendSettings={bendSettings}
        observerCameraStateRef={observerCameraStateRef}
        mode={mode}
      />
      <FXAAPostProcess />
      <FirstFrameSignal onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
