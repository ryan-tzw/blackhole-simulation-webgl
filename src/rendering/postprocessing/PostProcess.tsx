import { EffectComposer, SMAA, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import type { PassShaderMode } from "@/rendering/config/pass-shader-mode";

type PostProcessProps = {
  mode: PassShaderMode;
};

export function PostProcess({ mode }: PostProcessProps) {
  const useToneMapping = mode === "march" || mode === "bend-env";

  if (!useToneMapping) {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <SMAA />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <SMAA />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}
