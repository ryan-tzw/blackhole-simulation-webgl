import { shaderMaterial } from "@react-three/drei";
import { EquirectangularReflectionMapping, LinearFilter, Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-bend-env.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { DEFAULT_OBSERVER_CAMERA_STATE } from "@/rendering/camera-state";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

const envMapTexture = new HDRLoader().load(
  "/assets/env/kloppenheim_06_puresky_1k.hdr",
);
envMapTexture.mapping = EquirectangularReflectionMapping;
envMapTexture.magFilter = LinearFilter;
envMapTexture.minFilter = LinearFilter;
envMapTexture.generateMipmaps = false;

export const FullscreenPassBendEnvMaterial = shaderMaterial(
  {
    uCameraPos: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.position),
    uCameraRight: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.right),
    uCameraUp: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.up),
    uCameraForward: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.forward),
    uFovY: DEFAULT_OBSERVER_CAMERA_STATE.fovYRadians,
    uAspect: DEFAULT_OBSERVER_CAMERA_STATE.aspect,
    uRs: 1.0,
    uPhiStepMin: 0.001,
    uPhiStepMax: 0.01,
    uMaxRelUChange: 0.01,
    uMaxAbsUPrimeChange: 0.01,
    uEscapeRadius: 100.0,
    uEscapeRadiusScale: 4.0,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
    uEnvMap: envMapTexture,
    uEnvExposure: 1.0,
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassBendEnvMaterial });
