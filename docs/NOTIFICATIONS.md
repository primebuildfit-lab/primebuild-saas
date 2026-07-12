# Eventra — Notification Platform (design)

> One shared notification service for Consumer, Business, and Admin, preserving product boundaries.
> **Design only.** Entities in `PLATFORM_SCHEMA.md §8`. Delivery respects entitlements
> (`ENTITLEMENTS.md`) and privacy/consent (`AD_PRIVACY.md`).

## 1. Architecture
```
Trigger (event or scheduled job)
  → NotificationJob (dedupe_key, scheduled_at)          # idempotent
  → build Notification (per recipient, type, payload, critical?)
  → check preferences + entitlement + consent + quiet hours + frequency cap
  → channel sender(s): in-app inbox, push (FCM/APNs/web push), email (later)
  → NotificationDelivery (status, attempts, retries)    # audit trail
```
One service; **surface-scoped** notification types so consumer/business/admin never cross boundaries.

## 2. Notification types
**Consumer:** followed-company deal · verified offer · likely-promotion window · offer ending soon ·
saved-offer update · category alert · trial expiration · subscription state.
**Business:** upcoming commercial date · preparation milestone · campaign deadline · supplier/product
opportunity · competitor/public-market signal · integration issue · trial expiration · plan-limit ·
storefront-promotion status.
**Admin:** suspicious promotion · failed verification · advertising violation · failed delivery ·
billing issue · integration outage · security alert.

## 3. Channels
- **In-app inbox** — always available; source of truth for read state.
- **Push** — web push + Android FCM + iOS APNs; requires explicit consent.
- **Email** — later; transactional/critical first.
SMS is out of scope.

## 4. Preferences & consent
Per principal + channel: enable/disable per type, lead time, quiet hours, frequency caps, digest vs
real-time. **Explicit opt-in** for push (`AD_PRIVACY.md`). Deal-alert delivery also gated by
entitlement (only Deal Intelligence consumers get offer notifications) and by per-follow toggles.

## 5. Critical vs optional
- **Critical** (billing failure, security alert, integration outage for a business, retraction of a
  saved deal) — bypass quiet hours/caps where appropriate, but still respect channel consent and legal
  limits. Never used for marketing.
- **Optional** (deal alerts, prep reminders, suggestions) — fully governed by prefs/caps/quiet hours.

## 6. Delivery correctness
- **Deduplication:** `dedupe_key` per (type, recipient, subject, window) prevents duplicates across
  retries/multi-trigger.
- **Frequency caps:** per type + global per-principal/day to prevent spam.
- **Quiet hours + timezone:** delivery scheduled in the recipient's timezone; queued during quiet hours.
- **Localization:** templates per locale (`NotificationTemplate`); fallback locale.
- **Retries:** exponential backoff on transient channel failures; capped attempts; dead-letter →
  admin "failed delivery".
- **Delivery status:** queued/sent/delivered/opened/failed on `NotificationDelivery`.
- **Opt-out:** honored immediately; unsubscribe per type/channel; global mute.
- **Audit history:** deliveries + preference changes retained for support/debugging.

## 7. Boundaries & abuse prevention
Business notifications never leak consumer data and vice versa; admin notifications are admin-only. Job
rate limits + caps prevent notification storms (e.g., a mass verified-deal publish fans out under
per-user caps). Monitoring/intel jobs check entitlement before emitting.

## 8. Open decisions
Email provider (later); push-consent copy per store policy; digest cadence defaults; which business
signals are "critical"; localization languages at launch.
