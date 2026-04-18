import type { RefObject } from "react";
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, DoubleSide } from "three";
import type { ObserverCameraState } from "@/rendering/camera/camera-state";
import type { BendRenderSettings } from "@/rendering/config/bend-render-settings";
import type { PassShaderMode } from "@/rendering/config/pass-shader-mode";
import { FullscreenPassBendEnvMaterial } from "@/rendering/materials/FullscreenPassBendEnvMaterial";
import { FullscreenPassBendDebugMaterial } from "@/rendering/materials/FullscreenPassBendDebugMaterial";
import { FullscreenPassMaterial } from "@/rendering/materials/FullscreenPassMaterial";
import { FullscreenPassMarchMaterial } from "@/rendering/materials/FullscreenPassMarchMaterial";
import type { BendUniformDefaults } from "@/rendering/materials/bend-uniforms";
import type { ObserverCameraUniformDefaults } from "@/rendering/materials/observer-camera-uniforms";

type FullscreenTriangleProps = {
  bendSettings: BendRenderSettings;
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
type FullscreenPassBendEnvMaterialInstance = InstanceType<
  typeof FullscreenPassBendEnvMaterial
>;
type BendMaterialUniforms = ObserverCameraUniformDefaults & BendUniformDefaults;
type BendEnvMaterialUniforms = BendMaterialUniforms & {
  uEnvExposure: number;
};

export function FullscreenTriangle({
  bendSettings,
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
  const bendEnvMaterialRef =
    useRef<FullscreenPassBendEnvMaterialInstance | null>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const cameraState = observerCameraStateRef.current;
    const passAspect =
      size.height > 0 ? size.width / size.height : cameraState.aspect;

    const updateMaterial = (material: ObserverCameraUniformDefaults | null) => {
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
    const updateBendMaterial = (material: BendMaterialUniforms | null) => {
      if (!material) {
        return;
      }

      updateMaterial(material);
      material.uTime = elapsedTime;
      material.uRs = bendSettings.uRs;
      material.uMaxSteps = bendSettings.uMaxSteps;
      material.uStepAdapt = bendSettings.uStepAdapt;
      material.uPhiBudget = bendSettings.uPhiBudget;
      material.uMinStepRatio = bendSettings.uMinStepRatio;
      material.uRadialStepBoost = bendSettings.uRadialStepBoost;
      material.uEnableDiscAccumulation = bendSettings.uEnableDiscAccumulation;
      material.uUseDebugColorOnTerminate =
        bendSettings.uUseDebugColorOnTerminate;
      material.uDiscInnerRadius = bendSettings.uDiscInnerRadius;
      material.uDiscOuterRadius = bendSettings.uDiscOuterRadius;
      material.uDiscHalfHeight = bendSettings.uDiscHalfHeight;
      material.uDiscDensity = bendSettings.uDiscDensity;
      material.uDiscDensityRadialPower = bendSettings.uDiscDensityRadialPower;
      material.uDiscAbsorption = bendSettings.uDiscAbsorption;
      material.uDiscEmissionStrength = bendSettings.uDiscEmissionStrength;
      material.uDiscEmissionInnerColor.set(
        ...bendSettings.uDiscEmissionInnerColor,
      );
      material.uDiscEmissionOuterColor.set(
        ...bendSettings.uDiscEmissionOuterColor,
      );
      material.uDiscEmissionRadialPower = bendSettings.uDiscEmissionRadialPower;
      material.uDiscEmissionColorCurve = bendSettings.uDiscEmissionColorCurve;
      material.uDiscInnerSoftness = bendSettings.uDiscInnerSoftness;
      material.uDiscOuterSoftness = bendSettings.uDiscOuterSoftness;
      material.uDiscVerticalFalloffPower =
        bendSettings.uDiscVerticalFalloffPower;
      material.uDiscIntegrationQuality = bendSettings.uDiscIntegrationQuality;
      material.uDiscNoiseScale = bendSettings.uDiscNoiseScale;
      material.uDiscNoiseStrength = bendSettings.uDiscNoiseStrength;
      material.uDiscSpinSpeed = bendSettings.uDiscSpinSpeed;
      material.uDiscSpinMaxOmega = bendSettings.uDiscSpinMaxOmega;
      material.uDiscAdvectionCycleSeconds =
        bendSettings.uDiscAdvectionCycleSeconds;
      material.uDiscAdvectionBlendFraction =
        bendSettings.uDiscAdvectionBlendFraction;
      material.uDiscDopplerStrength = bendSettings.uDiscDopplerStrength;
      material.uDiscDopplerTintStrength = bendSettings.uDiscDopplerTintStrength;
      material.uDiscDopplerMaxBeta = bendSettings.uDiscDopplerMaxBeta;
      material.uDiscGravRedshiftStrength =
        bendSettings.uDiscGravRedshiftStrength;
      material.uDiscGravRedshiftTintStrength =
        bendSettings.uDiscGravRedshiftTintStrength;
    };

    updateMaterial(debugMaterialRef.current);
    updateMaterial(marchMaterialRef.current);
    updateBendMaterial(bendDebugMaterialRef.current);
    updateBendMaterial(bendEnvMaterialRef.current);

    const bendEnvMaterial =
      bendEnvMaterialRef.current as BendEnvMaterialUniforms | null;

    if (bendEnvMaterial) {
      bendEnvMaterial.uEnvExposure = bendSettings.uEnvExposure;
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
        />
      )}
    </mesh>
  );
}
