#!/usr/bin/env node
/**
 * MM5 Part 15 — Eventra pre-install readiness gate.
 *
 * Verifies EVERYTHING that can be checked locally, WITHOUT external access:
 * Node version, branch, working tree, env-template completeness (missing secrets
 * reported by NAME only — never printed), Shopify config syntax, required files,
 * SQL/migration readiness, typecheck, lint, tests, build, and the absence of
 * PrimeBuild production identifiers in app code/config.
 *
 * It NEVER logs into Shopify, connects Supabase, installs, deploys, or mutates any
 * external system. Prints exactly one final line:
 *     READY FOR SHOPIFY AUTHORIZATION
 *   or
 *     NOT READY — <n> blocker(s)
 *
 * Flags: --fast skips the heavy build/test/lint/typecheck steps (structure only).
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(root, p);
const FAST = process.argv.includes("--fast");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const blockers = [];
const warnings = [];
const passed = [];
const pass = (m) => passed.push(m);
const block = (m) => blockers.push(m);
const warn = (m) => warnings.push(m);

function sh(cmd, args) {
  return execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: "pipe" }).trim();
}
function shOk(cmd, args) {
  try {
    execFileSync(cmd, args, { cwd: root, stdio: "ignore", shell: process.platform === "win32" });
    return true;
  } catch {
    return false;
  }
}

// ── 1. Node version ──
{
  const major = Number(process.versions.node.split(".")[0]);
  if (major >= 20) pass(`Node ${process.versions.node}`);
  else block(`Node ${process.versions.node} too old (need >=20.19)`);
}

// ── 2. Branch + working tree ──
try {
  const branch = sh("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch === "main" || branch === "master") warn(`on default branch '${branch}' — MM5 expects a feature branch`);
  else pass(`branch '${branch}'`);
  const status = sh("git", ["status", "--porcelain"]);
  if (status) warn(`working tree has uncommitted changes (${status.split("\n").length} file(s))`);
  else pass("working tree clean");
} catch {
  warn("git not available — skipped branch/tree checks");
}

// ── 3. Required files ──
const REQUIRED = [
  "apps/business/shopify.app.toml",
  "apps/business/.env.example",
  "apps/business/app/shopify.server.ts",
  "apps/business/app/db/repository.ts",
  "apps/business/app/routes/app.data.tsx",
  "supabase/migrations/0001_schema.sql",
  "supabase/policies/0002_rls.sql",
  "supabase/tests/preinstall_rls_matrix.sql",
  "docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md",
];
for (const f of REQUIRED) {
  if (existsSync(P(f))) pass(`file ${f}`);
  else block(`missing required file: ${f}`);
}

// ── 4. Shopify config syntax (light) ──
{
  const tomlPath = P("apps/business/shopify.app.toml");
  if (existsSync(tomlPath)) {
    const toml = readFileSync(tomlPath, "utf8");
    if (/^name\s*=/m.test(toml)) pass("shopify.app.toml has name");
    else block("shopify.app.toml missing name");
    if (/\[access_scopes\]/.test(toml) && /scopes\s*=/.test(toml)) pass("shopify.app.toml declares scopes");
    else warn("shopify.app.toml missing [access_scopes].scopes");
    if (/client_id\s*=\s*""/.test(toml)) warn("shopify client_id is blank (expected — set at `shopify app config link`)");
  }
}

// ── 5. Env template completeness (report missing SECRET names only) ──
{
  const examplePath = P("apps/business/.env.example");
  const REQUIRED_KEYS = [
    "SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "SCOPES",
    "SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET",
    "EVENTRA_PERSISTENCE",
  ];
  if (existsSync(examplePath)) {
    const ex = readFileSync(examplePath, "utf8");
    const missing = REQUIRED_KEYS.filter((k) => !new RegExp(`^${k}=`, "m").test(ex));
    if (missing.length) block(`.env.example missing keys: ${missing.join(", ")}`);
    else pass(".env.example lists all required keys");
  }
  // Report which secrets are still UNSET (by name only) — informational, never prints values.
  const dotenv = P("apps/business/.env");
  if (existsSync(dotenv)) {
    const env = readFileSync(dotenv, "utf8");
    const secretKeys = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "SUPABASE_URL", "SUPABASE_JWT_SECRET"];
    const unset = secretKeys.filter((k) => !new RegExp(`^${k}=.+`, "m").test(env));
    if (unset.length) warn(`.env present but these are unset (expected pre-install): ${unset.join(", ")}`);
  } else {
    warn(".env not present (expected — Brian supplies it at install time)");
  }
}

// ── 6. No PrimeBuild PRODUCTION identifiers in app code/config ──
{
  const targets = [
    "apps/business/app", "apps/business/shopify.app.toml", "apps/business/shopify.web.toml",
  ];
  const banned = /primebuildfit\.com|primebuild-core|primebuildfit-lab/i;
  let hit = null;
  const scan = (p) => {
    const full = P(p);
    if (!existsSync(full)) return;
    try {
      const out = sh("git", ["grep", "-lI", "-E", "primebuildfit\\.com|primebuild-core|primebuildfit-lab", "--", p]);
      if (out) hit = out;
    } catch {
      // git grep exits 1 when no match — that's the good case.
    }
  };
  targets.forEach(scan);
  if (hit) block(`PrimeBuild production identifier found in app code/config: ${hit.replace(/\n/g, ", ")}`);
  else pass("no PrimeBuild production identifiers in app code/config");
  void banned;
}

// ── 7. SQL readiness ──
if (shOk("node", ["scripts/check-sql-readiness.mjs"])) pass("SQL readiness (check:sql)");
else block("SQL readiness failed (run `npm run check:sql`)");

// ── 8. Boundary check ──
if (shOk("node", ["scripts/check-boundaries.mjs"])) pass("workspace boundaries");
else block("workspace boundary check failed");

// ── 9. Heavy gates (typecheck / lint / test / build) ──
if (FAST) {
  warn("--fast: skipped typecheck/lint/test/build");
} else {
  const heavy = [
    ["typecheck", ["run", "typecheck"]],
    ["lint", ["run", "lint"]],
    ["tests", ["test"]],
    ["build", ["run", "build"]],
  ];
  for (const [name, args] of heavy) {
    process.stdout.write(`  … running ${name} `);
    const ok = shOk(npm, args);
    console.log(ok ? "✓" : "✗");
    if (ok) pass(name);
    else block(`${name} failed (run \`npm run ${args[args.length - 1]}\`)`);
  }
}

// ── report ──
console.log("\n=== Eventra pre-install readiness ===\n");
for (const p of passed) console.log(`  ✓ ${p}`);
for (const w of warnings) console.log(`  ! ${w}`);
for (const b of blockers) console.log(`  ✗ ${b}`);
console.log("");
if (blockers.length === 0) {
  console.log("READY FOR SHOPIFY AUTHORIZATION");
  process.exit(0);
} else {
  console.log(`NOT READY — ${blockers.length} blocker(s)`);
  process.exit(1);
}
