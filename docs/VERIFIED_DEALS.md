# Eventra — Verified Deals Architecture (PROPOSED)

> The trust product connecting Business (submit) → Admin (verify) → Consumer (alert). **Proposed —
> awaiting approval. No implementation.** Related: `ADMIN_CONSOLE.md`, `CONSUMER_PRODUCT.md`,
> `PLATFORM_ARCHITECTURE.md §7–8`.

## 1. Goal
Deliver **trustworthy** sale notifications: a consumer only ever gets alerted about a promotion that a
human admin (V1) has confirmed against an official source. Credibility is the product — a single false
"verified" alert damages trust more than a missed deal.

## 2. Entities
- `companies` — the registry; a company may be an Eventra Business customer or just monitored.
- `monitored_companies` — companies whose promotions the platform tracks.
- `deal_sources` — official verification sources per company/category (official site page, press feed,
  merchant-submitted proof URL, known promo page). Each source has a type + trust weight.
- `deal_submissions` — inbound candidates (business-submitted or monitoring-detected).
- `verified_deals` — approved, published promotions (title, company, offer, dates, country scope,
  category scope, source ref, confidence, admin who verified).
- `deal_alerts` / `notification_deliveries` — fan-out records.

## 3. How companies are monitored
Two intake paths feed one review queue:
1. **Business submission (primary, V1):** a Growth+ Org submits its own official promotion with a proof
   URL + dates + scope (`BUSINESS_PRODUCT.md §12`). Highest signal (first-party).
2. **Monitoring (assisted, later):** scheduled jobs check `deal_sources` for monitored companies
   (official promo pages, feeds) and create candidate submissions. Deterministic scraping/feed parsing
   first; ML classification is a **future** enhancement.
Both create a `deal_submission` in state `submitted`.

## 4. How a deal becomes verified (workflow)
```
submitted ──► in_review ──► verified ──► published ──► expired
                   │
                   └──► rejected
```
- **in_review:** an admin (Deals reviewer) opens the candidate in `/admin/deals/queue`.
- **verify:** admin confirms the offer against a `deal_source`, sets/adjusts **country** and **category**
  scope, sets **confidence**, optionally schedules publish; on approve → `verified` then `published`.
- **reject:** with a reason (kept for audit + submitter feedback).
- **expired:** past the deal's end date; auto-transitioned; no longer alertable.

## 5. Confidence scoring
A `confidence` value (e.g., High / Medium / Low, or 0–100) computed from signals, shown to admins and
used to gate alerts:
| Signal | Effect |
|--------|--------|
| Source type/trust weight (official site > press > submitted claim) | primary driver |
| First-party business submission with proof URL | raises |
| Multiple independent sources agree | raises |
| Matches a known sale window (e.g., Black Friday) | slight raise |
| Missing/expired/mismatched dates, broken proof link | lowers |
| History of rejected submissions from the submitter | lowers |
Policy (proposed): only **High** (and admin-approved Medium) deals trigger **push** alerts; Low may
appear in the feed but not push. Confidence + policy are Admin-configurable.

## 6. How countries affect deals
Every verified deal has a **country scope** (one or more). A consumer only receives a deal if it applies
to their region. Country scope also affects the calendar "likely-sale" context. National promotions map
to a country; global brands may scope to several.

## 7. How categories affect deals
Deals carry **category scope** (from the shared category catalog). A consumer following a category gets
matching verified deals even without following the specific company. Category also feeds ad/deal
relevance and Discover.

## 8. How notifications are sent
On `published`, a fan-out job selects **Verified-Deals-tier** consumers who (a) follow the company or a
matching category, (b) are in the deal's country scope, and (c) pass alert preferences (lead time, quiet
hours, per-follow toggle, confidence policy). Delivery via the shared notification service
(`PLATFORM_ARCHITECTURE.md §8`), idempotent per (deal, user). Non-paid tiers may see it in the feed
(gated) but receive no push.

## 9. Preventing false positives
- **Human verification in V1** — nothing is auto-published.
- **Source-backed** — a deal cannot be verified without a `deal_source` reference.
- **Confidence gating** — only high-confidence deals push.
- **Date sanity** — start/end validated; expired candidates auto-rejected.
- **Duplicate/collision detection** — same company+offer+window is de-duplicated.
- **Submitter reputation** — repeated rejections lower confidence/priority.
- **Consumer feedback** — "this deal wasn't real" reports feed moderation + submitter reputation.
- **Post-publish revocation** — admins can unpublish a deal (with an optional correction notice).

## 10. Administrator review (queue UX)
`/admin/deals/queue`: prioritized by confidence + freshness; each item shows the offer, proof/source,
dates, company, proposed scope, and computed confidence. Actions: verify (with scope/confidence),
reject (reason), request-info (back to submitter), schedule. Bulk actions for obvious cases. All logged.

## 11. How future automation could help (explicitly future)
- ML pre-classification to auto-rank the queue and auto-reject obvious spam.
- Source monitoring bots that draft high-confidence candidates for one-click admin approval.
- Anomaly detection on submitter behavior.
Automation only ever **assists** human verification; auto-publish requires a separate, explicit policy
decision — not in scope.

## 12. Data boundaries
Verified deals are **published** platform data (consumers can see them). Business-private planning
(campaigns, memory) is **never** exposed — only the promotion a business explicitly submitted and an
admin verified becomes visible. RLS + review gate enforce this (`PLATFORM_ARCHITECTURE.md §11`).
