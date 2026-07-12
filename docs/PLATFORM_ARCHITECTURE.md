# Eventra — Platform Architecture (PROPOSED, v3)

> One backend, three surfaces (Consumer / Business / Admin). **Proposed — awaiting approval.** No
> implementation, no Supabase changes. Section numbers align with the 20-point brief; see
> `PLATFORM_VISION.md §4` for the full mapping.

## 2. User types & roles
Three **distinct principal types**, each with its own identity, auth, and data boundary:
| Principal | Identity source | Tenant key | Surfaces |
|-----------|-----------------|-----------|----------|
| **Consumer** | Consumer auth (email/OAuth) | `consumer_account_id` | Eventra Consumer |
| **Business member** | Shopify session **or** other-platform OAuth **or** email signup | `org_id` (+ `membership`) | Eventra Business |
| **Admin** | Internal SSO/email + RBAC | platform-wide (role-scoped) | Admin Console |
Roles: Consumer tiers (Free/Ad-Free/Verified); Business owner/staff; Admin roles (`ADMIN_CONSOLE.md §1`).
A single human could hold multiple principals (a shopper who also runs a business) — kept as separate
accounts, never merged in code.

## 6. Advertising architecture (first-party; no ad network)
Domains: `advertisers` (incl. PrimeBuild as a normal record), `ad_campaigns`, `ad_creatives`,
`ad_placements` (surface+slot+targeting: country/category), `ad_events` (impression/click).
Serving: an **ad-selection service** returns eligible placements for a Consumer **Free** user by
surface/slot + their country/followed categories; **suppressed** for Ad-Free/Verified and for all
Business/Admin surfaces. Reporting aggregates `ad_events` in `/admin/ads/reporting`. V1 = house/direct-
sold only; third-party networks are a later approved step (`MONETIZATION.md §5`).

## 7. Verified-deal monitoring & approval workflow
Entities: `monitored_companies`, `deal_sources` (official verification sources per company/category),
`deal_submissions` (business-submitted), `verified_deals` (approved, published).
Flow:
```
business submits promo  ┐
                        ├─► review queue ─► admin verifies vs deal_source ─► verified_deal (published)
monitoring job detects ─┘        (in_review)      (verify | reject)              │
                                                                                 ▼
                                                    fan-out alerts to followers on Verified-Deals tier
```
States: `submitted → in_review → verified | rejected → published → expired`. Only **verified/published**
deals ever reach consumers. Reviewer role + audit log in the Admin Console.

## 8. Notification architecture
A shared **notification service** with: triggers → a queue → channel senders → `notification_deliveries`
(+ status). Triggers: scheduled **calendar reminders** (all consumers/business prep), **verified-deal
published** events (Verified-tier followers), **trial lifecycle** (day-30/40/44/expiry), **business prep**
reminders (30/14/7/1). Channels: **push** (web push + Android FCM), **in-app inbox**, **email** (later).
Per-principal `alert_preferences` (lead time, quiet hours, per-follow toggles) gate delivery; tiering
enforced server-side. Idempotent delivery keys prevent duplicates.

## 9. Platform / integration detection & onboarding (adapters)
A common interface so no platform is special:
```ts
interface CommerceConnection {
  platform: "shopify" | "woocommerce" | "wix" | "squarespace" | "custom" | "none";
  connect(org, credentials): Promise<ConnectionResult>;
  listProducts(query): Promise<ProductRef[]>;      // optional; "none" returns manual list
  listCollections(): Promise<CollectionRef[]>;     // optional
  subscribeWebhooks?(events): Promise<void>;        // uninstall, product update, etc.
}
```
Shopify adapter = the existing embedded/App-Bridge integration. Woo/Wix/Squarespace = OAuth/API adapters
(later phases). "none/physical" returns a manual product list — **core planning/memory never requires a
connection**. Onboarding asks the platform, runs the adapter, and records the connection on the org.

## 10. Shared backend domains
| Domain | Owns | Consumers of it |
|--------|------|-----------------|
| Identity & Accounts | consumer/business/admin principals, memberships | all surfaces |
| Subscriptions & Billing | plans (consumer+business), subscriptions, trials | Business, Consumer, Admin |
| Calendar & Events (catalog) | countries, categories, global_events (platform-owned) | all |
| Companies | company registry, monitored companies | Consumer (follow), Admin, Business (identity) |
| Follows | consumer→company / consumer→category | Consumer, Notifications, Ads |
| Notifications | deliveries, preferences, templates | Consumer, Business, Admin |
| Advertising | advertisers, campaigns, creatives, placements, events | Consumer (serve), Admin |
| Verified Deals | submissions, sources, verified deals | Business (submit), Admin (review), Consumer (receive) |
| Campaigns (Business) | campaigns, templates, custom events, store prefs | Business only |
| Integrations | commerce connections + health | Business, Admin |
| Analytics | cross-product events + rollups | Admin |
| Admin & Audit | staff, roles, audit log | Admin |

## 11. Data separation, tenancy & security model
- **Three ownership classes:** platform-owned (catalog/ads-catalog — read rules per surface),
  **consumer-owned** (`consumer_account_id`), **org-owned** (`org_id`). Admin acts via service role with
  full audit.
- **RLS everywhere**, keyed by the authenticated principal — extends the existing `is_store_member`
  pattern to `is_org_member(org_id)` and `is_self(consumer_account_id)`. **Never trust client-supplied
  ids** (unchanged; `SECURITY_PLAN.md`).
- **Cross-product boundaries:** consumers can read only **published** company data (verified deals,
  public calendar) — never Business-private campaigns/memory. Businesses see only their org. Admins see
  all, logged.
- **Auth bridges (per surface):** Business-Shopify uses the App Bridge session→JWT bridge already
  designed (Option A); Business-other-platform and Consumer use their own auth → the same short-lived
  RLS JWT carrying the principal id + role; Admin uses internal SSO + RBAC (separate JWT audience).
- **Store → Org rename:** the current single-store tenant generalizes to an **org** with an optional
  commerce connection; the existing Supabase business schema becomes the Business slice under `org_id`.

## 17. Migration impact on the current codebase
- **Repo shape:** introduce three surfaces. Recommended: a **monorepo** with `apps/business` (the
  current React Router app, moved), `apps/consumer` (new; web/PWA, packaged for Play later),
  `apps/admin` (new; web), and `packages/*` shared (design-system, domain types, calendar/date engine,
  db/platform client, api contracts). Alternative (lower lift now): keep one app and add `/business`,
  `/consumer`, `/admin` route trees — acceptable for an MVP, split later.
- **Rename `store` → `org`** across types/schema/DataContext (mechanical but broad).
- **Route rescope:** `/app/*` → `/business/*` (keep `/app` as the Shopify embedded host).
- **Schema:** expand from the business-only design to the platform schema (§10) with three principal
  types; the business tables carry over under `org_id`.
- **Auth:** multiplex Shopify/other-platform/consumer/admin identities into the RLS-JWT bridge.
- **`app/db/*` foundation:** adapts — `tenant.server.ts` becomes principal-aware (org/consumer/admin);
  mappers/repositories extend to new tables. Little is thrown away.

## 18. What existing work remains reusable (high reuse)
- **Design system + UI primitives** (`app/components/ui/*`, shell, `useDialog`, accents) — all surfaces.
- **Calendar/date engine** (`lib/events`, `planning`, `calendar`, `dates`) incl. the corrected
  recurrence model — Consumer + Business.
- **Domain types** (`types/domain.ts`) — carry forward; add consumer/ads/deals/notification types.
- **Plan-limit + downgrade-retention logic** (`planEntitlements`, `planLimits`) — extend to new plan
  families + trial-grace.
- **Mock-data architecture + the 87 tests** — patterns reused; business tests remain valid after the
  store→org rename.
- **Business Supabase schema + `app/db/*` server foundation** — becomes the Business slice of the
  platform schema; the RLS-JWT bridge design generalizes.
- **Docs** (`PLAN_ENFORCEMENT`, `SECURITY_PLAN`, `RECURRENCE`, `STATE_ARCHITECTURE`, `ROUTING`) — still
  apply to Business and inform the platform versions.

## 19. What Phase 5 must change (the paused DB work)
The old Phase 5 ("Shopify OAuth + Supabase RLS + Billing for the Shopify app") is **rescoped**:
- It becomes **"Business slice on the platform schema"** — `org`-based, principal-aware, ready for
  Consumer/Admin to attach later. The `supabase/migrations/*` and `app/db/*` already written are a
  **strong starting point** but must: rename `store`→`org`; add principal type to the JWT/RLS; and be
  applied against the platform schema, not a business-only DB.
- **Do not** finalize/apply the business-only schema or billing until this architecture is approved and
  entitlements/open decisions are settled. The env-gated foundation stays in the repo, unactivated.

## 20. Updated implementation phases & complexity
| Phase | Scope | Complexity |
|-------|-------|-----------|
| **A. Architecture lock** | Approve this package; finalize entitlements + open decisions | S |
| **B. Platform foundation + Business persistence** | platform schema (3 principals), org rename, RLS, apply Business slice (rescoped old Phase 5), Business pilot on a dev store | **L** |
| **C. Consumer MVP** | consumer auth, calendar, discover/follow, alerts inbox, ad slots (house ads), PWA | **L** |
| **D. Admin Console MVP** | users, subscriptions, trials, deals queue, catalog editing, health | **L** |
| **E. Verified deals E2E** | submit → verify → publish → consumer alerts + notification service | **M–L** |
| **F. Billing + trials** | business (Shopify + PSP), consumer (Play/web), 45-day trial automation, downgrade-grace | **L** |
| **G. Multi-platform business** | Woo/Wix/Squarespace/custom adapters | **M each** |
| **H. Android + advertising** | Play packaging (TWA), consumer ads serving, consent/privacy | **M–L** |

Overall: a roughly **3–4× scope increase** over the current single product. Recommended order A→B→C/D
(parallelizable)→E→F→G→H. Consumer (C) and Admin (D) can proceed in parallel once B lands.

## Risks (architecture-level)
- **Scope/timeline:** three products is a major expansion; risk of diluting the strong Business core.
  Mitigation: land B first (protect existing value), stage C–H.
- **Auth complexity:** four identity sources into one RLS model — must be tested hard (isolation tests).
- **Play Billing constraint** for consumer subscriptions (fees + mandated billing) — resolve early.
- **Ads + privacy/consent** for an Android consumer app — compliance work before launch.
- **Verified-deal trust:** the product's credibility depends on real verification sources + moderation.
- **Data-boundary leaks** between consumer/business/admin — the top security risk; RLS + tests are the
  gate.
