#!/usr/bin/env node
/**
 * PWA readiness check (Bloque 10/22/25) — static validation only, no browser.
 * Verifies the Business app ships a valid manifest, a service worker, an offline
 * fallback, and the icons the manifest references. Exits non-zero on any problem.
 *
 * NOTE: this proves the artifacts are present and internally consistent. It does
 * NOT prove installability on a physical device — that requires Lighthouse / a real
 * iPhone/Android and is a Brian-gated manual step (see docs).
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "apps", "business", "public");
const errors = [];
const ok = [];

function must(file) {
  const p = join(pub, file);
  if (existsSync(p)) ok.push(`found ${file}`);
  else errors.push(`missing ${file}`);
  return p;
}

const manifestPath = must("manifest.webmanifest");
must("sw.js");
must("offline.html");

if (existsSync(manifestPath)) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (e) {
    errors.push(`manifest is not valid JSON: ${e.message}`);
  }
  if (manifest) {
    const required = ["name", "short_name", "start_url", "scope", "display", "icons"];
    for (const key of required) {
      if (manifest[key] === undefined || manifest[key] === "") {
        errors.push(`manifest missing required field: ${key}`);
      }
    }
    if (!["standalone", "minimal-ui", "fullscreen"].includes(manifest.display)) {
      errors.push(`manifest.display should be an installable mode, got "${manifest.display}"`);
    }
    if (Array.isArray(manifest.icons)) {
      if (manifest.icons.length === 0) errors.push("manifest.icons is empty");
      const hasMaskable = manifest.icons.some((i) => (i.purpose || "").includes("maskable"));
      if (!hasMaskable) errors.push("manifest has no maskable icon");
      for (const icon of manifest.icons) {
        if (!icon.src) errors.push("an icon entry has no src");
        else if (!existsSync(join(pub, icon.src.replace(/^\//, "")))) {
          errors.push(`icon file not found: ${icon.src}`);
        }
      }
    }
    if (manifest.icons?.length) ok.push(`${manifest.icons.length} manifest icon(s) present`);
  }
}

for (const line of ok) console.log(`  ✓ ${line}`);
if (errors.length) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error("\nPWA CHECK: FAIL");
  process.exit(1);
}
console.log(
  "\nPWA CHECK: READY (artifacts valid) — physical-device install still requires manual verification.",
);
