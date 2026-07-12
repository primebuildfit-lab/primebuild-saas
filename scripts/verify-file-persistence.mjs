#!/usr/bin/env node
/**
 * MM5 Part 4 — scriptable file-mode persistence & reload verification.
 *
 * Runs the persistence + cross-process reload + UI-wiring test suites, which
 * together exercise the required flow: create a campaign → reload (new repository
 * instance) → confirm → restart (separate node process) → confirm → duplicate →
 * confirm a NEW version → confirm history was not overwritten.
 *
 * SAFE: no Shopify login, no Supabase, no install, no deploy. Local files only.
 * Exits 0 and prints "FILE PERSISTENCE VERIFIED" on success; non-zero otherwise.
 */
import { execFileSync } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const files = [
  "test/db/persistence.test.ts",
  "test/db/reload.test.ts",
  "test/db/mode.test.ts",
  "test/context/persistenceWiring.test.tsx",
];

console.log("→ Verifying file-mode persistence, reload, and UI wiring…\n");
try {
  execFileSync(npm, ["--workspace", "@eventra/business", "run", "test", "--", ...files], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  console.log("\n✓ FILE PERSISTENCE VERIFIED — create → reload → restart → duplicate → history intact.");
  process.exit(0);
} catch {
  console.error("\n✗ FILE PERSISTENCE VERIFICATION FAILED — see test output above.");
  process.exit(1);
}
