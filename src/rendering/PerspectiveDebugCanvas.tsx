import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  MathUtils,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import type { ObserverCameraState } from "./camera-state.ts";

type PerspectiveDebugCanvasProps = {
  className?: string;
  onCameraUpdate: (cameraState: ObserverCameraState) => void;
};

export function PerspectiveDebugCanvas({
  className,
  onCameraUpdate,
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

      <PerspectiveCameraStatePublisher onCameraUpdate={onCameraUpdate} />
    </Canvas>
  );
}

type PerspectiveCameraStatePublisherProps = {
  onCameraUpdate: (cameraState: ObserverCameraState) => void;
};

function PerspectiveCameraStatePublisher({
  onCameraUpdate,
}: PerspectiveCameraStatePublisherProps) {
  const worldForward = useMemo(() => new Vector3(), []);
  const worldRight = useMemo(() => new Vector3(), []);
  const worldUp = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    if (!(camera instanceof ThreePerspectiveCamera)) {
      return;
    }

    const perspectiveCamera = camera;
    perspectiveCamera.getWorldDirection(worldForward);
    worldRight.set(1, 0, 0).applyQuaternion(perspectiveCamera.quaternion);
    worldUp.set(0, 1, 0).applyQuaternion(perspectiveCamera.quaternion);

    onCameraUpdate({
      position: [
        perspectiveCamera.position.x,
        perspectiveCamera.position.y,
        perspectiveCamera.position.z,
      ],
      right: [worldRight.x, worldRight.y, worldRight.z],
      up: [worldUp.x, worldUp.y, worldUp.z],
      forward: [worldForward.x, worldForward.y, worldForward.z],
      fovYRadians: MathUtils.degToRad(perspectiveCamera.fov),
      aspect: perspectiveCamera.aspect,
    });
  });

  return null;
}
