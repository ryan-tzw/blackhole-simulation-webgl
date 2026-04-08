import {
  Environment,
  Grid,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  DoubleSide,
  MathUtils,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import {
  OBSERVER_CAMERA_DEFAULTS,
  type ObserverCameraState,
} from "./camera-state";

type PerspectiveDebugCanvasProps = {
  className?: string;
  onCameraUpdate: (cameraState: ObserverCameraState) => void;
};

const DEBUG_ENV_CUBEMAP_FILES = [
  "/assets/cubemap/right.png",
  "/assets/cubemap/left.png",
  "/assets/cubemap/top.png",
  "/assets/cubemap/bottom.png",
  "/assets/cubemap/front.png",
  "/assets/cubemap/back.png",
];

export function PerspectiveDebugCanvas({
  className,
  onCameraUpdate,
}: PerspectiveDebugCanvasProps) {
  return (
    <Canvas className={className}>
      <color attach="background" args={["#1a1d24"]} />

      <PerspectiveCamera
        makeDefault
        position={OBSERVER_CAMERA_DEFAULTS.position}
        fov={OBSERVER_CAMERA_DEFAULTS.fovDegrees}
        near={OBSERVER_CAMERA_DEFAULTS.near}
        far={OBSERVER_CAMERA_DEFAULTS.far}
      />
      <OrbitControls target={OBSERVER_CAMERA_DEFAULTS.target} />

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

      <Grid
        args={[16, 16]}
        cellColor="#4b5563"
        sectionColor="#374151"
        side={DoubleSide}
      />
      <axesHelper args={[2]} />

      <Environment files={DEBUG_ENV_CUBEMAP_FILES} background />

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
      position: [...perspectiveCamera.position.toArray()],
      right: [...worldRight.toArray()],
      up: [...worldUp.toArray()],
      forward: [...worldForward.toArray()],
      fovYRadians: MathUtils.degToRad(perspectiveCamera.fov),
      aspect: perspectiveCamera.aspect,
    });
  });

  return null;
}
