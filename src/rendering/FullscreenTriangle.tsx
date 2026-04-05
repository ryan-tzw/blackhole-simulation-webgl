import type { RefObject } from "react";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, DoubleSide } from "three";
import type { ObserverCameraState } from "./camera-state";
import { FullscreenPassMaterial } from "./FullscreenPassMaterial";

type FullscreenTriangleProps = {
  observerCameraStateRef: RefObject<ObserverCameraState>;
};

type FullscreenPassMaterialInstance = InstanceType<
  typeof FullscreenPassMaterial
>;

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

  const materialRef = useRef<FullscreenPassMaterialInstance | null>(null);

  useFrame(() => {
    const cameraState = observerCameraStateRef.current;
    const material = materialRef.current;
    if (!material) {
      return;
    }

    material.uCameraPos.set(...cameraState.position);
    material.uCameraRight.set(...cameraState.right);
    material.uCameraUp.set(...cameraState.up);
    material.uCameraForward.set(...cameraState.forward);
    material.uFovY = cameraState.fovYRadians;
    material.uAspect = cameraState.aspect;
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      <fullscreenPassMaterial
        key={FullscreenPassMaterial.key}
        ref={materialRef}
        side={DoubleSide}
      />
    </mesh>
  );
}
