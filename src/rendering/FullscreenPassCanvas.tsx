import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "./camera-state";
import { FullscreenTriangle } from "./FullscreenTriangle";
import { Perf } from "r3f-perf";

type FullscreenPassCanvasProps = {
  className?: string;
  observerCameraStateRef: RefObject<ObserverCameraState>;
};

export function FullscreenPassCanvas({
  className,
  observerCameraStateRef,
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
      <Perf />
      <FullscreenTriangle observerCameraStateRef={observerCameraStateRef} />
    </Canvas>
  );
}
