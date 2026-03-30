import { Box } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

export function App() {
  return (
    <Canvas>
      <Box args={[1, 1, 1]} position={[0, 0, 0]}>
        <meshBasicMaterial color="hotpink" />
      </Box>
    </Canvas>
  );
}
