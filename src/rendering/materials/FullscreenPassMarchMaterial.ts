import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-march.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { getSharedCubemapTexture } from "@/rendering/environment/cubemap";
import { createObserverCameraUniformDefaults } from "./observer-camera-uniforms";

export const FullscreenPassMarchMaterial = shaderMaterial(
  {
    ...createObserverCameraUniformDefaults(),
    uBlackHolePosition: new Vector3(0, 0, 0),
    uBlackHoleRadius: 1.0,
    uEnvMap: getSharedCubemapTexture(),
    uEnvExposure: 1.0,
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassMarchMaterial });
