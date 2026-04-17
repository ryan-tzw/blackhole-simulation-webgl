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

  const { innerRadius } = useControls("Accretion Disk", {
    innerRadius: {
      value: 2.6,
      min: 1,
      max: 20,
      step: 0.1,
    },
  });

  const { outerRadius } = useControls("Accretion Disk", {
    outerRadius: {
      value: 12.0,
      min: 1,
      max: 50,
      step: 0.1,
    },
  });

  const { height } = useControls("Accretion Disk", {
    height: {
      value: 0.2,
      min: 0.1,
      max: 5,
      step: 0.1,
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
      step: 0.1,
    },
  });

  const { densityH } = useControls("Accretion Disk", {
    densityH: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  const { noiseScale } = useControls("Accretion Disk", {
    noiseScale: {
      value: 5.0,
      min: 0,
      max: 10,
      step: 0.1,
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

  const { speed } = useControls("Accretion Disk", {
    speed: {
      value: 0.5,
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
        adiskInnerRadius={innerRadius}
        adiskOuterRadius={outerRadius}
        adiskHeight={height}
        adiskLit={lit}
        adiskDensityV={densityV}
        adiskDensityH={densityH}
        adiskNoiseScale={noiseScale}
        adiskNoiseLod={noiseLod}
        adiskSpeed={speed}
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
