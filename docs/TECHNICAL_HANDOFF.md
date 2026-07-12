# Eventra — Technical Handoff (MM3 platform foundation, as-built)

> The repository is now an **npm-workspaces monorepo**. The Business app is fully functional and all
> prior tests pass. **No Supabase/auth/billing/ads are connected.** This doc = the actual structure +
> how to run everything.

## Workspace tool
**npm workspaces** — simplest reliable for this npm/single-lockfile stack; one root lockfile, no extra
infra (no Nx/Turborepo/pnpm). Root `package.json#workspaces = ["apps/*","packages/*","services/*"]`.

## As-built structure
```
apps/
  business/   Eventra Business (moved intact; Shopify-embedded + standalone; React Router SSR)
  consumer/   Eventra Consumer foundation shell (Vite + React Router SPA)
  admin/      Eventra Admin Console foundation shell (Vite SPA, desktop-first)
packages/
  types/         platform types by domain (type-only)
  config/        SINGLE source of prices/plans/add-ons/limits/trials/entitlement keys (no secrets)
  entitlements/  pure two-axis consumer + business plan resolver
  identity/      principal guards, access checks (never trust client ids), RLS-JWT claim contracts
  calendar/      pure date engine (rules incl. offsetDays, grids, occurrence) — Business consumes it
  ui/            product-neutral primitives + responsive AppShell (self-styled, router-agnostic)
  testing/       shared factories/fixtures (principals, orgs, workspaces, entitlement inputs, events)
services/
  api/       backend API contracts (foundation only; no server)
  workers/   worker contracts (foundation only; no queues)
supabase/    migrations / policies / seeds / tests (structure only; NOT provisioned)
docs/        architecture + this handoff
scripts/     check-boundaries.mjs (dependency-boundary + circular validation)
```

## How to run
From the repo root:
```bash
npm install                 # links all workspaces, one lockfile
npm run check:workspaces    # dependency-boundary + circular-import validation
npm run typecheck           # all workspaces
npm run test                # all workspaces (aggregate)
npm run build               # all buildable workspaces

# per app
npm run dev  -w @eventra/business   # shopify app dev (Business)
npm run dev  -w @eventra/consumer   # vite dev (Consumer shell)
npm run dev  -w @eventra/admin      # vite dev (Admin shell)
npm run test:business | test:consumer | test:admin | test:packages
npm run build:business | build:consumer | build:admin
```
Note: on this machine, after `npm install`, run `node node_modules/esbuild/install.js` once if esbuild's
postinstall was blocked (known npm-allow-scripts behavior).

## Dependency boundaries (enforced by scripts/check-boundaries.mjs)
- Apps depend only on `@eventra/*` shared packages; **no app imports another app.**
- Shared packages **never** import an app; packages depend only on `@eventra/types`/`config`/each other
  acyclically.
- Business SSR build bundles workspace TS via `ssr.noExternal: [/@eventra\//]`.

## Environments
Per `docs/ENVIRONMENTS.md`: local · test · development · staging · production, per surface (consumer/
business/admin) + api/workers. **No secrets committed**; `.env.example` per app/service; client apps use
only `VITE_`-prefixed non-secrets; server secrets live in a future secret manager.

## What's done vs deferred (honest)
**Done (verified):** monorepo + Business move (history preserved); 7 shared packages (types/config/
entitlements/identity/calendar/ui/testing) with tests; Business consumes `@eventra/calendar` as a single
source (no duplication); Consumer + Admin shells build + smoke-tested; services + supabase structure;
env templates; boundary validator; docs.
**Deferred (documented, to keep Business green):**
- **Full `@eventra/ui` adoption by Business** — Business still uses its own `app/components/ui/*`
  (converge in MM4).
- **`store → organization/workspace` rename inside the Business app** — Business domain still uses
  `store*`; the platform `Organization/Workspace` types exist in `@eventra/types` and drive new apps.
  The rename is mechanical but touches ~100 files + tests; staged for MM4 to avoid destabilizing the
  87 tests. `@eventra/types` keeps `Store*` OUT and models `Organization/Workspace` so the target is
  unambiguous.
- **Business rewire onto `@eventra/config`/`entitlements`** — Business keeps its tested plan logic;
  new surfaces use the shared engine. Converge in MM4.
- **Consumer/Admin real routing depth, real data, auth, billing, ads** — later Mega Modules.

## MM4 — Business Persistence: run & verify (2026-07-12)

The Business app now has an org-based persistence layer behind an env gate. **Mock is the default** — no
setup needed.

**Persistence modes** (`apps/business/app/db/env.server.ts#persistenceMode`):
- `mock` (default) — in-memory demo data, ephemeral per process. No env needed.
- `file` — set `EVENTRA_PERSISTENCE_MODE=file` (optionally `EVENTRA_PERSISTENCE_FILE=<path>`). Snapshot on
  disk; **survives restarts**. Dev only, no secrets.
- `supabase` — set `EVENTRA_PERSISTENCE=true` + `SUPABASE_URL`/`SUPABASE_ANON_KEY`/
  `SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_JWT_SECRET`. Requires the provisioned project (external gate).

**Verify (all green as of MM4):**
```
npm run typecheck --workspace @eventra/business   # tsc clean
npm run test --workspace @eventra/business         # 121 tests
npm run test:packages                              # shared packages
npm run check:workspaces                           # boundary + cycles
npm run build --workspace @eventra/business        # RR production build
```
Persistence/CRUD/isolation/memory/reload are proven by `test/db/persistence.test.ts` (in-memory + on-disk).

**Live cutover (when the gates open):** apply `supabase/migrations/0001 → policies/0002 →
migrations/0003 → seeds/seed` to a **new, separate** Eventra project; set the `supabase` env; `resolveTenant`
provisions the org/workspace on first Shopify install; wire `DataContext` to `/app/data`; run the live
isolation matrix (`RLS_SECURITY_MODEL.md §7`) + in-browser reload check.

## No production services touched
No Supabase provisioned, no billing/ads connected, no Android/iOS publish, no PrimeBuild changes.
