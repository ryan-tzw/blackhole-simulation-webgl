import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-bend-debug.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { createObserverCameraUniformDefaults } from "./observer-camera-uniforms";

export const FullscreenPassBendDebugMaterial = shaderMaterial(
  {
    ...createObserverCameraUniformDefaults(),
    uRs: 1.0,
    uPhiStepMin: 0.001,
    uPhiStepMax: 0.01,
    uMaxRelUChange: 0.01,
    uMaxAbsUPrimeChange: 0.01,
    uEscapeRadius: 100.0,
    uEscapeRadiusScale: 4.0,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uEscapeColor: new Vector3(0.1, 0.55, 0.95),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassBendDebugMaterial });
