import { useCallback, useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  MathUtils,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  OBSERVER_CAMERA_DEFAULTS,
  type ObserverCameraState,
} from "./camera-state";

type ObserverCameraControllerProps = {
  autoOrbit: boolean;
  observerCameraStateRef: RefObject<ObserverCameraState>;
};

const AUTO_ORBIT_TARGET_SPEED = -0.2;
const AUTO_ORBIT_ACCELERATION = 4.0;
const AUTO_ORBIT_STOP_EPS = 1e-4;

export function ObserverCameraController({
  autoOrbit,
  observerCameraStateRef,
}: ObserverCameraControllerProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const orbitControlsRef = useRef<ThreeOrbitControls | null>(null);
  const observerCameraRef = useRef<ThreePerspectiveCamera | null>(null);
  const worldForwardRef = useRef(new Vector3());
  const worldRightRef = useRef(new Vector3());
  const worldUpRef = useRef(new Vector3());
  const orbitSpeedRef = useRef(0);

  if (observerCameraRef.current == null) {
    const camera = new ThreePerspectiveCamera(
      OBSERVER_CAMERA_DEFAULTS.fovDegrees,
      1,
      OBSERVER_CAMERA_DEFAULTS.near,
      OBSERVER_CAMERA_DEFAULTS.far,
    );
    camera.position.set(...OBSERVER_CAMERA_DEFAULTS.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(...OBSERVER_CAMERA_DEFAULTS.target);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    observerCameraRef.current = camera;
  }

  const publishObserverCameraState = useCallback(() => {
    const observerCamera = observerCameraRef.current;
    if (!observerCamera) {
      return;
    }

    const worldForward = worldForwardRef.current;
    const worldRight = worldRightRef.current;
    const worldUp = worldUpRef.current;

    observerCamera.getWorldDirection(worldForward);
    worldRight.set(1, 0, 0).applyQuaternion(observerCamera.quaternion);
    worldUp.set(0, 1, 0).applyQuaternion(observerCamera.quaternion);

    observerCameraStateRef.current = {
      position: [...observerCamera.position.toArray()],
      right: [...worldRight.toArray()],
      up: [...worldUp.toArray()],
      forward: [...worldForward.toArray()],
      fovYRadians: MathUtils.degToRad(observerCamera.fov),
      aspect: observerCamera.aspect,
    };
  }, [observerCameraStateRef]);

  useEffect(() => {
    const observerCamera = observerCameraRef.current;
    if (!observerCamera) {
      return;
    }

    const aspect = size.height > 0 ? size.width / size.height : 1;
    observerCamera.aspect = aspect;
    observerCamera.updateProjectionMatrix();
    publishObserverCameraState();
  }, [publishObserverCameraState, size.height, size.width]);

  useEffect(() => {
    const observerCamera = observerCameraRef.current;
    if (!observerCamera) {
      return;
    }

    const controls = new ThreeOrbitControls(observerCamera, gl.domElement);
    controls.target.set(...OBSERVER_CAMERA_DEFAULTS.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0;
    controls.update();
    orbitControlsRef.current = controls;
    publishObserverCameraState();

    return () => {
      controls.dispose();
      orbitControlsRef.current = null;
    };
  }, [gl, publishObserverCameraState]);

  useFrame((_, delta) => {
    const controls = orbitControlsRef.current;
    if (!controls) {
      return;
    }

    const targetOrbitSpeed = autoOrbit ? AUTO_ORBIT_TARGET_SPEED : 0;
    orbitSpeedRef.current = MathUtils.damp(
      orbitSpeedRef.current,
      targetOrbitSpeed,
      AUTO_ORBIT_ACCELERATION,
      delta,
    );

    const currentOrbitSpeed = orbitSpeedRef.current;
    controls.autoRotate = Math.abs(currentOrbitSpeed) > AUTO_ORBIT_STOP_EPS;
    controls.autoRotateSpeed = currentOrbitSpeed;
    controls.update();
    publishObserverCameraState();
  }, -1);

  return null;
}
