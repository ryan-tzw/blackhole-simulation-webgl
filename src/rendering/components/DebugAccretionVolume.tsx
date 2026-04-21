import { Edges } from "@react-three/drei";
import { BackSide, DoubleSide } from "three";

type DebugAccretionVolumeProps = {
  innerRadius: number;
  outerRadius: number;
  halfHeight: number;
};

const DEBUG_VOLUME_COLOR = "#67e8f9";
const DEBUG_VOLUME_OPACITY = 0.14;
const DEBUG_VOLUME_EDGE_COLOR = "#bae6fd";
const DEBUG_VOLUME_EDGE_OPACITY = 0.78;
const RADIAL_SEGMENTS = 96;
const HEIGHT_SEGMENTS = 1;
const MIN_RADIUS_DELTA = 0.01;
const MIN_HALF_HEIGHT = 0.005;

// Visualizes the finite annulus slab used by accretion integration (walls + top/bottom caps).
export function DebugAccretionVolume({
  innerRadius,
  outerRadius,
  halfHeight,
}: DebugAccretionVolumeProps) {
  const safeOuterRadius = Math.max(outerRadius, MIN_RADIUS_DELTA);
  const safeInnerRadius = Math.min(
    Math.max(innerRadius, 0.0),
    safeOuterRadius - MIN_RADIUS_DELTA,
  );
  const safeHalfHeight = Math.max(halfHeight, MIN_HALF_HEIGHT);
  const fullHeight = safeHalfHeight * 2.0;
  const hasInnerWall = safeInnerRadius > MIN_RADIUS_DELTA;

  return (
    <group>
      <mesh>
        <cylinderGeometry
          args={[
            safeOuterRadius,
            safeOuterRadius,
            fullHeight,
            RADIAL_SEGMENTS,
            HEIGHT_SEGMENTS,
            true,
          ]}
        />
        <meshStandardMaterial
          color={DEBUG_VOLUME_COLOR}
          side={DoubleSide}
          transparent
          opacity={DEBUG_VOLUME_OPACITY}
          depthWrite={false}
        />
        <Edges
          scale={1.0005}
          color={DEBUG_VOLUME_EDGE_COLOR}
          opacity={DEBUG_VOLUME_EDGE_OPACITY}
          transparent
        />
      </mesh>

      {hasInnerWall ? (
        <mesh>
          <cylinderGeometry
            args={[
              safeInnerRadius,
              safeInnerRadius,
              fullHeight,
              RADIAL_SEGMENTS,
              HEIGHT_SEGMENTS,
              true,
            ]}
          />
          <meshStandardMaterial
            color={DEBUG_VOLUME_COLOR}
            side={BackSide}
            transparent
            opacity={DEBUG_VOLUME_OPACITY}
            depthWrite={false}
          />
          <Edges
            scale={1.0005}
            color={DEBUG_VOLUME_EDGE_COLOR}
            opacity={DEBUG_VOLUME_EDGE_OPACITY}
            transparent
          />
        </mesh>
      ) : null}

      <mesh position={[0, safeHalfHeight, 0]} rotation={[-Math.PI * 0.5, 0, 0]}>
        <ringGeometry
          args={[safeInnerRadius, safeOuterRadius, RADIAL_SEGMENTS]}
        />
        <meshStandardMaterial
          color={DEBUG_VOLUME_COLOR}
          side={DoubleSide}
          transparent
          opacity={DEBUG_VOLUME_OPACITY}
          depthWrite={false}
        />
        <Edges
          scale={1.0005}
          color={DEBUG_VOLUME_EDGE_COLOR}
          opacity={DEBUG_VOLUME_EDGE_OPACITY}
          transparent
        />
      </mesh>

      <mesh
        position={[0, -safeHalfHeight, 0]}
        rotation={[-Math.PI * 0.5, 0, 0]}
      >
        <ringGeometry
          args={[safeInnerRadius, safeOuterRadius, RADIAL_SEGMENTS]}
        />
        <meshStandardMaterial
          color={DEBUG_VOLUME_COLOR}
          side={DoubleSide}
          transparent
          opacity={DEBUG_VOLUME_OPACITY}
          depthWrite={false}
        />
        <Edges
          scale={1.0005}
          color={DEBUG_VOLUME_EDGE_COLOR}
          opacity={DEBUG_VOLUME_EDGE_OPACITY}
          transparent
        />
      </mesh>
    </group>
  );
}
