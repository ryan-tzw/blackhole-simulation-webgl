import { ReactThreeFiber } from "@react-three/fiber";
import { FullscreenPassMaterial } from "./FullscreenPassMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    fullscreenPassMaterial: ReactThreeFiber.Object3DNode<
      InstanceType<typeof FullscreenPassMaterial>,
      typeof FullscreenPassMaterial
    >;
  }
}
