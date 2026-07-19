#!/usr/bin/env node
/**
 * Guard: the Eventra Business Admin version must be identical in all three
 * places that define it.
 *
 * Why this matters for the updater: the version an installed app reports is the
 * one baked from `tauri.conf.json`, while the manifest published by the release
 * is derived from the same build. If `package.json` or `Cargo.toml` drift, the
 * release is tagged one way and the binary identifies itself another, so the
 * updater compares the wrong numbers — either offering an update that is already
 * installed, or never offering one at all. Both fail silently, which is exactly
 * the failure mode an auto-updater must not have.
 *
 * Run standalone (`node scripts/check-version-sync.mjs`) or in CI before a release.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(file) {
  return readFileSync(join(appDir, file), "utf8");
}

const sources = [
  {
    file: "package.json",
    version: JSON.parse(read("package.json")).version,
  },
  {
    file: "src-tauri/tauri.conf.json",
    version: JSON.parse(read("src-tauri/tauri.conf.json")).version,
  },
  {
    file: "src-tauri/Cargo.toml",
    // First `version = "…"` under [package] — the crate's own version.
    version: read("src-tauri/Cargo.toml").match(/^version\s*=\s*"([^"]+)"/m)?.[1],
  },
];

const missing = sources.filter((s) => !s.version);
if (missing.length > 0) {
  console.error(
    `✗ No se pudo leer la versión de: ${missing.map((m) => m.file).join(", ")}`,
  );
  process.exit(1);
}

const unique = [...new Set(sources.map((s) => s.version))];
if (unique.length > 1) {
  console.error("✗ Las versiones de Eventra Business Admin no coinciden:");
  for (const s of sources) console.error(`    ${s.version}  ${s.file}`);
  console.error(
    "\n  Ponlas todas en el mismo número antes de publicar: una versión desincronizada\n" +
      "  rompe la comparación del actualizador de forma silenciosa.",
  );
  process.exit(1);
}

console.log(`✓ Versión de Eventra Business Admin sincronizada: ${unique[0]}`);
