# Eventra — Monetization (PROPOSED)

> Single reference for all pricing, plans, advertising, verified-deal monetization, and the trial +
> billing model across the three products. Prices below are **approved inputs**; **entitlements are
> proposals** pending sign-off. **No billing is implemented** by this package.

## 1. Revenue streams
1. **Consumer subscriptions** — Ad-Free ($15), Verified Deals ($30).
2. **Business subscriptions** — Starter ($15), Growth ($30), Business Pro ($45).
3. **Advertising** — shown to Consumer Free users; advertisers include PrimeBuild and future third
   parties.
4. (Future) verified-deal placements / promoted companies — **not** in this scope; flagged only.

## 2. Consumer plans (approved prices)
| Plan | Price | Ads | Highlights |
|------|-------|-----|-----------|
| Free | $0/mo | Yes | General calendar, basic notifications |
| Ad-Free | $15/mo | No | Everything in Free, no ads |
| Verified Deals | $30/mo | No | Ad-free + verified-promo alerts + company/category selection + priority alerts |
Entitlement detail + open decisions: `CONSUMER_PRODUCT.md §3`.

## 3. Business plans (approved prices; supersede old Free/Starter$10/Growth$20/VIP$50)
| Plan | Price | Highlights (proposed) |
|------|-------|-----------------------|
| Starter | $15/mo | 2 markets, 25 saved campaigns, 4-mo horizon, 1 integration |
| Growth | $30/mo | 3 markets, 150 saved, 8-mo horizon, up to 3 integrations, verified-deal submission |
| Business Pro | $45/mo | Unlimited markets/campaigns, 12+-mo horizon, unlimited integrations, advanced templates |
No free business tier — entry is the **45-day trial**. Entitlement detail + open decisions:
`BUSINESS_PRODUCT.md §3`.

## 4. Trial & downgrade model (business)
- New business org → **45 days full Business Pro**, no plan pre-selected.
- Trial end → must select a paid plan; if not, **read-only grace** (data retained, edits blocked).
- Downgrades / expiry never delete data: excess becomes **read-only**, restores on upgrade
  (`PLAN_ENFORCEMENT.md`). This is already implemented for campaigns in the mock layer and extends to
  the trial-grace state.
- Consumer plans have no trial in this proposal (open decision: introductory Ad-Free trial?).

## 5. Advertising architecture (PROPOSED — no ad network wired)
- **Where:** designated slots in Eventra Consumer for **Free** users only; suppressed for Ad-Free and
  Verified Deals. Never in Business or Admin surfaces.
- **Who:** advertisers are platform records managed in the Admin Console (`/admin/ads/*`). **PrimeBuild
  is one advertiser record** — not hardcoded, not privileged in code.
- **What (V1 proposal):** first-party, admin-managed **house ads / sponsored placements** (image +
  link + targeting by country/category), served from our own ad domain — **no third-party ad-network
  SDK** at launch (avoids privacy/SDK complexity and keeps the Play listing clean). Third-party
  networks are a later, explicitly-approved step.
- **Model:** house/direct-sold placements (flat or CPM booked by admins); reporting in `/admin/ads`.
- **Data/consent:** ad targeting uses only country/category + follows the user already set; a consent/
  privacy flow is required for the Android release (open compliance decision).

## 6. Verified deals (trust product, ties Business ↔ Consumer)
- Businesses (Growth+) **submit** official promotions; admins **verify** against approved sources
  (`PLATFORM_ARCHITECTURE.md §7`); verified deals drive **Verified Deals**-tier consumer alerts.
- Monetization: primarily makes the $30 consumer tier and Growth+ business tiers valuable. Paid
  promotion of verified deals is a **future** option, not in scope.

## 7. Billing model (PROPOSED — not implemented)
- **Business (Shopify):** Shopify Billing API for Shopify-integrated orgs.
- **Business (non-Shopify) & Consumer web:** a PSP (e.g. Stripe) for cards/subscriptions.
- **Consumer Android:** **Google Play Billing** is typically required for in-app digital subscriptions —
  a significant constraint (Play fees, mandated billing). **Open decision:** Play Billing vs web-based
  subscription (with Play policy implications). Must be resolved before the Android release.
- Plan definitions/limits live in **one config source** (as today with `mockPlans.ts`), extended to
  cover consumer + business families and read by both UI and server enforcement.
- **Nothing here is built.** Billing implementation is a later, approved phase.

## 8. Open monetization decisions (summary)
Consumer follow limits per tier; whether Ad-Free gets any verified alerts; business numeric caps;
Starter verified-deal access; team-member counts; annual pricing; consumer trial; **Play Billing vs web
billing**; ad consent/privacy model; PSP choice.
