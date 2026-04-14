import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "./camera-state";
import type { BendRenderSettings } from "./bend-render-settings";
import { FullscreenTriangle } from "./FullscreenTriangle";
import type { PassShaderMode } from "./pass-shader-mode";
import { FXAAPostProcess } from "./postprocessing/FXAAPostProcess";
import { Perf } from "r3f-perf";

type FullscreenPassCanvasProps = {
  className?: string;
  observerCameraStateRef: RefObject<ObserverCameraState>;
  bendSettings: BendRenderSettings;
  mode?: PassShaderMode;
  showPerf?: boolean;
};

export function FullscreenPassCanvas({
  className,
  observerCameraStateRef,
  bendSettings,
  mode = "march",
  showPerf = true,
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
      <FullscreenTriangle
        bendSettings={bendSettings}
        observerCameraStateRef={observerCameraStateRef}
        mode={mode}
      />
      <FXAAPostProcess />
    </Canvas>
  );
}
