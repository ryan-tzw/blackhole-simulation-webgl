import { FullscreenPassCanvas } from "./FullscreenPassCanvas.tsx";
import { PerspectiveDebugCanvas } from "./PerspectiveDebugCanvas.tsx";
import "./rendering-root.css";

export function RenderingRoot() {
  return (
    <div className="render-root">
      <FullscreenPassCanvas className="main-pass-canvas" />
      <div className="debug-inset">
        <PerspectiveDebugCanvas className="debug-inset-canvas" />
      </div>
    </div>
  );
}
