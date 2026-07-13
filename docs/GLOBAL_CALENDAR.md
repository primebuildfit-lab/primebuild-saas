# Eventra Global Calendar (`GLOBAL_CALENDAR.md`)

> Phase 7, Bloque 5/7. The Internal OS calendar is primarily **annual**, with a **four-year horizon**. It is
> a decision tool, not just a date list: visualize opportunities, compare offers, and rank by score.

## Views (planned)

Year (built), quarter, month, agenda, year-over-year comparison, density heatmap, 4-year timeline. Filters:
country, region, industry, audience, template, source, reliability, plan, status.

## Four-year horizon + certainty (`engine/occurrences.ts`)

Occurrences are computed from the anchor date + recurrence — **not stored per year** (Bloque 5 storage
optimization). Certainty is explicit and never inflated:

| Certainty | Meaning |
|-----------|---------|
| `confirmed` | officially published |
| `estimated` | inferred from recurrence, not yet published |
| `historical_projection` | projected from prior editions (future years) |
| `pending` | expected, unknown |

Only the anchor year keeps the offer's own certainty; generated future years are `historical_projection`.
`confirmedCount()` is what's safe to advertise. The UI labels projected dates as `estimated`/projection and
never shows them as confirmed.

## Scoring & ranking

Offers rank best-first by composite score (see `OFFER_ENGINE.md`), so the most valuable opportunities
surface first. Cancellations/changes surface on the calendar via the detection engine.

## Performance (Bloque 25)

The annual view computes occurrences for the selected year only (`horizonYears: 0` per year); it does not
pre-load four full years of detail. Server-side pagination/filtering apply when live.

## Status

Year view + ranking + certainty labels: **built** (`apps/admin/src/os/pages.tsx` GlobalCalendar) on dev
seed. Other views + live data: planned.
