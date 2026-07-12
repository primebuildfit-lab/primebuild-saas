# Eventra — Monetization (PROPOSED, complete)

> Single reference for all pricing, plans, advertising, trials, and future revenue lines across the
> three products. Prices are **approved inputs**; **entitlements are proposals** pending sign-off. **No
> billing is implemented.** Supersedes the shorter v3 draft (MEGA MODULE 1 expansion).

## 1. Revenue streams (now vs future)
| Stream | Status | Notes |
|--------|--------|-------|
| Consumer subscriptions | now (design) | Ad-Free $15, Verified Deals $30 |
| Business subscriptions | now (design) | Starter $15, Growth $30, Business Pro $45 |
| Advertising | now (design) | House/direct ads to Consumer Free (`ADVERTISING.md`) |
| Yearly plans | future | Discounted annual billing for all paid tiers |
| Enterprise / multi-brand | future | Large businesses, multi-org, SSO, SLA |
| Marketplace | future | Templates / services / partner offers |
| Affiliate | future | Referral revenue on outbound deals (with disclosure) |
| API monetization | future | Paid access to platform data/APIs for partners |

## 2. Consumer plans (approved prices)
| Plan | Price | Ads | Highlights |
|------|-------|-----|-----------|
| Free | $0/mo | Yes | General calendar, basic notifications |
| Ad-Free | $15/mo | No | Everything in Free, no ads |
| Verified Deals | $30/mo | No | Ad-free + verified alerts + company/category selection + priority alerts + unlimited follows |
Entitlement detail + open decisions: `CONSUMER_PRODUCT.md §5`.

## 3. Business plans (approved prices; supersede old Free/Starter$10/Growth$20/VIP$50)
| Plan | Price | Highlights (proposed) |
|------|-------|-----------------------|
| Starter | $15/mo | 2 markets, 25 saved campaigns, 4-mo horizon, 1 integration |
| Growth | $30/mo | 3 markets, 150 saved, 8-mo horizon, up to 3 integrations, verified-deal submission |
| Business Pro | $45/mo | Unlimited markets/campaigns, 12+-mo horizon, unlimited integrations, advanced templates/reports |
No free business tier — entry is the **45-day full-Pro trial**. Detail: `BUSINESS_PRODUCT.md §3, §18`.

## 4. Trials
- **Business:** 45 days full Business Pro, no plan pre-selected; countdown; at end → choose a plan or
  **read-only grace** (data retained). Restore on upgrade.
- **Consumer:** no trial in this proposal (open decision: introductory Ad-Free trial or 7-day Verified
  Deals trial to drive conversion).

## 5. Advertising (summary; full design in `ADVERTISING.md`)
House/direct-sold placements to **Consumer Free** users only; advertisers (incl. PrimeBuild) managed in
the Admin Console; priority + frequency caps + pacing; CTR/impression reporting. No third-party ad
network at launch. Paid tiers exclude ads server-side.

## 6. Upgrades & downgrades
- **Upgrade:** immediate entitlement raise; proration per billing provider; read-only excess becomes
  editable (restoration).
- **Downgrade:** never deletes data — excess (campaigns/markets/history) becomes **read-only** under the
  retention policy (`PLAN_ENFORCEMENT.md`; implemented for campaigns in the mock layer today).
- **Cancel:** access ends at period end; data retained per policy; re-subscribe restores editing.

## 7. Future yearly plans
Annual billing at a discount (e.g., ~2 months free) for every paid consumer + business tier. Requires
proration/renewal handling in billing. Design-only.

## 8. Future enterprise / multi-brand
For large businesses: multiple Orgs under one account, SSO, custom limits, SLA, priority support,
optional custom contracts/invoicing. Pricing bespoke. Design-only.

## 9. Future marketplace
A place to buy/sell campaign templates, seasonal playbooks, or partner services; Eventra takes a fee.
Requires seller onboarding, payouts, moderation. Design-only, later.

## 10. Future affiliate
Revenue share on outbound deal/company links (clearly disclosed, never compromising verified-deal
neutrality). Must not bias verification. Design-only.

## 11. Future API monetization
Paid, rate-limited API/data access for partners (calendar, verified deals feed) with keys, quotas, and
billing. Design-only; strong data-boundary + ToS requirements.

## 12. Billing model (PROPOSED — not implemented)
- **Business (Shopify Orgs):** Shopify Billing API.
- **Business (web/other-platform) & Consumer web:** a PSP (e.g. Stripe).
- **Consumer mobile:** **Google Play Billing / Apple StoreKit** are typically **required** for in-app
  digital subscriptions (store fees + mandated billing) — a major constraint. **Open decision:** store
  billing vs web billing (with policy implications).
- Plan definitions/limits live in **one config source** (as with `mockPlans.ts`), extended to consumer +
  business families and read by both UI and server enforcement.

## 13. Open monetization decisions (for Brian)
Exact entitlements per tier; consumer follow limits; whether Starter submits verified deals; team-member
counts; **yearly pricing**; consumer trial?; **store billing vs web billing** on mobile; PSP choice; ad
consent model; enterprise packaging; whether/when to pursue marketplace/affiliate/API lines.
