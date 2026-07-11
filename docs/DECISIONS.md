# Eventra — Decision Log (`DECISIONS.md`)

Record of approved product decisions. Do not silently change an approved rule —
amend here and flag it. Status: ✅ approved · 🟡 proposed (awaiting user) · 🔴 open.

_Last updated: 2026-07-11 — **Architecture Review approved with amendments.** Open items resolved._

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

### Status
Architecture Review **approved with amendments (2026-07-11)**. All previously-open items (D1, D2, D5,
D8, D19, D20, D22) are now resolved. **Phase 1 foundation correction executed and verified (2026-07-11)** —
migrated onto the official Shopify React Router template; typecheck + build pass; see `BUILD_STATUS.md`.
Phase 1 is **Ready for Review**; awaiting user approval before Phase 2.
