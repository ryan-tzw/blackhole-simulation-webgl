import type { RefObject } from "react";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, DoubleSide } from "three";
import type { ObserverCameraState } from "./camera-state";
import { FullscreenPassBendEnvMaterial } from "./materials/FullscreenPassBendEnvMaterial";
import { FullscreenPassBendDebugMaterial } from "./materials/FullscreenPassBendDebugMaterial";
import { FullscreenPassMaterial } from "./materials/FullscreenPassMaterial";
import { FullscreenPassMarchMaterial } from "./materials/FullscreenPassMarchMaterial";
import type { PassShaderMode } from "./pass-shader-mode";

type FullscreenTriangleProps = {
  observerCameraStateRef: RefObject<ObserverCameraState>;
  mode?: PassShaderMode;
  adiskInnerRadius: number;
  adiskOuterRadius: number;
  adiskHeight: number;
  adiskLit: number;
  adiskDensityV: number;
  adiskDensityH: number;
  adiskNoiseScale: number;
  adiskNoiseLod: number;
  adiskSpeed: number;
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
type FullscreenPassBendEnvMaterialInstance = InstanceType<
  typeof FullscreenPassBendEnvMaterial
>;

export function FullscreenTriangle({
  observerCameraStateRef,
  mode = "debug",
  adiskInnerRadius,
  adiskOuterRadius,
  adiskHeight,
  adiskLit,
  adiskDensityV,
  adiskDensityH,
  adiskNoiseScale,
  adiskNoiseLod,
  adiskSpeed,
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
  const bendEnvMaterialRef =
    useRef<FullscreenPassBendEnvMaterialInstance | null>(null);

  useFrame((state) => {
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
    updateMaterial(bendEnvMaterialRef.current);

    // Update uTime (simulation time) for bend enviornment material to animate the accretion disk
    if (bendEnvMaterialRef.current) {
      // state.clock.elapsedTime provides the seconds since the app started
      bendEnvMaterialRef.current.uTime = state.clock.elapsedTime;
    }
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
      ) : mode === "bend-debug" ? (
        <fullscreenPassBendDebugMaterial
          key={FullscreenPassBendDebugMaterial.key}
          ref={bendDebugMaterialRef}
          side={DoubleSide}
        />
      ) : (
        <fullscreenPassBendEnvMaterial
          key={FullscreenPassBendEnvMaterial.key}
          ref={bendEnvMaterialRef}
          side={DoubleSide}
          ADISK_INNER_RADIUS={adiskInnerRadius}
          ADISK_OUTER_RADIUS={adiskOuterRadius}
          ADISK_HEIGHT={adiskHeight}
          ADISK_LIT={adiskLit}
          ADISK_DENSITY_V={adiskDensityV}
          ADISK_DENSITY_H={adiskDensityH}
          ADISK_NOISE_SCALE={adiskNoiseScale}
          ADISK_NOISE_LOD={adiskNoiseLod}
          ADISK_SPEED={adiskSpeed}
        />
      )}
    </mesh>
  );
}
