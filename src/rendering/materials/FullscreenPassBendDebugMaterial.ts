import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-bend-debug.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { DEFAULT_OBSERVER_CAMERA_STATE } from "@/rendering/camera-state";

export const FullscreenPassBendDebugMaterial = shaderMaterial(
  {
    uCameraPos: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.position),
    uCameraRight: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.right),
    uCameraUp: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.up),
    uCameraForward: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.forward),
    uFovY: DEFAULT_OBSERVER_CAMERA_STATE.fovYRadians,
    uAspect: DEFAULT_OBSERVER_CAMERA_STATE.aspect,
    uRs: 1.0,
    uPhiStep: 0.01,
    uEscapeRadius: 50.0,
    uCaptureColor: new Vector3(0.0, 0.0, 0.0),
    uEscapeColor: new Vector3(0.1, 0.55, 0.95),
    uMaxIterColor: new Vector3(1.0, 0.55, 0.1),
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassBendDebugMaterial });
