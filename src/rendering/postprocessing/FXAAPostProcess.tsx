import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

export function FXAAPostProcess() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const composer = useMemo(() => new EffectComposer(gl), [gl]);
  const renderPass = useMemo(
    () => new RenderPass(scene, camera),
    [scene, camera],
  );
  const fxaaPass = useMemo(() => new ShaderPass(FXAAShader), []);

  useEffect(() => {
    composer.addPass(renderPass);
    composer.addPass(fxaaPass);

    return () => {
      composer.removePass(renderPass);
      composer.removePass(fxaaPass);
      composer.dispose();
    };
  }, [composer, renderPass, fxaaPass]);

  useEffect(() => {
    const pixelRatio = gl.getPixelRatio();
    composer.setPixelRatio(pixelRatio);
    composer.setSize(size.width, size.height);

    fxaaPass.material.uniforms.resolution.value.set(
      1 / (size.width * pixelRatio),
      1 / (size.height * pixelRatio),
    );
  }, [composer, fxaaPass, gl, size.height, size.width]);

  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}
