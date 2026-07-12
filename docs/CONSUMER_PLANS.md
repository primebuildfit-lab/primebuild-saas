# Eventra Consumer — Plans & Entitlements (APPROVED, locked)

> Locks the consumer monetization model for MEGA MODULE 2. **Supersedes** the plan/entitlement content
> in the earlier `CONSUMER_PRODUCT.md` / `MONETIZATION.md` drafts where they conflict. **No billing
> implemented.** Prices are approved; enforcement is server-side via the entitlement engine
> (`ENTITLEMENTS.md`).

## 1. The two independent axes (non-negotiable)
Consumer monetization has **two independent purchases**, not one ladder of mutually-exclusive tiers:

- **Intelligence axis** — *Consumer Core (Free)* → *Deal Intelligence ($30/mo)*.
- **Ad-Free axis** — an **independent add-on ($15/mo)** that only removes advertising. It is **not** a
  plan, is **not** bundled into Deal Intelligence, and does **not** unlock any intelligence features.

**Approved combinations (the only four states):**
| State | Intelligence | Ad-Free add-on | Ads shown? | Price |
|-------|--------------|----------------|-----------|-------|
| A | Core | off | **yes** | **$0** |
| B | Core | on | no | **$15** |
| C | Deal Intelligence | off | **yes** | **$30** |
| D | Deal Intelligence | on | no | **$45** |
**Rule (locked):** paying $30 for Deal Intelligence **without** Ad-Free → **ads remain visible** (state
C). Ad removal happens **only** when the $15 Ad-Free add-on is active. This independence must not be
"simplified" into a bundle without Brian's explicit change.

## 2. Consumer Core — Free ($0)
A genuinely useful, simple commercial calendar.
- Select **one country**.
- View important **national, retail, seasonal, commercial** dates for that country.
- See **general periods** when discounts may be more common (deterministic, from the curated catalog —
  no company-specific intelligence).
- Basic calendar navigation + basic event descriptions.
- **Advertisements visible.**
- **Excluded:** company following, company promotion monitoring, verified/likely-deal notifications,
  AI-assisted research, offer cards, multi-country.
Design intent: simple and honest — not a deliberately crippled trial.

## 3. Ad-Free add-on ($15/mo, independent)
- Removes advertising across the consumer app (server-enforced: ads are not served to Ad-Free users).
- Adds **no** intelligence features.
- Can be attached to **either** Core (→ state B) **or** Deal Intelligence (→ state D).
- Billed independently; can be cancelled independently (ads return, intelligence unaffected).

## 4. Deal Intelligence ($30/mo)
Everything in Core, plus company-specific intelligence (full design in `COMPANY_MONITORING.md`):
- **Follow companies**; select preferred **offer categories** and **offer types**.
- **Monitor public company promotion information** (legal/approved sources only).
- **Approved AI-assisted / automated research** to identify **possible upcoming** promotions — always
  labeled with a confidence/verification status; never presented as guaranteed.
- Clearer **likely-promotion windows** in the calendar; show officially published / publicly available
  offers; **summarize** offers so users don't read long pages.
- **Notify** when a followed company has a relevant **confirmed or strongly supported** offer.
- Offer detail fields: discount %, eligible product/category, start, end, requirements, exclusions,
  **source**, **confidence/verification status**.
- Enable/disable companies; enable/disable categories; choose which offer types notify; follow as many
  companies as the fair-use policy permits (`COMPANY_MONITORING.md §fair-use`).
- **Ads still visible unless Ad-Free is also active** (see §1).
- **PrimeBuild** may receive prominent promotional placement but **must not** corrupt search results,
  confidence scoring, or verified-deal truthfulness; paid placement stays **visibly distinct** from
  verified information.

## 5. Consumer trial (approved)
A new consumer gets **one month of Deal Intelligence** free.
- **Unlocks:** Deal Intelligence features for 30 days.
- **Ads:** remain visible during the trial **unless** the user separately activates the Ad-Free add-on
  (preserves add-on independence — the trial never silently grants Ad-Free).
- **No silent conversion:** clear end date; reminders before expiration (`TRIALS_AND_DOWNGRADES.md`).
- **On expiry (no purchase):** user returns to **Consumer Core**; preferences/follows/history are
  **kept but inactive/read-only** (re-activate on subscribing again). Ad-Free, if the user bought it
  separately, is unaffected.
- **Eligibility:** one trial per consumer identity (anti-abuse in `ENTITLEMENTS.md` / `RLS_SECURITY_MODEL.md`).
- State machine: `CONSUMER_TRIAL` in `TRIALS_AND_DOWNGRADES.md §1`.

## 6. Entitlement identifiers (see `ENTITLEMENTS.md`)
`consumer.core`, `consumer.deal_intelligence`, `addon.ad_free`, plus limits
`consumer.country_limit` (Core = 1; DI = multiple), `consumer.follow_limit` (fair-use). Ads are gated by
the **absence** of `addon.ad_free` (never by intelligence state).

## 7. Open decisions (flagged, not guessed)
- Exact **follow limit** under fair-use for Deal Intelligence.
- Whether Core may follow **0** companies (proposed: yes, 0 — following is a DI feature).
- Whether the trial is **7 or 30 days** (approved default here: **30 days / one month**).
- Multi-country count for Deal Intelligence (proposed: a small cap, e.g., 3).
