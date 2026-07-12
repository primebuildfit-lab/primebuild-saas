# Eventra — MM5 Pre-Install Audit (MM4 verified against the repository)

> Part 1 of MEGA MODULE 5. Verifies MM4 **directly against the code** (not against its report), then lists
> the exact gaps MM5 closes before a Shopify dev-store install. Status: ✅ verified · ⚠️ gap (fixed in MM5)
> · ⛔ external gate (out of scope). Last updated 2026-07-12.

## A. Branch / tree / remote (verified)
- MM4 lives on `mm4-business-persistence`, 3 commits (`b15e9aa`, `87bb5f9`, `7fe847e`), pushed, **not
  merged**. MM5 works on `mm5-preinstall-readiness` branched from it; MM4 history preserved.
- Working tree clean at MM5 start.

## B. MM4 deliverables — verified present & correct
| Claim | Verification | Result |
|-------|--------------|--------|
| Persistence layer files | all 14 `app/db/*` + `routes/app.data.tsx` + `lib/planModel.ts` present | ✅ |
| Schema reconciled (no old model) | `grep planning_horizon_months\|store_id\|in ('free'\|'vip'` over `supabase/**` → only a **provenance comment** in `0002_rls.sql` header; no stale DDL | ✅ |
| Locked plans in SQL | `0003` = `business.*`, prices 0/15/30/45, `planning_horizon_years` | ✅ |
| `vip` confined to bridge | only `mockPlans.ts` (façade display), `planModel.ts` (mapper), `domain.ts` (façade type) | ✅ |
| Org RLS | `is_org_member`/`is_workspace_member`, `WITH CHECK` on all merchant tables | ✅ |
| Tests | full suite **172** green (business 121); typecheck/build/boundary green | ✅ |

## C. Gaps found (fixed in MM5)
1. ⚠️ **UI not wired to persistence** — `context/DataContext.tsx` mutates client `useState` only;
   `routes/app.tsx` loader loads **no** business data. So `file`/`supabase` modes don't yet persist from
   the UI. → **Part 3** adds a loader-hydrate + fetcher-persist seam (mock stays the pure-client default).
2. ⚠️ **No local preview** — `/app` requires `authenticate.admin`, so screens can't be inspected without
   Shopify. → **Part 10** adds an env-gated, clearly-labeled preview loader (no OAuth impersonation).
3. ⚠️ **Pre-existing lint errors** — `app.search.tsx`, `app.calendar.tsx` (react-hooks rules, from MM3).
   → **Part 12** fixes them; target lint 0 errors.
4. ⚠️ **No server-side entitlement enforcement** — limits are display-only. → **Part 6** enforces in the
   persistent action path via `@eventra/entitlements`.
5. ⚠️ **No install runbook / preinstall gate / certification / Shopify checklist / RLS test matrix.**
   → **Parts 8/9/14/15/16**.
6. ⚠️ **Provenance comment** in `0002_rls.sql` contains the literal `store_id` (documentation only) — the
   SQL-readiness checker (Part 8) is made comment-aware so it isn't a false positive.

## D. Unsafe assumptions checked
- Tenant ids are **server-resolved & deterministic** (`ids.server.ts` v5) — never client-supplied. ✅
- `persistenceEnabled()` requires all four Supabase secrets → mock/file need none. ✅
- `shopify.app.toml` `client_id=""`, scopes `read_products` only (no write; V1 actions visual-only). ✅
  (Scope least-privilege re-review in Part 9.)

## E. External gates (MM5 must stop here)
⛔ Shopify auth / dev-store selection / credentials · ⛔ Supabase provisioning · ⛔ actual install /
deploy / publish · ⛔ merge to main. All deferred to Brian.
