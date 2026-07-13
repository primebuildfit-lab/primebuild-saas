# Changelog — Eventra

All notable milestones. Dates are absolute. This file summarizes; `docs/DECISIONS.md` is authoritative for
decisions and `docs/BUILD_STATUS.md` for per-module status.

## Phase 7 — Internal OS, visual redesign, offer engine — 2026-07-13

Builds the private platform admin console (Nivel A), strictly separated from Business (B) and Personal (C).
No new Business features; Business stays functionally frozen. All gates green.

### Added
- **Platform roles** (`@eventra/identity`): `platform_owner|platform_admin|operations|support|analyst|
  read_only` + `PLATFORM_ROLE_PERMISSIONS` + `platformCan()`. A tenant role can never grant a platform
  permission (tested). Tests +8.
- **Offer engine** (`apps/admin/src/engine/*`, pure + tested): domain types; deterministic `scoring`
  (0–100, 7 factors); 4-year `occurrences` (recurrence-expanded, certainty ladder, never confirms a
  projection); `changeDetection` (cancellation=critical, date=major); `commissions` (hard-clamped 1–2%,
  modeled never charged); **AI port + deterministic fake** (human-review threshold, no auto-publish, cost 0).
  Tests +14.
- **Internal OS UI** (`apps/admin`): dark, information-dense shell (grouped collapsible sidebar, topbar,
  ⌘K command palette, environment badge) + real screens on clearly-marked DEV SEED — Home (operational KPIs
  + alerts + activity), Global Calendar (annual + horizon + ranking), Offers (filters + score + bulk-gated),
  Sources, Companies, Users, Commissions, Jobs, Analytics, AI (runs the fake). Remaining modules are honest
  scaffolds. Shell tests updated (+2).
- **Offer-engine schema** (`supabase/migrations/0004_internal_os.sql` + `policies/0005_internal_os_rls.sql`):
  platform-owned tables (sources/offers/versions/scores/verifications/cancellations/eligibility/commissions/
  jobs/change_detections/ai_reviews/alerts/notes/integrations/media-metadata/metrics/platform_admins);
  `is_platform_admin()`/`has_platform_role()` RLS; media bytes stay off Postgres. Not executed.
- **Dev seed** (`apps/admin/src/data/seed.ts`): fictional, generic, `isDev`-marked (NO PrimeBuild); prod guard.
- **Docs**: `INTERNAL_OS_INFORMATION_ARCHITECTURE`, `OFFER_ENGINE`, `GLOBAL_CALENDAR`, `AI_ENGINE`,
  `COMMISSIONS`, `DATA_MODEL`, `PLATFORM_ADMIN_SECURITY`, `DESIGN_SYSTEM`, `AUTOMATIONS`, `ARCHITECTURE`,
  `ROADMAP`; `FINAL_CERTIFICATION_CHECKLIST` gains an Internal-OS section (D79–D82).

### Verified (all green)
typecheck (0 err) · lint (0 err) · **~230 tests** (business 150, admin 19, identity 23, …) · build ·
boundaries · sql · pwa.

### Not done (Brian-gated / next phases)
Live Supabase (offer-engine tables) + admin auth provider; real source connectors + job scheduler; real AI
provider; Shopify Billing/real commissions; design-system extraction to `@eventra/ui`; scaffolded modules
(Content/Templates/Media/Audiences/Integrations/Countries/Health/Logs/Audit/Settings/Plans); Playwright E2E;
a11y/perf audits. No deploy/install/merge/push.

## Phase 6 — Pre-certification: infra & activation closed — 2026-07-13

Final technical phase before install. No new product features — Eventra is functionally frozen. All gates
re-verified green. Full post-install list: `docs/FINAL_CERTIFICATION_CHECKLIST.md`.

### Added
- **GDPR compliance webhooks** (D76): `customers/data_request`, `customers/redact` (acknowledged — no
  customer PII stored), `shop/redact` (deletes sessions + cascades the org in supabase mode). Registered in
  `shopify.app.toml`; all HMAC-verified + idempotent.
- **Health/readiness + observability** (D77): public `/healthz` (liveness + build/version) and `/readyz`
  (supabase → live catalog read or 503); `lib/observability.server.ts` (request-id + structured logger,
  no secrets) and `lib/version.server.ts`. Tests +7.
- **Deploy config** (D75): root `railway.json` (Nixpacks from repo root, health `/healthz`) + `docs/DEPLOY.md`.
- **Supabase rollback** (D78): `supabase/rollback/0001_drop.sql` (dev-only).
- **Docs**: `INSTALL.md`, `DEPLOY.md`, `TESTING.md`, `FINAL_CERTIFICATION_CHECKLIST.md`.

### Verified (all green)
typecheck (0 err) · lint (0 err) · **~208 tests** (business 150) · build · boundaries · sql · pwa · preinstall.

### Not done (Brian-gated, by design)
Real deploy, Shopify credentials/`client_id`, Supabase provisioning + live RLS matrix, install, physical
device/PWA/Shopify-Mobile certification, merge to main. No functional development remains.

## Stabilization phase — Plans/roles convergence, server authz, PWA — 2026-07-13

Pre-cutover hardening. No infra provisioned, no credentials, no deploy/install, no merge to main.
All gates re-verified green (typecheck, lint, ~201 tests, build, boundaries, SQL readiness, preinstall,
PWA check). Full report + Brian action list: `docs/STABILIZATION_2026-07-13.md`.

### Added
- **Canonical roles + permissions** in `@eventra/identity`: locked `owner|admin|editor|viewer`,
  `ROLE_PERMISSIONS` matrix, `roleCan()`. Business maps intents→permissions (`app/lib/permissions.ts`)
  and **enforces server-side** in the single write choke point `dispatchDataAction` (deny-by-default →
  `forbidden`/403). Tests +9 (business) +7 (identity).
- **PWA** (Business): `public/manifest.webmanifest`, conservative `public/sw.js` (never caches
  `/app/data`/auth/cross-origin; network-first navigations + `offline.html`; static SWR), `PwaRuntime`
  (SW register top-level only — never in the Shopify iframe — + offline banner + install hints), PWA
  meta/manifest links in `root.tsx`, maskable icon. `scripts/check-pwa.mjs` + `npm run check:pwa`.
- **Unified `npm run verify`** (typecheck+lint+test+build+boundaries+sql+pwa).
- **`.env.example`**: `NODE_ENV` + a clearly-labeled PREPARED block (`BILLING_TEST_MODE`, `LOG_LEVEL`,
  `OBSERVABILITY_DSN`, `SESSION_SECRET`, `ENCRYPTION_SECRET`, `EVENTRA_FEATURE_FLAGS`) — reserved, not yet
  read by code.

### Changed
- **Plans single source of truth confirmed = `@eventra/config`.** `data/mockPlans.ts` documented as the
  display-only façade bridged by `lib/planModel.ts`. Merchant-facing price/name/horizon flip to the locked
  model is **deferred to Brian** (D71) — not changed silently.
- Docs: corrected the obsolete "Phase 0 / no code" `README.md`; `DECISIONS.md` D70–D74.

### Not done (external gates / Brian)
Merchant price-display flip (D71); PNG 192/512 icons; live Supabase + Shopify credentials; OAuth/install;
E2E harness; physical device/PWA/Shopify-Mobile testing; deploy; merge to main.

## Installation phase — Local install + Windows desktop integration — 2026-07-12

Eventra Business is launchable like a normal Windows app, entirely locally (no Shopify/Supabase/deploy).

### Added
- **Windows shortcuts:** `scripts/windows/{install,uninstall}-shortcuts.ps1` + `make-icon.ps1` →
  Desktop + Start Menu (`Eventra ▸ Eventra Business`), branded `assets/eventra.ico`. npm:
  `shortcuts:install` / `shortcuts:uninstall` / `icon:make`.
- **Launchers:** `Eventra-Local.cmd` (UTF-8 codepage, title, exit codes), `scripts/eventra-local.ps1`
  (UTF-8 output), hardened `scripts/eventra-local.mjs` (ASCII output, HTTP already-running guard,
  auto-open browser, friendly errors). Helpers `reset:local` / `update:local`.
- **Desktop quality:** app `<title>Eventra Business</title>` + favicon (`public/favicon.svg` + `.ico`).
- **Docs:** `WINDOWS_INSTALL.md`; updates to `LOCAL_USAGE`, `BUILD_STATUS`, `TECHNICAL_HANDOFF`.

### Verified live (Windows 11)
Desktop + Start Menu launch → HTTP 200 on `/app`, title + preview banner; startup, shutdown (port
released), restart recovery (data survives), multiple-launch guard, idempotent re-install. Typecheck /
lint (0 errors) / tests (134) / build green.

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
