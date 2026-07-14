# Eventra — Product Vision

_Last updated: 2026-07-13._

## What Eventra is

Eventra is **not** a calendar, a reminder app, Google Calendar, Outlook, or Notion Calendar.

Eventra is **the operating system that discovers, evaluates, organizes, prepares and reuses marketing
opportunities.** The calendar is only one visual representation of that information. **The product is the
opportunity.**

## What it solves

Companies rediscover the same marketing moments every year and start from zero each time. Eventra replaces
that with a memory-backed cycle:

```
Discover opportunity → Evaluate → Choose → Create promotion → Create campaign →
Generate content → Publish → Measure → Save learning → Reuse next year
```

If a screen does not help one of these steps, it should not exist.

## What the customer buys

Not a calendar — **marketing opportunities, time, knowledge, memory, and years of accumulated experience.**

## Who it's for

Business owners, marketing managers, small teams, medium companies, agencies. Optimize for **quick decisions**,
not complex configuration. Every screen answers *"what should I do now?"* — not *"what data do I have?"*.

## Design principles

Professional · premium · elegant · fast · commercial · useful — never overloaded, childish, or decorative.
Dark commercial identity (deep slate + indigo/violet). Every colour has meaning (see `DESIGN_SYSTEM.md`).

## Honesty rule (non-negotiable)

Eventra **never invents data**. No fake metrics, graphs, revenue, or history. When data does not exist yet,
show an honest state ("No promotions yet", "No analytics available yet — create campaigns to start collecting
data") with a clear next action.

## Module responsibilities (single-purpose)

- **Dashboard** — decision center: what to work on today.
- **Calendar** — annual heatmap of when to act.
- **Opportunities** — the centre: which opportunity to prioritize, with an explainable score.
- **Promotion Builder** — turn an opportunity into ready-to-publish marketing (`PROMOTION_BUILDER.md`).
- **Campaigns / Campaign Library** — organize advertisements; remember and reuse past work.
- **Content / Templates / Media** — the marketing knowledge base and reusable structures.
- **Analytics** — ask questions of real data (query builder), never fabricated charts.
- **Countries / Sources** — where to focus and where opportunities come from.
- **Team / Billing / Settings** — company administration.

## Status (2026-07-13)

Foundation of the vision is implemented: dark identity, opportunity-first navigation, decision-center
dashboard with country scope, annual calendar heatmap, and a working Promotion Builder. Several modules are
themed but not yet restructured to this vision — tracked in
`EVENTRA_BUSINESS_PRODUCT_REDESIGN_REPORT.md`.
