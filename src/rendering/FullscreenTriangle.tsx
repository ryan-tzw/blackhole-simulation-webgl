import type { MutableRefObject } from "react";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  ShaderMaterial,
  Vector3,
} from "three";
import type { ObserverCameraState } from "./camera-state.ts";
import fragmentShader from "../shaders/fullscreen-pass.frag.glsl";
import vertexShader from "../shaders/fullscreen-pass.vert.glsl";

type FullscreenTriangleProps = {
  observerCameraStateRef: MutableRefObject<ObserverCameraState>;
};

type FullscreenUniforms = {
  uCameraPos: { value: Vector3 };
  uCameraRight: { value: Vector3 };
  uCameraUp: { value: Vector3 };
  uCameraForward: { value: Vector3 };
  uFovY: { value: number };
  uAspect: { value: number };
};

export function FullscreenTriangle({
  observerCameraStateRef,
}: FullscreenTriangleProps) {
  const geometry = useMemo(() => {
    const triangle = new BufferGeometry();
    const positions = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    triangle.setAttribute("position", new BufferAttribute(positions, 3));
    triangle.setAttribute("uv", new BufferAttribute(uvs, 2));

    return triangle;
  }, []);

  const materialRef = useRef<ShaderMaterial | null>(null);
  const uniforms = useMemo<FullscreenUniforms>(
    () => ({
      uCameraPos: { value: new Vector3(0, 0, 0) },
      uCameraRight: { value: new Vector3(1, 0, 0) },
      uCameraUp: { value: new Vector3(0, 1, 0) },
      uCameraForward: { value: new Vector3(0, 0, -1) },
      uFovY: { value: 1.0 },
      uAspect: { value: 1.0 },
    }),
    [],
  );

  useFrame(() => {
    const cameraState = observerCameraStateRef.current;
    const material = materialRef.current;
    if (!material) {
      return;
    }
    const shaderUniforms = material.uniforms as unknown as FullscreenUniforms;

    shaderUniforms.uCameraPos.value.set(...cameraState.position);
    shaderUniforms.uCameraRight.value.set(...cameraState.right);
    shaderUniforms.uCameraUp.value.set(...cameraState.up);
    shaderUniforms.uCameraForward.value.set(...cameraState.forward);
    shaderUniforms.uFovY.value = cameraState.fovYRadians;
    shaderUniforms.uAspect.value = cameraState.aspect;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={DoubleSide}
        uniforms={uniforms}
      />
    </mesh>
  );
}
