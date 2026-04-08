import { shaderMaterial } from "@react-three/drei";
import { CubeTextureLoader, SRGBColorSpace, Vector3 } from "three";
import fragmentShader from "@/shaders/fullscreen-pass-march.frag.glsl";
import vertexShader from "@/shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";
import { DEFAULT_OBSERVER_CAMERA_STATE } from "@/rendering/camera-state";

const envMapTexture = new CubeTextureLoader().load([
  "/assets/cubemap/right.png",
  "/assets/cubemap/left.png",
  "/assets/cubemap/top.png",
  "/assets/cubemap/bottom.png",
  "/assets/cubemap/front.png",
  "/assets/cubemap/back.png",
]);
envMapTexture.colorSpace = SRGBColorSpace;

export const FullscreenPassMarchMaterial = shaderMaterial(
  {
    uCameraPos: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.position),
    uCameraRight: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.right),
    uCameraUp: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.up),
    uCameraForward: new Vector3(...DEFAULT_OBSERVER_CAMERA_STATE.forward),
    uFovY: DEFAULT_OBSERVER_CAMERA_STATE.fovYRadians,
    uAspect: DEFAULT_OBSERVER_CAMERA_STATE.aspect,
    uBlackHolePosition: new Vector3(0, 0, 0),
    uBlackHoleRadius: 1.0,
    uEnvMap: envMapTexture,
    uEnvExposure: 1.0,
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassMarchMaterial });
