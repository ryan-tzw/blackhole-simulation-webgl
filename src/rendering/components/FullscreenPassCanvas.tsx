import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import type { ObserverCameraState } from "@/rendering/camera/camera-state";
import type { BendRenderSettings } from "@/rendering/config/bend-render-settings";
import type { PassShaderMode } from "@/rendering/config/pass-shader-mode";
import { ObserverCameraController } from "@/rendering/camera/ObserverCameraController";
import { PostProcess } from "@/rendering/postprocessing/PostProcess";
import { FullscreenTriangle } from "./FullscreenTriangle";
import { Perf } from "r3f-perf";
import { FirstFrameSignal } from "./FirstFrameSignal";

type FullscreenPassCanvasProps = {
  className?: string;
  observerCameraStateRef: RefObject<ObserverCameraState>;
  autoOrbit: boolean;
  bendSettings: BendRenderSettings;
  mode?: PassShaderMode;
  bloomThreshold: number;
  bloomSmoothing: number;
  bloomIntensity: number;
  noiseOpacity: number;
  showPerf?: boolean;
  onFirstFrame?: () => void;
};

export function FullscreenPassCanvas({
  className,
  observerCameraStateRef,
  autoOrbit,
  bendSettings,
  mode = "march",
  bloomThreshold,
  bloomSmoothing,
  bloomIntensity,
  noiseOpacity,
  showPerf = true,
  onFirstFrame,
}: FullscreenPassCanvasProps) {
  return (
    <Canvas
      className={className}
      orthographic
      camera={{
        position: [0, 0, 1],
        left: -1,
        right: 1,
        top: 1,
        bottom: -1,
        near: 0.1,
        far: 100,
      }}
      dpr={1}
    >
      {showPerf ? <Perf position="bottom-left" /> : null}
      <ObserverCameraController
        autoOrbit={autoOrbit}
        observerCameraStateRef={observerCameraStateRef}
      />
      <FullscreenTriangle
        bendSettings={bendSettings}
        observerCameraStateRef={observerCameraStateRef}
        mode={mode}
      />
      <PostProcess
        bloomThreshold={bloomThreshold}
        bloomSmoothing={bloomSmoothing}
        bloomIntensity={bloomIntensity}
        noiseOpacity={noiseOpacity}
      />
      <FirstFrameSignal onFirstFrame={onFirstFrame} />
    </Canvas>
  );
}
