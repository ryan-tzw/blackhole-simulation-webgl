import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "./camera-state";
import { FullscreenTriangle } from "./FullscreenTriangle";
import type { PassShaderMode } from "./pass-shader-mode";
import { FXAAPostProcess } from "./postprocessing/FXAAPostProcess";
import { Perf } from "r3f-perf";

type FullscreenPassCanvasProps = {
  className?: string;
  observerCameraStateRef: RefObject<ObserverCameraState>;
  mode?: PassShaderMode;
  adiskLit: number;
  adiskDensityV: number;
  adiskDensityH: number;
  noiseLod: number;
};

export function FullscreenPassCanvas({
  className,
  observerCameraStateRef,
  mode = "march",
  adiskLit,
  adiskDensityV,
  adiskDensityH,
  noiseLod,
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
      <Perf position="bottom-left" />
      <FullscreenTriangle
        observerCameraStateRef={observerCameraStateRef}
        mode={mode}
        adiskLit={adiskLit}
        adiskDensityV={adiskDensityV}
        adiskDensityH={adiskDensityH}
        noiseLod={noiseLod}
      />
      <FXAAPostProcess />
    </Canvas>
  );
}
