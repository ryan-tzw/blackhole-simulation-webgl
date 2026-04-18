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

export function PostProcess() {
  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <SMAA />
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.1}
          intensity={0.1}
        />
        <Vignette eskil={false} offset={0.5} darkness={0.5} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        <Noise premultiply blendFunction={BlendFunction.ADD} />
      </EffectComposer>
    </Suspense>
  );
}
