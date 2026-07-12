# Eventra — Platform Vision (v3, expansion)

> **Status: PROPOSED — awaiting review/approval.** This supersedes the "Shopify-app-only" framing of
> v1–v2. Nothing here is implemented yet; the Phase-5 database work is **paused** pending approval of
> this package. No Supabase provisioning, billing, Android publishing, ad-network integration, or
> PrimeBuild changes are performed by this package.

## 1. What changed
Eventra is no longer a single B2B Shopify app. It becomes **one shared platform** exposing **three
separate product surfaces** that share approved backend services:

1. **Eventra Consumer** — a general commercial-calendar app for shoppers (Android/Google Play first,
   also web). Shows important commercial dates, predicts likely sale windows, lets users follow
   companies/categories, delivers verified official-sale notifications, and shows advertising (removed
   on paid tiers).
2. **Eventra Business** — the existing campaign-planning + campaign-memory product, generalized beyond
   Shopify to WooCommerce, Wix, Squarespace, custom ecommerce, physical businesses, and businesses with
   **no** technical integration. Shopify becomes **one specialized integration**, not the whole product.
3. **Eventra Admin Console** — a private, desktop-optimized (tablet/mobile-usable) web control center
   for platform administrators to manage users, subscriptions, trials, advertising, verified deals,
   monitored companies, the global calendar, integrations, health, and permissions.

**PrimeBuild is only a business customer and a possible advertiser.** It is never hardcoded into the
platform architecture.

## 2. Product map
```
                         ┌───────────────────────────────────────────────┐
                         │            Eventra Platform (shared)           │
                         │  identity · subscriptions/billing · calendar   │
                         │  companies · follows · notifications · ads ·   │
                         │  verified deals · campaigns(B) · analytics ·   │
                         │  integrations · admin/audit                    │
                         └───────────────────────────────────────────────┘
                 ┌───────────────────┼───────────────────────┬───────────────────┐
        ┌────────▼────────┐ ┌────────▼─────────┐   ┌──────────▼─────────┐
        │ Eventra Consumer│ │ Eventra Business │   │ Eventra Admin      │
        │ (Android + web) │ │ (web + Shopify   │   │ Console (web,      │
        │ shoppers        │ │  embedded + other│   │ desktop-first)     │
        │                 │ │  platforms)      │   │ platform staff     │
        └─────────────────┘ └──────────────────┘   └────────────────────┘
```

Consumer and Business may later ship as **separate downloadable apps** (different onboarding, branding
variants, permissions, store listings) over the **same backend**. The Admin Console stays web-only.

## 3. Guiding principles
- **One backend, three surfaces.** Shared domains and APIs; surface-specific UIs, auth, and onboarding.
- **Audience separation is a security boundary.** Consumer accounts, business orgs, and admins are
  distinct principal types with distinct data and RLS/roles (see `PLATFORM_ARCHITECTURE.md §11`).
- **Integrations are adapters.** Shopify/Woo/Wix/Squarespace/custom/manual all implement a common
  Business "commerce connection" interface; none is the product's core.
- **Quality over quantity** (unchanged): countries/events/verified-deals are curated, not inflated.
- **PrimeBuild is a tenant/advertiser, never a special case in code.**
- **Reuse what exists.** The design system, calendar/date engine, domain types, and mock architecture
  carry forward (see `PLATFORM_ARCHITECTURE.md §18`).

## 4. Where each required topic is documented (coverage of the 20-point brief)
| # | Topic | Doc |
|---|-------|-----|
| 1 | Revised product map | `PLATFORM_VISION.md §2` |
| 2 | User types & roles | `PLATFORM_ARCHITECTURE.md §2`; per-surface docs |
| 3 | Consumer plans & entitlements | `CONSUMER_PRODUCT.md §3`, `MONETIZATION.md §2` |
| 4 | Business plans & entitlements | `BUSINESS_PRODUCT.md §3`, `MONETIZATION.md §3` |
| 5 | Trial lifecycle | `BUSINESS_PRODUCT.md §4`, `MONETIZATION.md §4` |
| 6 | Advertising architecture | `MONETIZATION.md §5`, `PLATFORM_ARCHITECTURE.md §6` |
| 7 | Verified-deal monitoring & approval | `PLATFORM_ARCHITECTURE.md §7`, `ADMIN_CONSOLE.md` |
| 8 | Notification architecture | `PLATFORM_ARCHITECTURE.md §8` |
| 9 | Platform detection & onboarding | `BUSINESS_PRODUCT.md §5`, `PLATFORM_ARCHITECTURE.md §9` |
| 10 | Shared backend domains | `PLATFORM_ARCHITECTURE.md §10` |
| 11 | Data separation / tenant & security | `PLATFORM_ARCHITECTURE.md §11` |
| 12 | Admin Console IA | `ADMIN_CONSOLE.md` |
| 13 | Consumer route/page map | `CONSUMER_PRODUCT.md §6` |
| 14 | Business route/page map | `BUSINESS_PRODUCT.md §6` |
| 15 | Admin route/page map | `ADMIN_CONSOLE.md §3` |
| 16 | Mobile/desktop/downloadable strategy | `PLATFORM_VISION.md §5` |
| 17 | Migration impact on current code | `PLATFORM_ARCHITECTURE.md §17` |
| 18 | Reusable existing work | `PLATFORM_ARCHITECTURE.md §18` |
| 19 | What Phase 5 must change | `PLATFORM_ARCHITECTURE.md §19` |
| 20 | Updated phases & complexity | `PLATFORM_ARCHITECTURE.md §20` |

## 5. Mobile, desktop & downloadable-app strategy
- **Eventra Consumer:** primary target Android via **Google Play**, plus a responsive web PWA sharing
  the same backend. Recommended packaging: a single web codebase delivered as a **PWA** and wrapped for
  Play as a **TWA (Trusted Web Activity)** for the first release (fastest path, one codebase); revisit a
  native/React-Native shell later if native push/widgets/store-optimization demand it. iOS is a later
  consideration, not in this scope.
- **Eventra Business:** primary **web app**, plus the existing **Shopify embedded** surface (App Bridge)
  as one integration. Other platforms (Woo/Wix/Squarespace) install via their own app mechanisms or
  OAuth and open the same web app. Fully responsive; no native app required for launch.
- **Eventra Admin Console:** **web only**, desktop-optimized, usable on tablet/mobile. Not distributed
  in any store.
- **Shared foundation:** all three consume the same backend HTTP/RPC APIs; branding variants and
  permissions differ per surface. The current React Router app becomes the **Business web surface**;
  Consumer and Admin are new surfaces (see `PLATFORM_ARCHITECTURE.md §17`).

## 6. Explicit non-goals of this package
No code features, no Supabase provisioning/migration, no billing implementation, no Android publish, no
ad-network wiring, no PrimeBuild modification. Deliverable = the architecture docs listed in §4, plus
updated `DECISIONS.md` and `BUILD_STATUS.md`. Then **stop for review.**
