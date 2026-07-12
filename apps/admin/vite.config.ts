import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Eventra Consumer shell — client-only SPA (web/PWA). Bundles workspace TS packages.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
});
