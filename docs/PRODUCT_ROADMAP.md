# Eventra — Product Roadmap, Business Rules & MVP Build Plan (v2.0)

> ⚠️ **PLATFORM EXPANSION (2026-07-11):** the **phase plan here is replaced** by `PLATFORM_ROADMAP.md`,
> and the **subscription table (Free/$10/$20/VIP $50) is superseded** by `MONETIZATION.md`. The Eventra
> **Business** product definition, objects, and non-negotiable rules below remain valid (scoped to
> Business; Shopify = one integration). See `PLATFORM_VISION.md`. Original kept for history.

> Highest-priority product document (priority #2). Product type: Shopify App + SaaS.
> Market: small/medium Shopify merchants. Model: freemium monthly subscription.

## Product definition
A business planning application for online stores that helps merchants identify important
sales opportunities, prepare campaigns early, save what they did, and reuse successful
strategies later. It answers four questions: (1) what opportunities are coming, (2) what to
prepare, (3) what campaigns exist, (4) what worked and can be reused. It is a **marketing
preparation and memory system**, not a date-display calendar.

**Core promise:** Never miss another important sales opportunity, and never rebuild a
successful campaign from zero.
**V1 mission:** the easiest way for a Shopify merchant to plan the marketing year.
**Long-term stages:** Marketing Calendar → Marketing Memory System → Business Growth Assistant.

## Main product objects
1. **Countries** — define markets and which events/opportunities are available.
2. **Global events** — platform-managed dates/periods (admin-owned; users can't edit).
3. **Campaigns** — merchant plans linked to an event/date/country/objective.
4. **Campaign memory** — stored prior campaigns for reuse/improvement (**the core advantage**).

## Users & permissions
- **Merchant:** install app, manage account, select countries (plan-limited), view calendar,
  create/edit/duplicate/complete/archive/delete campaigns, attach products/collections, save
  history per plan, reuse campaigns, manage reminders/settings, view billing.
- **Platform admin:** manage countries, global events, categories, plan rules, users/subscriptions,
  event database, quality/feedback.
- **Excluded from MVP:** teams, employee roles, complex permissions, agency accounts, multi-store staff.

## Primary user flow
Install → account → select country → dashboard → see opportunities → open event → create
campaign (dates, products, discount, objective, notes) → save → return to update/complete →
reuse as history for a future opportunity. MVP succeeds when this full flow works reliably.

## Dashboard
Sections: Upcoming Opportunities (event, country, date, time remaining, prep status, "Create
campaign"), Active Campaigns, Preparation Needed, Recent/Saved Campaigns, Quick Actions
(create campaign, open calendar, manage countries, review saved).

## Calendar
Views: Year, Month, Selected-date detail. Content: global events, campaigns, prep periods,
start/end, status indicators. Filters: country, category, campaign status, event-vs-campaign.
Two separate status models:
- **Event preparation:** Unprepared / Planning / Ready / Passed
- **Campaign lifecycle:** Draft / Scheduled / Active / Completed / Archived

## Countries
Each has validated national holidays, retail events, seasonal opportunities, culturally-relevant
commercial events, key ecommerce periods. Launch small & high-quality: **US required**, **Canada
second if capacity**. Add countries only after research/validation, never to inflate a number.

## Event database
Admin maintains: name, country(ies), date/rule, category, description, commercial relevance,
recommended lead time, recurrence, active state. Quality rule: every event must let a normal
merchant prepare a useful campaign. Merchants can't create global events but can create custom
campaigns (private). Dates support fixed and rule-based recurrence.

## Event categories (MVP)
Major Sales Events (Black Friday, Cyber Monday, Christmas) · National Holidays (Independence Day,
Canada Day) · Seasonal Opportunities (Summer, Winter, Back to School) · Cultural/Commercial
moments (only with credible relevance). Industry-specific calendars (fitness/fashion/beauty/
electronics) are **post-V1**.

## Campaign system
Fields: name, connected global event (optional), country, objective, description/strategy,
prep start, start, end, discount/offer, products/collections (optional), notes, status, reminders.
Recommended-if-not-delaying: target audience, channels, checklist, results notes, manual revenue
summary. Actions: create/edit/save/duplicate/mark-ready/mark-active/complete/archive/delete.
A campaign is more than a discount record.

## Campaign memory
Preserve what/when/which-event/products/offer/notes/repeat. Reuse: open prior → review → duplicate
into new year/event → update → save as new while preserving original. **History is never overwritten.**

## Templates
Reusable structures (name, event type, default timeline/duration, offer structure, product notes,
checklist, strategy). MVP = basic duplication required; advanced template library can follow later
and may be plan-gated.

## Notifications
In-app reminders/prep indicators. Default milestones: 30 days (begin prep), 14 (in progress),
7 (review offer/assets), 1 (confirm launch). No complex multichannel automation in V1. Later:
email, push, Shopify admin notifications.

## Shopify integration
MVP: install as Shopify app, connect store, authenticate merchant, read minimum store info, read
products/collections when attached. Merchant-control principle: no important store change without
clear approval ("Your July 4 campaign is prepared. Review and activate."). Post-MVP: prepare
discount drafts, schedule approved actions, product selections, performance tracking. **No automatic
changes in V1.**

## Subscription model (working prices; single config source)
| Plan | Price | Countries | Adds |
|------|-------|-----------|------|
| Free | $0 | 1 | core calendar, main events, manual campaigns, basic reminders, limited saved |
| Starter | $10 | 2 | more categories/capacity, basic history, duplication, expanded reminders |
| Growth | $20 | 3 | longer history, plan 8 months ahead, more saved, better filters, expanded memory |
| VIP | $50 | ∞ | all countries, plan 12+ months, advanced history, yearly recurring workflows, advanced templates, multiple strategies, approved automations |

Principle: users upgrade because needs grow, not because free is crippled. Prices remain working
until billing/competitor/unit-economics/beta review.

## Plan enforcement & storage
Control active country count, planning horizon, saved-campaign limits, history retention, template
access, automation access. Don't delete data on downgrade — make excess read-only, explain, apply a
retention policy. Enforce on the server. Store numeric limits in plan config, not duplicated in code.

## Technical build principles
Independent, testable modules; each clear/reusable/easy to modify/test/expand. Frontend: React +
TypeScript + Tailwind. Backend must provide secure auth, tenant separation by store/account, DB
access controls, subscription/feature checks, audit-friendly campaign data, admin management.
Provider finalized at architecture; security + tenant isolation mandatory. Modules: app shell,
auth, dashboard, calendar, countries, events, campaigns, campaign memory, billing, notifications,
settings, admin, Shopify integration.

## Core data model (expected entities)
Users · Shopify stores · Subscriptions · Plans · Plan entitlements · Countries · Event categories ·
Global events · Event-country assignments · Campaigns · Campaign products/collections · Campaign
reminders · Campaign history/versions · Templates (if enabled) · Admin users/roles.
Rules: every merchant record linked to the correct store; global events platform-owned; merchant
campaigns private; reuse creates a new record/version; plan rules enforced server-side.

## Development phases
0. **Architecture & product lock** (scope, countries, entitlements, Shopify auth, schema, recurrence,
   wireframes) ← *current phase*
1. Foundation (app shell, auth, store/user records, DB, nav, design system)
2. Countries & events (records, categories, global DB, admin mgmt, filtering)
3. Calendar (year, month, day detail, indicators, filters)
4. Campaigns (form, detail, editing, status, product/collection attach)
5. Dashboard & memory (opportunities, active, prep-needed, history, duplicate/reuse)
6. Plans & billing (definitions, entitlement checks, limits, billing connection)
7. Notifications & settings (reminder rules, prep indicators, account/country settings, billing page)
8. Testing & beta (functional, permissions, plan-limit, tenant-isolation, Shopify install, responsive,
   error-state, onboarding)

## Definition of MVP completion
A real merchant can: install → secure access → choose allowed country → see opportunities → open
calendar → create campaign from event → attach products → save & edit → complete → return & reuse →
hit correct plan limits. Complete end-to-end flow with persistent, secure data — not just screens.

## Release plan
- **1.0** functional public MVP (dashboard, calendar, countries, events, campaigns, memory, plans,
  basic Shopify, settings, admin)
- **1.1** retention (better search/filters, organization, duplication, more countries, onboarding)
- **1.2** preparation intelligence (checklists, lead times, suggested steps, better reminders)
- **2.0** planning assistant (AI suggestions, automation, performance analysis, email/ads integrations,
  predictions, industry calendars, teams, multi-store mgmt) — only after validation

## Non-negotiable rules
1. Stay focused on marketing preparation + memory. 2. Global events are platform-managed. 3. Merchant
campaigns private to the store. 4. Store changes require clear approval. 5. Reuse preserves history.
6. Plan limits enforced server-side. 7. Quality > quantity for countries/events. 8. Advanced features
never delay MVP. 9. Mobile/tablet preserve desktop experience & design language. 10. Deliver a complete
working flow, not disconnected screens.

## Final definition
**Problem:** businesses forget selling opportunities, prepare late, lose prior campaign knowledge.
**Solution:** a Shopify-focused marketing calendar that surfaces opportunities, helps prepare
campaigns, and remembers strategies. **Core feature:** Campaign Memory. **Advantage:** stored business
context, not the calendar UI itself.
