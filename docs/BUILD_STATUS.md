# Eventra — Build Status (`BUILD_STATUS.md`)

Status legend: ⬜ Not Started · 🟨 In Progress · 🟦 Ready for Review · ✅ Approved · ⛔ Blocked

_Last updated: 2026-07-11 — **Phase 1 correction EXECUTED and verified** in a connected Claude Code
session (Windows, Node 24.18, npm 11.16, Shopify CLI 4.3.0). The app was migrated onto the official
Shopify React Router template; `npm install`, `npm run typecheck`, and `npm run build` all pass; a
production-server smoke test boots and serves. Foundation is 🟦 **Ready for Review** (final Phase-1
approval still pending from the user)._

---

## PHASE 7 — Internal OS + Offer Engine + visual redesign (2026-07-13) 🟦

Built the private platform admin console (Nivel A), strictly separated from Business (B) / Personal (C).
Business stays functionally frozen. See `docs/INTERNAL_OS_INFORMATION_ARCHITECTURE.md`, `OFFER_ENGINE.md`,
`DATA_MODEL.md`, `PLATFORM_ADMIN_SECURITY.md`.

- **Platform roles** (`@eventra/identity`): 6 roles + matrix + `platformCan`; tenant roles can't reach
  platform perms (D79).
- **Offer engine** (`apps/admin/src/engine/*`, tested): scoring, 4-year horizon (certainty ladder),
  change/cancellation detection, commissions (1–2% clamp), **AI port + deterministic fake** (human review,
  no auto-publish) (D80–D82).
- **Internal OS UI** (`apps/admin`): dark information-dense shell (sidebar/topbar/⌘K palette/env badge) +
  real Home/Calendar/Offers/Sources/Companies/Users/Commissions/Jobs/Analytics/AI screens on marked DEV
  SEED (no PrimeBuild); remaining modules = honest scaffolds (D83).
- **Schema**: `supabase/migrations/0004_internal_os.sql` + `policies/0005_internal_os_rls.sql` (platform-
  owned, admin-only RLS; media off Postgres). Not executed.
- **Docs**: 11 new/updated incl. INTERNAL_OS IA, OFFER_ENGINE, DATA_MODEL, AI_ENGINE, COMMISSIONS,
  PLATFORM_ADMIN_SECURITY, DESIGN_SYSTEM, GLOBAL_CALENDAR, AUTOMATIONS, ARCHITECTURE, ROADMAP;
  FINAL_CERTIFICATION_CHECKLIST +Internal-OS section.
- **Verified**: typecheck ✅ · lint ✅ · tests ✅ **~230** (business 150, admin 19, identity 23) · build ✅ ·
  boundaries ✅ · sql ✅ · pwa ✅.

---

## PHASE 6 — Pre-Certification: infrastructure & activation closed (2026-07-13) 🟦

Eventra is **functionally frozen** and infra-complete in code. Remaining steps are Brian-gated
(credentials, deploy, install, device certification). See `docs/FINAL_CERTIFICATION_CHECKLIST.md`,
`docs/DEPLOY.md`, `docs/INSTALL.md`.

- **Compliance webhooks** added + registered (`customers/data_request`, `customers/redact`, `shop/redact`) —
  HMAC-verified, idempotent (D76). Eventra stores no customer PII (`read_products` only).
- **Health/readiness**: `/healthz` (liveness+version) and `/readyz` (supabase → live catalog read or 503);
  request-id + structured logger, no secrets (D77).
- **Deploy**: `railway.json` (Nixpacks from repo root, health `/healthz`) + `DEPLOY.md`; Supabase rollback
  SQL (D75/D78).
- **OAuth/onboarding/App Bridge**: verified already wired (library-handled OAuth/state/HMAC/token/session;
  idempotent tenant provisioning; embedded Dashboard). No redesign.
- **Docs**: `INSTALL`, `DEPLOY`, `TESTING`, `FINAL_CERTIFICATION_CHECKLIST`; README/DECISIONS/CHANGELOG updated.
- **Verified**: typecheck ✅ · lint ✅ (0 err) · tests ✅ **~208** (business 150) · build ✅ · boundaries ✅ ·
  sql ✅ · pwa ✅ · preinstall ✅ READY.
- **Stabilization phase (earlier same day)**: canonical plans SoT (`@eventra/config`) + roles/permissions
  (`@eventra/identity`) with server-side enforcement at `dispatchDataAction`; PWA. See D70–D74.

---

## INSTALLATION PHASE — Local install + Windows desktop integration ready (2026-07-12) ✅

Eventra Business is **installed and usable locally** with no external services (preview + file
persistence), and **integrated into Windows** so Brian launches it like any desktop app. Verified live
end-to-end: startup, shutdown, restart recovery, first-run seeding, persistence, multiple-launch guard,
and idempotent shortcut install. See **`docs/WINDOWS_INSTALL.md`** + **`docs/LOCAL_USAGE.md`**.

- **Windows integration:** `npm run shortcuts:install` creates a **Desktop icon** + **Start Menu ▸ Eventra
  ▸ Eventra Business** (branded `assets/eventra.ico`, working dir = repo root, no temp paths). Both shortcut
  launches verified → HTTP 200 on `/app`, window title `Eventra Business`, preview banner. Remove with
  `shortcuts:uninstall`.
- **Launchers (hardened, Windows 11):** `Eventra-Local.cmd` (UTF-8 codepage, title, exit codes),
  `scripts/eventra-local.ps1` (UTF-8 output), `scripts/eventra-local.mjs` (ASCII output, HTTP-based
  already-running guard, auto-open browser, friendly errors). `npm run start:local` → `localhost:3000/app`.
- **Helpers:** `reset:local` (fresh demo), `update:local` (safe ff + install), `icon:make`.
- **Desktop quality:** app `<title>Eventra Business</title>` + favicon (`favicon.svg`/`.ico`) added to root.
- **Stops at the gate:** no Shopify, no Supabase, no publish/deploy. Real Shopify Admin install remains
  Brian-gated (`docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md`).

---

## MEGA MODULE 5 — Pre-Install Readiness implemented in code (2026-07-12) 🟦

Business is **installation-ready** — certified **READY FOR SHOPIFY AUTHORIZATION**
(`docs/EVENTRA_PREINSTALL_CERTIFICATION.md`). No install, no Supabase, no OAuth, no merge to main.

**Delivered:**
- **Client persistence wiring** — `DataProvider` hydrates from loader data + persists mutations through an
  optimistic `/app/data` seam (mock pure-client default preserved; all tests green).
- **Local preview** — env-gated, labeled, no Shopify session. **Verified live in the browser:** all 12
  Business screens render with **zero console errors**; an in-app file-mode write **survived reload**.
- **Server-side entitlement enforcement** (country limits, non-destructive downgrade).
- **Tooling** — `preinstall:check` (READY gate), `check:sql`, `verify:persistence`; RLS isolation matrix.
- **Docs** — MM5 audit, Shopify checklist (scopes least-privilege = `read_products` only), install runbook,
  screen review, certification.
- **Lint** — fixed pre-existing `app.search`/`app.calendar` errors → **0 lint errors**.
- **Verification** — typecheck ✅ · lint ✅ · tests ✅ (Business 134 / ~181 total) · build ✅ · boundaries ✅
  · SQL readiness ✅ · preinstall gate ✅ READY.

**Remaining (Brian-gated):** Shopify auth + dev-store selection + install; later live-Supabase cutover.

---

## MEGA MODULE 4 — Business Persistence implemented in code (2026-07-12) 🟦

The Business app now has a real, **org-based persistence layer** behind an env gate, with **mock mode as
default** — the app still runs out of the box and every prior test passes. **No infrastructure was
provisioned.**

**Delivered:**
- **Reconciliation (resolves old Blocker 3):** `supabase/*` rewritten to the **locked org model** —
  `organization`+`workspace` tenancy, `business.*` plans with workspace/year limits, audit + soft-delete +
  campaign versioning; RLS `is_org_member`/`is_workspace_member`; reconciled reference data + demo seed.
  Full audit + inconsistency inventory (R1–R9) in `docs/MM4_PERSISTENCE.md`.
- **Persistence layer:** `BusinessRepository` contract; **in-memory**, **file-backed (dev)**, and
  **Supabase (RLS, org-aware)** adapters; `persistenceMode()` selector (`mock|file|supabase`);
  `planModel.ts` façade↔locked bridge; validation/integrity guards; org-aware tenant provisioning.
- **Server actions:** pure `dispatchDataAction` + `routes/app.data.tsx` resource route (GET catalog+bundle
  / POST intent), server-resolved scope, never trusts client ids.
- **Tests:** +34 (Business 87 → **121**) — CRUD, isolation, campaign memory/versioning, survives-reload
  (snapshot + on-disk), soft-delete retention, validation/failure, mode selection, plan bridge.
- **Verification:** typecheck ✅ · business tests ✅ · packages tests ✅ · boundary check ✅ · build ✅.

**Compatibility (kept green):** the Business UI façade (`Store`/`storeId`, `PlanId`) is unchanged; the
DB/persistence layer is org-based and bridged (façade `storeId` ≡ persistent `workspaceId`). Full UI
convergence onto `@eventra/config`/`@eventra/ui` is a later module.

**Remaining external gates:** provision the separate Eventra Supabase project + link Shopify creds → flip
to `supabase` mode → wire `DataContext`→`/app/data` + run the live isolation matrix + in-browser reload.

**Pre-existing debt (not MM4):** lint errors in `app.search.tsx`/`app.calendar.tsx` (react-hooks rules,
from MM3) remain; unrelated to persistence, left untouched to avoid churn.

---

## MEGA MODULE 3 — Platform Foundation implemented (2026-07-11) 🟩

The repo is now an **npm-workspaces monorepo**; the Business app is fully functional (87 tests) in
`apps/business`. Delivered: shared packages `@eventra/{types,config,entitlements,identity,calendar,ui,
testing}` (all tested); Business consumes `@eventra/calendar` as a single source (no duplication);
`apps/consumer` + `apps/admin` foundation shells (build + smoke tests); `services/{api,workers}` +
`supabase/` structure; env templates; `scripts/check-boundaries.mjs` (dependency-boundary + circular
validation); docs (`TECHNICAL_HANDOFF`, `ENVIRONMENTS`, updated `REPOSITORY_ARCHITECTURE`/`MIGRATION_PLAN`).
Checkpoint tag `pre-monorepo-foundation` preserves the pre-move state.
**Deferred to MM4 (to keep Business green):** `store→org/workspace` rename inside Business, Business
rewire onto shared `config/entitlements/ui`, and the Business `app/db` → identity generalization.
**Not touched:** Supabase, auth, billing, ads, PrimeBuild. See `docs/TECHNICAL_HANDOFF.md`.

---

## Platform Expansion (v3) — 🟦 architecture review pending (2026-07-11)

Eventra is being expanded from a single B2B Shopify app into **one platform, three products**: Eventra
Consumer (Android/Play + web), Eventra Business (the existing product, now multi-platform — Shopify is
one integration), and the Eventra Admin Console (web). **Phase-5 database implementation is PAUSED**
until this architecture is reviewed and approved.

- Checkpoint tag `pre-platform-expansion` (commit `0e7bb7b`) preserves all prior work.
- Architecture package delivered (docs only, no code), then **deepened to complete spec in MEGA MODULE
  1**: `PLATFORM_VISION`, `PLATFORM_ARCHITECTURE`, `CONSUMER_PRODUCT`, `BUSINESS_PRODUCT`,
  `ADMIN_CONSOLE`, `MONETIZATION`, plus dedicated `VERIFIED_DEALS`, `ADVERTISING`, `USER_FLOWS`,
  `PLATFORM_ROADMAP`, and `DOC_IMPACT` (impact matrix + self-audit). `DECISIONS.md` updated (old
  Shopify-first items rescoped/superseded, new D36–D46). Superseded-plan banners added to
  `BUSINESS_RULES`, `PRODUCT_ROADMAP`, `PLAN_ENFORCEMENT`, `ARCHITECTURE_REVIEW`, and root `CLAUDE.md`
  (content preserved). Full per-doc status: `docs/DOC_IMPACT.md`.
- New pricing (approved): Consumer Free $0 / Ad-Free $15 / Verified Deals $30; Business Starter $15 /
  Growth $30 / Business Pro $45 + a 45-day full-Pro trial (old business plans superseded). Exact
  entitlements are **proposed, pending sign-off**.
- **MEGA MODULE 2 — Architecture Lock (2026-07-11):** implementation-ready specs added —
  `ENTITLEMENTS`, `CONSUMER_PLANS`, `BUSINESS_PLANS`, `PLATFORM_SCHEMA`, `RLS_SECURITY_MODEL`,
  `BILLING_ARCHITECTURE`, `TRIALS_AND_DOWNGRADES`, `COMPANY_MONITORING`, `NOTIFICATIONS`, `AD_PRIVACY`,
  `ADMIN_CONFIGURATION`, `REPOSITORY_ARCHITECTURE`, `MIGRATION_PLAN`. Locked rules (D47–D59): **Ad-Free is
  an independent $15 add-on ($30 keeps ads)**; **Business Free $0** exists; business horizons in **years**
  (1/4/10); "limit" = **workspaces**; provider-independent **billing orchestration**; single **entitlement
  engine**; `Store→Org/Workspace`. Prior conflicting items (D38/D39, month-horizons) marked superseded.
- **Not done (by design):** no code, no Supabase, no billing, no Android publish, no ad networks, no
  PrimeBuild changes. Awaiting approval of the lock + the open decisions in `DECISIONS.md`.

---

## Phase 5 — Private Pilot: ⏸ PAUSED (architecture expansion under review)

_The Business persistence work below is preserved and unchanged, but paused. When resumed it is
**rescoped** to "Business slice on the platform schema" (org-based, principal-aware) per
`PLATFORM_ARCHITECTURE.md §19`. Original status retained for reference:_

### Phase 5 — Private Pilot (as of the pause): 🟨 blocked on Brian's gates

**No Shopify app linked and no Supabase project connected yet** — both require Brian's interactive
login / authorization (external cost), which are the sprint's designated stop gates. Honest status:

- ✅ **DB contract (in-repo):** `supabase/migrations/0001_schema.sql` (all tables), `0002_rls.sql`
  (RLS + policies, `WITH CHECK` blocks cross-tenant writes), `0003_reference_data.sql` (countries,
  plans, 11 events — matches `app/data`), `supabase/seed.sql` (dev-only Demo Store).
- ✅ **Server persistence foundation (env-gated, unit-tested):** `app/db/` — `supabase.server.ts`
  (admin + RLS-JWT user client), `tenant.server.ts` (resolve/provision store + membership from the
  Shopify session; storeId never from client), `ids.server.ts` (deterministic tenant ids),
  `mappers.ts` (row↔domain), `repositories.server.ts` (all merchant reads/writes, RLS-scoped),
  `env.server.ts` (`EVENTRA_PERSISTENCE` gate). 10 new tests (uuidv5 RFC vector, JWT claims, gate,
  mapper round-trips). Mock mode remains the default so all 87 tests + build stay green.
- ✅ **Config:** minimal Shopify scope (`read_products`, no write), `.env.example` pilot vars,
  `docs/PHASE5_PILOT_RUNBOOK.md` with exact steps for Brian.
- ⛔ **Blocked (needs Brian):** (1) `shopify app config link` + install on the dev store — interactive
  Partner login; (2) create the separate Eventra Supabase project — external cost/authorization;
  (3) secrets in `.env`. **Not yet done:** wiring the loaders/actions into routes + DataContext and
  end-to-end persistence/tenant-isolation verification against the live DB (the next step once the
  gates clear).

---

## Pre‑Phase‑5 Hardening Sprint — ✅ complete (2026‑07‑11)

Ran against `docs/PROJECT_AUDIT.md` as the backlog. **No Phase 5 / Shopify / Supabase / paid services.**

- **P1 Tests:** Vitest + React Testing Library + user‑event + jsdom. **77 tests, all passing** across 9
  files — date resolution, Black Friday/Cyber Monday 2023–2030, prep‑status, campaign duplication +
  next‑year, history‑never‑overwritten (lib + stateful context), plan country/saved‑campaign limits,
  downgrade retention, hide/restore, single current store + tenant keying, template→campaign,
  deterministic search, and dialog a11y. Scripts: `npm run test`, `npm run test:watch`.
- **P2 Dates:** `DateRule.offsetDays`; Black Friday = 4th Thu + 1, Cyber Monday = 4th Thu + 4 (correct
  every year). All other rule‑based events audited. `docs/RECURRENCE.md`.
- **P3 Accessibility:** `useDialog` — focus trap, focus return, Escape, scroll lock, aria‑labelledby —
  applied to Modal, Drawer, mobile nav; a11y contrast fixes.
- **P4 State/perf:** `DataContext` split into Plan/Catalog/Campaigns; shell no longer re‑renders on
  campaign changes; stable action identities. `docs/STATE_ARCHITECTURE.md`.
- **P5 Routing:** invalid‑id "not found" panels, `/app/*` catch‑all 404. `docs/ROUTING.md`.
- **P6 Plan limits:** `planLimits.ts` retention + read‑only‑on‑downgrade UI. `docs/PLAN_ENFORCEMENT.md`.
- **P7 Security plan:** `docs/SECURITY_PLAN.md` + 9‑point Phase‑5 test plan (no real security claimed yet).

**Gates:** `npm run lint` → 0 errors (6 advisory warnings), `npm run typecheck` clean, `npm run test`
→ 77 passing, `npm run build` green. Finding‑by‑finding disposition in `docs/PROJECT_AUDIT.md`.

---

## Current phase

**Phases 2–4 — complete mock-driven product: 🟦 Ready for Review (built, typechecked, tested, SSR-verified).**

The full mock-data-driven Eventra interface is functional and cohesive: dashboard, calendar
(year/month drag-to-move/day), countries, events + Event Creator, campaigns CRUD + memory,
templates, library, search, plans/billing, settings/appearance, light analytics, and admin — all
wired to one mutable client state layer (`app/context/DataContext.tsx`) seeded from typed mock data.
No Supabase/Shopify production is connected; actions remain visual-only (D7). See
"Phases 2–4 deliverables" below. **Phase 5 not started.**

**Phase 1 — Foundation: 🟦 Ready for Review (corrected & verified; awaiting approval).**

Honest status of what exists:
- ✅ **Done & genuine:** design system, UI component library, responsive shell + navigation, domain
  types, typed mock-data layer, Store/Plan contexts, routes/placeholders, and the **Supabase schema +
  RLS design doc** (`docs/SUPABASE_SCHEMA.md`).
- ✅ **Now corrected (was the gap in the first Phase-1 report):**
  - The app runs on the **official Shopify React Router template** (cloned from
    `Shopify/shopify-app-template-react-router`, identical to `npm init @shopify/app`). Present and wired:
    `@shopify/shopify-app-react-router`, `@shopify/app-bridge-react`, real `app/shopify.server.ts`,
    `shopify.app.toml`, `shopify.web.toml`, `prisma/` session storage, `auth.$` + webhook routes, and an
    **authenticated `/app` layout** (`authenticate.admin` loader → App Bridge `AppProvider` → our
    `StoreProvider`/`PlanProvider`/`AppShell`).
  - **Build/typecheck verified:** `npm run typecheck` (react-router typegen + `tsc --noEmit`) passes with
    zero errors; `npm run build` produces client + SSR bundles (Tailwind CSS emitted). A `react-router-serve`
    smoke test boots: `GET /` → 200 (login landing), `GET /app` → controlled Shopify auth response (410,
    session gate engaged — not a crash).
  - **Lockfile generated:** `package-lock.json` is committed (removed from `.gitignore`).
- ⏳ **Still design-only (correct for Phase 1):** Supabase is **designed, not provisioned** — no project,
  no tables, no data, not connected to PrimeBuild. Real OAuth/install, session tokens, live RLS, and the
  swap from mock data to real reads remain **Phase 5**.

## Overall

| Area | Status | Notes |
|------|--------|-------|
| Project docs (CLAUDE, ROADMAP, RULES, SOP, DECISIONS, BUILD_STATUS) | ✅ Approved | Updated with approved amendments |
| Architecture Review / Lock | ✅ Approved (with amendments) | Locked |
| Scaffolding (official Shopify React Router app) | 🟦 Ready for Review | Migrated onto official template; App Bridge + auth layout wired |
| Build / typecheck verification | ✅ Passing | `typecheck` + `build` green; server smoke test boots |
| Dependency lockfile | ✅ Generated | `package-lock.json` committed |
| Repo connection / push | ⛔ See blockers | git initialized + committed locally; push depends on remote credentials |

## Approval gates (build order — stop at each gate)

| Gate | Scope | Status |
|------|-------|--------|
| **Phase 1 — Foundation** | Shopify React Router scaffold, shell + nav, design system + UI primitives, TS domain types, mock-data layer | 🟦 Ready for Review (build pending) |
| **Phase 2 — Core Planning** | Dashboard, Calendar (year/month dnd-kit/day), Countries (`StoreCountry`), Events catalog + Event Creator, Event Actions (visual) | 🟦 Ready for Review (mock-driven, verified) |
| **Phase 3 — Campaign Memory** | Campaigns CRUD + status, Campaign Library, memory/reuse (versioned), Templates (duplication), Search | 🟦 Ready for Review (mock-driven, verified) |
| **Phase 4 — Platform Surfaces** | Search, Subscription/pricing UI, Settings, Appearance, Billing view, light Analytics, Admin (countries/events), states/a11y/polish | 🟦 Ready for Review (mock-driven, verified) |
| **Phase 5 — Real Shopify & Supabase Infrastructure** | OAuth/install, App Bridge session tokens, Supabase tables + live RLS, server-side membership validation, replace mock data with real API, Shopify Billing, tenant-isolation tests | ⬜ |

## Application sections

| Section | Gate | Status |
|---------|------|--------|
| App shell + navigation | 1 | 🟦 |
| Design system / UI primitives | 1 | 🟦 |
| TS domain types + mock-data layer | 1 | 🟦 |
| Supabase project + RLS design | 1 | ⬜ (provision at Phase 5) |
| Dashboard | 2 | 🟦 |
| Year / Month (dnd-kit) / Day calendar | 2 | 🟦 |
| Countries (`StoreCountry`) | 2 | 🟦 |
| Events catalog + Event Creator + Actions (visual) | 2 | 🟦 |
| Campaigns (CRUD + status) | 3 | 🟦 |
| Campaign Library + Memory (versioned) | 3 | 🟦 |
| Templates (duplication) | 3 | 🟦 |
| Search | 4 | 🟦 |
| Subscription/pricing UI + country/campaign limits | 4 | 🟦 |
| Settings + Appearance | 4 | 🟦 |
| Billing view | 4 | 🟦 |
| Light analytics | 4 | 🟦 |
| Admin (countries/events) | 4 | 🟦 |
| Notifications/reminders (in-app reminder settings) | 4 | 🟦 (settings; surfacing is light in V1) |
| Empty / error / loading states + a11y | 4 | 🟦 |
| Auth + Shopify install | 5 | ⬜ |
| Supabase tables + RLS live + membership | 5 | ⬜ |
| Shopify Billing | 5 | ⬜ |

## Phases 2–4 deliverables (mock-driven)

**State layer:** `app/context/DataContext.tsx` (single mutable tenant store; back-compat
`useCurrentStore`/`usePlan`). Domain libs: `lib/events.ts` (date-rule resolution + prep status),
`lib/planning.ts` (opportunities/prep-needed/calendar entries), `lib/campaigns.ts` (duplication,
next-year reuse, template↔campaign), `lib/calendar.ts`, `lib/search.ts`, `lib/accents.ts`,
`lib/id.ts`, `lib/format.ts`. Mock data added: `mockCustomEvents.ts`, `mockCatalog.ts`
(products/collections). Dependency added: `@dnd-kit/core` + `@dnd-kit/utilities`.

**Routes (all real now):** `app._index` (dashboard), `app.calendar`, `app.events`, `app.countries`,
`app.campaigns`, `app.campaign-library`, `app.templates`, `app.billing`, `app.settings`,
`app.analytics`, `app.admin`, `app.search`. Each has an in-shell `ErrorBoundary`.

**Feature components:** `features/dashboard/*`, `features/calendar/*` (Year/Month dnd-kit/Day +
toolbar/chips), `features/events/*` (catalog, filters, hide-restore, Event Creator),
`features/countries/*`, `features/campaigns/*` (form/modal/detail/status/filters/product-picker/card),
`features/library/*`, `features/templates/*`, `features/billing/*`, `features/settings/*`,
`features/analytics/*`, `features/admin/*`. New UI primitives: `Drawer`, `FormControls`
(TextInput/Textarea/Select), `Field`, `SegmentedControl`, `ConfirmDialog`, `LinkButton`, `States`
(Spinner/Skeleton/LoadingState/ErrorState).

**Business rules honored:** importance colors vs category indicators kept separate (D11/D12);
per-store hide/restore never deletes globally (D13); repeat-next-year defaults ON (D14); reuse
always creates a new record and never overwrites history (D15); plan limits (countries + saved
campaigns) enforced in the UI with non-destructive over-limit messaging (D16); exact plan
names/prices from a single config (D9/D10); actions are visual-only (D7). Server-side enforcement
of limits remains Phase 5 (UI checks are convenience only, as designed).

## Files created (Phase 1)

**From the official Shopify template (kept):**
- `shopify.app.toml`, `shopify.web.toml`, `Dockerfile`, `.dockerignore`, `.npmrc`, `.editorconfig`,
  `.eslintrc.cjs`, `.eslintignore`, `.prettierignore`, `.graphqlrc.ts`, `.mcp.json`, `env.d.ts`,
  `public/favicon.ico`, `extensions/.gitkeep`
- `app/entry.server.tsx`, `app/db.server.ts`, `app/globals.d.ts`, `app/shopify.server.ts` (real
  `shopifyApp({…})`), `app/routes/_index/` (login landing), `app/routes/auth.$.tsx`,
  `app/routes/auth.login/`, `app/routes/webhooks.app.uninstalled.tsx`,
  `app/routes/webhooks.app.scopes_update.tsx`
- `prisma/schema.prisma` + `prisma/migrations/**` (session storage)

**Eventra work preserved / migrated on top (unchanged unless noted):**
- **Types:** `app/types/domain.ts`
- **Mock data:** `app/data/` (index + mockStore, mockPlans, mockCountries, mockGlobalEvents, mockCampaigns, mockTemplates, mockStoreEventPreferences)
- **Contexts:** `app/context/StoreContext.tsx`, `app/context/PlanContext.tsx`
- **Lib:** `app/lib/` (cn, dates, nav, planEntitlements, tenant)
- **UI primitives:** `app/components/ui/` (Button, Card, Badge, StatusPill, ColorDot, StatTile, EmptyState, Toggle, Modal, Tabs, PageHeader, index)
- **Shell:** `app/components/shell/` (AppShell, Sidebar, Topbar, MobileNav, NavLinks, Brand) + `app/components/Placeholder.tsx`
- **Routes:** `app/routes/app._index.tsx` (overview) + 10 surface placeholders (calendar, events, countries, campaigns, campaign-library, templates, billing, settings, admin, analytics)
- **Design system:** `app/app.css` (Tailwind v4 entry + brand tokens)

**Merged/rewritten during the correction:**
- `app/routes/app.tsx` — rewritten as the **authenticated App Bridge layout** wrapping our contexts + shell
- `app/root.tsx` — template root + `app.css` stylesheet link
- `package.json` — template base + Tailwind/Eventra deps · `vite.config.ts` — Tailwind plugin added ·
  `tsconfig.json` — `~/*` path · `react-router.config.ts` — explicit SSR · `.gitignore` — keep lockfile
- The old generic `app/routes/_index.tsx` redirect and placeholder `shopify.server.ts` were **replaced**
  by the template's login route and real Shopify server config.

## Packages (installed; `package-lock.json` committed)

Template: `@shopify/shopify-app-react-router`, `@shopify/app-bridge-react`,
`@shopify/shopify-app-session-storage-prisma`, `@prisma/client` + `prisma`, `react`, `react-dom`,
`react-router`, `@react-router/{dev,node,serve,fs-routes}`, `isbot`, `vite`, `vite-tsconfig-paths`,
`typescript`, eslint/prettier tooling, `@shopify/api-codegen-preset`, `@shopify/polaris-types`.
Added for Eventra: `framer-motion`, `lucide-react`, `date-fns`, `clsx`, `tailwind-merge`,
`@tailwindcss/vite`, `tailwindcss`. (768 packages total.)

## Known limitations / blockers

- ✅ **Resolved:** npm registry is reachable in this connected Code session; install/typecheck/build ran
  successfully. (Note: this sandbox blocks package install scripts by default — Prisma client generation
  and native/esbuild binaries were explicitly approved via `npm approve-scripts`, which added an
  `allowScripts` field to `package.json`. That field is harmless/ignored by standard npm and can be
  removed on a normal machine.)
- **Supabase** remains **design-only** by decision (Phase 1 scope): not provisioned, not connected, no
  data. Provisioned in Phase 5.
- **Real Shopify auth** requires Partner-org credentials (a `client_id` in `shopify.app.toml`, plus
  `SHOPIFY_API_KEY`/`SHOPIFY_API_SECRET`). Not present — the app builds and boots with mock UI; live OAuth
  is Phase 5. `npm run dev` (Shopify CLI tunnel) needs a Partner login and was intentionally not run.
- Black Friday / Cyber Monday are encoded (in `@eventra/calendar`, consumed via `lib/events.ts`) as
  Thanksgiving-relative rules: `{ kind: "nth_weekday", month: 11, weekday: 4, nth: 4, offsetDays }`
  — i.e. **BF = 4th Thursday + 1 day**, **CM = 4th Thursday + 4 days**. This is the correct definition
  in every year (no Nov-1-is-a-Friday drift); verified by `packages/calendar/test/calendar.test.ts`
  across 2023–2030. The earlier "4th Friday / last Monday" encoding (H-2 in `docs/PROJECT_AUDIT.md`)
  has been fixed — this note is retained only to record that the drift risk no longer applies.
- **Loading states:** loaders are synchronous mock reads in V1, so there is little async to show; the
  Search surface demonstrates a debounced skeleton, and `Skeleton`/`LoadingState`/`Spinner` primitives
  exist for the Phase-5 real async loaders.
- **Notifications:** reminder *milestones* are configurable in Settings; proactive in-app notification
  surfacing is intentionally light in V1 (no email/push automation).
- Country catalog stays US + CA (D22 / quality-over-quantity). The country-limit UX is exercised by
  switching plans (Free = 1 … VIP = ∞) in Plans & billing, which also demonstrates the downgrade
  read-only rule (D16).
- See the commit/push record at the bottom of this file.

## Next task

**Phase 5 — Real Shopify & Supabase Infrastructure (not started; needs approval + credentials):**
1. Create the Eventra app on a Shopify Partner org (`shopify app config link` → `client_id`) and set
   `SHOPIFY_API_KEY`/`SHOPIFY_API_SECRET`/`SHOPIFY_APP_URL` to run the embedded app live (`npm run dev`).
2. Provision the new, separate Eventra Supabase project; apply `docs/SUPABASE_SCHEMA.md` migrations + RLS.
3. Replace `DataContext` mock reads/writes with server loaders/actions (App Bridge session → server-side
   Membership validation → Supabase with RLS). Enforce plan limits server-side. Wire Shopify Billing.
4. Add tenant-isolation + plan-limit + install/responsive tests.

## Commit / push record

- **Repo:** `primebuildfit-lab/primebuild-saas` · **branch:** `main`
- `df1cb16` — Phase 1: Eventra foundation on official Shopify React Router template (initial commit)
- `0aae3a2` — Phase 2: Core Planning (dashboard, calendar, countries, events)
- `b8ae3f6` — Phase 3: Campaign Memory (CRUD, statuses, duplication, library, templates)
- Phase 4: Platform Surfaces (search, billing, settings, analytics, admin, states) — this milestone.
- Every milestone verified before push: `npm run typecheck` ✅ · `npm run build` ✅ · SSR smoke test of
  the surfaces ✅. Pushed to `origin/main`.
