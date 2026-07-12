# Eventra — Decision Log (`DECISIONS.md`)

Record of approved product decisions. Do not silently change an approved rule —
amend here and flag it. Status: ✅ approved · 🟡 proposed (awaiting user) · 🔴 open.

_Last updated: 2026-07-11 — **Platform expansion proposed** (three products: Consumer / Business /
Admin). See the "Platform Expansion (v3)" section below; several earlier Shopify-first decisions are
now **rescoped to Eventra Business** or **superseded**. Nothing is deleted — history preserved._

---

## Product identity

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D1 | Brand/product name | **Eventra** | ✅ |
| D2 | Internal codename | Calendar Engine (non-blocking) | ✅ |
| D3 | Repository | `primebuildfit-lab/primebuild-saas` — **name unchanged for now** | ✅ |
| D4 | Relationship to PrimeBuild | Independent product; PrimeBuild is only a future test store; no branding/logic reuse | ✅ |

## Product scope

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D5 | Primary V1 delivery | **Shopify app first**; public standalone SaaS shell **deferred** | ✅ |
| D6 | V1 focus | Planning + campaign memory; **no** advanced automation | ✅ |
| D7 | Event actions in V1 | Visual, non-executing placeholders | ✅ |
| D8 | Build sequencing | Frontend + realistic mock data first; **built inside the final Shopify app** (no throwaway SPA); real Shopify/Supabase wired in Phase 5 | ✅ |

## Plans & pricing (working prices, single config source)

| # | Plan | Price | Country limit | Status |
|---|------|-------|---------------|--------|
| D9 | Free | $0/mo | 1 | ✅ |
| D9 | Starter | $10/mo | 2 | ✅ |
| D9 | Growth | $20/mo | 3 | ✅ |
| D9 | VIP | $50/mo | Unlimited | ✅ |
| D10 | "Pro" / "Advanced" names | **Deprecated — do not use** | ✅ |

## Calendar & data rules

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D11 | Importance colors (official dates) | 🟢 high · 🟡 medium · 🔴 low/niche | ✅ |
| D12 | Category color | Separate indicator from importance | ✅ |
| D13 | Event removal | Per-store hide/restore (`StoreEventPreference`); never global delete | ✅ |
| D14 | Repeat next year | Default ON, user can disable | ✅ |
| D15 | Campaign reuse | New record/version; never overwrite history | ✅ |
| D16 | Plan limits | Enforced server-side; no instant data deletion on downgrade | ✅ |
| D17 | Multi-tenant keying | All merchant records include `storeId` from day one | ✅ |

## Technical (locked)

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D18 | Frontend libs | React + TS + Tailwind + Framer Motion + date-fns + dnd-kit | ✅ |
| D19 | App framework | **Shopify official React Router app template**, from the start (no separate Vite SPA to migrate) | ✅ |
| D20 | Backend provider | **Supabase — a completely separate, new Eventra project** | ✅ |
| D21 | Backend isolation | New Eventra project; never `primebuild-core` | ✅ |
| D22 | Initial countries | **US (required for initial release) + Canada** in architecture & mock data; Canada's final event catalog may be completed afterward | ✅ |

## Tenant security & data model (approved amendments)

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D23 | Tenant authorization | Never trust a client-supplied `storeId` alone. Validate **`Membership`** server-side; enforce via **Supabase RLS** | ✅ |
| D24 | Explicit entities | Replace linear `Store→Countries→Events` with `Store`, `Membership`, `StoreCountry`, `StoreEventPreference`, `CustomEvent`, `Campaign`, `Template`, `StorePreference`, `Subscription` | ✅ |
| D25 | Country enablement | `Country.enabled` is **not** global; store enablement lives in **`StoreCountry`** | ✅ |
| D26 | Seed/mock identity | Use a **fictional demo merchant** (e.g. `Demo Store`); no PrimeBuild names/domains/IDs in seed data | ✅ |
| D27 | Approval gates | Phase 1 Foundation · Phase 2 Core Planning · Phase 3 Campaign Memory · Phase 4 Platform Surfaces · Phase 5 Real Shopify & Supabase Infrastructure | ✅ |

---

## Build execution notes

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D28 | Official template acquisition | Obtained the official Shopify RR template by cloning `Shopify/shopify-app-template-react-router` (identical to `npm init @shopify/app`) to avoid an interactive Partner-org login / linking a real app. TypeScript flavor. | ✅ |
| D29 | Session storage | Keep the template default **Prisma (SQLite dev)** for Shopify session storage in Phase 1; revisit Supabase/Postgres session storage in Phase 5. | ✅ |
| D30 | Lockfile | `package-lock.json` is **committed** (removed from `.gitignore`) — required Phase-1 deliverable. | ✅ |
| D31 | App Bridge nav | `/app` uses App Bridge `AppProvider` + Eventra's own Tailwind `AppShell`/`Sidebar` for navigation (dropped the template's `<s-app-nav>` demo links). | ✅ |
| D32 | Phase 2–4 state | One mutable client store (`app/context/DataContext.tsx`) seeded from typed mock data holds all tenant state; components read/write it so the whole product is interactive with no backend. Swapped for Supabase reads/writes in Phase 5 with no component rewrites. | ✅ |
| D33 | Country-limit demo | Country catalog stays **US + CA** (respects D22 + quality-over-quantity). The country-limit & downgrade-read-only UX is exercised by **switching plans** in Plans & billing, not by padding the catalog. | ✅ |
| D34 | Appearance accent | Appearance settings expose an accent (indigo/blue/emerald/violet) applied at runtime via CSS variables that Tailwind v4 `brand-*` utilities resolve — instant re-tint, no rebuild. Design stays light per the design system. | ✅ |
| D35 | Search placement | Global deterministic search lives at `/app/search` with a Topbar entry point (not a sidebar item). Searches events/campaigns/templates/countries/custom events by substring — no AI. | ✅ |

---

## Platform Expansion (v3) — proposed 2026-07-11 (awaiting approval)

Eventra becomes **one platform, three products** (Consumer / Business / Admin). See
`docs/PLATFORM_VISION.md`, `CONSUMER_PRODUCT.md`, `BUSINESS_PRODUCT.md`, `ADMIN_CONSOLE.md`,
`MONETIZATION.md`, `PLATFORM_ARCHITECTURE.md`. Status: 🟡 proposed unless noted. Nothing deleted.

### Rescoped / superseded earlier decisions
| Old | Was | Now |
|-----|-----|-----|
| D5 | Shopify app first; standalone deferred | 🔁 **Rescoped:** Shopify is **one integration of Eventra Business**, not the whole product (also Woo/Wix/Squarespace/custom/physical/none). |
| D6, D7, D8 | V1 planning + memory, visual actions, mock-first | ✅ **Still apply — scoped to Eventra Business.** |
| D9 (business plans) | Free $0 / Starter $10 / Growth $20 / VIP $50 | 🔴 **Superseded** by **Starter $15 / Growth $30 / Business Pro $45** + a **45-day full-Pro trial** (no free business tier). |
| D10 | "Pro"/"Advanced" deprecated | ⚠️ **Amended:** "Business **Pro**" is the approved top business tier; the old deprecation referred to the earlier draft only. |
| D16 | Downgrade retention (read-only excess) | ✅ **Kept + extended** to the trial-grace state. |
| D19 | Shopify official RR template from the start | 🔁 **Rescoped:** the template powers the **Business web/embedded surface**; Consumer (web/PWA→Android) and Admin (web) are new surfaces on the shared backend. |
| D22 | Initial countries US + Canada | ✅ **Kept** for the curated catalog. |
| D17/D24 | `Store`-based multi-tenant model | 🔁 **Generalized:** `Store` → **`Org`**; add **Consumer account** and **Admin** principal types. |

### New decisions (proposed) — numbered from D36 (D28–D35 are build-execution notes above)
| # | Decision | Value | Status |
|---|----------|-------|--------|
| D36 | Product structure | One platform, three surfaces: Consumer, Business, Admin Console | 🟡 |
| D37 | PrimeBuild role | Only a business customer and possible **advertiser**; never hardcoded | ✅ |
| D38 | Consumer prices | Free $0 · Ad-Free $15 · Verified Deals $30 (incl. ad removal) | ✅ prices / 🟡 entitlements |
| D39 | Business prices | Starter $15 · Growth $30 · Business Pro $45; no free tier | ✅ prices / 🟡 entitlements |
| D40 | Business trial | 45 days full Business Pro; then choose a plan; expiry → read-only grace, never delete | ✅ |
| D41 | Consumer target | Android (Google Play) first + responsive web PWA (proposed TWA packaging) | 🟡 |
| D42 | Integrations as adapters | Common `CommerceConnection` interface; core works with no integration | 🟡 |
| D43 | Advertising | First-party/house ads only at launch; Consumer Free only; no third-party network yet | 🟡 |
| D44 | Verified deals | Business submits → Admin verifies vs sources → publish → Verified-tier consumer alerts | 🟡 |
| D45 | Tenancy/security | Three principal types (consumer/org/admin); RLS per principal; never trust client ids | 🟡 |
| D46 | Phase 5 rescope | DB work paused; becomes "Business slice on the platform schema" once approved | ✅ |

### Open business decisions (need Brian)
Exact entitlements per consumer/business tier; consumer follow limits; whether Starter can submit
verified deals; team-member counts; annual pricing; consumer trial?; **Google Play Billing vs web
billing**; ad consent/privacy model; PSP choice; monorepo vs single-app repo shape.

---

---

## Architecture Lock (MEGA MODULE 2) — approved in direction 2026-07-11

Precise, approved rules that **override earlier conflicting assumptions**. See `ENTITLEMENTS.md`,
`CONSUMER_PLANS.md`, `BUSINESS_PLANS.md`, `PLATFORM_SCHEMA.md`, `RLS_SECURITY_MODEL.md`,
`BILLING_ARCHITECTURE.md`, `TRIALS_AND_DOWNGRADES.md`, `COMPANY_MONITORING.md`, `NOTIFICATIONS.md`,
`AD_PRIVACY.md`, `ADMIN_CONFIGURATION.md`, `REPOSITORY_ARCHITECTURE.md`, `MIGRATION_PLAN.md`.

### Corrections to prior decisions
| Old | Correction |
|-----|-----------|
| **D38** (Consumer: "Verified Deals $30 **incl. ad removal**") | 🔴 **Superseded.** Ad-Free is an **independent $15 add-on**. Intelligence tier renamed **Deal Intelligence ($30)** and **does NOT remove ads**. Four states: $0 / $15 / $30 / $45 (see D47). |
| **D39** ("Business… **no free tier**") | 🔴 **Superseded.** There **is** a **Business Free $0** tier (1 workspace) **and** the 45-day Pro trial (D40 kept). |
| MM1 business horizons (4/8/12 **months**) | 🔴 **Superseded** by **years**: Starter ~1yr, Growth 4yr, Pro 10yr (D49). |
| "Verified Deals" tier name | ✏️ Renamed **Deal Intelligence** (consumer). "Verified deals" now = the deal *classification/pipeline*. |

### New locked decisions
| # | Decision | Value | Status |
|---|----------|-------|--------|
| D47 | Consumer model | Two **independent** axes: Deal Intelligence ($30) × Ad-Free add-on ($15). States: $0/$15/$30/$45. **$30 alone keeps ads.** Non-negotiable unless Brian changes it. | ✅ |
| D48 | Consumer trial | **30 days Deal Intelligence**; ads remain unless Ad-Free bought separately; no silent conversion; prefs kept read-only on expiry | ✅ |
| D49 | Business plans | **Free $0 (1 ws)** · Starter $15 (2 ws, ~1yr) · Growth $30 (3 ws, ∞ countries, 4yr) · Business Pro $45 (∞ ws, 10yr, consumer-promo + storefront widgets) | ✅ prices / 🟡 caps |
| D50 | Business "limit" = **workspaces** (store/business connections); Free1/Starter2/Growth3/Pro∞ (fair-use) | ✅ |
| D51 | Downgrade | Never delete; excess workspaces/countries/horizon-data/premium features → **read-only**; restore on upgrade | ✅ |
| D52 | Billing | Provider-independent **orchestration layer** (BillingProvider/Resolver/Verifier/TrialManager/WebhookProcessor); licensed providers/app-store billing only; **no card storage**; no provider selected | ✅ |
| D53 | Entitlement engine | Single engine + one config source resolves all plan/add-on/trial/grant/grace states; enforced server-side | ✅ |
| D54 | Tenancy | `Store` → **Organization/Workspace**; principals: consumer/org-member/advertiser/admin/service | ✅ |
| D55 | Deal classification | Confirmed Official · Publicly Published · Strongly Supported Likely · Historical Pattern · Unverified Possibility; uncertainty never marketed as guaranteed | ✅ |
| D56 | Company monitoring | Legal/approved public sources only; no auth bypass/restricted extraction | ✅ |
| D57 | Storefront tools naming | "promotional widgets / engagement tools / campaign overlays / gamified promotions" (never "spam"); merchant-approved, guarded | ✅ |
| D58 | Privacy posture | Contextual ads before personalized; minimal data; explicit consent; ads ≠ verified deals; items need legal review | ✅ direction / ⚖️ legal |
| D59 | Repository | Monorepo `apps/{consumer,business,admin}` + `packages/*` + `services/*`; project-owned, no lock-in; migrate per `MIGRATION_PLAN.md` | ✅ |

### Open decisions (updated)
Fair-use follow limit; DI multi-country count; exact business saved-campaign/history caps; card-on-start
for business trial; **store vs web billing on mobile**; PSP choice; personalized-ads (legal); minors
policy; workspace-tool choice; effective-date scheduling for price changes.

---

### MEGA MODULE 3 — foundation implemented (2026-07-11)
| # | Decision | Value | Status |
|---|----------|-------|--------|
| D60 | Monorepo tool | **npm workspaces** (simplest reliable; one root lockfile; no Nx/Turborepo/pnpm) | ✅ |
| D61 | Migration safety | Business app moved intact + kept green each step; `store→org/workspace` rename inside Business **staged to MM4** to protect the 87 tests; platform types already model `Organization/Workspace` | ✅ |
| D62 | Shared single-source | `@eventra/config` + `@eventra/entitlements` (prices/limits) and `@eventra/calendar` (date engine, Business re-exports it); Business rewire onto config/ui deferred to MM4 | ✅ |

### Status
D1–D27 approved (Business). Phases 1–4 built, hardened, tested. Platform expansion (D36–D46) **approved
in direction**; **MM2 architecture lock (D47–D59)** documented; **MM3 platform foundation (D60–D62)
implemented** — npm-workspaces monorepo, 7 shared packages, Consumer/Admin shells, Business green
(**138 tests across 9 workspaces**). **Phase-5 DB implementation remains PAUSED.** No Supabase / billing /
ads / PrimeBuild changes.

---

## MEGA MODULE 4 — Business Persistence (implemented in code, 2026-07-12)

Turns the Business app from mock-only into a real, org-based, persistent application **in code**, behind
an env gate with mock as default. No infrastructure provisioned. See `docs/MM4_PERSISTENCE.md`.

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D63 | **Persistence via a repository contract + adapters** | One `BusinessRepository` interface; `mock` (in-memory), `file` (snapshot-on-disk dev), `supabase` (RLS) adapters selected by `persistenceMode()`. Callers depend only on the contract. | ✅ |
| D64 | **Schema/plan reconciliation (resolves Blocker 3)** | DB + `@eventra/entitlements` are authoritative (locked `business.*` plans, workspace/year limits); the Business UI façade (`PlanId`, `mockPlans`) is retained as a compat display layer, bridged by `app/lib/planModel.ts`. `vip`⇒`business.pro` (legacy alias). Full UI convergence deferred to a later module. | ✅ |
| D65 | **Store → Org/Workspace in the persistence layer** | DB is org/workspace-based (RLS `is_org_member`/`is_workspace_member`); 1 store = 1 org + 1 workspace (V1); façade `storeId` **≡** persistent `workspaceId`, so UI/tests are unchanged. Roles `owner/admin/editor/viewer` (façade `staff`→`editor`). | ✅ |
| D66 | **Integrity: soft-delete + audit + versioning** | Merchant tables gain `created_at/updated_at/created_by`, `deleted_at` soft-delete (reads exclude, snapshots retain), and `campaigns.version` memory chaining (source never overwritten — D15). | ✅ |

### Reconciled by MM4
| Old | Correction |
|-----|-----------|
| Paused Phase-5 SQL (`plans.id in free/starter/growth/vip`, `planning_horizon_months`, `store_id`) | 🔁 **Reconciled** to `business.*` + `planning_horizon_years` + `workspace_id`, org/workspace tenancy, audit/soft-delete/versioning. Store-based original preserved in git history. |

### Logged assumptions (configurable — `@eventra/config`)
A1 `vip`⇒`business.pro`. A2 Free enforces **0** managed countries (locked). A3 1 store = 1 org + 1
workspace in V1. A4 soft-delete retention is indefinite in V1.

### Open (unchanged by MM4)
Live Supabase provisioning + Shopify credentials (external gates); full Business-UI convergence onto
`@eventra/config`/`@eventra/ui`; nested record routes vs query-param modals.

---

## MEGA MODULE 5 — Pre-Install Readiness (implemented in code, 2026-07-12)

Makes Business installation-ready behind the Shopify/Supabase/install gate. See
`docs/EVENTRA_PREINSTALL_CERTIFICATION.md` (decision: READY FOR SHOPIFY AUTHORIZATION).

| # | Decision | Value | Status |
|---|----------|-------|--------|
| D67 | **UI↔persistence via an optimistic action seam** | `DataProvider` hydrates from loader data and emits each mutation to `onPersist`→`/app/data`; local state stays synchronous (no component-contract change). Mock is the pure-client default. Failures surface a real error banner — never a faked success. | ✅ |
| D68 | **Env-gated local preview** | `EVENTRA_PREVIEW=true` (dev-only, never production, never `supabase` mode) renders the Business UI without a Shopify session for labeled local inspection. Does NOT impersonate OAuth. `shopify.server` uses non-production placeholder credentials so the app can boot for preview. | ✅ |
| D69 | **Server-side entitlement enforcement** | Country limits enforced in the write path from the LOCKED model (`@eventra/entitlements`); downgrade is non-destructive (excess → read-only, never deleted). | ✅ |

**Scopes (least-privilege, re-reviewed):** `read_products` only — no write scopes (V1 actions visual-only).
**External gates (unchanged):** Supabase provisioning, Shopify OAuth/credentials, install/deploy, merge to main.
