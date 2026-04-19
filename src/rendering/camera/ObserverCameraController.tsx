import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { CameraControlMode } from "./camera-control-mode";
import type { ObserverCameraState } from "./camera-state";
import {
  createFpsCameraModeController,
  disposeFpsCameraModeController,
  updateFpsCameraModeController,
  type FpsCameraModeController,
} from "./fps-camera-mode";
import {
  createObserverCamera,
  createObserverCameraStateScratch,
  publishObserverCameraState,
  syncObserverCameraAspect,
} from "./observer-camera-core";
import {
  computeOrbitTargetFromCamera,
  createDefaultOrbitTarget,
  createOrbitCameraModeController,
  disposeOrbitCameraModeController,
  getOrbitDistance,
  getOrbitTarget,
  updateOrbitCameraModeController,
  type OrbitCameraModeController,
} from "./orbit-camera-mode";

type ObserverCameraControllerProps = {
  cameraControlMode: CameraControlMode;
  autoOrbit: boolean;
  fpsMoveAcceleration: number;
  fpsMoveDrag: number;
  fpsMoveMaxSpeed: number;
  observerCameraStateRef: RefObject<ObserverCameraState>;
};

export function ObserverCameraController({
  cameraControlMode,
  autoOrbit,
  fpsMoveAcceleration,
  fpsMoveDrag,
  fpsMoveMaxSpeed,
  observerCameraStateRef,
}: ObserverCameraControllerProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const observerCamera = useMemo(() => createObserverCamera(), []);
  const cameraStateScratch = useMemo(
    () => createObserverCameraStateScratch(),
    [],
  );
  const defaultOrbitTarget = useMemo(() => createDefaultOrbitTarget(), []);

  const orbitControllerRef = useRef<OrbitCameraModeController | null>(null);
  const fpsControllerRef = useRef<FpsCameraModeController | null>(null);
  const previousModeRef = useRef<CameraControlMode>(cameraControlMode);
  const orbitDistanceRef = useRef(
    observerCamera.position.distanceTo(defaultOrbitTarget),
  );
  const orbitTargetRef = useRef(defaultOrbitTarget.clone());
  const targetScratchRef = useRef(new Vector3());

  const publishCurrentCameraState = useCallback(() => {
    publishObserverCameraState(
      observerCamera,
      observerCameraStateRef,
      cameraStateScratch,
    );
  }, [cameraStateScratch, observerCamera, observerCameraStateRef]);

  useEffect(() => {
    syncObserverCameraAspect(observerCamera, size.width, size.height);
    publishCurrentCameraState();
  }, [observerCamera, publishCurrentCameraState, size.height, size.width]);

  useEffect(() => {
    const previousMode = previousModeRef.current;

    if (cameraControlMode === "orbit") {
      if (fpsControllerRef.current) {
        disposeFpsCameraModeController(fpsControllerRef.current);
        fpsControllerRef.current = null;
      }
      if (orbitControllerRef.current) {
        disposeOrbitCameraModeController(orbitControllerRef.current);
        orbitControllerRef.current = null;
      }

      const target = targetScratchRef.current;
      if (previousMode === "fps") {
        computeOrbitTargetFromCamera(
          observerCamera,
          orbitDistanceRef.current,
          target,
        );
        orbitTargetRef.current.copy(target);
      } else {
        target.copy(orbitTargetRef.current);
      }

      orbitControllerRef.current = createOrbitCameraModeController(
        observerCamera,
        gl.domElement,
        target,
      );
    } else {
      if (orbitControllerRef.current) {
        orbitDistanceRef.current = getOrbitDistance(orbitControllerRef.current);
        getOrbitTarget(orbitControllerRef.current, orbitTargetRef.current);
        disposeOrbitCameraModeController(orbitControllerRef.current);
        orbitControllerRef.current = null;
      }
      if (fpsControllerRef.current) {
        disposeFpsCameraModeController(fpsControllerRef.current);
        fpsControllerRef.current = null;
      }

      fpsControllerRef.current = createFpsCameraModeController(
        observerCamera,
        gl.domElement,
      );
    }

    previousModeRef.current = cameraControlMode;
    publishCurrentCameraState();
  }, [cameraControlMode, gl, observerCamera, publishCurrentCameraState]);

  useEffect(() => {
    return () => {
      if (orbitControllerRef.current) {
        disposeOrbitCameraModeController(orbitControllerRef.current);
      }
      if (fpsControllerRef.current) {
        disposeFpsCameraModeController(fpsControllerRef.current);
      }
      orbitControllerRef.current = null;
      fpsControllerRef.current = null;
    };
  }, []);

  useFrame((_, delta) => {
    if (cameraControlMode === "orbit") {
      if (orbitControllerRef.current) {
        updateOrbitCameraModeController(
          orbitControllerRef.current,
          autoOrbit,
          delta,
        );
        orbitDistanceRef.current = getOrbitDistance(orbitControllerRef.current);
      }
    } else if (fpsControllerRef.current) {
      updateFpsCameraModeController(
        fpsControllerRef.current,
        {
          acceleration: fpsMoveAcceleration,
          drag: fpsMoveDrag,
          maxSpeed: fpsMoveMaxSpeed,
        },
        delta,
      );
    }

    publishCurrentCameraState();
  }, -1);

  return null;
}
