# Eventra — Company Monitoring & Deal Intelligence (design)

> How Deal Intelligence discovers, classifies, and notifies company promotions for consumers. **Design
> only.** Complements `VERIFIED_DEALS.md` (the verify→publish pipeline). **Legality first:** only
> legally accessible information and approved sources — no auth bypass, hidden-data extraction, or
> platform-restriction violations, ever.

## 1. Objects
- **Company profile** — name, website, countries, store regions, categories, official channels, status;
  optional `is_business_customer`.
- **CompanyLocation / store region** — where a company operates (affects which consumers see a deal).
- **Categories / OfferCategory / OfferType** — shared catalog; drive relevance + notification filters.
- **Consumer selections** — FollowedCompany, FollowedCategory, OfferPreference (which offer types
  notify), MutedCompany/MutedCategory/MutedSource, NotificationPreference.
- **Promotion sources** — DealSource records (type + trust weight).
- **Deals** — classified, scoped, confidence-scored, expiring, revisable, retractable (see §5–§9).

## 2. Approved data sources (legal only)
Company websites · official promotional pages · public newsletters · official social media · public
press releases · public store listings · public promotion feeds · **approved APIs** · public
advertisements · **manually submitted business promotions** (first-party, highest trust).
**Prohibited:** logins/paywalls bypass, scraping behind auth, private/hidden endpoints, anything a
site's terms or the law disallow. Each `DealSource` carries a `type` and `trust_weight`; monitoring
respects robots/terms and rate limits.

## 3. Consumer controls
Enable/disable companies; enable/disable categories; choose offer types that notify; mute sources/
companies/categories; set lead time, quiet hours, frequency caps; follow up to the fair-use limit.

## 4. Fair-use follow policy (open number)
Follows are capped by a **fair-use** policy (technical + abuse protection), not an arbitrary paywall —
exact number is an open decision (`CONSUMER_PLANS.md §7`). Excessive automated following is throttled.

## 5. Deal classification (locked labels)
Every surfaced deal carries exactly one class; uncertain classes are **visually distinct** and **never**
marketed as guaranteed:
| Class | Meaning | Alert eligibility (proposed) |
|-------|---------|------------------------------|
| **Confirmed Official Deal** | Verified against an official first-party source | push |
| **Publicly Published Deal** | Publicly posted (e.g., official page/feed), admin-checked | push |
| **Strongly Supported Likely Deal** | Multiple credible signals; not officially confirmed | push (high confidence only) |
| **Historical Pattern** | Recurs historically (e.g., annual sale window) | calendar hint, no push |
| **Unverified Possibility** | Weak/single signal | feed only, clearly tentative, no push |

## 6. Confidence scoring
A `confidence` score (0–100 or High/Med/Low) from signals: source trust weight; first-party submission
with proof; independent corroboration; match to a known sale window; date validity; submitter
reputation. Low confidence lowers class + blocks push. Score + class are shown to the consumer and to
admins (`VERIFIED_DEALS.md §5`).

## 7. Verification status & official vs inferred
- **Official** = backed by an official first-party source/submission (Confirmed/Published classes).
- **Inferred** = derived from patterns/weak signals (Likely/Historical/Unverified). Inferred deals are
  labeled as such and never shown as official. Admin verification can promote an inferred candidate to
  official when a real source is confirmed.

## 8. Expiration, correction, retraction
- **Expiration:** deals carry start/end; past-end deals auto-expire (no alerts).
- **Correction (revision):** admins can revise details; consumers who saw it get a correction notice if
  material.
- **Retraction:** admins can unpublish a wrong deal; a retraction notice is sent to affected consumers;
  submitter reputation adjusts.

## 9. Duplicate detection & history
- **Dedupe:** same company + offer + overlapping window collapses to one deal (highest confidence
  source wins).
- **Historical promotions:** stored per company → power "Historical Pattern" + likely recurring windows
  (deterministic; e.g., "this brand ran a sale this week for 3 years").
- **Likely recurring windows** are shown as ranges (uncertain), visually distinct from confirmed dates
  (`CONSUMER_PRODUCT.md` calendar §).

## 10. Accuracy loop
- **User reports:** consumers flag inaccurate deals (`DealReport`) → moderation queue.
- **Company disputes:** a company can dispute a listing → admin review → correct/retract.
- **Administrator review:** all candidates pass a human gate before "official" push (V1);
  monitoring/AI only *assists* (ranks, drafts) — never auto-publishes as guaranteed
  (`VERIFIED_DEALS.md §11`).

## 11. AI/automation guardrails (Deal Intelligence)
"Approved AI-assisted research" may *suggest* possible upcoming promotions, but outputs are always
classified (Likely/Unverified), confidence-scored, source-attributed, and **never** labeled Confirmed
without a real source. Hallucination risk is mitigated by: source-required promotion, human verification
for push, confidence gating, and user-report feedback. AI never fabricates a source.

## 12. PrimeBuild neutrality
PrimeBuild may buy prominent promotional placement, but **paid placement is visibly distinct** from
verified information and **must not** influence search ranking, confidence scoring, or deal truthfulness.

## 13. Data boundaries
Consumer follows/prefs are private to the consumer. Deal **evidence** (pre-publish) is admin/service
only. Only **published** deals reach consumers (`RLS_SECURITY_MODEL.md §6`).

## 14. Open decisions
Fair-use follow number; which classes/confidence trigger push (proposed above); AI provider/scope; per-
country source lists; recurring-window inference thresholds.
