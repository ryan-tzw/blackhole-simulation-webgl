import { Environment, Grid, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";
import {
  DoubleSide,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import {
  OBSERVER_CAMERA_DEFAULTS,
  type ObserverCameraState,
} from "./camera-state";
import { getSharedCubemapTexture } from "@/rendering/environment/cubemap";
import { FirstFrameSignal } from "./FirstFrameSignal";

type PerspectiveDebugCanvasProps = {
  className?: string;
  observerCameraStateRef: RefObject<ObserverCameraState>;
  onFirstFrame?: () => void;
};

export function PerspectiveDebugCanvas({
  className,
  observerCameraStateRef,
  onFirstFrame,
}: PerspectiveDebugCanvasProps) {
  const sharedCubemapTexture = useMemo(() => getSharedCubemapTexture(), []);

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

      <Environment map={sharedCubemapTexture} background />

      <DebugCameraFollower observerCameraStateRef={observerCameraStateRef} />
      <FirstFrameSignal onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}

type DebugCameraFollowerProps = {
  observerCameraStateRef: RefObject<ObserverCameraState>;
};

function DebugCameraFollower({
  observerCameraStateRef,
}: DebugCameraFollowerProps) {
  const lookAtTarget = useMemo(() => new Vector3(), []);
  const nextPosition = useMemo(() => new Vector3(), []);
  const nextForward = useMemo(() => new Vector3(), []);
  const nextUp = useMemo(() => new Vector3(), []);

  useFrame(({ camera }) => {
    if (!(camera instanceof ThreePerspectiveCamera)) {
      return;
    }

    const cameraState = observerCameraStateRef.current;
    const perspectiveCamera = camera;

    nextPosition.set(...cameraState.position);
    nextForward.set(...cameraState.forward).normalize();
    nextUp.set(...cameraState.up).normalize();
    lookAtTarget.copy(nextPosition).add(nextForward);

    perspectiveCamera.position.copy(nextPosition);
    perspectiveCamera.up.copy(nextUp);
    perspectiveCamera.fov = (cameraState.fovYRadians * 180) / Math.PI;
    perspectiveCamera.lookAt(lookAtTarget);
    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
}
