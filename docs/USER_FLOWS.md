# Eventra — User Flows / Journeys (PROPOSED)

> End-to-end journeys for the three principals, from first visit through subscription, long-term use,
> cancellation, and return. **Proposed — awaiting approval.** Ties together `CONSUMER_PRODUCT.md`,
> `BUSINESS_PRODUCT.md`, `ADMIN_CONSOLE.md`, `MONETIZATION.md`.

## 1. Consumer journey
```
First visit (web/app)
  └─ Value intro → pick region → browse calendar as GUEST (limited)
Activation
  └─ Follow a company/category → prompted to SIGN UP (email/OAuth) → Free account
Engagement (Free)
  └─ Daily: check calendar + upcoming; basic reminders; sees ads
  └─ Tries to enable a verified-deal alert → UPSELL to Verified Deals ($30)
Conversion
  └─ Upgrade: Ad-Free ($15, remove ads) or Verified Deals ($30, alerts + unlimited follows)
  └─ Billing via store (Play/App Store) or web PSP → tier active immediately
Long-term
  └─ Verified-deal alerts on followed companies/categories; manage follows; adjust alert prefs;
     wishlist flags (future); widgets (future)
Downgrade / cancel
  └─ Downgrade to Free (ads return; verified alerts stop) or cancel → account retained; follows kept
Return
  └─ Re-open app or re-subscribe → follows, region, read-state, and history preserved
```
Key upsell moments: enabling verified alerts, hitting the follow limit, removing ads.

## 2. Business journey
```
First contact
  └─ (a) Shopify App Store / store install  OR  (b) eventra web sign-up  OR  (c) other-platform install
Onboarding
  └─ Create Org (name, country, type) → "How do you sell?" → connect integration OR "none/physical"
  └─ 45-day FULL Business-Pro TRIAL starts (no card required to start)
First value (trial)
  └─ Dashboard shows upcoming opportunities → open an event → create first campaign → save
  └─ Explore calendar (drag campaigns), countries, templates, campaign memory
Habit
  └─ Prep reminders (30/14/7/1); reuse past campaigns for the next season (memory); submit a
     verified deal (Growth+ equivalent during trial)
Trial end (day 45)
  └─ Prompted to choose Starter $15 / Growth $30 / Business Pro $45
  └─ If chosen → active on that plan (limits apply; excess read-only, never deleted)
  └─ If NOT chosen → READ-ONLY GRACE (all data viewable, edits blocked, upgrade prompt)
Long-term
  └─ Season-over-season planning + memory; add markets/integrations as they grow → upgrade tiers
Downgrade / cancel
  └─ Downgrade → excess campaigns/markets become read-only (retained); cancel → data retained per policy
Return / upgrade
  └─ Re-subscribe or upgrade → read-only data becomes editable again (restoration)
```
Multi-platform note: the journey is identical regardless of integration; only the "connect" step
differs (Shopify session vs Woo/Wix/Squarespace OAuth vs manual).

## 3. Administrator journey
```
Access
  └─ Internal SSO + MFA → Admin Console (role-scoped); no store/consumer identity
Daily operations
  └─ Overview (KPIs, health, trials ending, deal queue) → triage
  └─ Verified Deals: review queue → verify/reject against sources (confidence-gated)
  └─ Trials/Revenue: watch conversions/cancellations; extend/assist
  └─ Support/Moderation: resolve tickets, act on reports
Platform management
  └─ Calendar/Countries/Categories: curate the shared catalog
  └─ Advertising: manage advertisers/campaigns (incl. PrimeBuild), scheduling, reporting
  └─ Companies: maintain registry + monitored set + sources
Governance
  └─ Users/Subscriptions/Billing: account + money ops (audited)
  └─ Security/Permissions/Feature Flags/Versions/Config: platform controls (Superadmin)
Everything is audit-logged; destructive/sensitive actions confirm (some need 2nd-admin approval)
```

## 4. Cross-product interaction flows
- **Verified deal, end-to-end:** Business submits promo → Admin verifies (queue) → published →
  Consumers (Verified tier, matching follow + country) get alerted → click-through to company/deal.
- **Advertising:** Admin schedules a PrimeBuild (or other) campaign → served to Consumer Free users in
  targeted country/category → CTR/impressions reported back to Admin.
- **Trial → paid → downgrade → restore:** Business lifecycle above, with retention guarantees enforced
  server-side (`PLAN_ENFORCEMENT.md`).

## 5. Failure / edge journeys
- **Consumer offline:** cached calendar + follows viewable; actions queue and sync on reconnect.
- **Business integration disconnects:** planner keeps working (manual product list); Admin sees the
  integration health drop and can prompt reauthorization.
- **Deal turns out false:** consumer reports → moderation → admin unpublishes → optional correction
  notice; submitter reputation adjusts.
- **Payment fails:** dunning (future billing) → grace/read-only, never data deletion.
