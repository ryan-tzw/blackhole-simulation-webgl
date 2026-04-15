import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

type FirstFrameSignalProps = {
  onFirstFrame?: () => void;
};

export function FirstFrameSignal({ onFirstFrame }: FirstFrameSignalProps) {
  const hasSignaledRef = useRef(false);

  useFrame(() => {
    if (!onFirstFrame || hasSignaledRef.current) {
      return;
    }

    hasSignaledRef.current = true;
    onFirstFrame();
  });

  return null;
}
