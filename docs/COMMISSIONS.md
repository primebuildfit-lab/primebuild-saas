# Eventra Commissions (`COMMISSIONS.md`)

> Phase 7, Bloque 11. Eventra may charge a **small 1%–2% commission** on eligible automated operations.
> **No real charges** are made in this phase — the engine only *models* amounts. Billing stays off until
> Brian authorizes it (`BILLING_TEST_MODE=true`).

## Authorized band (hard-clamped)

`COMMISSION_MIN_RATE = 1%`, `COMMISSION_MAX_RATE = 2%`. `clampRate()` forces any configured rate into
`[1%, 2%]`, so an out-of-band configuration can never produce an unauthorized charge. The DB enforces it too:
`rate numeric CHECK (rate between 0.010 and 0.020)`.

## Operations that may carry a commission

`automated_offer`, `recurring_campaign`, `premium_automation`. Nothing else. Commissions are only ever
attached to authorized, tracked operations.

## Modeling (`apps/admin/src/engine/commissions.ts`)

`computeCommission(baseMinor, rate)` → rounded minor units, clamped rate, 0 for non-positive base.
`modelCommission(...)` → a `CommissionRecord` with `status: "modeled"` — **never `"applied"`** without
authorized billing. Records are visible, explainable, configurable within the band, and auditable
(`platform_commissions` table).

## UI

`/commissions` shows modeled totals + a per-record table with company, operation, base, rate, amount, and a
clear "modeled — not charged" framing.

## Status

Engine + clamp + model: **built & tested** (`apps/admin/test/engine.test.ts`). Real Shopify Billing wiring:
not built (Brian-gated; no charges).
