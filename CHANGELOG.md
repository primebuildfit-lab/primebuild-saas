# Changelog — Eventra

All notable milestones. Dates are absolute. This file summarizes; `docs/DECISIONS.md` is authoritative for
decisions and `docs/BUILD_STATUS.md` for per-module status.

## Phase 13 — Internal OS: metrics-by-equation in the code panel — 2026-07-15

Lets operators define metrics as EQUATIONS in the Estudio code panel, and choose them
as options in the marked places (Comparaciones, each metrics page, Inversión y retorno).
Frontend only — no backend, no deploy/push/merge.

### Added
- **Equation engine + shared registry** (`os/metric-formulas.ts`): a SAFE recursive-descent
  arithmetic parser (no `eval`/`Function`) for `+ − × ÷ ( )` and unary signs; variable
  extraction; `evaluateFormula` (empty values → honest `null`/"no calculable", div-by-zero →
  null); `validateExpression`; unit formatting; and a `useSyncExternalStore`-backed registry
  seeded with the documented equations (ROI, ROAS, costo por visita/registro/prueba/cliente/
  conversión, conversión visita→prueba, visitas por $10, ingreso neto).
- **Equation editor** in Estudio → new "Métricas" area (`os/studio.tsx`): create/edit/delete
  metrics by equation with live validation, detected variables and an honest "no calculable"
  preview; built-ins are protected.
- **Formula UI** (`os/formula-ui.tsx`): `FormulaPanel` (equation + variables + honest result)
  and `FormulaPicker` (dropdown fed by the shared registry — reflects Estudio edits live).

### Changed — the marked places now consume equation-defined metrics
- **Comparaciones**: the metric selector is the `FormulaPicker`.
- **Métricas Mobile/Business/Resumen**: each gains a "Métrica por ecuación" picker.
- **Inversión y retorno**: renders the ROI family (ROI, ROAS, costo por X) from the registry.

### Notes
- No fabricated numbers anywhere — every equation stays "no calculable" until a data source is
  connected. Tests: admin **100 green** (parser precedence/missing-vars/div0/validation, registry
  upsert/remove/builtin-protection, pickers present in the marked places). Typecheck + build clean.

## Phase 12 — Internal OS: platform-control correction + real calendar + metrics — 2026-07-15

Corrects the Internal OS so it is a **platform control centre**, not a copy of Eventra
Business. Fewer operational branches; more real platform control. Mandatory audit:
`docs/EVENTRA_INTERNAL_OS_CORRECTION_AUDIT.md`. Dark design kept. No deploy/push/merge.

### Changed — navigation (28 branches, 5 groups)
- `os/nav.ts`: **General · Métricas · Datos y configuración · Operaciones de producto ·
  Control**. Operational entities (Campañas, Ofertas, Anuncios, Estudio, Contenido,
  Medios, Eventos, Oportunidades, and the Mobile sub-pages) are no longer top-level —
  they are **supervision tabs** inside Eventra Business / Eventra Mobile / Publicaciones.
- Sidebar bottom card replaced: tenant-looking "Eventra Inc./Plan" → **platform status**
  (entorno, versión, base de datos, última sinc.).

### Added
- **Real calendar** (`os/calendar.tsx`): Año/Mes/Semana/Agenda (default Mes), 7-col month
  grid via `@eventra/calendar`, colour-coded by app/type, filters, detail drawer — not a list.
- **Métricas** (`os/metrics.tsx`): Resumen general · Métricas Mobile · Métricas Business ·
  Comparaciones · Inversión y retorno. D/M/A toggle + comparación, documented formulas,
  per-plan cards (Free/Starter/Growth/Pro), all **honest empty states** (no billing/analytics
  connected); every PB metric is permanently "No disponible · Integración PB futura".
- **Platform-control pages** (`os/control.tsx`): Publicaciones, Empresas, Usuarios, Alertas,
  Parámetros, Eventra Business (tabs), Eventra Mobile (tabs), IA y modelos, Versiones y
  publicaciones, Auditoría, Salud del sistema.
- **Building blocks** (`os/platform.tsx`): `PlatformPage` (header + expected source +
  connection status + honest empty + next action — no dead links), `Tabs`, `DmaBar`,
  `MetricPanel`/`MetricGrid`.
- **Inicio** reworked to platform metrics (visitas/ingresos/membresías = honest empty;
  empresas/publicaciones/alertas = real counts) + platform blocks (fuentes con incidencias,
  publicaciones pendientes, países, planes, estado de productos).

### Notes
- Real plan names used (Free/Starter/Growth/**Pro**; spec's "VIP" = Pro).
- Tests: admin **87 green** (5-group nav, absence of removed operational branches, per-route
  render with no dead links, real-calendar views, separated metrics + D/M/A, PB no disponible,
  parámetros, salud, auditoría). Typecheck + production build clean. Full suite green.

## Phase 11 — Internal OS: definitive information architecture — 2026-07-15

Restructures the Internal OS (`apps/admin`) navigation to the **ecosystem master spec** (the 21 platform
branches + a **Mobile Operations** centre that lives inside `apps/admin`, never a 4th app), keeping the
approved **dark command-center** design and visual density. Mandatory audit written first:
`docs/EVENTRA_THREE_APPS_AUDIT.md`. Frontend only — no backend, no deploy, no push.

### Added
- **Definitive nav** (`os/nav.ts`): 31 branches in four sections (Operación · Datos y análisis ·
  Mobile Operations · Configuraciones); generic section rendering in the sidebar; longest-prefix active state.
- **Global branches** (`os/branches.tsx`): **Eventos y noticias**, **Oportunidades**, **Anuncios**,
  **Fuentes**, **Países** — real modules (metrics, filters, tables, distributions) from badged DEV fixtures
  (`data/global-seed.ts`); measured outcomes (acceptance, conversion, impressions, CTR) are honest empty states.
- **Mobile Operations** (`os/mobile.tsx`): Resumen móvil, Publicaciones, Notificaciones push, Usuarios móviles,
  Versiones (Android/iOS/PWA), Analítica móvil, Configuración móvil — fixtures in `data/mobile-seed.ts`;
  users/analytics are honest empty states (no fabricated user/telemetry numbers).
- New icons (`os/icons.tsx`); write actions gated by the platform permission matrix (mock, no live mutation).

### Notes
- Kept "Estudio" alongside the new "Anuncios" branch (composition/code vs. type supervision).
- Tests: admin 86 green (nav counts, spec branches, per-route render, live surface status). Full suite green.

## Phase 10 — Master Spec: opportunity OS + Promotion Builder — 2026-07-13

Executes the 4-part **Eventra Product Master Specification**: reposition the Business app from a calendar into
an **opportunity operating system** (discover → evaluate → promote → publish → measure → remember → reuse).
Frontend/design phase — **no backend touched** (live Supabase, migrations, persistence seam, business rules
unchanged; no deploy/OAuth/Shopify install). Full report: `docs/EVENTRA_BUSINESS_PRODUCT_REDESIGN_REPORT.md`.

### Added
- **Promotion Builder** (`routes/app.promotion-builder.tsx`, "the heart") — a real multi-step wizard
  (Opportunity → Template → Products → Offer & text → Schedule → Preview) that turns an opportunity into a
  campaign/advertisement. Saves a genuine record (optimistic + server seam); honest note that a dedicated
  Promotion schema is future backend work. Reuses `ProductPicker`.
- **Annual calendar heatmap** (`features/calendar/YearHeatmap.tsx`) — default view is the year as an
  importance heatmap (legend, no per-day labels); clicking a month **expands inline** (accordion, reuses
  `MonthView`) so the year context is never lost.
- **`CountrySelector`** primitive + dashboard **country scope** — narrows the dashboard to one market.
- Richer **`scoreFactors()`** (relevance/potential/urgency/reach/ease/reliability) with an honest note that
  competition & historical success are not faked (need real performance data).

### Changed
- **Navigation** → the master-spec structure: Dashboard · Planning (Calendar, Opportunities, Campaigns,
  Promotion Builder, Campaign Library) · Content (Content, Templates, Media) · Knowledge (Audiences,
  Analytics, Countries, Sources) · Company (Team, Billing, Settings). `nav.test.ts` updated.

### Verified
- typecheck ✅ · lint ✅ (0 err) · **191 tests** ✅ · `react-router build` ✅ · preview serves `/app`,
  `/app/promotion-builder`, `/app/calendar?view=year`, `/app/campaign-library` all **200**.

### Not done (honest — see report §Remaining)
- Deep restructuring of Content (4 workspaces), Templates (versioning), Analytics (query builder), Sources,
  Countries, Audiences, AI, Integrations, Team, Billing, Settings — re-themed dark, not rebuilt to spec.
- Promotions/Advertisements as **distinct entities** need a schema change (backend — out of this phase's scope).

## Phase 9 — Business DARK commercial redesign — 2026-07-13

A frontend/design-only phase that gives the Business app a **dark, premium commercial identity** and deepens
the opportunity-first product. Ordered directly by the owner, superseding the Phase-6 Business pre-cert freeze
(must be re-verified). **No backend touched** — live Supabase, migrations, persistence seam, and business rules
are unchanged; no deploy, OAuth, or irreversible step. Full report: `docs/EVENTRA_BUSINESS_PRODUCT_REDESIGN_REPORT.md`.

### Added
- **Dark design system** in `apps/business/app/app.css` — semantic tokens (`canvas`/`surface`/`elevated`/
  `line`/`ink*`/`accent` + `ok/warn/err/info`), `color-scheme: dark`, global reduced-motion guard. Tailwind v4
  utilities (`bg-surface`, `text-ink`, `border-line`…) consumed by the shell + every shared primitive.
- **`ScoreBreakdown`** primitive + `scoreFactors()` helper — explains an opportunity score with its REAL
  weighted signals (relevance/category/reach/reliability), no invented dimensions.
- **`/app/memory`** route — reusable record of completed campaigns + learnings + reuse chains; honest empty state.
- Enhanced **Topbar** (workspace + connection status, quick-create, notifications, help) and a commercial
  **5-group nav** (Planning / Create / Knowledge / Resources / Company); Internal/admin surfaces removed from
  the Business nav.
- **Dashboard** rebuilt around "what should this business do today": contextual summary, primary actions,
  real KPI cards, Needs-attention, Recommended-today (labelled rules-based, not fake AI), 30–90 day timeline,
  recent activity — all real data with honest empty states.

### Changed
- Re-themed the shell + all `components/ui/*` primitives and every Business screen to the dark tokens.

### Verified
- typecheck ✅ · lint ✅ (0 errors) · **189 tests** ✅ · `react-router build` ✅ · preview server serves `/app` 200
  with dark canvas + honest states.

## Phase 8 — Business UI reorg: opportunity-first product — 2026-07-13

Re-centers the Business (Nivel B) surface on **opportunities → campaigns → content → results → memory →
reuse** instead of the calendar. Ordered directly by the user, superseding the Phase-6 Business freeze
(CLAUDE.md §1). Presentation + read-model only — the LIVE Supabase project, migrations, and persistence seam
are untouched (no schema/deploy/irreversible step). See `docs/BUSINESS_INFORMATION_ARCHITECTURE.md`.

### Added
- **Opportunity engine** (`apps/business/app/lib/opportunities.ts`, pure + tested): `buildOpportunities`
  (score 0–100 from importance + category + urgency + reach × reliability), lifecycle state (verified/new/
  modified/cancelled/archived — derived from real hide-prefs + dates + a signal overlay, never invented),
  priority, difficulty, reliability; `sortOpportunities`, `countByState`, `urgentOpportunities`. Tests +11.
- **Discovery-signal overlay** (`app/data/mockOpportunitySignals.ts`): typed `app/data` overlay keyed by
  existing `globalEvents` ids (source/reliability/state/first-seen/revisions); verified default.
- **Opportunities screen** (`/app/opportunities`) — the new flagship: KPI strip, search + status chips +
  sort, scored table; "Create campaign" reuses the existing campaign modal.
- **Definitive navigation** (`app/lib/nav.ts`): 4 groups (General/Management/Operations/Configuration) +
  separate Platform track; grouped `NavLinks`. Tests +6.
- **Dashboard control center**: 4 clickable `MetricCard`s (Countries/Opportunities/Campaigns/Plan) with
  sub-metrics linking into each module.
- **Analytics builder** (`app/lib/analyticsBuilder.ts` + `AnalyticsBuilder`): choose dimension (X) +
  measure (Y) + period; series computed live. Tests +5.
- **New modules** (real, data-driven, no live connections): Content, Audiences, Media, Sources, Integrations,
  Automations, Jobs, AI, Team, Account. Countries gains a coverage/insights view. Typed `app/data` mocks for
  each (demo store only, never PrimeBuild). Module smoke tests +12.
- **Reusable UI**: `MetricCard`, `ScoreBadge`, `DataTable` (responsive), `Toolbar`, `FilterChips`.
- **Docs**: new `BUSINESS_INFORMATION_ARCHITECTURE.md`; CHANGELOG/BUILD_STATUS/PROJECT_CONTEXT/ARCHITECTURE/
  ROADMAP/DESIGN_SYSTEM updated.

### Verified
typecheck ✅ · lint ✅ (0 errors) · tests ✅ **184** (business; +34) · build ✅ (180 modules).

---

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
