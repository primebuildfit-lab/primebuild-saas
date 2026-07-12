#!/usr/bin/env node
/**
 * Eventra — local launcher (installation phase).
 *
 * Starts Eventra Business on this machine for Brian's daily use, with NO external
 * services: labeled PREVIEW mode (no Shopify session) + FILE persistence (data
 * survives restarts). Never connects Shopify/Supabase, never installs/deploys.
 *
 * Usage:
 *   npm run start:local            # http://localhost:3000/app
 *   npm run start:local -- 4000    # custom port
 * or double-click  Eventra-Local.cmd  (Windows).
 *
 * Ctrl-C stops it cleanly.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const businessDir = join(root, "apps", "business");
const port = String(Number(process.argv[2]) || process.env.PORT || 3000);
const url = `http://localhost:${port}`;

if (!existsSync(join(businessDir, "node_modules")) && !existsSync(join(root, "node_modules"))) {
  console.error("✗ Dependencies not installed. Run `npm install` from the repo root first.");
  process.exit(1);
}

const env = {
  ...process.env,
  EVENTRA_PREVIEW: "true",
  EVENTRA_PERSISTENCE_MODE: "file",
  NODE_ENV: "development",
  SHOPIFY_APP_URL: url,
  PORT: port,
};

const line = "─".repeat(56);
console.log(`\n${line}
  Eventra — Local (preview + file persistence)
  No Shopify · No Supabase · No external services
${line}
  Opening on:   ${url}/app
  Your data:    apps/business/.eventra/dev-store.json  (survives restarts)
  Stop:         press Ctrl-C in this window
${line}\n`);

const isWin = process.platform === "win32";
const bin = isWin ? "npx.cmd" : "npx";
const child = spawn(bin, ["react-router", "dev", "--port", port], {
  cwd: businessDir,
  env,
  stdio: "inherit",
  shell: isWin,
});

const shutdown = () => {
  if (!child.killed) child.kill("SIGINT");
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
child.on("exit", (code) => {
  console.log("\nEventra local stopped.");
  process.exit(code ?? 0);
});
