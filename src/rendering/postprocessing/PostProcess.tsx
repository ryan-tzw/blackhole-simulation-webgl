import {
  Bloom,
  EffectComposer,
  Noise,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import { Suspense } from "react";

type PostProcessProps = {
  bloomThreshold: number;
  bloomSmoothing: number;
  bloomIntensity: number;
  noiseOpacity: number;
};

export function PostProcess({
  bloomThreshold,
  bloomSmoothing,
  bloomIntensity,
  noiseOpacity,
}: PostProcessProps) {
  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <SMAA />
        <Bloom
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={bloomSmoothing}
          intensity={bloomIntensity}
        />
        <Vignette eskil={false} offset={0.5} darkness={0.5} opacity={1} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Noise
          premultiply
          blendFunction={BlendFunction.ADD}
          opacity={noiseOpacity}
        />
      </EffectComposer>
    </Suspense>
  );
}
