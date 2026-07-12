# Eventra Admin Console — Complete Design (PROPOSED)

> Private, desktop-first (tablet/mobile-usable) web control center for platform staff. Controls every
> platform service. Not distributed in any app store. Shares the backend. **Proposed — awaiting
> approval. No implementation.** Supersedes the shorter v3 draft (MEGA MODULE 1 expansion).

## 1. Access, roles & audit
Admins are a **separate principal type** (internal SSO/email + MFA). Proposed RBAC (exact matrix is an
open decision):
| Role | Scope |
|------|-------|
| Superadmin | Everything incl. security, permissions, destructive ops, feature flags, config. |
| Ops | Users, subscriptions, trials, support, moderation. |
| Content | Calendar/events, countries/categories, companies. |
| Deals reviewer | Verified-deal queue + sources. |
| Ads manager | Advertisers, campaigns, placements, reporting. |
| Analyst / read-only | Dashboards + analytics only. |
**Every write is audit-logged** (actor, action, target, before/after, timestamp, IP). Destructive
actions require confirmation and (for some) a second-admin approval.

## 2. Modules — purpose · actions · displays · future
| Module | Purpose | Key actions | Displays | Future expansion |
|--------|---------|-------------|----------|------------------|
| **Overview** | At-a-glance platform health & KPIs | drill into alerts | MRR, active users (C/B), trials ending, deal queue size, health, recent activity | customizable dashboards, saved views |
| **Users (all)** | Unified people search | search, open, suspend | cross-type user search (consumer + business) | merged identity insights |
| **Business Customers** | Manage Orgs | view, adjust plan/trial, suspend, impersonate (audited) | Org, integration type, plan/trial, owners, usage | health scoring, CS notes |
| **Consumer Users** | Manage shoppers | view, suspend, reset, moderate | account, tier, follows, alert settings, region | cohort tools |
| **Subscriptions** | All subscriptions | change plan, refund (via billing), cancel | consumer (Free/Ad-Free/Verified) + business (Starter/Growth/Pro) | dunning management |
| **Trials** | 45-day business trials | extend, convert, message | active, days-left, ending-soon, expired | automated nudges |
| **Advertising** | Ad platform control | create advertiser/campaign/creative, set placement/priority/frequency, pace | advertisers, campaigns, spend/pacing (see `ADVERTISING.md`) | advertiser self-serve portal |
| **PrimeBuild campaigns** | PrimeBuild as **one advertiser** | manage PB campaigns like any advertiser | PB campaigns/creatives/reporting | none special-cased |
| **Future advertisers** | Onboard new advertisers | invite, KYC, contract, enable | pipeline, status | self-serve onboarding |
| **Companies** | Company registry + monitoring | add/edit company, mark monitored, link sources | company profiles, monitored flag, categories | logo/asset mgmt, dedupe |
| **Verified Deals** | Review & publish deals | verify/reject, edit, set confidence, schedule | queue, submissions, verified feed, confidence (see `VERIFIED_DEALS.md`) | ML-assisted triage |
| **Countries** | Curated country catalog | add/edit/enable | countries, per-country coverage | localization |
| **Categories** | Commercial categories | add/edit/merge | category tree, usage counts | taxonomy tooling |
| **Calendar** | Global official events | CRUD events + rules (incl. `offsetDays`), importance/category | events per country, rule preview | bulk import, rule tester |
| **Notifications** | Delivery ops | edit templates, quiet-hour policy, resend, throttle | sent/failed/opened, per-channel health | A/B templates |
| **Analytics** | Cross-product insight | filter, export | usage, engagement, funnels, deal/ad performance | dashboards, cohorts |
| **Support** | Assist users | open/assign/resolve tickets, canned replies | tickets, SLAs, linked user | in-app chat |
| **Moderation** | Content/account safety | review reports, act (warn/suspend/remove) | report queue, flags | automated filters |
| **Logs** | Operational + audit trail | search, filter, export | audit log (writes), system logs, delivery logs | SIEM export |
| **Server Health** | Uptime & jobs | acknowledge, retry jobs | service status, queue depth (notifications/monitoring), error rates | on-call integration |
| **Integrations** | Commerce connections | inspect, reauthorize, disable | Shopify/Woo/Wix/Squarespace/custom health + config | per-adapter diagnostics |
| **Billing** | Money ops | refunds, credits, invoices, reconcile | PSP + Shopify billing status, failed payments | revenue recognition |
| **Security** | Platform safety | manage MFA policy, sessions, IP allowlists, review anomalies | admin sessions, RLS advisor results, incidents | secret rotation, alerts |
| **Permissions** | Admin RBAC | create/edit roles, assign, revoke | role matrix, admin accounts | granular scopes |
| **Version Control** | App builds | publish version, force-update flag, rollback pointer | Consumer/Business build versions, min-supported | staged rollout |
| **Feature Flags** | Gradual rollout / kill-switch | toggle per surface/cohort/%; kill-switch | flag list, targeting, state | experiment framework |
| **Configuration** | Platform settings | edit non-secret config (limits, defaults, copy) | config values, change history | typed config schema |

## 3. Route / page map
```
/admin                              Overview
/admin/users                        Unified user search
/admin/businesses[/:id]             Business customers
/admin/consumers[/:id]              Consumer users
/admin/subscriptions/{consumer,business}
/admin/trials
/admin/revenue                      Conversions/cancellations/churn/MRR
/admin/ads/{advertisers,campaigns,reporting}[/:id]
/admin/companies[/:id]
/admin/deals/{queue,sources}[/:id]
/admin/catalog/{countries,categories}
/admin/calendar/events[/:id]
/admin/notifications
/admin/analytics
/admin/support[/:id]
/admin/moderation
/admin/logs
/admin/health
/admin/integrations
/admin/billing
/admin/security
/admin/staff                        Admin accounts
/admin/permissions                  Roles
/admin/versions                     App versions
/admin/flags                        Feature flags
/admin/config                       Configuration
/admin/audit                        Audit log
```

## 4. Layout & responsiveness
Desktop-first: persistent left-nav (grouped: People · Revenue · Growth surfaces · Catalog · Ops ·
System), top bar with global search + environment badge, dense filterable tables, detail drawers, bulk
actions. Tablet: nav → drawer; tables → scrollable/cards. Mobile: triage-usable (queues, trials,
support, health), not primary.

## 5. Cross-references
Verified deals → `VERIFIED_DEALS.md`; advertising → `ADVERTISING.md`; trials/billing → `MONETIZATION.md`
+ `BUSINESS_PRODUCT.md §18`; security/tenancy → `PLATFORM_ARCHITECTURE.md §11`; journeys →
`USER_FLOWS.md`.
