# Eventra — Trials & Downgrades (state machines)

> Exact lifecycles for consumer/business trials and downgrade/read-only behavior. **Design only.**
> Enforced by the entitlement engine + billing orchestration (`ENTITLEMENTS.md`, `BILLING_ARCHITECTURE.md`).
> Golden rule: **never immediately delete customer data** — excess becomes read-only, restores on
> upgrade.

## 1. Consumer trial (Deal Intelligence, 30 days)
```
eligible ──activate──▶ active ──(T-3d,T-1d)──▶ ending_soon ──expire──▶ expired
   │                     │                                   │
   │                     └──subscribe──▶ converted           └──subscribe──▶ converted
   └──(already used)──▶ previously_used        (admin)──▶ promotional_extension──▶ active
                                            cancel──▶ cancelled
```
- **Grants:** Deal Intelligence features for 30 days. **Ad-Free is NOT granted** — ads remain unless the
  user separately activates the $15 add-on (add-on independence, `CONSUMER_PLANS.md §1`).
- **Reminders:** T-3 days, T-1 day, and at expiry (in-app + push).
- **Expiry (no purchase):** → Consumer Core. Follows/categories/offer prefs/saved deals are **kept but
  inactive/read-only**; re-activate automatically if the user later subscribes.
- **No silent conversion:** never auto-charge; explicit action required.
- **Eligibility/anti-abuse:** one trial per consumer identity (`previously_used`); duplicate-account
  detection noted as a risk (`§4`).

## 2. Business trial (Business Pro, 45 days)
```
eligible ──activate(on org create)──▶ active ──(T-7,T-3,T-1)──▶ ending_soon ──expire──▶ grace_read_only
   │                                    │                                          │
   │                                    └──select_plan──▶ converted(plan)          ├─select_plan─▶ converted(plan)
   │                                    cancel──▶ cancelled                        └─(default)──▶ business_free + excess read-only
   └──(already used)──▶ previously_used              (admin)──▶ extended──▶ active
```
- **Grants:** full Business Pro for 45 days (no card required to start — timing of card capture is an
  open billing decision).
- **Reminders:** T-7, T-3, T-1, expiry.
- **At expiry:** the org **selects a plan**; if none selected it **defaults to Business Free** (the real
  $0 tier) with all **excess** resources **read-only** (never deleted) — this is the downgrade path (§3).
- **Admin** can extend; all transitions audited.

## 3. Downgrade / read-only mechanics (business)
Triggered by trial expiry-without-selection, explicit downgrade, or payment failure (→ grace). Steps:
1. Compute the target plan's limits (`BUSINESS_PLANS.md §1`): workspaces, countries, horizon-years,
   premium features (templates/widgets/multi-strategy).
2. **Identify excess:** workspaces beyond limit; countries beyond limit; campaigns/plans dated beyond the
   horizon; premium templates/widgets; supplier/competitor intel.
3. **Mark excess read-only** (not deleted). Where a choice is required (which workspaces stay active),
   **let the customer choose**; otherwise apply a deterministic rule (most-recently-active kept).
4. **Explain impact** clearly in-app (what's read-only, why, how to restore).
5. **Restore on upgrade:** re-resolving entitlements clears read-only markers.
6. **Retention:** read-only/archived data retained per the transparent retention policy; hard deletion
   only on explicit account/workspace deletion after the retention window.

Read-only means: viewable, exportable, not editable; no new creates that would exceed limits; scheduled
jobs (intel/notifications) for excess resources pause.

## 4. Consumer downgrade
Cancelling Deal Intelligence → Core (follows/prefs kept inactive/read-only, re-activate on resubscribe).
Cancelling Ad-Free → ads return (intelligence unaffected — independent axes). Cancelling both → Core +
ads. No data deleted.

## 5. Anti-abuse / edge cases (flagged as risks)
- **Trial exploitation:** one trial per identity; duplicate-account/device signals feed anti-abuse;
  eligibility recorded permanently.
- **Duplicate subscriptions** across providers: entitlement union kept; duplicate billing flagged for
  admin/refund (`BILLING_ARCHITECTURE.md §6`).
- **Restore-purchase** after reinstall re-resolves entitlements (no data loss).
- **Grace/payment-failure** never deletes; read-only until resolved.

## 6. Open decisions
Consumer trial 30 vs 7 days (default 30); whether card is required to start the business trial; exact
"which workspace stays active" default rule; retention window lengths per data class; consumer trial
reminder cadence.
