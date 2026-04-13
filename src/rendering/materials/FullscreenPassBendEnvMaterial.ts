import { shaderMaterial } from "@react-three/drei";
import fragmentShader from "@/shaders/fullscreen-pass-bend-env.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { getSharedCubemapTexture } from "@/rendering/environment/cubemap";
import { createBendUniformDefaults } from "./bend-uniforms";
import { createObserverCameraUniformDefaults } from "./observer-camera-uniforms";

export const FullscreenPassBendEnvMaterial = shaderMaterial(
  {
    ...createObserverCameraUniformDefaults(),
    ...createBendUniformDefaults(),
    uEnvMap: getSharedCubemapTexture(),
    uEnvExposure: 1.0,
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassBendEnvMaterial });
