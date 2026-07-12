# Eventra Consumer — Product Architecture (PROPOSED)

> Consumer-facing commercial calendar (Android/Google Play first, also web PWA). Shares the platform
> backend (`PLATFORM_ARCHITECTURE.md`). **Proposed — awaiting approval.** No implementation here.

## 1. Purpose & value
Help shoppers **know when to buy**:
- show important commercial dates (official events + seasonal windows);
- indicate when better prices / sales are likely (from the curated calendar + historical patterns —
  *deterministic*, not AI predictions in V1);
- let consumers **follow companies and categories** they care about;
- deliver **verified official-sale notifications** (admin-verified promotions — see
  `PLATFORM_ARCHITECTURE.md §7`);
- show **advertising** on the free tier (removed on paid tiers).

Not a personal to-do calendar; not a coupon-scraper. The differentiator is **trustworthy, verified**
sale timing.

## 2. Users & roles (consumer side)
| Role | Description |
|------|-------------|
| Guest | Browses the public commercial calendar (limited); no follows/alerts. |
| Consumer (Free) | Registered shopper; general calendar, basic notifications, sees ads. |
| Consumer (Ad-Free) | Paid; same features, no ads. |
| Consumer (Verified Deals) | Paid; no ads + verified-promo alerts + company/category selection + priority configurable alerts. |

Consumer accounts are **individuals**, entirely separate from Business orgs and Admins
(`PLATFORM_ARCHITECTURE.md §11`).

## 3. Plans & entitlements (PROPOSED — prices are approved inputs; entitlements need sign-off)
Prices are given (do not change): **Free $0**, **Ad-Free $15/mo**, **Verified Deals $30/mo**. The $30
tier **includes** ad removal. These are **separate** from Business plans.

| Capability | Free ($0) | Ad-Free ($15) | Verified Deals ($30) |
|-----------|:--------:|:-------------:|:--------------------:|
| General commercial calendar | ✓ | ✓ | ✓ |
| Basic notifications (major dates) | ✓ | ✓ | ✓ |
| Advertising shown | ✓ | — | — |
| Follow companies | proposed: limited (e.g. 3) | proposed: extended (e.g. 20) | ✓ unlimited |
| Follow categories | proposed: limited | proposed: extended | ✓ unlimited |
| Verified official-promo alerts | — | — | ✓ |
| Priority / configurable alerts (lead time, channels, quiet hours) | — | basic | ✓ full |
| Alert delivery channels | push | push | push (+ email later) |
| Region/country selection | 1 | proposed: multiple | multiple |

**Open business decisions (flagged):** exact follow limits per tier; whether Ad-Free gets any verified
alerts (proposed: no — verified alerts are the $30 differentiator); email channel timing; annual pricing.

## 4. Consumer notifications
Consumers receive: (a) **calendar reminders** for upcoming commercial dates (basic, all tiers);
(b) **verified-deal alerts** when an admin-verified promotion matches a followed company/category
(Verified Deals tier only). Alert configuration (lead time, quiet hours, per-follow toggles) scales by
tier. Delivery uses the shared notification service (`PLATFORM_ARCHITECTURE.md §8`).

## 5. Following model
- **Companies:** consumers follow businesses (which may or may not be Eventra Business customers). A
  followed company that is also a Business customer can surface its **verified** promotions.
- **Categories:** consumers follow commercial categories (e.g. electronics, fashion) to get relevant
  date/deal alerts without following individual companies.
- Follows are private to the consumer account.

## 6. Consumer route / page map (PROPOSED)
Mobile-first (Android/PWA); the same routes render responsively on web.
```
/                     Onboarding / value intro (guest)
/auth/*               Sign up / sign in (consumer identity)
/calendar             Commercial calendar (month/upcoming); default home after login
/calendar/:date       Day detail — events + likely-sale indicators + any verified deals
/discover             Browse companies & categories to follow
/companies/:id        Company page — upcoming/verified deals, follow toggle
/categories/:slug     Category page — relevant dates/deals, follow toggle
/following            Managed follows (companies + categories)
/alerts               Notification inbox (calendar reminders + verified-deal alerts)
/alerts/settings      Alert preferences (lead time, quiet hours, per-follow) [tiered]
/deals                Verified deals feed [Verified Deals tier]
/account              Profile, region, notification channels
/account/subscription Plan + upgrade/downgrade (Free / Ad-Free / Verified Deals)
/upgrade              Paywall / plan comparison (also triggered contextually)
```
Ads render as designated slots on `/calendar`, `/discover`, `/companies/:id` for Free users only.

## 7. Data (consumer slice — see full model in PLATFORM_ARCHITECTURE.md §10–11)
`consumer_accounts`, `consumer_subscriptions`, `follows (company|category)`, `alert_preferences`,
`notification_deliveries`, `saved_dates`. All keyed to `consumer_account_id`; RLS scopes every row to
its owner. Consumers never see Business-private data (campaigns, memory) — only **published/verified**
company deals.

## 8. Reuse from current codebase
The calendar/date engine (`lib/events.ts`, `lib/planning.ts`, `lib/calendar.ts`, `lib/dates.ts`), the
global-events catalog, importance colors, the design system + UI primitives, and calendar UI patterns
transfer directly. Consumer adds: follows, ads slots, verified-deal feed, consumer auth/onboarding, and
push notifications.
