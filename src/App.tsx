import { Leva } from "leva";
import { FaGithub } from "react-icons/fa";
import { RenderingRoot } from "./rendering/components/RenderingRoot";

const REPO_URL = "https://github.com/ryan-tzw/blackhole-simulation-webgl";

export function App() {
  return (
    <>
      <Leva
        theme={{
          sizes: { rootWidth: "400px" },
        }}
      />
      <RenderingRoot />
      <a
        className="repo-link"
        href={REPO_URL}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="View project on GitHub"
      >
        <FaGithub aria-hidden="true" />
        <span>GitHub</span>
      </a>
    </>
  );
}
