import { PerspectiveCamera, Vector3 } from "three";
import { PointerLockControls as ThreePointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";

type FpsKeyState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export type FpsMovementSettings = {
  acceleration: number;
  drag: number;
  maxSpeed: number;
};

export type FpsCameraModeController = {
  controls: ThreePointerLockControls;
  velocity: Vector3;
  keyState: FpsKeyState;
  forwardDir: Vector3;
  rightDir: Vector3;
  upDir: Vector3;
  inputDir: Vector3;
  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
  handlePointerDown: () => void;
};

function updateKeyState(
  keyState: FpsKeyState,
  event: KeyboardEvent,
  value: boolean,
) {
  switch (event.code) {
    case "KeyW":
      keyState.forward = value;
      break;
    case "KeyS":
      keyState.backward = value;
      break;
    case "KeyA":
      keyState.left = value;
      break;
    case "KeyD":
      keyState.right = value;
      break;
    case "KeyX":
      keyState.up = value;
      break;
    case "KeyZ":
      keyState.down = value;
      break;
    default:
      break;
  }
}

export function createFpsCameraModeController(
  observerCamera: PerspectiveCamera,
  domElement: HTMLElement,
): FpsCameraModeController {
  const controls = new ThreePointerLockControls(observerCamera, domElement);
  controls.enabled = true;

  const keyState: FpsKeyState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    updateKeyState(keyState, event, true);
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    updateKeyState(keyState, event, false);
  };

  const handlePointerDown = () => {
    if (!controls.isLocked) {
      controls.lock();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  domElement.addEventListener("pointerdown", handlePointerDown);

  controls.lock();

  return {
    controls,
    velocity: new Vector3(),
    keyState,
    forwardDir: new Vector3(),
    rightDir: new Vector3(),
    upDir: new Vector3(),
    inputDir: new Vector3(),
    handleKeyDown,
    handleKeyUp,
    handlePointerDown,
  };
}

export function updateFpsCameraModeController(
  controller: FpsCameraModeController,
  movement: FpsMovementSettings,
  delta: number,
) {
  const {
    controls,
    keyState,
    velocity,
    forwardDir,
    rightDir,
    upDir,
    inputDir,
  } = controller;

  inputDir.set(0, 0, 0);

  if (controls.isLocked) {
    forwardDir.set(0, 0, -1).applyQuaternion(controls.object.quaternion);
    rightDir.set(1, 0, 0).applyQuaternion(controls.object.quaternion);

    if (keyState.forward) {
      inputDir.add(forwardDir);
    }
    if (keyState.backward) {
      inputDir.sub(forwardDir);
    }
    if (keyState.right) {
      inputDir.add(rightDir);
    }
    if (keyState.left) {
      inputDir.sub(rightDir);
    }
    if (keyState.up) {
      upDir.copy(controls.object.up).normalize();
      inputDir.add(upDir);
    }
    if (keyState.down) {
      upDir.copy(controls.object.up).normalize();
      inputDir.sub(upDir);
    }

    if (inputDir.lengthSq() > 0) {
      inputDir.normalize();
      velocity.addScaledVector(
        inputDir,
        Math.max(movement.acceleration, 0.0) * delta,
      );
    }
  }

  const dragFactor = Math.exp(-Math.max(movement.drag, 0.0) * delta);
  velocity.multiplyScalar(dragFactor);

  const maxSpeed = Math.max(movement.maxSpeed, 0.0);
  if (velocity.lengthSq() > maxSpeed * maxSpeed) {
    velocity.setLength(maxSpeed);
  }

  controls.object.position.addScaledVector(velocity, delta);
}

export function disposeFpsCameraModeController(
  controller: FpsCameraModeController,
) {
  window.removeEventListener("keydown", controller.handleKeyDown);
  window.removeEventListener("keyup", controller.handleKeyUp);
  controller.controls.domElement?.removeEventListener(
    "pointerdown",
    controller.handlePointerDown,
  );
  if (controller.controls.isLocked) {
    controller.controls.unlock();
  }
  controller.controls.dispose();
}
