# Promotion Builder (`PROMOTION_BUILDER.md`)

_Last updated: 2026-07-13._

The Promotion Builder is **the heart of Eventra**: it converts an opportunity into ready-to-publish marketing.

## Flow

```
Opportunity → Promotion Builder → Advertisement → Campaign → Publication
```

## Implementation

- Route: `apps/business/app/routes/app.promotion-builder.tsx` (nav: Planning → Promotion Builder).
- Deep link: `/app/promotion-builder?opp=<opportunityId>` preselects an opportunity (used by dashboard
  recommendations and the opportunities screen).
- Steps (a clean 6-step flow that maps the spec's 10 sub-steps):
  1. **Opportunity** — pick from the real scored opportunity set (or start blank).
  2. **Template** — start from a reusable structure or blank.
  3. **Products** — attach products/collections via the shared `ProductPicker`.
  4. **Offer & text** — name, offer, headline, subheadline, description, CTA, optional **Liquid** block.
  5. **Schedule** — country + start/end dates.
  6. **Preview & save** — live banner preview + summary; **Save draft** or **Save & schedule**.

## Persistence (honest)

The domain currently has **no dedicated `Promotion` table**. A promotion is saved as a real **campaign**
record (optimistic update + the existing `/app/data` server seam), with the extra marketing fields (headline,
subheadline, CTA, Liquid) captured in the campaign notes. When a Promotion schema is added later, **only the
save mapping changes** — the builder UI stays. No data is fabricated; empty steps stay empty and are explained.

## Concepts (per master spec)

- **Advertisement** = a single piece of marketing. **Campaign** = a container of advertisements.
- Modeling Promotions and Advertisements as **distinct entities** (separate from Campaign) requires a database
  schema change and is **backend work out of the current frontend/design phase** — documented, not faked.

## Tests

`test/components/builder-calendar.test.tsx` renders the builder, asserts the heading and the stepper
(Opportunity … Preview & save). Preview server serves `/app/promotion-builder` with HTTP 200.
