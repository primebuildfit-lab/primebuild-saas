# Eventra Admin Console — Information Architecture (PROPOSED)

> Private, desktop-optimized (tablet/mobile-usable) web control center for platform staff. Not
> distributed in any app store. Shares the platform backend. **Proposed — awaiting approval.**

## 1. Purpose & roles
Operate and monitor the whole platform: consumers, businesses, subscriptions, trials, advertising,
verified deals, the global calendar, integrations, health, and staff permissions.

Admin principal type is separate from Consumer/Business. Proposed admin roles (RBAC — exact matrix is an
open decision):
| Role | Scope |
|------|-------|
| Superadmin | Everything, incl. admin permissions + destructive ops. |
| Ops | Users, subscriptions, trials, support/moderation. |
| Content | Calendar/events, countries/categories, monitored companies. |
| Deals reviewer | Verified-deal queue + sources. |
| Ads manager | Advertisers, campaigns, placements. |
| Read-only / analyst | Dashboards + analytics, no writes. |

Every admin write is **audit-logged** (actor, action, target, timestamp).

## 2. Information architecture (modules)
Grouped for a desktop left-nav; collapses to a drawer on tablet/mobile.

- **Overview** — platform KPIs, health summary, recent activity, alerts.
- **People**
  - Consumer users — search, detail, status, follows, alert settings, moderation.
  - Business customers — orgs, integration type, plan/trial, owners/staff, activity.
- **Subscriptions & Revenue**
  - Consumer subscriptions (Free/Ad-Free/Verified Deals).
  - Business subscriptions (Starter/Growth/Business Pro).
  - **Trials** — active 45-day trials, days remaining, ending soon.
  - **Conversions & cancellations** — funnel, churn, MRR (post-billing).
- **Advertising**
  - Advertisers (incl. **PrimeBuild as one advertiser**, never special-cased).
  - Ad campaigns, creatives, placements, targeting, pacing, reporting.
- **Verified Deals**
  - Review **queue** (submitted promotions → verify/reject).
  - **Sources** — official promotion-verification sources per company/category.
  - Monitored companies — the roster of companies whose promos are tracked.
- **Calendar & Catalog**
  - Global events (official dates) — CRUD, rules (incl. `offsetDays`), importance/category.
  - Countries & categories — curated catalog.
- **Notifications**
  - Delivery monitoring (sent/failed/opened), templates, quiet-hour policies.
- **Integrations**
  - Shopify and non-Shopify (Woo/Wix/Squarespace/custom) connection health + config.
  - App versions (Consumer/Business builds; forced-update flags).
- **Support & Moderation** — tickets, reports, content moderation, account actions.
- **Analytics** — cross-product usage, engagement, deals performance, ad performance.
- **System Health** — server/integration status, job queues (notifications, monitoring), error rates.
- **Admin & Permissions** — staff accounts, roles, audit log.

## 3. Admin route / page map (PROPOSED)
```
/admin                              Overview dashboard
/admin/consumers[/:id]              Consumer users list / detail
/admin/businesses[/:id]             Business customers list / detail
/admin/subscriptions/consumer       Consumer subscriptions
/admin/subscriptions/business       Business subscriptions
/admin/trials                       45-day trials (active / ending / expired)
/admin/revenue                      Conversions, cancellations, churn, MRR
/admin/ads/advertisers[/:id]        Advertisers (incl. PrimeBuild)
/admin/ads/campaigns[/:id]          Ad campaigns / creatives / placements
/admin/ads/reporting                Ad performance
/admin/deals/queue                  Verified-deal review queue
/admin/deals/sources                Verification sources
/admin/companies[/:id]              Monitored companies
/admin/calendar/events[/:id]        Global events CRUD
/admin/catalog/countries            Countries
/admin/catalog/categories           Categories
/admin/notifications                Delivery monitoring + templates
/admin/integrations                 Integration health + config
/admin/app-versions                 Consumer/Business app versions
/admin/support                      Tickets / reports / moderation
/admin/analytics                    Cross-product analytics
/admin/health                       Server & integration health
/admin/staff                        Admin accounts + roles
/admin/audit                        Audit log
```

## 4. Layout & responsiveness
Desktop-first: persistent left-nav + top bar + dense data tables with filters, detail drawers, and
bulk actions. Tablet: nav collapses to a drawer; tables become horizontally scrollable cards.
Mobile: usable for triage (queues, trial/renewal alerts, support) though not the primary surface.

## 5. Key workflows (referenced elsewhere)
- **Verified-deal approval:** `/admin/deals/queue` — see `PLATFORM_ARCHITECTURE.md §7`.
- **Trial monitoring/conversion:** `/admin/trials` + `/admin/revenue` — see `BUSINESS_PRODUCT.md §4`.
- **Ad management:** `/admin/ads/*` — see `MONETIZATION.md §5`.
- **Global calendar editing:** `/admin/calendar/events` — the existing merchant-facing admin-of-catalog
  screen graduates into this authoritative console.
