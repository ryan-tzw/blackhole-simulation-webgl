import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "@/rendering/camera/camera-state";
import type { BendRenderSettings } from "@/rendering/config/bend-render-settings";
import type { PassShaderMode } from "@/rendering/config/pass-shader-mode";
import { ObserverCameraController } from "@/rendering/camera/ObserverCameraController";
import { PostProcess } from "@/rendering/postprocessing/PostProcess";
import { FullscreenTriangle } from "./FullscreenTriangle";
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
      dpr={1}
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
      <PostProcess />
      <FirstFrameSignal onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
