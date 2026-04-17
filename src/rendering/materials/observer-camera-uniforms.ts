import { Vector3 } from "three";
import { DEFAULT_OBSERVER_CAMERA_STATE } from "@/rendering/camera/camera-state";

export type ObserverCameraUniformDefaults = {
  uCameraPos: Vector3;
  uCameraRight: Vector3;
  uCameraUp: Vector3;
  uCameraForward: Vector3;
  uFovY: number;
  uAspect: number;
};

// OSOT: canonical default values for fullscreen pass observer-camera uniforms.
export function createObserverCameraUniformDefaults(): ObserverCameraUniformDefaults {
  return {
    uCameraPos: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.position),
    uCameraRight: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.right),
    uCameraUp: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.up),
    uCameraForward: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.forward),
    uFovY: DEFAULT_OBSERVER_CAMERA_STATE.fovYRadians,
    uAspect: DEFAULT_OBSERVER_CAMERA_STATE.aspect,
  };
}
