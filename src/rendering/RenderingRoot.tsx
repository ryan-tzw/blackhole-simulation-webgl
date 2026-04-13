import { useCallback, useRef } from "react";
import { useControls } from "leva";
import {
  DEFAULT_OBSERVER_CAMERA_STATE,
  type ObserverCameraState,
} from "./camera-state";
import { FullscreenPassCanvas } from "./FullscreenPassCanvas";
import { PASS_SHADER_MODES, type PassShaderMode } from "./pass-shader-mode";
import { PerspectiveDebugCanvas } from "./PerspectiveDebugCanvas";
import "./rendering-root.css";

export function RenderingRoot() {
  const observerCameraStateRef = useRef<ObserverCameraState>(
    DEFAULT_OBSERVER_CAMERA_STATE,
  );

  const handleCameraUpdate = useCallback((cameraState: ObserverCameraState) => {
    observerCameraStateRef.current = cameraState;
  }, []);

  const { passMode } = useControls("Render", {
    passMode: {
      value: "bend-env" as PassShaderMode,
      options: PASS_SHADER_MODES,
    },
  });

  const { lit } = useControls("Accretion Disk", {
    lit: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.1,
    },
  });

  const { densityV } = useControls("Accretion Disk", {
    densityV: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 1,
    },
  });

  const { densityH } = useControls("Accretion Disk", {
    densityH: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 1,
    },
  });

  const { noiseLod } = useControls("Accretion Disk", {
    noiseLod: {
      value: 5.0,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  return (
    <div className="render-root">
      <FullscreenPassCanvas
        className="main-pass-canvas"
        observerCameraStateRef={observerCameraStateRef}
        mode={passMode}
        adiskLit={lit}
        adiskDensityV={densityV}
        adiskDensityH={densityH}
        noiseLod={noiseLod}
      />
      <div className="debug-inset">
        <PerspectiveDebugCanvas
          className="debug-inset-canvas"
          onCameraUpdate={handleCameraUpdate}
        />
      </div>
    </div>
  );
}
