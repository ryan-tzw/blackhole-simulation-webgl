import { useCallback, useState, type ReactNode } from "react";

type StartupLoadingOverlayProps = {
  children: (callbacks: { onMainFirstFrame: () => void }) => ReactNode;
};

export function StartupLoadingOverlay({
  children,
}: StartupLoadingOverlayProps) {
  const [isInitialRenderReady, setIsInitialRenderReady] = useState(false);

  const onMainFirstFrame = useCallback(() => {
    setIsInitialRenderReady(true);
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
