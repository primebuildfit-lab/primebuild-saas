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

### Status
D1–D27 approved (Business). Phases 1–4 built, hardened, tested (**87 tests green**). Platform expansion
(D36–D46) **approved in direction**; **MEGA MODULE 2 architecture lock (D47–D59)** documented and
awaiting final review. **Phase-5 DB implementation remains PAUSED.** No application code / no Supabase /
no billing / no ads / no PrimeBuild changes until the Architecture Lock is approved for implementation.
