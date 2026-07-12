# Eventra Consumer — Complete Product Design (PROPOSED)

> Consumer app: Web + Google Play (Android) + App Store (iOS). Shares the platform backend
> (`PLATFORM_ARCHITECTURE.md`). **Proposed — awaiting approval. No implementation.**
> Supersedes the shorter v3 draft of this file (MEGA MODULE 1 expansion).

## 1. Purpose
Help any shopper **know when to buy**: upcoming commercial dates, important shopping opportunities, and
**verified** sales — trustworthy timing, not a coupon-scraper. Free tier is ad-supported; paid tiers
remove ads and unlock verified-deal alerts and richer following.

## 2. Target users
- **Deal-seekers** who want to time purchases around real sales.
- **Category shoppers** (electronics, fashion, home, beauty…) wanting relevant alerts.
- **Brand followers** who want to know when specific companies actually run promotions.
- Casual users who just want a clean commercial calendar.
Platforms: **Web (PWA)** and **Android** at launch; **iOS** shortly after. One codebase, responsive.

## 3. Navigation (information architecture)
Bottom tab bar (mobile) / left rail (web), 5 primary destinations + account:
```
[ Calendar ]  [ Discover ]  [ Deals ]  [ Alerts ]  [ Account ]
```
- **Calendar** — home; upcoming commercial dates and likely-sale windows.
- **Discover** — browse & follow companies and categories.
- **Deals** — verified-deals feed (paid) / preview + upsell (free).
- **Alerts** — notification inbox + preferences.
- **Account** — profile, subscription, settings.

## 4. Main pages (free) — every screen
| Screen | Route | What it shows / does |
|--------|-------|----------------------|
| Onboarding | `/welcome` | Value intro (3 cards), region pick, optional sign-in; "start free". |
| Auth | `/auth/*` | Sign up / sign in (email + OAuth Google/Apple). Guest allowed with limits. |
| Calendar (home) | `/calendar` | Month + "Upcoming" list of official events and seasonal windows in the user's country; each item shows date, importance color, category, and a "likely sale" indicator. Ad slot (free). |
| Day detail | `/calendar/:date` | Events on that day, prep/likely-sale note, and any verified deals; "remind me" toggle. |
| Discover | `/discover` | Search + browse companies and categories; follow/unfollow; trending. Ad slot (free). |
| Company page | `/companies/:id` | Company profile, upcoming/verified deals, follow toggle, category tags. |
| Category page | `/categories/:slug` | Relevant dates/deals for a category; follow toggle. |
| Following | `/following` | Managed follows (companies + categories); reorder; per-follow alert toggle. |
| Alerts inbox | `/alerts` | Chronological notifications: calendar reminders + verified-deal alerts; read/unread. |
| Account | `/account` | Profile, region/country, connected sign-in, subscription status, settings entry. |
| Upgrade / paywall | `/upgrade` | Plan comparison (Free / Ad-Free / Verified Deals); contextual triggers. |

## 5. Premium pages / gated features
| Feature | Free | Ad-Free ($15) | Verified Deals ($30) |
|---------|:----:|:-------------:|:--------------------:|
| Ads shown | yes | **no** | **no** |
| Verified-deal **feed** (`/deals`) | preview + upsell | preview + upsell | **full feed + filters** |
| Verified-deal **alerts** | — | — | **yes** |
| Follow companies / categories | limited (proposed 3 each) | extended (proposed 20) | **unlimited** |
| Priority / configurable alerts (lead time, quiet hours, per-follow) | basic | basic | **full** |
| Multiple regions | 1 | multiple | multiple |
| Future wishlist (see §11) | basic | basic | **price/deal-linked** |
`/deals` and alert configuration render gated states with clear upsell for lower tiers (no fake buttons).

## 6. Settings
`/account/settings` sections:
- **Profile** — name, avatar, email, connected providers.
- **Region & language** — country(ies) drive the calendar/deals; language later.
- **Notifications** — channels (push, email later), quiet hours, per-category/company defaults,
  lead-time (e.g., alert 3 days before). Tiered: full control on $30.
- **Privacy & ads** — ad personalization consent (required on mobile), data export/delete (GDPR/CCPA).
- **Subscription** — current plan, upgrade/downgrade, receipts, restore purchases (store billing).
- **Appearance** — light/dark, density (reuse the design system's accent/appearance concept).
- **About** — version, terms, support link.

## 7. Notification system (consumer view; infra in `PLATFORM_ARCHITECTURE.md §8`)
- **Calendar reminders** (all tiers, basic): upcoming major dates in the user's region.
- **Verified-deal alerts** ($30 only): when a **verified/published** promotion matches a followed
  company/category, respecting lead-time + quiet hours + per-follow toggles.
- **Digest option**: daily/weekly summary vs. real-time (user choice).
- Channels: **push** (web push + Android FCM + iOS APNs) and **in-app inbox**; email later.
- Every alert links to the relevant company/deal/day; delivery is idempotent (no duplicates).

## 8. Favorite companies
- Follow from Discover / company page / a deal. Followed companies drive verified-deal alerts (paid)
  and appear first in Discover.
- A followed company may or may not be an Eventra **Business** customer; only **verified** promotions of
  that company reach the consumer (never Business-private data).
- Free tier: limited follow count; paid tiers extend/remove the cap.

## 9. Favorite categories
- Follow commercial categories to get relevant dates/deals without following individual companies.
- Categories come from the shared catalog (Admin-curated). Used for alert targeting and Discover.

## 10. Calendar behavior & commercial events
- Reuses the platform **event engine** (`lib/events`, `planning`, `calendar`, `dates`) incl. the
  corrected recurrence (`RECURRENCE.md`): fixed + nth-weekday(+offset) rules resolved per year.
- Views: **Upcoming** (default list), **Month**, **Day**. Country-filtered.
- **Likely-sale indicator**: derived deterministically from the curated calendar (event importance +
  known sale windows like Black Friday/seasonal) — **not** an AI prediction in V1. Verified deals, when
  present, override "likely" with "confirmed".
- Events are **platform-owned** and read-only to consumers; consumers can save/remind, not edit.

## 11. Future wishlist (roadmap feature)
A consumer can add products/brands they want; Eventra flags when a **verified** deal or a likely-sale
window hits a wishlisted item's company/category. V1 = simple saved list; later = price/deal linkage.
Marked **future** (not in the first consumer MVP).

## 12. Offline capabilities (PWA + native)
- PWA/app caches the **upcoming calendar** and **followed list** for offline viewing.
- Alerts inbox shows last-synced items offline; actions queue and sync on reconnect.
- No offline writes to shared data beyond local preferences/read-state (synced later).

## 13. Search
- Deterministic search (no AI) over **companies, categories, and commercial events** in the user's
  region; reuses the platform search approach (`app/lib/search.ts` pattern). Results deep-link to
  company/category/day. Recent + trending suggestions.

## 14. Widgets (mobile home-screen)
- **Next opportunity** widget: the nearest important date / countdown.
- **Today's deals** widget ($30): verified deals for followed companies/categories.
- Web: an optional embeddable "upcoming dates" mini-view. Widgets are **future**, post-MVP.

## 15. Future AI opportunities (explicitly future; not V1)
- Personalized "best time to buy X" guidance from historical sale patterns.
- Natural-language deal search ("cheap headphones sales soon").
- Smart alert bundling / noise reduction.
All gated behind explicit approval; V1 stays deterministic and privacy-conservative.

## 16. Navigation flows (see `USER_FLOWS.md` for full journeys)
First visit → value intro → pick region → browse calendar (guest) → follow a company (prompts sign-up)
→ enable alerts (prompts upgrade for verified) → subscribe → long-term: daily calendar check + alerts →
manage follows → upgrade/downgrade → cancel → return (data + follows preserved).

## 17. Reuse from current codebase
Calendar/date engine, global-events catalog, importance colors, design system + UI primitives, search
pattern, and the responsive shell transfer directly. New: consumer auth/onboarding, follows, ads slots,
verified-deal feed/alerts, push notifications, offline/PWA, widgets.
