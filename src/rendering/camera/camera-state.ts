import { Vector3 } from "three";

export type Vec3Tuple = [number, number, number];

export type ObserverCameraState = {
  position: Vec3Tuple;
  right: Vec3Tuple;
  up: Vec3Tuple;
  forward: Vec3Tuple;
  fovYRadians: number;
  aspect: number;
};

export type ObserverCameraDefaults = {
  position: Vec3Tuple;
  target: Vec3Tuple;
  fovDegrees: number;
  near: number;
  far: number;
};

// OSOT: canonical observer camera defaults for rendering + debug camera setup.
export const OBSERVER_CAMERA_DEFAULTS: ObserverCameraDefaults = {
  position: [13, 6, 13],
  target: [0, 0, 0],
  fovDegrees: 60,
  near: 0.1,
  far: 200,
};

const positionVec = new Vector3(...OBSERVER_CAMERA_DEFAULTS.position);
const targetVec = new Vector3(...OBSERVER_CAMERA_DEFAULTS.target);
const forwardVec = targetVec.clone().sub(positionVec).normalize();
const worldUpVec = new Vector3(0, 1, 0);

if (Math.abs(forwardVec.dot(worldUpVec)) > 0.999) {
  worldUpVec.set(0, 0, 1);
}

const rightVec = forwardVec.clone().cross(worldUpVec).normalize();
const upVec = rightVec.clone().cross(forwardVec).normalize();

export const DEFAULT_OBSERVER_CAMERA_STATE: ObserverCameraState = {
  position: OBSERVER_CAMERA_DEFAULTS.position,
  right: rightVec.toArray() as Vec3Tuple,
  up: upVec.toArray() as Vec3Tuple,
  forward: forwardVec.toArray() as Vec3Tuple,
  fovYRadians: OBSERVER_CAMERA_DEFAULTS.fovDegrees * (Math.PI / 180),
  aspect: 1,
};
