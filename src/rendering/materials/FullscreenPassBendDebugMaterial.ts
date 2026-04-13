import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-bend-debug.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { createBendUniformDefaults } from "./bend-uniforms";
import { createObserverCameraUniformDefaults } from "./observer-camera-uniforms";

export const FullscreenPassBendDebugMaterial = shaderMaterial(
  {
    ...createObserverCameraUniformDefaults(),
    ...createBendUniformDefaults(),
    uEscapeColor: new Vector3(0.1, 0.55, 0.95),
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassBendDebugMaterial });
