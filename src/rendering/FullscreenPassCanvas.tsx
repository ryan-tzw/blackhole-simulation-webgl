import { Canvas } from "@react-three/fiber";
import { FullscreenTriangle } from "./FullscreenTriangle.tsx";

type FullscreenPassCanvasProps = {
  className?: string;
};

export function FullscreenPassCanvas({ className }: FullscreenPassCanvasProps) {
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
      <FullscreenTriangle />
    </Canvas>
  );
}
