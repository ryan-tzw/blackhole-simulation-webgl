import { useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  ShaderMaterial,
} from "three";
import fragmentShader from "../shaders/fullscreen-pass.frag.glsl";
import vertexShader from "../shaders/fullscreen-pass.vert.glsl";

export function FullscreenTriangle() {
  const geometry = useMemo(() => {
    const triangle = new BufferGeometry();
    const positions = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
    const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);

    triangle.setAttribute("position", new BufferAttribute(positions, 3));
    triangle.setAttribute("uv", new BufferAttribute(uvs, 2));

    return triangle;
  }, []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        side: DoubleSide,
      }),
    [],
  );

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}
