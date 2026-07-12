# Changelog — Eventra

All notable milestones. Dates are absolute. This file summarizes; `docs/DECISIONS.md` is authoritative for
decisions and `docs/BUILD_STATUS.md` for per-module status.

## MEGA MODULE 5 — Pre-Install Readiness & Embedded Hardening (in code) — 2026-07-12

Makes Eventra Business **installation-ready**: the only remaining steps before seeing it in Shopify Admin
are Brian's Shopify auth + dev-store selection + the prepared install command. No install, no Supabase, no
OAuth, no merge to main. Certification: **READY FOR SHOPIFY AUTHORIZATION**.

### Added
- **Client persistence wiring** (Part 3): `DataProvider` hydrates from loader data + persists each mutation
  through an optimistic `onPersist`→`/app/data` seam (`usePersistence`). Mock stays the pure-client default.
- **Local preview** (Part 10): env-gated, clearly-labeled `EVENTRA_PREVIEW` loader — renders the Business
  UI without a Shopify session (no OAuth impersonation). Verified live: all 12 screens render, 0 console
  errors, in-app file-mode write→reload survives.
- **Server-side entitlement enforcement** (Part 6): `db/enforcement.ts` (country limits from the locked
  model; non-destructive downgrade read-only).
- **Tooling**: `scripts/check-sql-readiness.mjs`, `verify-file-persistence.mjs`, `preinstall-check.mjs`
  (`READY FOR SHOPIFY AUTHORIZATION` gate) + npm scripts `check:sql` / `verify:persistence` /
  `preinstall:check`. `supabase/tests/preinstall_rls_matrix.sql`.
- **Docs**: `MM5_PREINSTALL_AUDIT`, `SHOPIFY_PREINSTALL_CHECKLIST`, `SHOPIFY_DEV_INSTALL_RUNBOOK`,
  `BUSINESS_PREINSTALL_UX_REVIEW`, `EVENTRA_PREINSTALL_CERTIFICATION`.
- **Tests** +9 (enforcement) +7 (wiring/reload) → Business **134**.

### Changed
- Lint: fixed the pre-existing `app.search.tsx` / `app.calendar.tsx` errors (0 lint errors now).
- `shopify.server.ts`: non-production placeholder credentials so the app boots for preview (production
  still fails loudly if secrets are missing).
- `.env.example` documents `EVENTRA_PERSISTENCE_MODE`/`FILE`/`PREVIEW`; `.gitignore` ignores `.eventra/`.

### Not done (external gates)
No Supabase provisioning, no Shopify OAuth/session, no install/deploy/publish, no merge to main. PrimeBuild
production untouched.

## MEGA MODULE 4 — Business Persistence (in code) — 2026-07-12

Turns the Business app from mock-only into a real, org-based, persistent application **in code**, behind an
env gate with **mock mode as the default**. No infrastructure provisioned; all tests green throughout.

### Added
- **Persistence layer** (`apps/business/app/db/`): `BusinessRepository` contract; in-memory, file-backed
  (dev, survives restart), and Supabase (RLS, org-aware) adapters; `persistenceMode()` selector
  (`mock|file|supabase`); pure server-action dispatcher + `routes/app.data.tsx` resource route.
- **Reconciliation bridge** `app/lib/planModel.ts` — façade `PlanId`/role ↔ locked `business.*`/role.
- **Validation & integrity** `app/db/validation.ts` — required/date/enum checks, duplicate prevention,
  referential guards; soft-delete, audit fields, campaign memory versioning.
- **Docs** `docs/MM4_PERSISTENCE.md` (audit + reconciliation + all 12 parts); this `CHANGELOG.md`.
- **Tests** +34 (Business 87 → 121): CRUD, isolation, memory/versioning, survives-reload, soft-delete
  retention, validation/failure, mode selection, plan bridge.

### Changed (reconciled — resolves the old schema Blocker 3)
- `supabase/migrations/0001_schema.sql`, `policies/0002_rls.sql`, `migrations/0003_reference_data.sql`,
  `seeds/seed.sql`: store-based → **organization/workspace** model; plans → locked `business.*`
  (workspace/year limits); RLS `is_org_member`/`is_workspace_member`; audit + soft-delete + versioning.
  Store-based originals preserved in git history.
- `app/db/{mappers,tenant,ids,env}.server.ts` reconciled to the org model; `repositories.server.ts`
  replaced by `supabaseRepository.server.ts`.
- Façade domain (`types/domain.ts`): added `WorkspaceNote`, `TenantScope`, optional `Campaign.version`.

### Not changed / not done (external gates)
- No Supabase project provisioned; no Shopify credentials wired. Business UI façade unchanged (compat).
- Live cutover (flip to `supabase` mode, wire `DataContext`→`/app/data`, live isolation matrix +
  in-browser reload) is the documented handoff.

## MEGA MODULE 3 — Platform Foundation — 2026-07-11
npm-workspaces monorepo; Business moved to `apps/business`; shared `@eventra/*` packages; Consumer/Admin
shells; services/supabase structure; boundary validator. 138 tests.

## MEGA MODULES 1–2 — Platform redesign + architecture lock — 2026-07-11
Three-product platform design; locked entitlements/plans/schema/RLS/billing/trials/deals/ads/notifications.

## Phases 1–4 — Business product — earlier
Foundation on the Shopify React Router template → full mock-driven Business product → hardening sprint.
