# Eventra Business — Complete Product Design (PROPOSED, platform-first)

> ⚠️ **ARCHITECTURE LOCK (D49–D51):** the authoritative business plan/entitlement model is
> **`BUSINESS_PLANS.md`** + **`ENTITLEMENTS.md`**. Corrections to the tables in this doc: **a Business
> Free $0 tier exists** (1 workspace, manual calendar); the "limit" is **workspaces/store connections**
> (Free1/Starter2/Growth3/Pro∞); horizons are **years** — Starter ~1yr, Growth 4yr, Pro 10yr (not
> months); Growth/Pro have **unlimited countries**; Business Pro adds **consumer-app promo exposure +
> storefront widgets**. The onboarding/workflows/widget guardrails below remain valid.

> The campaign-planning + campaign-memory product, generalized beyond Shopify. Shopify is **one
> integration**, not the product. Shares the platform backend. **Proposed — awaiting approval. No
> implementation.** Supersedes the shorter v3 draft (MEGA MODULE 1 expansion). The current mock UI is
> the Business web surface.

## 1. Purpose (unchanged core, platform-first framing)
Find commercial opportunities → prepare campaigns early → **reuse what worked** (campaign memory). Works
for any business — with or without a store integration. A store connection is an *attribute* of the
**Org** (the tenant), not its identity.

## 2. Users & roles
| Role | Scope |
|------|-------|
| Owner | Creates the Org on signup; full access; manages subscription/billing. |
| Admin (org) | Manage planning, campaigns, integrations, members (no billing). |
| Editor | Create/edit campaigns, events, templates; no settings/members. |
| Viewer | Read-only. |
Teams are **post-MVP**; MVP ships Owner-only, but the role model is defined now so RLS/permissions are
built once. Platform admins are **not** business users.

## 3. Merchant onboarding (platform-first)
```
1. Sign up (email/OAuth) or arrive via a store install (Shopify/Woo/Wix/…)
2. Create Org: name, primary country/countries, business type/category
3. "How do you sell?" → choose integration OR "No integration / physical / other"
4. If integration: run its adapter (connect/authorize); else skip
5. Land in the planner with the 45-day full Business-Pro trial active
```
No store connection is required to use the planner. Onboarding is identical across platforms except the
connect step.

## 4. Platform detection & store creation
- **Arriving from a store** (e.g., Shopify install): the platform is known; the adapter provisions the
  Org + connection automatically (shop domain → Org).
- **Arriving from the web**: the user picks the platform in onboarding; the adapter runs OAuth/API-key
  connect; "custom" uses API keys/webhooks; "none/physical" creates an Org with a **manual** product
  list.
- **Store creation** = Org creation + optional CommerceConnection record (`PLATFORM_ARCHITECTURE.md §9`).

## 5. Future integrations (adapters)
Shopify (now) → WooCommerce → Wix → Squarespace → custom → others. All implement the common
`CommerceConnection` interface; adding one is a self-contained adapter + onboarding branch, never a core
rewrite. Product/collection attach uses the connected adapter when present, else the manual list.

## 6. Planning workflow
Dashboard surfaces **Upcoming Opportunities**, **Active Campaigns**, **Preparation Needed**, and
**Quick Actions** (existing). The merchant reviews an upcoming event → opens it → creates a campaign
from it. Prep status (Unprepared/Planning/Ready/Passed) is derived from linked campaigns + dates.

## 7. Campaign workflow
Create/edit/duplicate/mark-ready/mark-active/complete/archive/delete. Fields: name, linked event,
country, objective, description, prep/start/end, offer, products/collections (adapter or manual), notes,
status, actions (visual-only in V1). **Reuse creates a new record and never overwrites history** (D15).

## 8. Calendar workflow
Year → Month (drag-to-move campaigns) → Day detail. Shows official events, custom events, campaigns, and
prep windows; filters by country/category/status/type. Reuses the existing calendar engine + dnd.

## 9. Countries / markets
Per-Org enablement (was per-store), plan-limited. Curated catalog (US + CA now; expand via Admin).
Downgrade → excess markets read-only, never deleted.

## 10. Templates
Reusable campaign structures (name, category, default duration/lead, offer, notes). Create-from-campaign
and use-template-to-create. Plan-gated depth (basic → advanced).

## 11. Campaign memory (the core advantage)
Every campaign is preserved with what/when/event/products/offer/notes; reuse duplicates into a new
year/event as a **new linked version**; original is never overwritten. Library groups completed/archived
campaigns for reuse. History retention scales by plan.

## 12. Verified-deal submission (NEW; ties Business → Consumer)
Growth+ Orgs can **submit** an official promotion for admin verification; once verified/published it can
alert consumers who follow the company/category (`VERIFIED_DEALS.md`). Submission UI: deal details,
proof/source link, dates, scope (country/category). Status tracked (submitted/in-review/verified/
rejected).

## 13. Future AI assistant (explicitly future)
Draft campaign suggestions from past performance, recommended timing/offers, checklist generation. Gated
behind approval; V1 stays manual + deterministic.

## 14. Future automation engine (explicitly future; V1 actions are visual-only, D7)
Turn visual campaign actions into real, **merchant-approved** executions (e.g., prepare a Shopify
discount draft, schedule a banner). Never auto-changes a store without clear approval. Post-MVP + per
integration.

## 15. Future reports & analytics
- **Analytics (near-term):** light usage/opportunity stats (exists) → standard (campaign outcomes,
  prep-rate, calendar coverage) → advanced (revenue attribution when integrations provide it).
- **Reports (future):** exportable summaries per season/campaign; scheduled email reports (Pro).

## 16. Settings
Account/org, calendar preferences (week start, default view, density), appearance (accent), notification
defaults (prep reminders 30/14/7/1), integrations management, members (post-MVP), billing view. Reuses
the existing settings surface.

## 17. Permissions
Org-scoped RBAC (Owner/Admin/Editor/Viewer). Enforced server-side + RLS by `org_id` and role. Client
never asserts org/role. Billing actions owner-only.

## 18. Subscription handling
- **Trial:** 45 days full Business Pro; countdown; at end → choose plan or read-only grace (never
  delete). Restore on upgrade.
- **Plans:** Starter $15 / Growth $30 / Business Pro $45 (`MONETIZATION.md`). Limits enforced
  server-side; downgrade → excess read-only (`PLAN_ENFORCEMENT.md`, already implemented for campaigns).
- **Billing:** Shopify Billing for Shopify Orgs; PSP (e.g. Stripe) for web/other-platform Orgs (design
  only).

## 19. Business route / page map (rescoped)
```
/business/onboarding                Org creation + integration choice
/business                           Dashboard
/business/calendar                  Year/Month/Day
/business/events                    Official catalog + Event Creator + hide/restore
/business/countries                 Markets (plan-limited)
/business/campaigns[/:id][/new]     Campaigns CRUD + memory (nested routes, ROUTING.md)
/business/campaign-library          Memory/history
/business/templates                 Templates
/business/deals                     Submit/track verified deals [Growth+]
/business/integrations              Connect/manage commerce platform(s)
/business/analytics                 Analytics (light→advanced by plan)
/business/reports                   Reports [future]
/business/billing                   Plan + trial status + upgrade/downgrade
/business/settings                  Account, calendar, appearance, notifications, members[future]
```
`/app` stays as the thin Shopify-embedded host that mounts this surface inside Shopify Admin.

## 20. Reuse from current codebase
Very high: design system + UI primitives, `DataContext` domains, calendar/date engine, domain types,
plan-limit + downgrade-retention logic, mock architecture + tests, and the Supabase business schema +
`app/db/*` server foundation (becomes the Business slice under `org_id`). New: multi-platform adapters,
org tenancy, trial lifecycle, verified-deal submission, roles/permissions.
