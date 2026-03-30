import type { MutableRefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "./camera-state";
import { FullscreenTriangle } from "./FullscreenTriangle";

type FullscreenPassCanvasProps = {
  className?: string;
  observerCameraStateRef: MutableRefObject<ObserverCameraState>;
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
      <FullscreenTriangle observerCameraStateRef={observerCameraStateRef} />
    </Canvas>
  );
}
