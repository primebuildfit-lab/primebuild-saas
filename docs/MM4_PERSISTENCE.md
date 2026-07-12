# Eventra — MEGA MODULE 4: Business Persistence

> Working document for MM4. Turns the Business app from a mock-driven product into a real,
> persistent, org-based application. Companion to `PROJECT_CONTEXT.md` (state) and `DECISIONS.md`.
> Status legend: ✅ done · 🟦 code-complete (needs live infra) · 🔜 planned.

---

## 0. Scope & hard boundary

**In scope (autonomous):** the complete persistence layer *in code* — reconciled schema + RLS + seeds,
org/workspace model, repository contract + adapters, server actions, validation/integrity, mode
selection, tests, docs. Mock mode stays the default; everything green throughout.

**Out of scope (external stop-gates, not autonomous):** provisioning a paid cloud Supabase project;
wiring real Shopify OAuth `client_id`/secret. These are documented gates (cost + authorization). MM4
therefore proves "survives reload" against a **local/simulated** persistence backend; flipping to a live
cloud project is a documented handoff step, not performed here. The Business app is Shopify-embedded, so
true in-browser end-to-end reload additionally depends on the Shopify credential gate.

---

## PART 1 — Audit of the current mock implementation

### 1.1 Where mock data enters the app

| Source file (`apps/business/app`) | Provides | Consumed by |
|---|---|---|
| `data/mockStore.ts` | `demoUser`, `demoStore`, `demoMembership`, `demoStoreCountries`, `demoStorePreference`, `demoSubscription` | `context/DataContext.tsx` |
| `data/mockPlans.ts` | `plans: Plan[]` (free/starter/growth/vip) | `lib/planEntitlements.ts`, `DataContext` |
| `data/mockCountries.ts` | `countries`, `getCountry` | `DataContext`, features |
| `data/mockGlobalEvents.ts` | `globalEvents` | `DataContext` |
| `data/mockCampaigns.ts` | seed `campaigns` | `DataContext` |
| `data/mockCustomEvents.ts` | seed `customEvents` | `DataContext` |
| `data/mockTemplates.ts` | seed `templates` | `DataContext` |
| `data/mockStoreEventPreferences.ts` | seed hide/restore prefs | `DataContext` |
| `data/mockCatalog.ts` | product/collection refs | campaign product picker |

### 1.2 The single mutable store

All tenant state lives in **`context/DataContext.tsx`** — three React contexts (Plan, Catalog,
Campaigns) seeded from the mock barrel, mutated purely in-memory via `useState`. **No persistence, no
loaders/actions.** Every mutation is ephemeral (reload resets). The `/app` route (`routes/app.tsx`) loader
only calls `authenticate.admin`; it loads **no** business data.

Mutations exposed by `DataContext` (the full write surface persistence must cover):

- **Plan/identity:** `setPlanId`
- **Countries:** `setCountryEnabled`
- **Events:** `hideEvent`, `restoreEvent` (per-store hide/restore, never global delete — D13)
- **Custom events:** `addCustomEvent`, `updateCustomEvent`, `deleteCustomEvent`
- **Preferences:** `updatePreferences` (weekStartsOn, calendarFormat, reminderDefaults, accent, density)
- **Campaigns:** `createCampaign`, `updateCampaign`, `deleteCampaign`, `duplicateCampaign` (memory/version — D15), `setCampaignStatus`, `moveCampaign`
- **Templates:** `addTemplate`, `deleteTemplate`

### 1.3 The already-written (paused) persistence foundation

`apps/business/app/db/*` is a **Supabase-targeted** foundation, never activated:
`env.server.ts` (feature gate), `supabase.server.ts` (admin + RLS-JWT user clients), `tenant.server.ts`
(store provisioning from Shopify session), `ids.server.ts` (deterministic v5 user ids), `mappers.ts`
(row↔domain), `repositories.server.ts` (store-scoped CRUD). It is **store-based** and encodes the **old
plan model** — see Part 2.

### 1.4 Mock → persistent equivalent map

| Mock object | Persistent table (locked schema) | Notes |
|---|---|---|
| `demoStore` | `organizations` + `workspaces` | one store ⇒ one org + one workspace (V1 compat) |
| `demoUser` / `demoMembership` | `users` (implicit) + `memberships` | role `staff`→`editor` |
| `demoSubscription` (`growth`) | `subscriptions.plan_id` = `business.growth` | plan id remapped (Part 2) |
| `demoStoreCountries` | `workspace_countries` | per-workspace enablement (was per-store) |
| `storeEventPreferences` | `workspace_event_preferences` | hide/restore |
| `customEvents` | `custom_events` (`workspace_id`) | + audit + soft-delete |
| `campaigns` | `campaigns` (`workspace_id`) | + audit + `created_from_id` memory link |
| `templates` | `templates` (`workspace_id`) | |
| `demoStorePreference` | `workspace_preferences` | |
| `countries`/`globalEvents`/`plans` | `countries`/`global_events`/`plans` | platform-owned catalog (unchanged ownership) |

**The mock system is preserved** as the default `mock` persistence mode (see Part 10). Nothing is deleted.

---

## PART 2 — Database / config reconciliation

Comparing `types/domain.ts`, `data/mockPlans.ts`, `@eventra/config`, `@eventra/entitlements`,
`@eventra/types`, `supabase/migrations/0001_schema.sql`, `supabase/policies/0002_rls.sql`.

### 2.1 Inconsistency inventory

| # | Inconsistency | Old (Business app / paused SQL) | Locked (config/entitlements/types) |
|---|---|---|---|
| R1 | **Plan ids** | `free/starter/growth/vip` | `business.free/starter/growth/pro` |
| R2 | **Prices** | 0 / 10 / 20 / 50 | 0 / 15 / 30 / 45 |
| R3 | **Limit unit** | `countryLimit` per plan | `workspaceLimit` (1/2/3/∞) + `countryLimit` (0/1/∞/∞) |
| R4 | **Horizon unit** | `planningHorizonMonths` (2/4/8/12) | `planningHorizonYears` (0/1/4/10) |
| R5 | **Tenant entity** | `Store` / `storeId` | `Organization` + `Workspace` / `organizationId`,`workspaceId` |
| R6 | **Membership roles** | `owner/admin/staff` | `owner/admin/editor/viewer` |
| R7 | **Country limit for Free** | 1 | 0 (manual only) |
| R8 | **RLS predicate** | `is_store_member(store_id)` | `is_org_member(org_id)` + `is_self` (principal-aware) |
| R9 | **No audit/soft-delete/versioning** columns anywhere | — | required by MM4 Part 7 |

### 2.2 Resolutions (authoritative)

**Principle:** the **database + persistence layer + `@eventra/entitlements`** are the *authoritative*
locked model. The Business **client façade** (`types/domain.ts` `Plan`/`PlanId`, `data/mockPlans.ts`,
existing components/tests) is retained **unchanged** for MM4 as a compatibility display layer, mapped to
the locked model at the persistence boundary. This resolves the latent schema defect (Blocker 3) **without
churning the 87 UI tests**. Full UI convergence onto `@eventra/config` is a separate later module.

- **R1/R2 (plan ids & prices):** DB `plans` table adopts locked ids/prices. A pure, tested map
  (`app/lib/planModel.ts`) bridges façade `PlanId` ↔ `BusinessPlanId`:
  `free↔business.free`, `starter↔business.starter`, `growth↔business.growth`, **`vip↔business.pro`**
  (`vip` is the documented legacy alias of Business Pro). Subscriptions persist the **locked** id.
- **R3 (limit unit):** persistence + server enforcement use **workspace + country + year** limits from
  `@eventra/entitlements` (the single engine). The façade's `countryLimit`/`planningHorizonMonths` remain
  for legacy UI display only and are **not** the enforcement source.
- **R4 (horizon):** DB stores **years**. `plans.planning_horizon_years` replaces
  `planning_horizon_months`.
- **R5 (store→org):** new schema is org/workspace-based (Part 3). Compat: 1 store ⇒ 1 org + 1 workspace;
  the façade `storeId` maps to the resolved `workspaceId`. `WITH CHECK` RLS keyed on `org_id`.
- **R6 (roles):** persistence uses `owner/admin/editor/viewer`; façade `staff` maps to `editor`.
- **R7 (Free country limit):** **locked value 0 wins** for server enforcement. Documented business-rule
  reconciliation; the façade mock plan text is legacy display. (Assumption logged — see §2.3.)
- **R8 (RLS):** new policies use `is_org_member(org_id)`; catalog stays read-for-authenticated. Design is
  principal-ready (`is_self` reserved for consumer tables in later modules).
- **R9 (audit/soft-delete/versioning):** every merchant table gains `created_at/updated_at`; soft-delete
  via `deleted_at` where a restore UX exists (custom events, campaigns, templates); campaign **memory
  versioning** via `created_from_id` + `version` (never overwrites — D15).

### 2.3 Logged assumptions (configurable; see `@eventra/config` / `SystemSetting` later)

- **A1:** `vip` ⇒ `business.pro` is the canonical legacy alias. Configurable in `planModel.ts`.
- **A2:** Free tier enforces **0** managed countries (locked). If Brian wants Free=1, change
  `BUSINESS_PLANS["business.free"].countryLimit` in `@eventra/config` — single source, no code churn.
- **A3:** One store = one org + one workspace in V1 (multi-workspace orgs are a later module). The schema
  already supports N workspaces per org.
- **A4:** Soft-delete retention is indefinite in V1 (no purge job). A retention window is a later config.

---

## PART 3–10 — see implementation sections below (updated as built)

(Implementation status tracked in `BUILD_STATUS.md`; decisions in `DECISIONS.md` D63–.)
</content>
</invoke>
