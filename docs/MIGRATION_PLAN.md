# Eventra — Migration Plan (current repo → platform monorepo)

> Exact plan to evolve the current single-app repo into the target `REPOSITORY_ARCHITECTURE.md`. **Do
> not execute yet** — this is the plan to approve first. Executed later, incrementally, with green
> tests at every step. The current app + **87 tests** must keep passing throughout.

## 1. Current state (inventory)
Single React Router app at repo root: `app/` (components 27, features 31, lib 14, routes 21, context 3,
db 6, data 10, types 1, hooks 1), `supabase/` (Business slice migrations + RLS + seed), `test/` (12
files, 87 tests), `docs/` (architecture package). Tenancy is **store-based** (mock `DataContext`, split
into Plan/Catalog/Campaigns).

## 2. What MOVES (into the monorepo)
| From | To | Notes |
|------|----|----|
| `app/` (whole current app) | `apps/business/app/` | becomes the Business surface; `/app` stays as Shopify embedded host |
| `app/components/ui/*`, `shell/*`, `hooks/useDialog` | `packages/ui` | shared design system |
| `app/lib/{events,planning,calendar,dates,recurrence}` | `packages/calendar` | shared engine |
| `app/db/*` + `supabase/*` | `packages/identity` + `supabase/*` (platform) | RLS-JWT bridge generalizes; schema expands |
| `app/lib/{planEntitlements,planLimits}` + `mockPlans` | `packages/config` + `packages/billing` | single entitlement/price source |
| `app/types/domain.ts` | `packages/types` | + new consumer/deal/ad/billing types |
| `test/*` | `packages/*/test` + `apps/business/test` | co-locate with moved code |

## 3. What STAYS put (initially, low-risk)
Business feature composition (`app/features/*`), routes, and mock data stay inside `apps/business` at
first — split into packages only where genuinely shared. Docs stay in `docs/`.

## 4. What becomes SHARED vs NOT
- **Shared:** ui, calendar engine, identity/auth bridge, config/entitlements, types, billing, deals,
  notifications, advertising, integrations, analytics, testing.
- **Not shared:** each surface's onboarding, navigation, branding, and page composition.
- **Never shared:** tenant data (RLS boundary, not packaging).

## 5. Schema migration (store → org; Business slice → platform)
1. Introduce **Organization/Workspace** alongside `store` (backward-compatible views).
2. Add platform tables (consumer, deals, advertising, billing, notifications, admin) from
   `PLATFORM_SCHEMA.md`.
3. Extend RLS: `is_org_member`, `is_self`, advertiser/admin/service policies (`RLS_SECURITY_MODEL.md`).
4. Migrate Business data `store_id → workspace_id/org_id` (data-preserving).
5. Retire `store` naming after all references move. No data loss.

## 6. Sequenced steps (each ends green: typecheck + test + build)
Status: ✅ done in MM3 · 🟡 partial · ⬜ pending.
| Step | Action | Status |
|------|--------|--------|
| M0 | Approve plan + `REPOSITORY_ARCHITECTURE.md` | ✅ |
| M1 | npm workspaces; wrap current app as `apps/business` (no logic change) | ✅ |
| M2 | Extract `packages/{types,config,calendar}` (+ `entitlements`,`identity`,`ui`,`testing`) | ✅ (ui adoption by Business 🟡) |
| M3 | `store → org/workspace` rename inside Business | 🟡 platform types model Org/Workspace; Business rename staged for MM4 (protects 87 tests) |
| M4 | Generalize `app/db` → `packages/identity` (principal-aware RLS-JWT) | 🟡 identity contracts done; Business `app/db` rewire pending |
| M5 | Expand `supabase/*` to platform schema + RLS + isolation tests | ⬜ (structure/classification done) |
| M6 | Wire Business persistence on the platform schema | ⬜ |
| M7 | Scaffold `apps/consumer` + `apps/admin` shells reusing packages | ✅ |
| M8+ | Build Consumer/Admin surfaces per `PLATFORM_ROADMAP.md` | ⬜ |

**MM3 delivered M0–M2, M7 fully + M3/M4 partially. Remaining (M3 rename, M4 db rewire, M5–M6, M8+) is
MM4+.** Details: `docs/TECHNICAL_HANDOFF.md`.

## 7. Guardrails during migration
- Keep the app runnable + tests green after **every** step (no big-bang).
- No behavior change during pure moves/renames (M1–M4).
- Isolation tests (`RLS_SECURITY_MODEL.md §7`) gate M5–M6.
- Lint boundary rules added in M2 to prevent illegal cross-package imports.

## 8. Reusability (what carries with little/no change)
Design system + primitives, calendar/date engine (incl. corrected recurrence), domain types, plan/
retention logic, mock architecture + 87 tests, and the Supabase Business slice + `app/db` foundation.

## 9. Requires migration/rework
`store→org/workspace` rename; expand schema/RLS to platform; principal-aware auth; move shared code into
packages; introduce workspace tooling; new Consumer/Admin apps.

## 10. Open decisions
Workspace tool choice; monorepo vs staged single-repo route-tree split first; timing of the `store→org`
rename (recommended early, M3).
