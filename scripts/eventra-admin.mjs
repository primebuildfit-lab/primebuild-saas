#!/usr/bin/env node
/**
 * Eventra Internal OS (Admin) - local launcher.
 *
 * Starts the private platform-admin console (apps/admin, Vite SPA) on this machine
 * and opens it in its OWN app window (Edge/Chrome --app, dedicated profile) so it
 * behaves like a desktop app. NO external services, NO deploy, NO Shopify/Supabase.
 * This is the Internal OS (Nivel A) — SEPARATE from Eventra Business (Nivel B).
 *
 * Usage:
 *   npm run start:admin            # http://localhost:5173/
 *   npm run start:admin -- 4100    # custom port
 *   npm run start:admin -- --no-open
 * or double-click  Eventra-Admin.cmd  (Windows).
 */
import { spawn, exec } from "node:child_process";
import { get } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const adminDir = join(root, "apps", "admin");
const args = process.argv.slice(2);
const noOpen = args.includes("--no-open");
const portArg = args.find((a) => /^\d+$/.test(a));
const port = String(Number(portArg) || process.env.PORT || 5173);
const url = `http://localhost:${port}`;

function banner(lines) {
  const bar = "=".repeat(58);
  console.log(`\n${bar}\n${lines.map((l) => "  " + l).join("\n")}\n${bar}\n`);
}

/** Locate Edge/Chrome so the console opens in its own app window (Windows). */
function findAppBrowser() {
  if (process.platform !== "win32") return null;
  const pf = process.env["ProgramFiles"] || "C:/Program Files";
  const pfx86 = process.env["ProgramFiles(x86)"] || "C:/Program Files (x86)";
  const local = process.env["LOCALAPPDATA"] || join(process.env.USERPROFILE || "", "AppData/Local");
  return [
    join(pfx86, "Microsoft/Edge/Application/msedge.exe"),
    join(pf, "Microsoft/Edge/Application/msedge.exe"),
    join(pf, "Google/Chrome/Application/chrome.exe"),
    join(pfx86, "Google/Chrome/Application/chrome.exe"),
    join(local, "Google/Chrome/Application/chrome.exe"),
  ].find((p) => existsSync(p)) || null;
}
function openBrowser(target) {
  if (noOpen) return;
  const browser = findAppBrowser();
  if (browser) {
    const profileDir = join(process.env["LOCALAPPDATA"] || join(process.env.USERPROFILE || root, "AppData/Local"), "Eventra", "AdminWindow");
    const win = spawn(browser, [`--app=${target}`, `--user-data-dir=${profileDir}`, "--window-size=1440,900", "--no-first-run", "--no-default-browser-check"], { detached: true, stdio: "ignore" });
    win.on("error", () => openDefault(target));
    win.unref();
    return;
  }
  openDefault(target);
}
function openDefault(target) {
  const cmd = process.platform === "win32" ? `start "" "${target}"` : process.platform === "darwin" ? `open "${target}"` : `xdg-open "${target}"`;
  exec(cmd, () => {});
}

function portInUse() {
  return new Promise((resolve) => {
    const req = get({ host: "localhost", port: Number(port), path: "/", timeout: 1500 }, (res) => { res.resume(); resolve(true); });
    req.on("timeout", () => { req.destroy(); resolve(false); });
    req.on("error", () => resolve(false));
  });
}
function waitForReady(timeoutMs = 60000) {
  const start = Date.now();
  return new Promise((resolve) => {
    const tick = () => {
      const req = get(url, (res) => { res.resume(); resolve(true); });
      req.on("error", () => { if (Date.now() - start > timeoutMs) resolve(false); else setTimeout(tick, 700); });
    };
    tick();
  });
}

async function main() {
  if (!existsSync(join(root, "node_modules"))) {
    console.error("ERROR: Dependencies not installed. Run `npm install` from the project root first.");
    process.exit(1);
  }
  if (await portInUse()) {
    banner(["Eventra Internal OS already running.", `Opening ${url}`]);
    openBrowser(url);
    process.exit(0);
  }
  banner([
    "Eventra - Internal OS (Admin console)",
    "Private platform admin . No Shopify . No Supabase . No deploy",
    "",
    `URL:    ${url}   (opens automatically as an app window)`,
    "Stop:   press Ctrl-C in this window",
  ]);

  const isWin = process.platform === "win32";
  const bin = isWin ? "npx.cmd" : "npx";
  const child = spawn(bin, ["vite", "--port", port, "--strictPort"], {
    cwd: adminDir,
    env: { ...process.env, NODE_ENV: "development", PORT: port },
    stdio: "inherit",
    shell: isWin,
  });
  child.on("error", (err) => { console.error(`ERROR: could not start the dev server: ${err.message}`); process.exit(1); });

  const shutdown = () => { if (!child.killed) child.kill("SIGINT"); };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  child.on("exit", (code) => { console.log("\nEventra Internal OS stopped."); process.exit(code ?? 0); });

  waitForReady().then((ok) => {
    if (ok) { console.log(`\n>> Internal OS ready. Opening ${url}\n`); openBrowser(url); }
    else console.log("\n(!) Server is taking a while - open " + url + " manually if needed.\n");
  });
}

main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exit(1); });
