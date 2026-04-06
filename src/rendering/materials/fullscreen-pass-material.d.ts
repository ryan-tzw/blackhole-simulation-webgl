import { ReactThreeFiber } from "@react-three/fiber";
import { FullscreenPassBendEnvMaterial } from "./FullscreenPassBendEnvMaterial";
import { FullscreenPassBendDebugMaterial } from "./FullscreenPassBendDebugMaterial";
import { FullscreenPassMaterial } from "./FullscreenPassMaterial";
import { FullscreenPassMarchMaterial } from "./FullscreenPassMarchMaterial";

declare module "@react-three/fiber" {
  interface ThreeElements {
    fullscreenPassMaterial: ReactThreeFiber.Object3DNode<
      InstanceType<typeof FullscreenPassMaterial>,
      typeof FullscreenPassMaterial
    >;
    fullscreenPassMarchMaterial: ReactThreeFiber.Object3DNode<
      InstanceType<typeof FullscreenPassMarchMaterial>,
      typeof FullscreenPassMarchMaterial
    >;
    fullscreenPassBendDebugMaterial: ReactThreeFiber.Object3DNode<
      InstanceType<typeof FullscreenPassBendDebugMaterial>,
      typeof FullscreenPassBendDebugMaterial
    >;
    fullscreenPassBendEnvMaterial: ReactThreeFiber.Object3DNode<
      InstanceType<typeof FullscreenPassBendEnvMaterial>,
      typeof FullscreenPassBendEnvMaterial
    >;
  }
}
