import { MathUtils, PerspectiveCamera, Vector3 } from "three";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { OBSERVER_CAMERA_DEFAULTS } from "./camera-state";

const AUTO_ORBIT_TARGET_SPEED = -0.2;
const AUTO_ORBIT_ACCELERATION = 4.0;
const AUTO_ORBIT_STOP_EPS = 1e-4;

export type OrbitCameraModeController = {
  controls: ThreeOrbitControls;
  orbitSpeed: number;
};

export function createOrbitCameraModeController(
  observerCamera: PerspectiveCamera,
  domElement: HTMLElement,
  target: Vector3,
): OrbitCameraModeController {
  const controls = new ThreeOrbitControls(observerCamera, domElement);
  controls.target.copy(target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0;
  controls.update();

  return {
    controls,
    orbitSpeed: 0,
  };
}

export function updateOrbitCameraModeController(
  controller: OrbitCameraModeController,
  autoOrbit: boolean,
  delta: number,
) {
  const targetOrbitSpeed = autoOrbit ? AUTO_ORBIT_TARGET_SPEED : 0;
  controller.orbitSpeed = MathUtils.damp(
    controller.orbitSpeed,
    targetOrbitSpeed,
    AUTO_ORBIT_ACCELERATION,
    delta,
  );
  controller.controls.autoRotate =
    Math.abs(controller.orbitSpeed) > AUTO_ORBIT_STOP_EPS;
  controller.controls.autoRotateSpeed = controller.orbitSpeed;
  controller.controls.update();
}

export function disposeOrbitCameraModeController(
  controller: OrbitCameraModeController,
) {
  controller.controls.dispose();
}

export function getOrbitDistance(
  controller: OrbitCameraModeController,
): number {
  return controller.controls.object.position.distanceTo(
    controller.controls.target,
  );
}

export function getOrbitTarget(
  controller: OrbitCameraModeController,
  outTarget: Vector3,
) {
  outTarget.copy(controller.controls.target);
}

export function computeOrbitTargetFromCamera(
  observerCamera: PerspectiveCamera,
  distance: number,
  outTarget: Vector3,
) {
  observerCamera.getWorldDirection(outTarget);
  outTarget.multiplyScalar(distance).add(observerCamera.position);
}

export function createDefaultOrbitTarget(): Vector3 {
  return new Vector3(...OBSERVER_CAMERA_DEFAULTS.target);
}
