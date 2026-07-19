import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Eventra Business Admin — client-only SPA (web/desktop via Tauri). Static build:
// no Node sidecar (unlike the commercial Business Client). Talks to the central
// API over HTTPS at runtime; ships honest "not connected" states until then.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
  clearScreen: false,
  server: {
    // Distinct from the Internal OS (:1420) and the Business Client (:3000/:39100).
    port: 1430,
    strictPort: true,
    watch: { ignored: ["**/src-tauri/**"] },
  },
});
