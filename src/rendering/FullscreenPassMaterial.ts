import { shaderMaterial } from "@react-three/drei";
import { Vector3 } from "three";
import fragmentShader from "../shaders/fullscreen-pass.frag.glsl";
import vertexShader from "../shaders/fullscreen-pass.vert.glsl";
import { extend } from "@react-three/fiber";

export const FullscreenPassMaterial = shaderMaterial(
  {
    uCameraPos: new Vector3(0, 0, 0),
    uCameraRight: new Vector3(1, 0, 0),
    uCameraUp: new Vector3(0, 1, 0),
    uCameraForward: new Vector3(0, 0, -1),
    uFovY: 1.0,
    uAspect: 1.0,
  },
  vertexShader,
  fragmentShader,
);

extend({ FullscreenPassMaterial });
