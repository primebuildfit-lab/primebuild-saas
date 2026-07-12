# Eventra — Platform Implementation Roadmap (PROPOSED, replaces prior roadmap)

> **Replaces** the phase plan in `docs/PRODUCT_ROADMAP.md §Development phases` and the interim list in
> `PLATFORM_ARCHITECTURE.md §20` (kept for reference). Sequenced future phases for the three-product
> platform. **Design only — no implementation.** Complexity: S < M < L < XL.

## Guiding sequence logic
1. **Protect the existing value** — the Business core is built, tested (87 tests), and strong. Land its
   real persistence first, on the platform-ready schema.
2. **Foundation before surfaces** — identity/tenancy/RLS + shared services before Consumer/Admin UIs.
3. **Parallelize** Consumer and Admin once the foundation exists.
4. **Trust & money** (verified deals, billing) after the surfaces can host them.
5. **Reach & scale** (more integrations, mobile stores, ads, advanced/AI) last.

## Phases
| # | Phase | Scope | Complexity | Depends on |
|---|-------|-------|:----------:|-----------|
| **P0** | Architecture Lock | Approve this package; finalize entitlements + open decisions (`DECISIONS.md`) | S | — |
| **P1** | Platform Foundation | Repo shape (monorepo `apps/*` + `packages/*` or route-tree split); `store→org` rename; platform schema (3 principals); RLS `is_org_member`/`is_self`; per-principal auth adapters + RLS-JWT bridge | **L** | P0 |
| **P2** | Business Persistence (rescoped Phase 5) | Apply Business slice on the platform schema; wire loaders/actions (countries, events, hide/restore, custom events, campaigns+memory, templates, prefs, plan); Shopify pilot on a dev store; live isolation tests | **L** | P1 |
| **P3** | Consumer MVP | Consumer auth/onboarding, calendar, discover/follow, alerts inbox, ad slots (house ads), PWA; web first | **L** | P1 |
| **P4** | Admin Console MVP | Users, businesses, subscriptions, trials, deals queue, calendar/countries/categories, health, permissions, audit | **L** | P1 |
| **P5** | Notifications + Verified Deals E2E | Notification service (push/in-app), verified-deal submit→verify→publish→alert, confidence + fan-out | **M–L** | P2, P3, P4 |
| **P6** | Billing + Trials | Business (Shopify + PSP), consumer (store/web), 45-day trial automation, downgrade-grace + restoration | **L** | P2, P3 |
| **P7** | Multi-platform Business | WooCommerce, then Wix, Squarespace, custom adapters | **M each** | P2 |
| **P8** | Mobile stores + Ads scale | Consumer Android (Play, TWA/native), iOS (App Store), ads serving + consent/privacy, advertiser reporting | **M–L** | P3, P5 |
| **P9** | Advanced / AI / future lines | AI assistant/opportunities, automation engine, reports, marketplace/affiliate/API monetization | **XL (staged)** | prior phases |

## Dependencies (critical path)
`P0 → P1 → P2` protects existing value. `P3` and `P4` run in parallel after `P1`. `P5` needs the
surfaces (`P2/P3/P4`). `P6` needs Business + Consumer. `P7` extends Business. `P8` extends Consumer. `P9`
is opportunistic and staged.

## Complexity & risk summary
- Heaviest: **P1** (multi-principal identity + RLS is the make-or-break foundation) and the trio
  **P3/P4** (two new full surfaces).
- Highest risk: identity/data-boundary correctness (P1), Play/App-Store billing economics (P6/P8), and
  verified-deal trust/moderation (P5).
- Overall ~**3–4× the current single-product scope**. Recommend committing to P0–P2 first (finish the
  Business pilot on the platform schema) before opening P3/P4 in parallel.

## What this roadmap does NOT do
No public App Store submission, no billing implementation, no ad-network wiring, no Supabase
provisioning, no PrimeBuild changes — until the corresponding phase is explicitly approved.
