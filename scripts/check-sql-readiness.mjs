#!/usr/bin/env node
/**
 * MM5 Part 8 — static Supabase SQL readiness check. NO database access.
 *
 * Validates, over the local `supabase/**` files only:
 *  - required migration/policy/seed files exist;
 *  - every required table is defined in the schema;
 *  - every tenant table enables RLS and has an expected policy;
 *  - the locked model has NO old residue (store_id column, planning_horizon_months,
 *    plan ids free/starter/growth/vip as DDL — comments are ignored).
 *
 * Prints a report and exits 0 (READY) or 1 (NOT READY). Safe: never connects,
 * provisions, or mutates anything.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = (p) => join(root, p);

const FILES = {
  schema: "supabase/migrations/0001_schema.sql",
  rls: "supabase/policies/0002_rls.sql",
  ref: "supabase/migrations/0003_reference_data.sql",
  seed: "supabase/seeds/seed.sql",
  matrix: "supabase/tests/preinstall_rls_matrix.sql",
};

const REQUIRED_TABLES = [
  "countries", "plans", "global_events",
  "organizations", "workspaces", "memberships", "invitations", "subscriptions",
  "workspace_countries", "workspace_event_preferences", "custom_events",
  "campaigns", "templates", "workspace_notes", "workspace_preferences",
];

// Tenant tables that MUST have RLS enabled + a policy.
const TENANT_TABLES = [
  "organizations", "workspaces", "memberships", "invitations", "subscriptions",
  "workspace_countries", "workspace_event_preferences", "custom_events",
  "campaigns", "templates", "workspace_notes", "workspace_preferences",
];

const errors = [];
const notes = [];
const ok = [];

/** Strip `--` line comments so provenance notes don't cause false positives. */
function stripComments(sql) {
  return sql
    .split("\n")
    .map((l) => {
      const i = l.indexOf("--");
      return i >= 0 ? l.slice(0, i) : l;
    })
    .join("\n");
}

function read(key) {
  const path = P(FILES[key]);
  if (!existsSync(path)) {
    errors.push(`missing file: ${FILES[key]}`);
    return "";
  }
  ok.push(`found ${FILES[key]}`);
  return readFileSync(path, "utf8");
}

const schema = stripComments(read("schema"));
const rls = stripComments(read("rls"));
const ref = stripComments(read("ref"));
read("seed");
read("matrix");

// 1. required tables defined
for (const t of REQUIRED_TABLES) {
  if (!new RegExp(`create table if not exists\\s+${t}\\b`, "i").test(schema)) {
    errors.push(`schema missing table: ${t}`);
  }
}

// 2. RLS enabled + a policy for every tenant table
for (const t of TENANT_TABLES) {
  if (!new RegExp(`alter table\\s+${t}\\s+enable row level security`, "i").test(rls)) {
    errors.push(`RLS not enabled for tenant table: ${t}`);
  }
  if (!new RegExp(`create policy\\s+\\w+\\s+on\\s+${t}\\b`, "i").test(rls)) {
    errors.push(`no policy defined for tenant table: ${t}`);
  }
}

// 3. membership helpers present
for (const fn of ["is_org_member", "is_workspace_member"]) {
  if (!new RegExp(`function\\s+${fn}\\b`, "i").test(rls)) errors.push(`RLS helper missing: ${fn}()`);
}

// 4. locked-model residue (DDL only — comments stripped)
const residue = [
  [/planning_horizon_months/i, "old planning_horizon_months column"],
  [/\bstore_id\b/i, "old store_id column"],
  [/in\s*\(\s*'free'\s*,\s*'starter'\s*,\s*'growth'\s*,\s*'vip'\s*\)/i, "old plan id set (free/starter/growth/vip)"],
];
for (const src of [schema, rls, ref]) {
  for (const [re, label] of residue) {
    if (re.test(src)) errors.push(`stale old-model residue: ${label}`);
  }
}

// 5. locked plans present in reference data
for (const id of ["business.free", "business.starter", "business.growth", "business.pro"]) {
  if (!ref.includes(id)) errors.push(`reference data missing locked plan: ${id}`);
}
if (/planning_horizon_years/i.test(schema)) ok.push("schema uses year horizons");

// ── report ──
console.log("Supabase SQL readiness check (static, no DB access)\n");
for (const o of ok) console.log(`  ✓ ${o}`);
for (const n of notes) console.log(`  • ${n}`);
if (errors.length) {
  console.log("");
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(`\nSQL READINESS: NOT READY (${errors.length} issue(s))`);
  process.exit(1);
}
console.log("\nSQL READINESS: READY — schema/RLS/reference data reconciled to the locked org model.");
process.exit(0);
