# Eventra — Plan Limits, Downgrade & Retention Specification

> Technical spec for enforcing plan entitlements. Uses the **approved** plan names/prices/limits
> (D9) — this document invents no new plans or prices. Mock-layer behavior is implemented where
> noted; the server-side enforcement points are the Phase-5 contract.
> Source: `app/data/mockPlans.ts` (single source of truth), `app/lib/planEntitlements.ts`,
> `app/lib/planLimits.ts`. Tests: `test/lib/planEntitlements.test.ts`, `test/lib/planLimits.test.ts`.

## 1. The limits (single config source — `mockPlans.ts`)
| Plan | Price | Countries | Planning horizon | Saved campaigns |
|------|-------|-----------|------------------|-----------------|
| Free | $0/mo | 1 | 2 months | 5 |
| Starter | $10/mo | 2 | 4 months | 20 |
| Growth | $20/mo | 3 | 8 months | 100 |
| VIP | $50/mo | Unlimited | 12 months | Unlimited |

`null` = unlimited. Prices/limits are **working values** (D9); never hardcode them elsewhere.

## 2. Entitlement predicates (implemented, tested)
- `canAddCountry(plan, currentCount)` / `countryLimitReached(...)`
- `canSaveCampaign(plan, currentCount)` / `savedCampaignLimitReached(...)`
- `withinPlanningHorizon(dateISO, plan, from)` / `planningHorizonEnd(plan, from)`

## 3. Excess-data identification & retention (D16 — never delete)
On downgrade, data is **never deleted**; excess becomes **read-only** and is restored on upgrade.

**Retention policy (deterministic):** within each limited resource, the most-recently-updated records
up to the limit stay **editable**; everything beyond the limit is **read-only**.

- Campaigns — `readOnlyCampaignIds(campaigns, plan)`: newest `savedCampaignLimit` editable; older
  excess read-only. **Implemented in the mock UI:** read-only campaigns show a "Read-only" badge in the
  list and, in the detail drawer, a banner + disabled Edit / status / action-checklist controls and an
  Upgrade link. Delete stays available (the merchant may still remove their own data).
- Countries — `overLimitCountryCodes(enabledCodes, plan)`: enabled markets beyond the cap are "over
  plan." The merchant is **not** auto-disabled; the Countries screen blocks enabling more and explains
  which to turn off to get back under the cap. (Identification implemented + tested; full per-row
  read-only UI is a near-term follow-up.)
- Planning horizon — dates beyond `planningHorizonEnd` are out of plan. (Predicate implemented + tested;
  wire into the campaign/event date fields as a soft validation next.)

**Restoration on upgrade:** because nothing is deleted, raising the plan simply widens the limit and the
previously-excess records become editable again — no data migration.

## 4. Expected UI messages (approved copy patterns)
- At limit, creating: _"You’ve reached your {Plan}’s saved-campaign limit. Existing campaigns stay
  editable, but you’ll need to upgrade to save more."_ + **Upgrade** → `/app/billing`.
- Read-only record: _"This campaign is read-only because it’s over your {Plan} plan’s saved-campaign
  limit. Your data is kept safe — upgrade to edit it again."_
- Countries over cap: _"You have more countries enabled than your current plan allows. Existing
  countries stay active, but you can’t add more until you upgrade."_
- Never imply data loss; always state data is retained.

## 5. Server-side enforcement points (Phase 5 — the real gate)
UI checks are convenience only. In Phase 5, enforce in React Router **actions** before any write, and as
defense-in-depth in Supabase:

| Action | Server check |
|--------|--------------|
| Enable country | reject if `countryLimitReached(plan, enabledCount)` |
| Create/duplicate campaign | reject if `savedCampaignLimitReached(plan, count)` |
| Edit campaign | reject if the record is in the read-only excess set for the current plan |
| Set campaign date / event date | reject if `!withinPlanningHorizon(date, plan)` |
| Read excess | still readable (retention) — never hard-deleted |

- Resolve the plan from the store's `subscription` server-side (never from the client).
- Optionally enforce hard caps with a Postgres trigger / RLS `WITH CHECK` as a second gate.
- Billing state (active/past_due/canceled) gates entitlements: `past_due`/`canceled` fall back to Free
  limits while retaining data read-only.

## 6. Test coverage
`planEntitlements.test.ts` (limits + config integrity, no "Pro"/"Advanced") and `planLimits.test.ts`
(retention set, country excess, horizon) cover the predicates. Phase 5 adds action-level enforcement
tests + a downgrade→read-only→upgrade→restore integration test.
