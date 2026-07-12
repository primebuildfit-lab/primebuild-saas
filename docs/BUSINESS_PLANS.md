# Eventra Business — Plans & Entitlements (APPROVED, locked)

> Locks the business monetization model for MEGA MODULE 2. **Supersedes** all earlier business plan
> tables (old Free/$10/$20/VIP $50, and the MM1 "no free tier / month-horizons" draft). **No billing
> implemented.** Enforcement is server-side via the entitlement engine (`ENTITLEMENTS.md`);
> downgrade/retention rules in `TRIALS_AND_DOWNGRADES.md`.

## 1. Plan matrix (approved)
| | **Free** | **Starter** | **Growth** | **Business Pro** |
|---|:---:|:---:|:---:|:---:|
| Price | $0/mo | $15/mo | $30/mo | $45/mo |
| **Workspaces** (store/business connections) | **1** | **2** | **3** | **Unlimited** (fair-use) |
| Countries | manual only | **1 primary** | **Unlimited** | **Unlimited** |
| Planning horizon | manual calendar | **~1 year** + annual recurrence | **4 years** | **10 years** |
| Event catalog | none (manual dates) | main dates for selected country | broad (major/medium/niche/industry) | broad + priority intelligence |
| Campaign suggestions | — | basic (opt-in) | advanced | advanced + multiple strategies |
| Campaign Memory | — | basic | advanced | advanced |
| Templates | — | — | ✓ | ✓ advanced |
| Custom dates | — | — | ✓ | ✓ |
| Reminders | basic notes | basic | configurable | configurable + priority |
| Supplier/product opportunity intel | — | — | ✓ (valid public/integrated data) | ✓ expanded |
| Competitor/public market intel | — | — | broader | expanded |
| Consumer-app promo exposure | — | — | — | **✓ included (fair-use, moderated)** |
| Storefront engagement tools (widgets) | — | — | — | **✓** |
| Analytics | — | light | standard | richer |

**"Workspace/business limit"** = the number of business **workspaces / store connections** an account
can **actively manage** (Part 7). Exceeding it never deletes data — excess becomes **read-only**
(`§4`, `TRIALS_AND_DOWNGRADES.md`).

## 2. Plan detail
### Business Free ($0) — a real manual calendar
Create a workspace; use a normal calendar; select dates manually; write planned offers/campaigns on
dates; edit/remove plans; basic notes. **No** full event intelligence, **no** broad country catalog,
**no** supplier/product monitoring, **no** consumer-app promo benefit. **1 workspace.** Usable, not
crippled.

### Business Starter ($15) — 2 workspaces, ~1-year horizon
Everything in Free + select a **primary country**; main commercial dates for it; **opt-in** campaign
suggestions per date; saved campaigns; **repeat-next-year**; **basic Campaign Memory**; basic reminders;
limited history. Horizon ≈ **one useful year** + annual recurrence. **Not** unlimited countries.

### Business Growth ($30) — 3 workspaces, unlimited countries, 4-year horizon
Everything in Starter + a **much broader** commercial-date catalog (major/medium/niche/industry);
**custom dates**; **multiple workspaces up to 3**; **unlimited countries**; broader history; **advanced
Campaign Memory**; **templates**; configurable reminders; **supplier/warehouse/product opportunity**
notifications where valid public/integrated data exists; product-sourcing/inventory offer intel;
broader public competitor intel; integration-ready workflows; more filters. Horizon **4 years**.

### Business Pro ($45) — unlimited workspaces, 10-year horizon
Everything in Growth + **unlimited** supported countries; **10-year** horizon; expanded competitor/
public-market intelligence; advanced Campaign Memory & templates; **multiple strategies per
opportunity**; richer analytics; automation-readiness; **priority** intelligence/notifications;
**consumer-app promotional exposure at no extra ad charge** (subject to moderation + fair-use,
`BUSINESS_PRODUCT.md §6` / `ADVERTISING.md`); and **custom storefront promotional experiences**.

## 3. Storefront engagement tools (Business Pro) — terminology & guardrails
Call these **promotional widgets / storefront engagement tools / campaign overlays / gamified
promotions** (never "spam"). Examples: spin-to-win wheels, promotional popups, banners, timed offers,
exit-intent offers (where policy permits), "complete an action → earn a reward", gift offers, countdown
promotions, gamified offer widgets, custom campaign announcements.
**Mandatory guardrails:** merchant approval required · configurable · accessible · mobile-respectful ·
approved platform mechanisms only · never silently modify a storefront · frequency controls · no
user-trapping · easy disable · performance measurement. Full spec: `BUSINESS_PRODUCT.md §widgets`.

## 4. Workspace & data ownership (Part 7)
Entities (full model in `PLATFORM_SCHEMA.md`): **Account → Organization → Workspace → CommerceConnection**,
plus **OrganizationMember / Role / Permission**, ownership transfer, workspace suspension/archival.
- Workspace limit per plan: Free 1 · Starter 2 · Growth 3 · Pro unlimited (fair-use).
- **Downgrade behavior:** never immediately delete; identify excess workspaces/countries/horizon-
  exceeding future data/premium templates+widgets; make excess **read-only**; let the customer choose
  which workspaces stay active where appropriate; **upgrade restores**; retention is transparent.
- Full state machine: `TRIALS_AND_DOWNGRADES.md §downgrades`.

## 5. Business trial (approved)
New orgs get **45 days of full Business Pro**. At end → select a plan; if none selected, the org
**defaults to Business Free** with excess resources **read-only** (never deleted). Reminders before
expiry; no silent conversion; admin can extend. State machine: `TRIALS_AND_DOWNGRADES.md §2`.

## 6. Entitlement identifiers (see `ENTITLEMENTS.md`)
Plans → `business.free|starter|growth|pro`. Limits: `business.workspace_limit` (1/2/3/∞),
`business.country_limit` (0/1/∞/∞), `business.horizon_years` (0/1/4/10), plus feature flags
`business.catalog.broad`, `business.templates`, `business.memory.advanced`, `business.supplier_intel`,
`business.competitor_intel`, `business.consumer_promo`, `business.storefront_widgets`,
`business.multi_strategy`. Prices/limits come from **one config source**.

## 7. Open decisions (flagged)
- Exact numeric caps for saved campaigns/history per tier (proposed but not locked).
- Whether Starter is truly single-country or "1 primary + view others read-only."
- Fair-use ceiling for "unlimited" Pro workspaces (technical protection threshold).
- Team-member counts per tier (teams otherwise post-MVP).
