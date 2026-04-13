import { shaderMaterial } from "@react-three/drei";
import fragmentShader from "@/shaders/fullscreen-pass.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { createObserverCameraUniformDefaults } from "./observer-camera-uniforms";

export const FullscreenPassMaterial = shaderMaterial(
  {
    ...createObserverCameraUniformDefaults(),
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassMaterial });
