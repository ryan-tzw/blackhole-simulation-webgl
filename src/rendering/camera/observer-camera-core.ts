import type { RefObject } from "react";
import {
  MathUtils,
  PerspectiveCamera as ThreePerspectiveCamera,
  Vector3,
} from "three";
import {
  OBSERVER_CAMERA_DEFAULTS,
  type ObserverCameraState,
} from "./camera-state";

type ObserverCameraStateScratch = {
  worldForward: Vector3;
  worldRight: Vector3;
  worldUp: Vector3;
};

export function createObserverCamera(): ThreePerspectiveCamera {
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
  return camera;
}

export function createObserverCameraStateScratch(): ObserverCameraStateScratch {
  return {
    worldForward: new Vector3(),
    worldRight: new Vector3(),
    worldUp: new Vector3(),
  };
}

export function publishObserverCameraState(
  observerCamera: ThreePerspectiveCamera,
  observerCameraStateRef: RefObject<ObserverCameraState>,
  scratch: ObserverCameraStateScratch,
) {
  observerCamera.updateMatrixWorld();

  const worldForward = scratch.worldForward;
  const worldRight = scratch.worldRight;
  const worldUp = scratch.worldUp;

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
}

export function syncObserverCameraAspect(
  observerCamera: ThreePerspectiveCamera,
  width: number,
  height: number,
) {
  observerCamera.aspect = height > 0 ? width / height : 1;
  observerCamera.updateProjectionMatrix();
}
