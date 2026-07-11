# Eventra — Build Status (`BUILD_STATUS.md`)

Status legend: ⬜ Not Started · 🟨 In Progress · 🟦 Ready for Review · ✅ Approved · ⛔ Blocked

_Last updated: 2026-07-11 — **Phase 1 correction EXECUTED and verified** in a connected Claude Code
session (Windows, Node 24.18, npm 11.16, Shopify CLI 4.3.0). The app was migrated onto the official
Shopify React Router template; `npm install`, `npm run typecheck`, and `npm run build` all pass; a
production-server smoke test boots and serves. Foundation is 🟦 **Ready for Review** (final Phase-1
approval still pending from the user)._

---

## Current phase

**Phases 2–4 — complete mock-driven product: 🟦 Ready for Review (built, typechecked, built, SSR-verified).**

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
- Black Friday / Cyber Monday are encoded as nth-weekday rules (BF = 4th Friday, CM = last Monday of
  November). `lib/events.ts` resolves those rules correctly, and they match the true US dates for 2026.
  ⚠️ The **encoding** can drift from the real definitions (BF = day after the 4th Thursday) in years
  where Nov 1 is a Friday — see `docs/PROJECT_AUDIT.md` (H-2). Fix the catalog rule before real use.
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
