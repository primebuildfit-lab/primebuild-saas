# Eventra — Billing Architecture (provider-independent)

> A reusable **billing orchestration layer** that normalizes subscriptions from multiple providers into
> internal entitlements. **No provider selected, none provisioned, no card data stored.** Actual payment
> processing always uses **compliant licensed providers / official app-store billing** — Eventra never
> stores card data or acts as a processor. Related: `ENTITLEMENTS.md`, `PLATFORM_SCHEMA.md §7`,
> `TRIALS_AND_DOWNGRADES.md`.

## 1. Principle
Eventra owns the **orchestration** (map external purchases → internal entitlements, verify receipts,
maintain state, handle transitions, audit) but **delegates money movement** to licensed providers. The
same layer is reusable across Eventra products (and future Partnera products) **without mixing customer
data** (per-`BillingAccount` tenant isolation).

## 2. Providers supported (design targets)
- **Google Play Billing** (consumer Android)
- **Apple App Store / StoreKit** (consumer iOS, future)
- **Web subscriptions** via a licensed PSP (e.g., Stripe) — consumer web + non-Shopify business
- **Shopify Billing API** — Shopify-installed business orgs
- **Another licensed provider** for non-Shopify business as needed
No provider is assumed selected; each is an adapter behind `BillingProvider`.

## 3. Abstractions
```
BillingProvider            # adapter per provider: create/cancel/refund, parse webhooks, verify receipt
SubscriptionSource         # a normalized external subscription (provider, external_id, product, status)
EntitlementResolver        # maps SubscriptionSources + trials + grants → internal EntitlementSet
PurchaseVerifier           # validates receipts/tokens with the provider (server-side)
TrialManager               # trial eligibility, activation, reminders, expiry, anti-abuse
BillingWebhookProcessor    # idempotent ingest of provider events → BillingEvent → resolve → entitlements
```
`EntitlementResolver` feeds the **entitlement engine** (`ENTITLEMENTS.md`) — one resolution path for all
surfaces.

## 4. Purchase → entitlement flow
```
Purchase (any provider)
  → BillingWebhookProcessor receives event (or client reports receipt)
  → PurchaseVerifier validates with provider (server-side; never trust client claim)
  → upsert ExternalSubscription + PurchaseReceipt (idempotent by provider external_id/token)
  → EntitlementResolver recomputes Entitlement rows for the BillingAccount
  → entitlement engine returns the new EntitlementSet to the app (read-only markers cleared as needed)
  → BillingEvent + AuditLog recorded
```

## 5. Consumer independent add-on modeling (critical)
Ad-Free and Deal Intelligence are **separate SubscriptionSources** on the same `BillingAccount`:
| State | Sources active | Resolved | Ads |
|-------|----------------|----------|-----|
| $0 | none | core | shown |
| $15 | ad_free | core + ad_free | hidden |
| $30 | deal_intelligence | deal_intelligence | **shown** |
| $45 | deal_intelligence + ad_free | deal_intelligence + ad_free | hidden |
The resolver treats them orthogonally — **buying Deal Intelligence never creates an Ad-Free source.**
On mobile stores these are typically two separate in-app products/subscriptions.

## 6. Lifecycle handling
- **Trials:** `TrialManager` (consumer 30-day DI, business 45-day Pro) — one per (account, kind);
  reminders; expiry → downgrade path; no silent conversion. `TRIALS_AND_DOWNGRADES.md`.
- **Upgrades/downgrades:** proration per provider; entitlement recompute; downgrade marks excess
  **read-only** (never deletes); upgrade restores.
- **Failed payments:** provider webhook → `GracePeriod` (read-only) → dunning (future) → never delete.
- **Refunds/cancellations:** provider-driven; entitlement recompute at period end; history retained.
- **Restore purchases:** re-verify receipts with the provider → re-resolve (idempotent) → clear
  read-only. Essential for app-store reinstalls/new devices.
- **Duplicate-subscription protection:** unique (provider, external_id); if a user subscribes on two
  providers, resolver keeps the **entitlement** (union) but flags duplicate billing for admin/refund;
  never double-charges internally.
- **Cross-device/platform reconciliation:** entitlements resolve from server state keyed by
  `BillingAccount`, so any device on the same identity sees the same entitlements after sign-in.

## 7. Store-billing constraints (must resolve before mobile launch)
Google Play / Apple generally **mandate their billing** for in-app digital subscriptions (store fees +
rules). **Open decision:** store billing vs web billing (with policy implications) for consumer
subscriptions. Business (Shopify) uses Shopify Billing; web business uses the PSP. The orchestration
layer supports either — the decision is commercial/legal, not architectural.

## 8. Data isolation & reuse
Each `BillingAccount` maps to exactly one principal (consumer or org); receipts/subscriptions are
tenant-scoped and RLS-gated (`RLS_SECURITY_MODEL.md`). The layer is product-agnostic: a future product
reuses `BillingProvider`/`EntitlementResolver` with its own product/entitlement config and **separate**
accounts — no customer-data mixing.

## 9. What is explicitly NOT built here
No PSP account, no keys, no card capture, no homemade processor, no live webhooks. This is the
abstraction + data model + flows only. Implementation is a later, approved phase.

## 10. Open decisions
Provider selection (PSP); store vs web billing on mobile; annual-plan handling; tax/VAT handling;
dunning policy; proration specifics per provider.
