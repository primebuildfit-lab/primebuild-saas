# Eventra Business — Product Architecture (PROPOSED)

> The existing campaign-planning + campaign-memory product, **generalized beyond Shopify**. Shopify is
> now one integration among several. **Proposed — awaiting approval.** No implementation here.
> The current mock UI (dashboard, calendar, events, campaigns, memory, templates, countries, settings,
> analytics, admin-of-catalog) becomes the Business web surface.

## 1. Purpose (unchanged core)
Help businesses find commercial opportunities, prepare campaigns early, and **reuse what worked**
(campaign memory). Core promise and the four questions are unchanged. What changes: the **audience**
(any business, integrated or not) and the **plan/trial model**.

## 2. Users & roles
| Role | Description |
|------|-------------|
| Business owner | Creates the business org on signup; full access; manages subscription. |
| Business staff | (Post-MVP) invited member of an org with scoped permissions. |
| — | Platform admins are **not** business users; they live in the Admin Console. |

A **Business org** is the tenant (was "store"). A store/site connection is an *attribute* of the org,
not its identity — so businesses **without** any integration are first-class.

## 3. Plans & entitlements (PROPOSED — prices approved; entitlements need sign-off)
Approved prices (do not change): **Starter $15/mo**, **Growth $30/mo**, **Business Pro $45/mo**. There is
**no free business tier** — the entry experience is the **45-day trial** (§4). Old business plans
(Free/Starter $10/Growth $20/VIP $50) are **superseded** (see `DECISIONS.md`).

| Entitlement | Starter ($15) | Growth ($30) | Business Pro ($45) |
|-------------|:-------------:|:------------:|:------------------:|
| Countries / markets | 2 | 3 | Unlimited |
| Saved campaigns | 25 | 150 | Unlimited |
| Planning horizon | 4 months | 8 months | 12+ months |
| Campaign memory / history | basic | extended | full + versioned |
| Templates | basic duplication | full | advanced |
| Commerce integrations connected | 1 | up to 3 | unlimited |
| Submit **verified deals** to Consumer | — (proposed) | ✓ | ✓ priority review |
| Team members | 1 | proposed: 3 | proposed: more |
| Analytics | light | standard | advanced |

**Open business decisions (flagged):** exact numeric caps; whether Starter can submit verified deals;
team-member counts (teams are otherwise post-MVP); annual pricing; whether "integrations connected"
should be a limit at all for a planning-first product.

Enforcement rules (unchanged, `PLAN_ENFORCEMENT.md`): limits enforced server-side; downgrades never
delete data — excess becomes **read-only** and restores on upgrade. Single plan-config source.

## 4. Trial lifecycle (NEW)
- Every **new business org** starts a **45-day full Business Pro** trial — no plan chosen up front.
- During the trial: full Business Pro entitlements; a persistent "X days left" indicator; no card
  required to start (payment collection timing is an open billing decision).
- **At trial end**, the org must select a paid plan (Starter/Growth/Business Pro).
- If none is selected, the org enters a **read-only "grace" state**: all data retained and viewable,
  edits/creates blocked, with an upgrade prompt — mirroring the downgrade-retention rule (never delete).
- Selecting a plan restores editing (subject to that plan's limits; excess stays read-only per
  `PLAN_ENFORCEMENT.md`).

States: `trialing → active(plan) | grace(expired) → active(plan)`; plus `past_due`/`canceled` from
billing. Trial start/end, conversions, and cancellations are surfaced in the Admin Console.

## 5. Platform detection & onboarding (integrations as adapters)
Business does **not** require a store connection. Onboarding:
1. Create org (name, country/countries, business type).
2. Ask "How do you sell?" → choose an integration, or **"No integration / physical / other"**.
3. Connect (if applicable) via that platform's adapter; otherwise proceed straight to the planner.

Adapters implement a common **CommerceConnection** interface (`PLATFORM_ARCHITECTURE.md §9`):

| Platform | Mechanism | Reads (min scope) |
|----------|-----------|-------------------|
| **Shopify** | Embedded app + App Bridge session tokens (existing) | products/collections (`read_products`) |
| **WooCommerce** | WordPress plugin + REST API keys (or OAuth) | products |
| **Wix** | Wix OAuth app | products |
| **Squarespace** | OAuth / API | products |
| **Custom ecommerce** | API keys + webhooks, or manual | optional |
| **Physical / none** | No connection; manual business profile | — |

Product/collection attachment on campaigns uses the connected adapter when present; otherwise a manual
list (the current mock-catalog UX generalizes to "manual products"). Core planning/memory works
identically with or without an integration.

## 6. Business route / page map (PROPOSED)
The existing `/app/*` surface is **rescoped to Business** and rooted for multi-platform (not only
Shopify embedded). Proposed structure:
```
/business/onboarding            Org creation + integration choice (new)
/business                        Dashboard (existing app._index)
/business/calendar               Year/Month/Day (existing)
/business/events                 Official catalog + Event Creator + hide/restore (existing)
/business/countries              Market selection (existing; plan-limited)
/business/campaigns[/:id][/new]  Campaigns CRUD + memory (existing; nested routes per ROUTING.md)
/business/campaign-library       Memory/history (existing)
/business/templates              Templates (existing)
/business/deals                  Submit/track verified deals for Consumer (NEW) [Growth+]
/business/integrations           Connect/manage commerce platform(s) (NEW)
/business/analytics              Light analytics (existing)
/business/billing                Plan + trial status + upgrade/downgrade (existing UI, real billing P5+)
/business/settings               Account, calendar, appearance, notifications (existing)
```
The Shopify embedded entry (`/app`) remains as a thin host that mounts the Business surface inside
Shopify Admin; non-Shopify businesses use the same surface at `/business` after their own auth.

## 7. Reuse from current codebase
Nearly all current Business work carries forward: design system + UI primitives, `DataContext` domains,
calendar/date engine, domain types, mock data patterns, plan-limit + downgrade-retention logic, the
Phase-5 Supabase business schema + server foundation (`app/db/*`) — which becomes the **Business slice**
of the platform schema. Main additions: multi-platform adapters, org-based tenancy (was store-based),
trial lifecycle, and the verified-deal submission surface.
