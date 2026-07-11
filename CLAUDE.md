# CLAUDE.md — Permanent Rules for Eventra (Calendar Engine)

> This file defines the **permanent working rules** for any AI assistant (Claude)
> or developer building this project. Read it fully **before every task**.
> Nothing in application code, chat history, or older PrimeBuild material may
> override these rules. If an instruction conflicts, see **Source of Truth Priority**.

---

## 0. Product Identity

- **Product / brand name:** **Eventra** (domain `eventra.com`).
- **Internal codename:** Calendar Engine.
- **Repository:** `primebuildfit-lab/primebuild-saas` (repo name to be renamed to `eventra` later — do not rename yet).
- **What it is:** A business **marketing-planning and campaign-memory** system, delivered first as a **Shopify app** for merchants, architected so it can later become a standalone multi-tenant SaaS.
- **What it is NOT:** a Google Calendar clone, a personal reminder app, or a PrimeBuild module.

### Eventra is completely independent of PrimeBuild

PrimeBuild is only the **first development/test store** — treat it exactly like any future external customer installing Eventra.

**Never** use or hardcode:
- PrimeBuild branding, logos, colors (black-and-gold), design system, or terminology
- `primebuildfit.com`, PrimeBuild store IDs, customer IDs
- PrimeBuild rewards, affiliate, or database logic
- PrimeBuild fitness imagery

---

## 1. Source of Truth Priority

When instructions conflict, resolve in this order (highest wins):

1. Latest direct instruction from the user (Brian)
2. `docs/PRODUCT_ROADMAP.md`
3. `docs/BUSINESS_RULES.md`
4. This `CLAUDE.md` / `docs/SOP.md`
5. Existing implementation

Never let older PrimeBuild assumptions override Eventra requirements.
Never silently change an **approved** business rule — update `docs/DECISIONS.md` and flag it.

---

## 2. Development Philosophy

- **V1 = planning, organization, and reusable campaign memory. No advanced automation.**
- Build the foundation first. Priority: **Clean → Fast → Reliable → Scalable.**
- Actions attached to events in V1 are **visual, non-executing placeholders**. They must NOT change a Shopify store. Real automation is V2, and only after explicit approval.
- **Frontend & visual logic first**, using **mock data**, until the interface is stable — but structure mock data with realistic TypeScript types so it can later be swapped for real API/DB data without rebuilding components.

---

## 3. Design System

Clean, modern, professional SaaS. **"Premium" = polished, not luxurious.**

Use:
- White backgrounds, light-gray app surfaces, dark readable text
- Restrained green / blue / neutral accents
- Clean borders, moderate radius, subtle shadows, generous spacing, accessible contrast

References: Shopify Admin, Stripe Dashboard, Notion, Linear, Google Calendar.

Avoid: luxury/gold styling, dark "premium" themes, neon, gaming UI, fitness imagery, heavy gradients, excessive animation, oversized marketing heroes inside the app.

---

## 4. Technology Stack

- **App framework:** **Shopify's official React Router app template** (`@shopify/shopify-app-react-router`), used **from the start**. Do **not** build a separate Vite SPA that must later be migrated — the mock-driven UI is built **inside the final Shopify app architecture**.
- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion (inside the React Router app)
- **Calendar/date logic:** date-fns
- **Drag & drop:** dnd-kit
- **Backend:** a **completely separate Supabase project** dedicated to Eventra (Postgres + Auth + Row-Level Security).
- ⚠️ The Eventra Supabase project must be **new and separate** from PrimeBuild's `primebuild-core`. Never reuse it.
- Security + tenant isolation are mandatory (see §5).

---

## 5. Multi-Store (Multi-Tenant) Rule

- Every merchant-owned record includes a `storeId`, even with mock data.
- **But `storeId` from the client is never trusted on its own.** Tenant authorization is validated **server-side** via a **`Membership`** record (user ↔ store) and enforced by **Supabase Row-Level Security (RLS)** policies. The client-supplied `storeId` is only a hint; RLS is the gate.
- Use **explicit multi-tenant entities**, not a flat `Store → Countries → Events` chain:
  `Store`, `Membership`, `StoreCountry`, `StoreEventPreference`, `CustomEvent`, `Campaign`, `Template`, `StorePreference`, `Subscription`.
- **Country enablement is per-store** and lives in **`StoreCountry`** — a `Country` in the global catalog must **not** carry a global `enabled` flag.
- **Global events** (official dates) and the **Country catalog** are **platform-owned** (no `storeId`). Per-store hiding of a global event lives in **`StoreEventPreference`**.
- Merchant campaigns/custom events/templates are **private** to their store.
- **Seed/mock data uses a fictional demo merchant** (e.g. `Demo Store` / `demo-store.example`). **Never** use PrimeBuild names, domains, or identifiers in seed data.

---

## 6. Shopify Development Rule

- Build Eventra as its **own Shopify app project**, never inside the PrimeBuild theme.
- Do not overwrite or edit a merchant's theme (header, footer, product/collection/account/rewards pages).
- Any future storefront integration uses approved mechanisms only: **app blocks, theme app extensions, app proxies**.
- The app must **not** make important store changes without **clear merchant approval**.

---

## 7. Code Organization Rules

- **Mock data lives in dedicated files** under `src/data/` (`mockEvents.ts`, `mockCampaigns.ts`, `mockCountries.ts`, `mockTemplates.ts`, ...). Never scatter fake data inside components.
- **Pages compose small reusable components.** No giant single-file pages. Example:
  `DashboardPage → StatsGrid, UpcomingOpportunities, ActiveCampaigns, SavedCampaigns, QuickActions`.
- **Button behavior:** every visible primary button must either open a working modal, navigate to a working route, update visible local state, or be **clearly marked disabled / "coming soon."** No fake buttons that look functional but do nothing.

---

## 8. Core Business Rules

### Event removal
Official global dates belong to the approved catalog. When a merchant removes/hides one:
- Do **NOT** delete it globally.
- Store a **per-store hidden preference**; hide it only for that merchant.
- Allow the merchant to **restore** it later.
- Merchant-created custom events may be deleted with normal confirmation.

### Repeat
Official and merchant recurring events default to **Repeat next year = ON**. The user can disable recurrence before saving or later in settings.

### Importance colors (official dates only)
- 🟢 Green = high commercial importance
- 🟡 Yellow = medium commercial importance
- 🔴 Red = niche / low-awareness opportunity

Do **NOT** reuse these colors for **categories** — categories get a **separate** visual indicator so priority and category are never confused.

### Campaign memory
Reusing/duplicating a campaign **creates a new record/version** and must **never overwrite** previous history.

### Plan limits
Enforce on the **server**, not just hidden in the UI. Do not delete merchant data immediately on downgrade — make excess data read-only, explain, and apply a defined retention policy.

---

## 9. Plan Names (use EXACTLY these)

| Plan | Price | Country limit |
|------|-------|---------------|
| Free | $0/mo | 1 |
| Starter | $10/mo | 2 |
| Growth | $20/mo | 3 |
| VIP | $50/mo | Unlimited |

- ❌ Do **NOT** use "Pro" or "Advanced" (deprecated names from an early draft) unless the user officially changes them.
- Prices are **working prices** — store them in **one** plan-config source, never hardcoded in multiple places.

---

## 10. Required Project Docs (keep updated)

- `docs/DECISIONS.md` — approved product decisions + open decisions. Update, don't silently change.
- `docs/BUILD_STATUS.md` — per-section status: Not Started / In Progress / Ready for Review / Approved / Blocked. Include files created, packages installed, known limitations, next task.
- `docs/ARCHITECTURE_REVIEW.md` — consolidated scope, structure, routes, components.
- `docs/PRODUCT_ROADMAP.md`, `docs/BUSINESS_RULES.md`, `docs/SOP.md` — source material.

---

## 11. Approval Gates (build in this order, stop at each gate)

Implementation is broken into gated phases. Do not start a phase before the prior one is approved.

1. **Phase 1 — Foundation:** Shopify React Router app scaffold, App Bridge shell + navigation, design system + UI primitives, TypeScript domain types, mock-data layer, new Supabase project provisioned (schema/RLS **designed**, not yet wired).
2. **Phase 2 — Core Planning:** Dashboard, Calendar (year/month with dnd-kit/day detail), Countries (`StoreCountry`), Events catalog + Event Creator, Event Actions (visual placeholders).
3. **Phase 3 — Campaign Memory:** Campaigns CRUD + status, Campaign Library, memory/reuse (versioned, non-destructive), Templates (duplication), Search.
4. **Phase 4 — Platform Surfaces:** Subscription/pricing UI, Settings, Admin (countries/events), in-app notifications/reminders.
5. **Phase 5 — Real Shopify & Supabase Infrastructure:** OAuth/install, App Bridge session tokens, Supabase tables + RLS live, server-side membership validation, replace mock data with real API, Shopify Billing.

## 12. Workflow Guardrail

**Do not build application code until the Architecture Lock is approved by the user.**
The current deliverable is analysis + docs, then **stop and wait for approval.**
