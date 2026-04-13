import { CubeTexture, CubeTextureLoader, SRGBColorSpace } from "three";

export const CUBEMAP_FACE_FILES = [
  "/assets/cubemap/right.png",
  "/assets/cubemap/left.png",
  "/assets/cubemap/top.png",
  "/assets/cubemap/bottom.png",
  "/assets/cubemap/front.png",
  "/assets/cubemap/back.png",
] as const;

let sharedCubemapTexture: CubeTexture | null = null;

export function getSharedCubemapTexture(): CubeTexture {
  if (sharedCubemapTexture) {
    return sharedCubemapTexture;
  }

  sharedCubemapTexture = new CubeTextureLoader().load([...CUBEMAP_FACE_FILES]);
  sharedCubemapTexture.colorSpace = SRGBColorSpace;

  return sharedCubemapTexture;
}
