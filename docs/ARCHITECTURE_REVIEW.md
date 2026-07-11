# Eventra (Calendar Engine) — Architecture Review & Lock v2

**Status:** ✅ **Approved with amendments (2026-07-11)** — folded in below. Awaiting final Architecture Lock go-ahead.
**Rule:** No application code is written until the Architecture Lock is approved.

---

## 1. Contradictions & Decisions — Resolved

| # | Issue | Resolution | Status |
|---|-------|------------|--------|
| C1 | Name (Calendar Engine / Marketing Calendar / Eventra) | Brand = **Eventra**; "Calendar Engine" = internal codename (non-blocking) | ✅ |
| C2 | Plan names (Pro/Advanced vs Starter/Growth) | **Free / Starter $10 / Growth $20 / VIP $50**; Pro/Advanced deprecated | ✅ |
| C3 | Standalone vs Shopify app | **Shopify app first**; standalone shell deferred | ✅ |
| C4 | Auth-first vs frontend-first | Frontend + mock data first, **built inside the final Shopify app** (no throwaway SPA) | ✅ |
| C5 | Backend provider | **Supabase — new, separate Eventra project** | ✅ |
| C6 | Color meaning | Importance (🟢🟡🔴) for official dates; categories use a separate indicator | ✅ |
| C7 | Templates/Analytics partly deferred | Templates = duplication in V1; Analytics = light/deferred | ✅ |
| — | Initial countries | **US (required) + Canada**; Canada catalog may finish later | ✅ |

---

## 2. Consolidated Version 1 Scope

Complete, working, **mock-data-driven Shopify-app UI** for marketing planning and campaign memory,
built on real multi-tenant types and the final app architecture from day one.

**In V1 (grouped by approval gate — see §10):** app shell + nav + design system · dashboard ·
year/month/day calendar (dnd-kit) · events catalog + Event Creator · event actions (visual only) ·
countries (`StoreCountry`) · campaigns CRUD + status · campaign library + memory · templates
(duplication) · search · subscription/pricing UI (no live payments) · settings · admin · in-app
notifications · then real Shopify OAuth + Supabase RLS.

**Not in V1:** real automation/store changes, AI recommendations, ads/email integrations, teams/roles,
native mobile, complex analytics, real payouts, industry-specific calendars, public standalone shell.

---

## 3. Framework Decision (locked)

**Shopify's official React Router app template** (`@shopify/shopify-app-react-router`), used **from the
start**. The mock-driven interface is built **inside** this final architecture — there is **no separate
Vite SPA to migrate later**. (The template already uses Vite internally; App Bridge + Polaris-compatible
shell are available, but our UI uses Tailwind + custom components per the design system.)

- Real OAuth/install, session tokens, and API/DB calls are added in **Phase 5**; earlier phases run the
  same app with mock loaders/actions.

---

## 4. Proposed Folder Structure (Shopify React Router app)

```
eventra/                          (repo: primebuildfit-lab/primebuild-saas)
├── CLAUDE.md · README.md
├── shopify.app.toml · shopify.web.toml
├── package.json · tsconfig.json · vite.config.ts · tailwind.config.ts
├── docs/                         # ARCHITECTURE_REVIEW, DECISIONS, BUILD_STATUS, ROADMAP, RULES, SOP
├── supabase/                     # migrations + RLS policies (designed Phase 1, live Phase 5)
│   ├── migrations/
│   └── policies/                 # RLS: membership-based tenant isolation
└── app/
    ├── root.tsx · entry.server.tsx
    ├── shopify.server.ts         # Shopify app config (auth wired in Phase 5)
    ├── routes/                   # React Router route modules (thin; compose components)
    │   ├── app.tsx               # embedded layout + App Bridge nav
    │   ├── app._index.tsx        # Dashboard
    │   ├── app.calendar.tsx      # Year view
    │   ├── app.calendar.month.$ym.tsx
    │   ├── app.calendar.day.$date.tsx
    │   ├── app.events._index.tsx · app.events.$id.tsx · app.events.new.tsx
    │   ├── app.campaigns._index.tsx · app.campaigns.$id.tsx · app.campaigns.new.tsx
    │   ├── app.campaign-library.tsx · app.templates.tsx
    │   ├── app.countries.tsx · app.analytics.tsx
    │   ├── app.settings.tsx · app.billing.tsx · app.admin.tsx
    ├── components/               # reusable UI: Button, Card, Modal, Badge, StatTile, ColorDot, ...
    ├── features/                 # events, campaigns, countries, plans, search, calendar
    ├── data/                     # MOCK ONLY: mockStores, mockMemberships, mockCountries,
    │                             #   mockStoreCountries, mockGlobalEvents, mockCampaigns, ...
    ├── types/                    # domain TS types (see §7)
    ├── lib/                      # date-fns helpers, formatting, plan-entitlements, tenant guards
    ├── db/                       # supabase client + server-side tenant helpers (Phase 5)
    ├── hooks/ · context/         # useCurrentStore, StoreContext, PlanContext, ThemeContext
    └── styles/
```

---

## 5. Route / Page Map

| Route (RR module) | Page | Gate |
|-------------------|------|------|
| `app._index` | Dashboard | 2 |
| `app.calendar` | Year view | 2 |
| `app.calendar.month.$ym` | Month view (dnd-kit) | 2 |
| `app.calendar.day.$date` | Day detail | 2 |
| `app.events._index` / `.$id` / `.new` | Events catalog / detail / Event Creator | 2 |
| `app.countries` | Country manager (`StoreCountry`) | 2 |
| `app.campaigns._index` / `.$id` / `.new` | Campaigns list / detail / form | 3 |
| `app.campaign-library` | Library + Memory | 3 |
| `app.templates` | Templates (duplication) | 3 |
| `app.billing` | Plans & billing (no live payments until P5) | 4 |
| `app.settings` | Account · Calendar · Appearance · Billing view | 4 |
| `app.admin` | Countries + official events (admin) | 4 |
| `app.analytics` | Light stats | 4 |

Mobile: responsive menu, design/functional parity with desktop.

---

## 6. Component Map (examples)

```
DashboardPage → StatsGrid · UpcomingOpportunities · ActiveCampaigns · PreparationNeeded
              · SavedCampaigns · QuickActions
CalendarMonthPage → CalendarToolbar · MonthGrid(DayCell×42, dnd-kit drop) · EventChip(draggable) · DayDetailDrawer
EventCreatorPage → EventForm · EventActionsPanel(visual placeholders) · EventPreview
CampaignFormPage → CampaignForm · ProductAttach(mock) · ReminderSettings
```
Shared primitives: `Button, Card, Modal, Drawer, Badge, StatusPill, ColorDot, Toggle, Select, DateField, EmptyState, Table, Tabs, SearchInput`.

---

## 7. Multi-Tenant Data Model (explicit entities)

Platform-owned (no `storeId`): **`Country`** (catalog, **no** global `enabled`), **`GlobalEvent`**, **`Plan`**.
Merchant-owned (carry `storeId`, gated by RLS): everything else.

```ts
type StoreId = string; type CountryCode = string; type PlanId = 'free'|'starter'|'growth'|'vip';

interface User   { id: string; email: string; }
interface Store  { id: StoreId; shopDomain: string; name: string; }
interface Membership { userId: string; storeId: StoreId; role: 'owner'|'admin'|'staff'; } // server-validated

interface Country { code: CountryCode; name: string; }                      // catalog only, NO enabled flag
interface StoreCountry { storeId: StoreId; countryCode: CountryCode; enabled: boolean; } // per-store enablement

interface GlobalEvent {                                                      // platform-owned
  id: string; name: string; countryCodes: CountryCode[];
  startRule: DateRule; endRule?: DateRule; category: EventCategory;
  importance: 'high'|'medium'|'low'; description?: string;
  recommendedLeadDays?: number; recurring: boolean;
}
interface StoreEventPreference { storeId: StoreId; globalEventId: string; hidden: boolean; } // hide/restore
interface CustomEvent { id: string; storeId: StoreId; name: string; /* dates, category, color, repeat */ }

interface Campaign {
  id: string; storeId: StoreId; name: string; globalEventId?: string; country?: CountryCode;
  objective?: string; description?: string; prepStart?: string; startDate: string; endDate: string;
  offer?: string; productRefs?: string[]; notes?: string;
  status: 'draft'|'scheduled'|'active'|'completed'|'archived';
  actions?: EventAction[];        // visual-only in V1
  createdFromId?: string;         // memory link; never overwrites source
}
interface Template     { id: string; storeId: StoreId; name: string; /* structure */ }
interface StorePreference { storeId: StoreId; /* calendar format, appearance, reminder defaults */ }
interface Subscription { storeId: StoreId; planId: PlanId; status: 'active'|'past_due'|'canceled'; }
interface Plan { id: PlanId; name: string; priceMonthly: number; countryLimit: number|null; entitlements: Record<string,unknown>; }
```

Two separate status concepts: **event preparation** (Unprepared/Planning/Ready/Passed) vs
**campaign lifecycle** (Draft/Scheduled/Active/Completed/Archived).

---

## 8. Tenant Security Model (mandatory)

- **Never trust a client-supplied `storeId`.** It's a hint only.
- On every request, resolve the authenticated user → look up **`Membership`** for the target `storeId`
  **server-side**; reject if absent.
- Enforce isolation at the database with **Supabase RLS**: each merchant table's policies allow a row
  only when a `Membership(auth.uid(), row.storeId)` exists. RLS is the real gate, not application code alone.
- Plan limits (country count, planning horizon, saved-campaign caps) are enforced **server-side**.
- Downgrades never hard-delete data — excess becomes read-only under a retention policy.

Until Phase 5, loaders/actions read **mock data** shaped to these exact types and simulate a single demo
membership, so swapping in Supabase later requires no component rewrites.

---

## 9. Independence & Seed Data

- **Demo merchant only:** seed/mock uses a fictional store (e.g. `Demo Store`, `demo-store.example`,
  `store_demo`). **No** PrimeBuild names, domains, colors, IDs, or logic anywhere.
- Own Shopify app; storefront touchpoints later only via app blocks / theme app extensions / app proxies.
- Backend = a **new, separate** Supabase project — never `primebuild-core`.

---

## 10. Architecture Lock — Approval Gates

Build stops for review at each gate.

1. **Phase 1 — Foundation:** Shopify React Router scaffold · App Bridge shell + navigation · design system
   + UI primitives · TS domain types · mock-data layer · new Supabase project provisioned (schema + RLS
   **designed**, not yet wired).
2. **Phase 2 — Core Planning:** Dashboard · Calendar (year/month dnd-kit/day) · Countries (`StoreCountry`) ·
   Events catalog + Event Creator · Event Actions (visual).
3. **Phase 3 — Campaign Memory:** Campaigns CRUD + status · Campaign Library · versioned reuse · Templates
   (duplication) · Search.
4. **Phase 4 — Platform Surfaces:** Subscription/pricing UI · Settings · Admin (countries/events) · in-app
   notifications/reminders.
5. **Phase 5 — Real Shopify & Supabase Infrastructure:** OAuth/install · App Bridge session tokens ·
   Supabase tables + live RLS · server-side membership validation · replace mock data with real API ·
   Shopify Billing · tenant-isolation tests.

**Next step:** approve this Architecture Lock → connect the repo to a Code session + provision the new
Eventra Supabase project → begin **Phase 1**, then stop at the Phase 1 gate.
