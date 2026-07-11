# Eventra — Build Status (`BUILD_STATUS.md`)

Status legend: ⬜ Not Started · 🟨 In Progress · 🟦 Ready for Review · ✅ Approved · ⛔ Blocked

_Last updated: 2026-07-11 — **Phase 1 correction EXECUTED and verified** in a connected Claude Code
session (Windows, Node 24.18, npm 11.16, Shopify CLI 4.3.0). The app was migrated onto the official
Shopify React Router template; `npm install`, `npm run typecheck`, and `npm run build` all pass; a
production-server smoke test boots and serves. Foundation is 🟦 **Ready for Review** (final Phase-1
approval still pending from the user)._

---

## Current phase

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
| **Phase 4 — Platform Surfaces** | Subscription/pricing UI, Settings, Admin (countries/events), in-app notifications/reminders | 🟨 In progress |
| **Phase 5 — Real Shopify & Supabase Infrastructure** | OAuth/install, App Bridge session tokens, Supabase tables + live RLS, server-side membership validation, replace mock data with real API, Shopify Billing, tenant-isolation tests | ⬜ |

## Application sections (all not started)

| Section | Gate | Status |
|---------|------|--------|
| App shell + navigation | 1 | 🟦 |
| Design system / UI primitives | 1 | 🟦 |
| TS domain types + mock-data layer | 1 | 🟦 |
| Supabase project + RLS design | 1 | ⬜ (provision at Phase 5 / when repo connected) |
| Dashboard | 2 | ⬜ |
| Year / Month (dnd-kit) / Day calendar | 2 | ⬜ |
| Countries (`StoreCountry`) | 2 | ⬜ |
| Events catalog + Event Creator + Actions (visual) | 2 | ⬜ |
| Campaigns (CRUD + status) | 3 | ⬜ |
| Campaign Library + Memory (versioned) | 3 | ⬜ |
| Templates (duplication) | 3 | ⬜ |
| Search | 3 | ⬜ |
| Subscription/pricing UI | 4 | ⬜ |
| Settings | 4 | ⬜ |
| Admin (countries/events) | 4 | ⬜ |
| Notifications/reminders (in-app) | 4 | ⬜ |
| Auth + Shopify install | 5 | ⬜ |
| Supabase tables + RLS live + membership | 5 | ⬜ |
| Shopify Billing | 5 | ⬜ |

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
- Black Friday / Cyber Monday date rules are `nth_weekday` approximations in mock data — resolved precisely in Phase 2.
- See the commit/push status recorded at the bottom of this file after the Phase-1 correction commit.

## Next task

1. **User review + Phase-1 approval** of the corrected foundation.
2. Provision the new, separate Eventra Supabase project (Phase 5 wiring), and — for a live embedded
   preview — create the app on a Shopify Partner org (`shopify app config link`) to populate `client_id`.
3. On approval, begin **Phase 2 — Core Planning**; stop at the Phase 2 gate.

## Commit / push record (Phase 1 correction)

- **Repo:** `primebuildfit-lab/primebuild-saas` · **branch:** `main`
- **Foundation commit:** `df1cb16` — _Phase 1: Eventra foundation on official Shopify React Router template_
- **Pushed:** ✅ 2026-07-11 to `origin/main` (repo was previously empty; this is the initial commit).
- Verification prior to push: `npm run typecheck` ✅ · `npm run build` ✅ · `react-router-serve` smoke test ✅.
- A follow-up docs commit records this status.
