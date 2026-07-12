#!/usr/bin/env node
/**
 * Eventra — reset local data. Deletes the file-mode persistence snapshot so the
 * next start begins fresh (re-seeds the demo workspace = first-run experience).
 * Safe: only touches the local dev snapshot; never external services.
 */
import { rmSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const store = join(root, "apps", "business", ".eventra");

if (existsSync(store)) {
  rmSync(store, { recursive: true, force: true });
  console.log("✓ Local data reset — next start re-seeds the demo workspace (fresh first run).");
} else {
  console.log("• No local data to reset (already fresh).");
}
