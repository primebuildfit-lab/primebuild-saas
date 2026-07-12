#!/usr/bin/env node
/**
 * Workspace dependency-boundary validation (MM3 Part 15).
 * Enforces:
 *  1. No app imports another app (@eventra/{business,consumer,admin}).
 *  2. No shared package imports any app.
 *  3. No circular dependencies among @eventra/* packages (from package.json deps).
 * Exits non-zero on any violation.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const APPS = new Set(["@eventra/business", "@eventra/consumer", "@eventra/admin"]);
const nameFor = (dir) => `@eventra/${dir.split(/[\\/]/).pop()}`;

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    if (e === "node_modules" || e === "dist" || e === "build" || e === ".react-router") continue;
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if ([".ts", ".tsx", ".mts"].includes(extname(p))) out.push(p);
  }
  return out;
}

const importRe = /\bfrom\s+["'](@eventra\/[a-z-]+)["']|\bimport\(["'](@eventra\/[a-z-]+)["']\)/g;
function importsOf(file) {
  const src = readFileSync(file, "utf8");
  const found = new Set();
  let m;
  while ((m = importRe.exec(src))) found.add(m[1] ?? m[2]);
  return found;
}

const violations = [];

function scanTree(baseDir, selfName, forbid) {
  let files = [];
  try { files = walk(baseDir); } catch { return; }
  for (const f of files) {
    for (const imp of importsOf(f)) {
      if (imp === selfName) continue;
      if (forbid(imp)) {
        violations.push(`${f}: illegal import of ${imp}`);
      }
    }
  }
}

// 1 & 2 — scan apps and packages
for (const kind of ["apps", "packages"]) {
  const base = join(ROOT, kind);
  let dirs = [];
  try { dirs = readdirSync(base).filter((d) => statSync(join(base, d)).isDirectory()); } catch { continue; }
  for (const d of dirs) {
    const self = nameFor(join(base, d));
    if (kind === "apps") {
      scanTree(join(base, d), self, (imp) => APPS.has(imp)); // apps must not import other apps
    } else {
      scanTree(join(base, d), self, (imp) => APPS.has(imp)); // shared packages must not import apps
    }
  }
}

// 3 — circular deps among @eventra packages from package.json
const graph = {};
for (const kind of ["apps", "packages", "services"]) {
  const base = join(ROOT, kind);
  let dirs = [];
  try { dirs = readdirSync(base).filter((d) => statSync(join(base, d)).isDirectory()); } catch { continue; }
  for (const d of dirs) {
    let pkg;
    try { pkg = JSON.parse(readFileSync(join(base, d, "package.json"), "utf8")); } catch { continue; }
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    graph[pkg.name] = Object.keys(deps).filter((n) => n.startsWith("@eventra/"));
  }
}
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = {};
const stack = [];
function dfs(n) {
  color[n] = GRAY; stack.push(n);
  for (const m of graph[n] || []) {
    if (color[m] === GRAY) violations.push(`circular dependency: ${[...stack, m].join(" -> ")}`);
    else if ((color[m] ?? WHITE) === WHITE && graph[m]) dfs(m);
  }
  color[n] = BLACK; stack.pop();
}
for (const n of Object.keys(graph)) if ((color[n] ?? WHITE) === WHITE) dfs(n);

if (violations.length) {
  console.error("✗ workspace boundary violations:\n" + violations.map((v) => "  - " + v).join("\n"));
  process.exit(1);
}
console.log("✓ workspace boundaries OK: no app→app imports, no package→app imports, no cycles.");
