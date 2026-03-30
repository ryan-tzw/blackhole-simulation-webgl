import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

type PerspectiveDebugCanvasProps = {
  className?: string;
};

export function PerspectiveDebugCanvas({
  className,
}: PerspectiveDebugCanvasProps) {
  return (
    <Canvas className={className}>
      <color attach="background" args={["#1a1d24"]} />

      <PerspectiveCamera
        makeDefault
        position={[4, 3, 4]}
        fov={50}
        near={0.1}
        far={200}
      />
      <OrbitControls />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 6, 3]} intensity={1.2} />

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color="#050505"
          roughness={0.2}
          metalness={0.65}
        />
      </mesh>

      <gridHelper args={[16, 16, "#4b5563", "#374151"]} />
      <axesHelper args={[2]} />
    </Canvas>
  );
}
