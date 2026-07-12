# Eventra — Entitlement Engine (APPROVED design)

> One engine resolves *what a principal can do* from their subscriptions, add-ons, trials, admin grants,
> and grace/downgrade state. Access rules are **never** hardcoded across UIs. **No implementation.**
> Prices/limits come from **one configurable source** (`config` package, Admin-editable —
> `ADMIN_CONFIGURATION.md`). Related: `CONSUMER_PLANS.md`, `BUSINESS_PLANS.md`,
> `TRIALS_AND_DOWNGRADES.md`, `BILLING_ARCHITECTURE.md`.

## 1. Core idea
`Entitlements = resolve(principal, subscriptions, addOns, trials, grants, state)`.
The engine returns a typed **EntitlementSet**: booleans (features), numeric limits, horizon limits, and
resource read-only markers. UI **displays** from it; the server **enforces** from it. One implementation,
shared by Consumer, Business, and Admin surfaces.

## 2. Entitlement identifiers
**Features (boolean):**
```
consumer.core                 consumer.deal_intelligence
consumer.company_follow       consumer.offer_notifications
addon.ad_free                 ads.suppressed            # derived: = addon.ad_free
business.manual_calendar      business.event_catalog.main   business.event_catalog.broad
business.suggestions          business.memory.basic     business.memory.advanced
business.templates            business.custom_dates     business.supplier_intel
business.competitor_intel     business.consumer_promo   business.storefront_widgets
business.multi_strategy       business.analytics.standard
```
**Limits (numeric; null = unlimited):**
```
consumer.country_limit        consumer.follow_limit
business.workspace_limit      business.country_limit    business.horizon_years
business.saved_campaign_limit business.history_years
```

## 3. Consumer resolution (two independent axes)
```
intelligence = trial.active ? "deal_intelligence"
             : sub("consumer.deal_intelligence") ? "deal_intelligence" : "core"
adFree       = addon.ad_free.active            # INDEPENDENT of intelligence
ads.suppressed = adFree                        # $30 alone does NOT suppress ads
```
| Resulting state | intelligence | adFree | features | ads |
|-----------------|-------------|:------:|----------|:---:|
| A ($0) | core | no | core calendar only | shown |
| B ($15) | core | yes | core calendar only | hidden |
| C ($30) | deal_intelligence | no | +follow/monitor/notify | **shown** |
| D ($45) | deal_intelligence | yes | +follow/monitor/notify | hidden |
The trial sets `intelligence=deal_intelligence` for 30 days **without** touching `adFree`.

## 4. Business resolution
```
plan = trial.active ? "pro" : sub("business.*")?.plan ?? "free"
limits = CONFIG.business[plan]            # workspace/country/horizon/etc.
readOnlyResources = downgrade.computeExcess(org, limits)   # never deleted
```
Plan → EntitlementSet from config (`BUSINESS_PLANS.md §1`). Excess workspaces/countries/future-data
beyond the current plan's limits are marked **read-only** (not removed).

## 5. Plan / add-on → entitlement mapping (config-driven excerpt)
```
consumer.core              → { consumer.core, country_limit:1, follow_limit:0 }
consumer.deal_intelligence → { consumer.core, consumer.deal_intelligence,
                               consumer.company_follow, consumer.offer_notifications,
                               country_limit:3, follow_limit:CONFIG.fairUse.follow }
addon.ad_free              → { addon.ad_free }           # orthogonal
business.free    → { manual_calendar, workspace_limit:1, country_limit:0, horizon_years:0 }
business.starter → { +event_catalog.main, suggestions, memory.basic, templates:false,
                     workspace_limit:2, country_limit:1, horizon_years:1 }
business.growth  → { +event_catalog.broad, custom_dates, memory.advanced, templates,
                     supplier_intel, competitor_intel, workspace_limit:3, country_limit:null,
                     horizon_years:4 }
business.pro     → { +consumer_promo, storefront_widgets, multi_strategy, analytics.standard,
                     workspace_limit:null, country_limit:null, horizon_years:10 }
```

## 6. Grants, grace & temporary access
- **Admin grant:** a time-boxed entitlement (e.g., comp a business promo, extend a trial). Recorded with
  actor + reason + expiry; audited; resolves like any source.
- **Grace / read-only:** on expiry/downgrade, the engine returns features but marks affected resources
  read-only; writes are blocked server-side. Never deletes.
- **Restored purchase:** re-resolving after a verified purchase clears read-only markers and re-enables
  writes (idempotent; `BILLING_ARCHITECTURE.md`).
- **Temporary promotional access:** same as admin grant with an expiry.

## 7. Enforcement points
- **Server (authoritative):** every loader/action/API checks the EntitlementSet before read/write; limit
  checks (workspace/country/horizon/follow) run server-side; ad-serving checks `ads.suppressed`.
- **Client (display only):** disable/upsell UI from the same EntitlementSet — never the source of truth.
- **Jobs/workers:** notification/monitoring jobs check entitlements before acting (e.g., only DI users
  get offer notifications; only Pro orgs get consumer-promo exposure).

## 8. Audit
Entitlement changes (subscribe, add-on toggle, trial start/convert/expire, grant, downgrade, restore)
emit `BillingEvent` + `AuditLog` records with source, before/after, actor, timestamp. The current
EntitlementSet is derivable and reproducible from these events (reconciliation).

## 9. Single source of truth
All prices, limits, horizons, and plan→entitlement maps live in the **`config`** package
(`REPOSITORY_ARCHITECTURE.md`), Admin-editable where a commercial rule may change
(`ADMIN_CONFIGURATION.md`). No duplication across `apps/consumer|business|admin`.

## 10. Open decisions
Fair-use follow limit; DI multi-country count; exact business saved-campaign/history caps; whether any
entitlement is annual-plan-specific (future yearly plans).
