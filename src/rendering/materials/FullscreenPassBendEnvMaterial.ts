import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-bend-env.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { getSharedCubemapTexture } from "@/rendering/environment/cubemap";
import { createObserverCameraUniformDefaults } from "./observer-camera-uniforms";

export const FullscreenPassBendEnvMaterial = shaderMaterial(
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
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
    uEnvMap: getSharedCubemapTexture(),
    uEnvExposure: 1.0,
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassBendEnvMaterial });
