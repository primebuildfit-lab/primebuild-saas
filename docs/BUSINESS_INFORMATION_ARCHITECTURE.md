# Business Information Architecture (`BUSINESS_INFORMATION_ARCHITECTURE.md`)

_Established 2026-07-13 — the definitive Business (Nivel B) product reorganization. Supersedes the earlier
"calendar-first" Business layout. Business had been functionally frozen at Phase 6; this reorg was ordered
directly by the user (Brian), which is the highest source-of-truth priority (see `CLAUDE.md §1`)._

---

## 1. Why Eventra now revolves around Opportunities, not the Calendar

The first Business build presented Eventra as a calendar with campaigns attached. That framing undersold the
product: a calendar is a **rendering of dates the merchant already knows**. Eventra's real value is
**discovering, ranking, and remembering marketing opportunities the merchant would otherwise miss**.

So the product is re-centered on a single spine:

```
Opportunities → Campaigns → Content → Results → Memory → Reuse
```

- **Opportunities** is the primary surface. Every marketing moment for the store's enabled markets is
  surfaced, **scored (0–100)**, and given a lifecycle state, priority, difficulty, and reliability.
- **The Calendar becomes one lens** on that data — a tool inside the product, not the product. (The full
  annual-engine calendar is a separate, later effort; today's calendar remains functional.)
- Campaigns turn opportunities into plans; Content is the material; Analytics measures results; Templates +
  campaign memory enable reuse.

This is a reorganization of **experience, hierarchy, and priority** — not a restyle. Brand, palette, and
typography are unchanged (CLAUDE.md §3 / `DESIGN_SYSTEM.md`).

## 2. Navigation (definitive)

`apps/business/app/lib/nav.ts` defines four groups; labels stay in English to match the shipped product.

| Group | Items |
|-------|-------|
| **General** | Dashboard · Calendar · **Opportunities** · Campaigns · Content · Analytics |
| **Management** | Audiences · Templates · Media · Sources · Countries |
| **Operations** | Integrations · Automations · AI · Jobs |
| **Configuration** | Account · Team · Billing · Settings |
| _Platform_ | Admin (separate track; platform roles only) |

Existing routes that left the top level (Events catalog, Campaign Library) remain reachable via deep links
and inside their parent modules — nothing was deleted, so nothing breaks.

## 3. The Opportunity engine

`apps/business/app/lib/opportunities.ts` is a **pure, deterministic** engine so the dashboard, the
Opportunities screen, Countries, and Analytics all show the same numbers.

Each `ScoredOpportunity` combines, for a store:

- **Score (0–100)** = importance base + category weight + urgency (peaks inside the recommended prep window)
  + market reach, scaled by a **reliability** confidence factor.
- **Priority** — urgent / high / medium / low (urgent = in-window + strong score).
- **Difficulty** — easy / moderate / hard, from the recommended lead time.
- **Reliability** — 0–100 source/date confidence.
- **State (lifecycle)** — derived, **not invented**:
  - `cancelled` (dismissed) ← the store **hid** the event (real `StoreEventPreference.hidden`);
  - `archived` ← the occurrence has passed;
  - `new` / `modified` / `verified` ← the discovery **signal** overlay (see below), defaulting to
    `verified` because seed events come from Eventra's own verified calendar.
- **hasCampaign** ← a real campaign links this `globalEventId`.

### Discovery signals

`apps/business/app/data/mockOpportunitySignals.ts` is a typed `app/data` overlay (SOP §7) keyed by existing
`globalEvents` ids. It carries `source`, `reliability`, `discoveryState`, `firstSeen`, and `revisions`. It
**does not invent events** — events with no signal fall back to a high-reliability verified default. This is
the mock seam that Phase-5 real discovery feeds will replace without changing components.

## 4. Data & persistence stance

- **No new mutations were wired into the persistence seam.** The reorg is a presentation + read-model layer
  over the existing optimistic `DataIntent` → `/app/data` → repository pipeline. The LIVE Supabase project
  and its migrations are untouched, so there is **no schema/deploy/irreversible step** in this phase.
- New module data lives in dedicated typed `app/data/mock*.ts` files (Content, Media, Sources, Integrations,
  Automations+Jobs, AI, Team, Audiences), matching `app/types/domain.ts` conventions so a later phase can
  swap them for real reads. Demo-store data only — never PrimeBuild (CLAUDE.md §5).

## 5. Module status (this reorg)

| Module | State | Notes |
|--------|-------|-------|
| Dashboard | **Rebuilt** | Control center: 4 clickable `MetricCard`s (Countries, Opportunities, Campaigns, Plan) with sub-metrics, each a doorway into its module. |
| Opportunities | **New (flagship)** | Scored, sortable, state-filtered table; "Create campaign" reuses the campaign modal. |
| Analytics | **Rebuilt** | Report **builder** — pick dimension (X) + measure (Y) + period; series computed live. Architecture for deeper metrics. |
| Countries | **Enhanced** | Coverage + per-market opportunities/campaigns/score insights above the enable/disable manager. |
| Content, Media, Sources, Integrations, Automations, Jobs, AI, Team, Audiences | **New (architecture)** | Real, data-driven read surfaces on typed mocks; no live connections (CLAUDE.md §2). |
| Account | **New** | Identity + workspace + plan + security summary. |
| Calendar | **Preserved** | Kept functional as a tool; full annual-engine rebuild is a later effort. |
| Billing, Settings, Templates, Campaigns | **Preserved** | Continue to work; Settings 8-section split is a follow-up. |

## 6. Reusable components added

`components/ui`: `MetricCard`, `ScoreBadge`, `DataTable` (responsive, `overflow-x-auto`), `Toolbar`,
`FilterChips`. All modules compose these — no duplicated tables/toolbars. Responsive (desktop → tablet →
mobile) preserved; wide tables scroll within their own container.

## 7. Verification

typecheck ✅ · lint ✅ (0 errors) · tests ✅ **184** (150 prior + 34 new: opportunities, analyticsBuilder,
nav, Opportunities screen, module smoke) · build ✅ (180 modules).
