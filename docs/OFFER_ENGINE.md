# Eventra Offer Engine (`OFFER_ENGINE.md`)

> Phase 7. The offer engine is Eventra's core platform asset: global marketing opportunities discovered,
> scored, and maintained by Eventra, offered to business customers by plan. Pure logic lives in
> `apps/admin/src/engine/*` (fully unit-tested); persistence in `supabase/migrations/0004_internal_os.sql`.

## Pipeline

```
Sources → discover → dedupe (AI) → classify (AI) → score → verify (human) → publish (by plan)
                                                        ↑                          ↓
                                          periodic re-verification ← change/cancellation detection
```

## Sources (`engine/types.ts` `OfferSource`)

Legal/authorized only — **no scraping that violates terms of service**. Methods: `manual`, `api`, `feed`,
`public_calendar`, `collaborator`, `ai`, `import`. Each has status, reliability (0..1), frequency, last/next
sync, error count.

## Offers (`engine/types.ts` `Offer`)

Fields: title/description/category/industry/country/region/city/audience, start/end date, recurring,
source, status, certainty, reliability, score, eligible plans, verification timestamps, content hash.

**Statuses:** discovered → pending_review → verified → active → modified → cancelled → expired → archived
(also rejected, duplicate).

## Scoring (`engine/scoring.ts`)

Transparent, deterministic composite (0..100) from seven factors — positives add, penalties subtract:

`22·reliability + 22·relevance + 18·reach + 22·commercialPotential − 8·difficulty − 8·competition − 8·risk`

Priority bands: ≥80 critical, ≥60 high, ≥35 medium, else low. AI may *suggest* factors; the composite stays
a human-explainable formula. Manual overrides are flagged.

## Four-year horizon (`engine/occurrences.ts`) — see `GLOBAL_CALENDAR.md`

Recurring offers are **expanded on read** (no redundant stored rows). Only the anchor year keeps the offer's
own certainty; projected future years are `historical_projection` — **never presented as confirmed**.
Certainty ladder: `confirmed` > `estimated` > `historical_projection` > `pending`.

## Change & cancellation detection (`engine/changeDetection.ts`)

`detectOfferChange(prev, next)` → `{ changed, cancelled, fields, impact }`. Cancellation = critical; date
change = major; other watched-field change = minor. `isAlertable` (major/critical) drives alerts to Home,
Calendar, Offer, Notifications, and affected companies. Real source polling is a job (mock now).

## AI — see `AI_ENGINE.md`

Classify, dedupe, score-suggest, summarize, translate, detect-change, content-suggest — all through the
port, deterministic fake today. Low-confidence output **requires human review** and can never auto-publish.

## Plan eligibility

Which offers a company can access depends on its plan (canonical `@eventra/config`). The UI must explain why
an offer is locked and which plan unlocks it (Bloque 20). No permissions hardcoded in components.

## Status

Engines + scoring + horizon + cancellation + AI port: **built and tested** (`apps/admin/test/engine.test.ts`).
Admin UI: Offers/Sources/Calendar screens on dev seed. Live persistence (0004/0005) is designed, **not
provisioned** — connects with Supabase credentials (Brian-gated).
