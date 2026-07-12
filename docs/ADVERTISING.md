# Eventra — Advertisement System (PROPOSED)

> First-party ad platform for the Consumer app. PrimeBuild is the first advertiser (one record among
> many). **Proposed — awaiting approval. No implementation, no ad-network SDK.** Related:
> `MONETIZATION.md §5`, `PLATFORM_ARCHITECTURE.md §6`, `ADMIN_CONSOLE.md`.

## 1. Scope & principles
- Ads appear **only** in Eventra Consumer, **only** for **Free** users. Never in Business/Admin.
- **First-party / house / direct-sold** placements at launch — **no third-party ad-network SDK**
  (privacy, Play/App-Store review, and performance reasons). Third-party networks are a later, explicit
  decision.
- **PrimeBuild is not privileged in code** — it is one `advertiser` record.
- Ad targeting uses only what the user already provides (country + followed categories) + consent.

## 2. Entities
- `advertisers` — org/brand, contact, billing terms, status (incl. PrimeBuild).
- `ad_campaigns` — advertiser, name, objective, schedule (start/end), budget/booking, status,
  **priority**, **frequency cap**, targeting (country/category).
- `ad_creatives` — image/copy/CTA/landing URL; format/slot; A/B variants.
- `ad_placements` — surface + slot (e.g., `consumer.calendar.inline`, `consumer.discover.card`).
- `ad_events` — impression / click / dismissal (for CTR + pacing), timestamp, user-region (no PII).

## 3. Placements (surfaces & slots)
Consumer Free only: `calendar` inline slot, `discover` card slot, `company page` banner, `day detail`
footer. Slots are **clearly labeled "Ad/Sponsored"**, sized to the design system, never interstitial-
spammy. Users with the Ad-Free add-on get the space back (no blank slot).

## 4. Rotation & selection
On each eligible render, the **ad-selection service** returns one creative by:
1. Eligibility: user is Free, in campaign's country, matches category targeting, campaign active/in
   schedule, under frequency cap for this user.
2. **Priority**: higher-priority (or higher-booked) campaigns win; ties broken by pacing + rotation to
   avoid starving lower campaigns.
3. **Pacing**: spread impressions across a campaign's schedule (avoid early exhaustion).
4. **Frequency cap**: per-user per-campaign per-time-window (e.g., N/day) to prevent fatigue.
Deterministic + fair; no real-time bidding.

## 5. Priorities & frequency limits
- **Priority tiers** (e.g., 1–5) set per campaign by Ads managers; house/PrimeBuild campaigns use the
  same scale.
- **Frequency cap** per campaign (impressions/user/day) and a global per-user daily ad cap so the app
  never feels ad-heavy.
- **Quiet placements**: no ads on sensitive flows (auth, billing, settings).

## 6. Premium users without ads
Only users with the **Ad-Free add-on ($15)** are excluded at selection time (server-checked via
`ads.suppressed` = `addon.ad_free`). **Deal Intelligence ($30) alone does NOT exclude ads** — the axes
are independent (`ENTITLEMENTS.md`). No client-side hiding only — the server does not return ads to
Ad-Free users (prevents leakage/flicker).

## 7. Campaign scheduling
Ads managers schedule campaigns with start/end, budget or flat booking, targeting, priority, and caps in
`/admin/ads/campaigns`. Creatives can be scheduled/rotated within a campaign; A/B variants split
traffic. Campaigns auto-activate/expire by schedule.

## 8. Analytics & CTR tracking
`ad_events` → aggregates: impressions, clicks, **CTR**, dismissals, pacing vs. schedule, per-creative and
per-placement performance, per-country/category breakdown. Surfaced in `/admin/ads/reporting`.
Attribution stays privacy-conservative (region + category only; no cross-site tracking).

## 9. Future advertiser dashboard (explicitly future)
A self-serve portal where approved advertisers create campaigns/creatives, set budgets/targeting, and
see their own reporting — mirroring the admin ad tools with advertiser-scoped RLS. Requires KYC/billing
onboarding (`ADMIN_CONSOLE.md` → Future advertisers). Not in scope now.

## 10. Privacy & compliance (must resolve before mobile launch)
- Explicit **ad-personalization consent** (country/category use) with a non-personalized fallback.
- Play/App-Store ad + data-safety disclosures.
- No third-party trackers at launch; first-party event logging only.
- Data export/delete honored for ad-event data tied to a user.

## 11. Data boundaries
Ad targeting reads only the consumer's country + followed categories + consent — never Business-private
data or another consumer's data. `ad_events` carry no PII beyond the owning consumer id (RLS-scoped for
user-facing views; aggregated for admin).
