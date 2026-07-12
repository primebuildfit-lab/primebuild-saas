# Eventra — Pre-Install Certification (MM5, Part 16)

> Internal certification that Eventra Business is ready for the Shopify dev-store installation gate.
> This does NOT claim the app is installed, that live Supabase was tested, or that real OAuth ran.
> Date 2026-07-12 · branch `mm5-preinstall-readiness`.

## DECISION: ✅ READY FOR SHOPIFY AUTHORIZATION

All gate criteria met: Critical = 0, High = 0; typecheck / lint / tests / build green; persistence
integration verified locally (incl. in-app file-mode write→reload); Shopify config prepared; RLS SQL +
isolation matrix prepared; runbook complete.

## 1. Gate criteria
| Criterion | Result |
|-----------|--------|
| Critical findings = 0 | ✅ |
| High findings = 0 | ✅ |
| typecheck green | ✅ (all workspaces) |
| lint green (0 errors) | ✅ (5 advisory React-Compiler warnings remain) |
| tests green | ✅ **Business 134**, full suite **185** across 9 workspaces |
| build green | ✅ RR production build |
| persistence integration verified locally | ✅ unit + integration + cross-process + **live preview** write→reload |
| Shopify configuration prepared | ✅ toml + scopes (least-privilege) + `.env.example` |
| RLS SQL prepared | ✅ schema/policies reconciled + `preinstall_rls_matrix.sql` |
| runbook complete | ✅ `SHOPIFY_DEV_INSTALL_RUNBOOK.md` |

## 2. Server-action security matrix (Part 7)
Every persistent action takes a **server-resolved `TenantScope`** (never a client id) and is gated by the
repository + (in `supabase` mode) RLS. Behavior per scenario:

| # | Scenario | Handling | Coverage |
|---|----------|----------|----------|
| 1 | Read own workspace | Loader/loadBundle filters by `scope.workspaceId` | persistence.test, persistenceWiring.test, live preview |
| 2 | Write own workspace | Repo writes under `scope.workspaceId` | persistence.test, live preview (POST /app/data) |
| 3 | Cross-workspace **read** | Other workspace returns nothing (per-workspace store / RLS `is_workspace_member`) | persistence.test (isolation) |
| 4 | Cross-workspace **write** | `not_found` at app layer; RLS `WITH CHECK` blocks at DB | persistence.test; `preinstall_rls_matrix.sql` |
| 5 | Malformed input | `RepositoryError("validation")` before any write | persistence.test (dates/name/category/duration) |
| 6 | Missing membership | `mock`/`file`: fixed demo scope; `supabase`: `resolveTenant` requires a verified Shopify session + membership row → else no access | tenant.server.ts; RLS matrix (anon reads 0) |
| 7 | Read-only downgrade state | Over-limit country enable blocked (`forbidden`); excess kept read-only, never deleted | enforcement.test |
| 8 | Inactive/deleted records | Soft-deleted rows excluded from reads; retained in snapshot | persistence.test (retention) |
| 9 | Repeated mutation | Upserts idempotent (countries/prefs/plan); create with client-id parity avoids dup-on-retry | persistence.test, mode.test |
| 10 | Unknown intent | `dispatchDataAction` throws (never a silent no-op) | persistence.test |
| 11 | Client-supplied tenant id | Never authoritative — scope resolved server-side from verified identity | identity pkg + tenant.server.ts |

## 3. Findings by severity
- **Critical:** none.
- **High:** none.
- **Medium:** (a) live Supabase RLS not executed (external gate — `preinstall_rls_matrix.sql` ready);
  (b) embedded App Bridge behavior verifiable only after install.
- **Low:** (a) 5 advisory React-Compiler warnings (form-modal effects, calendar memo) — no runtime bug;
  (b) Business-UI still on the `Store`/`PlanId` façade (documented compat, later convergence);
  (c) `notes` entity persisted but has no UI yet.

## 4. Verified vs simulated vs gated
- **Verified (real):** persistence layer, reconciled schema/RLS SQL (static + syntax), server actions,
  entitlement enforcement, tenant isolation (app-level), file-mode reload survival **in the running app**,
  every Business screen renders with zero console errors, typecheck/lint/tests/build.
- **Simulated (labeled):** local preview renders the UI **without** a Shopify session (no OAuth
  impersonation; clearly bannered).
- **Gated (NOT done):** live Supabase provisioning + RLS execution; real Shopify OAuth/session; in-Admin
  embedded reload; install/deploy/publish; merge to main.

## 5. Statement
Eventra Business is **installation-ready in code**. The only remaining steps before seeing Eventra inside
Shopify Admin are Brian's: (1) authorize Shopify access, (2) select the approved development store, (3) run
the prepared install command (`docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md`). No installation, Supabase
provisioning, OAuth, deployment, or merge to main was performed. PrimeBuild production was untouched.
