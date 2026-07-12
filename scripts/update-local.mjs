#!/usr/bin/env node
/**
 * Eventra — update the local copy. Fast-forwards the current branch and installs
 * dependencies. Does NOT switch branches, force-push, or touch external services.
 * If there are uncommitted changes or the pull is not fast-forward, it stops and
 * tells you what to do — it never discards your work.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args) =>
  execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: "pipe" }).trim();

try {
  const dirty = run("git", ["status", "--porcelain"]);
  if (dirty) {
    console.error("✗ You have uncommitted changes. Commit or stash them first, then re-run update.");
    process.exit(1);
  }
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  console.log(`→ Updating branch '${branch}'…`);
  try {
    console.log(run("git", ["pull", "--ff-only"]));
  } catch {
    console.error("✗ Could not fast-forward (branch has diverged or no upstream). Resolve manually with git.");
    process.exit(1);
  }
  console.log("→ Installing dependencies…");
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  execFileSync(npm, ["install"], { cwd: root, stdio: "inherit", shell: process.platform === "win32" });
  console.log("\n✓ Update complete. If Prisma/esbuild scripts were blocked, run `npm approve-scripts`.");
  console.log("  Then start with:  npm run start:local");
} catch (e) {
  console.error(`✗ Update failed: ${e.message}`);
  process.exit(1);
}
