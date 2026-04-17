import { Leva } from "leva";
import { RenderingRoot } from "./rendering/components/RenderingRoot";

export function App() {
  return (
    <>
      <Leva
        theme={{
          sizes: { rootWidth: "360px" },
        }}
      />
      <RenderingRoot />
    </>
  );
}
