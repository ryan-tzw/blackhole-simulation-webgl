import type { RefObject } from "react";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, DoubleSide } from "three";
import type { ObserverCameraState } from "./camera-state";
import { FullscreenPassBendDebugMaterial } from "./materials/FullscreenPassBendDebugMaterial";
import { FullscreenPassMaterial } from "./materials/FullscreenPassMaterial";
import { FullscreenPassMarchMaterial } from "./materials/FullscreenPassMarchMaterial";
import type { PassShaderMode } from "./pass-shader-mode";

type FullscreenTriangleProps = {
  observerCameraStateRef: RefObject<ObserverCameraState>;
  mode?: PassShaderMode;
};

type FullscreenPassMaterialInstance = InstanceType<
  typeof FullscreenPassMaterial
>;
type FullscreenPassMarchMaterialInstance = InstanceType<
  typeof FullscreenPassMarchMaterial
>;
type FullscreenPassBendDebugMaterialInstance = InstanceType<
  typeof FullscreenPassBendDebugMaterial
>;

export function FullscreenTriangle({
  observerCameraStateRef,
  mode = "debug",
}: FullscreenTriangleProps) {
  const size = useThree((state) => state.size);
  const geometry = useMemo(() => {
    const triangle = new BufferGeometry();
    const positions = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    triangle.setAttribute("position", new BufferAttribute(positions, 3));
    triangle.setAttribute("uv", new BufferAttribute(uvs, 2));

    return triangle;
  }, []);

  const debugMaterialRef = useRef<FullscreenPassMaterialInstance | null>(null);
  const marchMaterialRef = useRef<FullscreenPassMarchMaterialInstance | null>(
    null,
  );
  const bendDebugMaterialRef =
    useRef<FullscreenPassBendDebugMaterialInstance | null>(null);

  useFrame(() => {
    const cameraState = observerCameraStateRef.current;
    const passAspect =
      size.height > 0 ? size.width / size.height : cameraState.aspect;
    const updateMaterial = (
      material: {
        uCameraPos: { set: (...v: number[]) => unknown };
        uCameraRight: { set: (...v: number[]) => unknown };
        uCameraUp: { set: (...v: number[]) => unknown };
        uCameraForward: { set: (...v: number[]) => unknown };
        uFovY: number;
        uAspect: number;
      } | null,
    ) => {
      if (!material) {
        return;
      }

      material.uCameraPos.set(...cameraState.position);
      material.uCameraRight.set(...cameraState.right);
      material.uCameraUp.set(...cameraState.up);
      material.uCameraForward.set(...cameraState.forward);
      material.uFovY = cameraState.fovYRadians;
      material.uAspect = passAspect;
    };

    updateMaterial(debugMaterialRef.current);
    updateMaterial(marchMaterialRef.current);
    updateMaterial(bendDebugMaterialRef.current);
  });

  return (
    <mesh geometry={geometry} frustumCulled={false}>
      {mode === "debug" ? (
        <fullscreenPassMaterial
          key={FullscreenPassMaterial.key}
          ref={debugMaterialRef}
          side={DoubleSide}
        />
      ) : mode === "march" ? (
        <fullscreenPassMarchMaterial
          key={FullscreenPassMarchMaterial.key}
          ref={marchMaterialRef}
          side={DoubleSide}
        />
      ) : (
        <fullscreenPassBendDebugMaterial
          key={FullscreenPassBendDebugMaterial.key}
          ref={bendDebugMaterialRef}
          side={DoubleSide}
        />
      )}
    </mesh>
  );
}
