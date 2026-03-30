import { Canvas } from "@react-three/fiber";
import { FullscreenTriangle } from "./FullscreenTriangle.tsx";

export function FullscreenPassCanvas() {
  return (
    <Canvas
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
      <FullscreenTriangle />
    </Canvas>
  );
}
