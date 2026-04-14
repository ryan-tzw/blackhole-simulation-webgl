import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],

  server: {
    host: true,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
