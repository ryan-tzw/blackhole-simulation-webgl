export type Vec3Tuple = [number, number, number];

export type ObserverCameraState = {
  position: Vec3Tuple;
  right: Vec3Tuple;
  up: Vec3Tuple;
  forward: Vec3Tuple;
  fovYRadians: number;
  aspect: number;
};

export const DEFAULT_OBSERVER_CAMERA_STATE: ObserverCameraState = {
  position: [4, 3, 4],
  right: [1, 0, 0],
  up: [0, 1, 0],
  forward: [-0.5773502692, -0.5773502692, -0.5773502692],
  fovYRadians: 0.872664626,
  aspect: 1,
};
