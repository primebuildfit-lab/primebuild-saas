#!/usr/bin/env node
/**
 * Eventra Mobile (Consumer PWA) - local host / launcher.
 *
 * Serves the mobile app (apps/consumer, Vite PWA) on this machine and opens it in
 * a phone-sized app window. This is the LOCAL host for the mobile surface — it is
 * NOT a public deploy (installing on a real phone still needs an HTTPS host).
 * NO external services, NO deploy.
 *
 * Usage:
 *   npm run start:mobile           # http://localhost:5273/
 *   npm run start:mobile -- 5300   # custom port
 *   npm run start:mobile -- --no-open
 * or double-click  Eventra-Mobile.cmd  (Windows).
 */
import { spawn, exec } from "node:child_process";
import { get } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const consumerDir = join(root, "apps", "consumer");
const args = process.argv.slice(2);
const noOpen = args.includes("--no-open");
const portArg = args.find((a) => /^\d+$/.test(a));
const port = String(Number(portArg) || process.env.PORT || 5273);
const url = `http://localhost:${port}`;

function banner(lines) {
  const bar = "=".repeat(58);
  console.log(`\n${bar}\n${lines.map((l) => "  " + l).join("\n")}\n${bar}\n`);
}
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
    const profileDir = join(process.env["LOCALAPPDATA"] || join(process.env.USERPROFILE || root, "AppData/Local"), "Eventra", "MobileWindow");
    // Phone-sized window so the mobile surface looks like a device.
    const win = spawn(browser, [`--app=${target}`, `--user-data-dir=${profileDir}`, "--window-size=430,880", "--no-first-run", "--no-default-browser-check"], { detached: true, stdio: "ignore" });
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
    banner(["Eventra Mobile already running.", `Opening ${url}`]);
    openBrowser(url);
    process.exit(0);
  }
  banner([
    "Eventra - Mobile (Consumer PWA) . LOCAL host",
    "Not a public deploy . installing on a real phone needs an HTTPS host",
    "",
    `URL:    ${url}   (opens automatically, phone-sized window)`,
    "Stop:   press Ctrl-C in this window",
  ]);

  const isWin = process.platform === "win32";
  const bin = isWin ? "npx.cmd" : "npx";
  const child = spawn(bin, ["vite", "--port", port, "--strictPort"], {
    cwd: consumerDir,
    env: { ...process.env, NODE_ENV: "development", PORT: port },
    stdio: "inherit",
    shell: isWin,
  });
  child.on("error", (err) => { console.error(`ERROR: could not start the dev server: ${err.message}`); process.exit(1); });
  const shutdown = () => { if (!child.killed) child.kill("SIGINT"); };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  child.on("exit", (code) => { console.log("\nEventra Mobile stopped."); process.exit(code ?? 0); });
  waitForReady().then((ok) => {
    if (ok) { console.log(`\n>> Eventra Mobile ready. Opening ${url}\n`); openBrowser(url); }
    else console.log("\n(!) Server is taking a while - open " + url + " manually if needed.\n");
  });
}
main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exit(1); });
