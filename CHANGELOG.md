# Changelog — Eventra

All notable milestones. Dates are absolute. This file summarizes; `docs/DECISIONS.md` is authoritative for
decisions and `docs/BUILD_STATUS.md` for per-module status.

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
