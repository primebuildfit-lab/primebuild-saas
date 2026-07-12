#!/usr/bin/env node
/**
 * Eventra - local launcher (installation phase).
 *
 * Starts Eventra Business on this machine for daily use, with NO external
 * services: labeled PREVIEW mode (no Shopify session) + FILE persistence (data
 * survives restarts). Never connects Shopify/Supabase, never installs/deploys.
 *
 * Usage:
 *   npm run start:local            # http://localhost:3000/app
 *   npm run start:local -- 4000    # custom port
 *   npm run start:local -- --no-open
 * or double-click  Eventra-Local.cmd  (Windows).
 *
 * Output is ASCII-only so it renders correctly on any Windows console codepage.
 * Ctrl-C stops it cleanly. Exit codes: 0 ok, 1 setup error, >1 dev-server code.
 */
import { spawn, exec } from "node:child_process";
import { get } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const businessDir = join(root, "apps", "business");
const args = process.argv.slice(2);
const noOpen = args.includes("--no-open");
const portArg = args.find((a) => /^\d+$/.test(a));
const port = String(Number(portArg) || process.env.PORT || 3000);
const url = `http://localhost:${port}`;
const appUrl = `${url}/app`;

function banner(lines) {
  const bar = "=".repeat(58);
  console.log(`\n${bar}\n${lines.map((l) => "  " + l).join("\n")}\n${bar}\n`);
}

function openBrowser(target) {
  if (noOpen) return;
  const cmd =
    process.platform === "win32"
      ? `start "" "${target}"`
      : process.platform === "darwin"
        ? `open "${target}"`
        : `xdg-open "${target}"`;
  exec(cmd, () => {});
}

/**
 * Resolve true if something is already serving on the port. Uses an HTTP probe to
 * `localhost` (same name resolution the browser uses, so it works whether the dev
 * server bound IPv4 or IPv6). A refused connection means free.
 */
function portInUse() {
  return new Promise((resolve) => {
    const req = get({ host: "localhost", port: Number(port), path: "/", timeout: 1500 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.on("error", () => resolve(false));
  });
}

/** Poll the app URL until it responds (server ready) or times out. */
function waitForReady(timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      const req = get(appUrl, (res) => {
        res.resume();
        resolve(true);
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) resolve(false);
        else setTimeout(tick, 700);
      });
    };
    tick();
  });
}

async function main() {
  if (!existsSync(join(root, "node_modules")) && !existsSync(join(businessDir, "node_modules"))) {
    console.error("ERROR: Dependencies not installed. Run `npm install` from the project root first.");
    process.exit(1);
  }

  // Multiple-launch guard: if the port is busy, assume Eventra is already up.
  if (await portInUse()) {
    banner([
      "Eventra appears to be running already.",
      `Opening ${appUrl}`,
      "(To use a different port: npm run start:local -- 4000)",
    ]);
    openBrowser(appUrl);
    process.exit(0);
  }

  banner([
    "Eventra - Local (preview + file persistence)",
    "No Shopify . No Supabase . No external services",
    "",
    `URL:    ${appUrl}   (opens automatically)`,
    "Data:   apps/business/.eventra/dev-store.json (survives restarts)",
    "Stop:   press Ctrl-C in this window",
  ]);

  const env = {
    ...process.env,
    EVENTRA_PREVIEW: "true",
    EVENTRA_PERSISTENCE_MODE: "file",
    NODE_ENV: "development",
    SHOPIFY_APP_URL: url,
    PORT: port,
  };

  const isWin = process.platform === "win32";
  const bin = isWin ? "npx.cmd" : "npx";
  const child = spawn(bin, ["react-router", "dev", "--port", port], {
    cwd: businessDir,
    env,
    stdio: "inherit",
    shell: isWin,
  });

  child.on("error", (err) => {
    console.error(`ERROR: could not start the dev server: ${err.message}`);
    process.exit(1);
  });

  const shutdown = () => { if (!child.killed) child.kill("SIGINT"); };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  child.on("exit", (code) => {
    console.log("\nEventra local stopped.");
    process.exit(code ?? 0);
  });

  // Open the browser once the server responds.
  waitForReady().then((ok) => {
    if (ok) { console.log(`\n>> Eventra is ready. Opening ${appUrl}\n`); openBrowser(appUrl); }
    else console.log("\n(!) Server is taking a while - open " + appUrl + " manually if needed.\n");
  });
}

main().catch((e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});
