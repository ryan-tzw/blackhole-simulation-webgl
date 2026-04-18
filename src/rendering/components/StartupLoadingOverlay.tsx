import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useProgress } from "@react-three/drei";
import { getSharedCubemapTexture } from "@/rendering/environment/cubemap";

type StartupLoadingOverlayProps = {
  children: (callbacks: { onMainFirstFrame: () => void }) => ReactNode;
};

export function StartupLoadingOverlay({
  children,
}: StartupLoadingOverlayProps) {
  // Kick off shared cubemap loading immediately so startup progress tracks it.
  useMemo(() => getSharedCubemapTexture(), []);

  const [isMainFirstFrameReady, setIsMainFirstFrameReady] = useState(false);
  const { active, loaded, total } = useProgress();

  const areAssetsReady = total <= 0 ? !active : !active && loaded >= total;
  const isInitialRenderReady = isMainFirstFrameReady && areAssetsReady;

  const onMainFirstFrame = useCallback(() => {
    setIsMainFirstFrameReady(true);
  }, []);

  return (
    <>
      {children({ onMainFirstFrame })}
      <div
        className={`loading-overlay${isInitialRenderReady ? " loading-overlay-exit" : ""}`}
        aria-hidden="true"
      >
        <div className="loading-spinner" />
      </div>
    </>
  );
}
