# Eventra — Privacy, Consent & Advertising Safety (decision framework)

> Framework only. **No tracking/advertising SDKs, no personalized-ad infrastructure implemented.**
> Every item marked **⚖️ legal review** requires counsel before launch. Recommended posture is
> conservative. Related: `ADVERTISING.md`, `NOTIFICATIONS.md`, `RLS_SECURITY_MODEL.md`.

## 1. Recommended launch posture
- **Contextual advertising before personalized** — target only by country + followed categories, no
  behavioral profiles.
- **Minimal data collection**; no sale of sensitive personal data.
- **Transparent ad labels**; advertisements always visibly distinct from verified deals.
- **Explicit opt-in** for push notifications and for any personalization.
- **Clear separation** between advertisements and verified/monitored deals at every touchpoint.

## 2. Decision framework (each = policy + default + review flag)
| Item | Default (proposed) | Flag |
|------|--------------------|------|
| Essential analytics (app function, crash) | on, first-party, aggregated | ⚖️ |
| Optional analytics (product usage) | **opt-in** | ⚖️ |
| Personalized advertising | **off at launch** (contextual only) | ⚖️ |
| Contextual advertising | on for Free consumers (country/category) | ⚖️ |
| Precise location | **not collected** | ⚖️ |
| Approximate region | from chosen country only (no geolocation) | ⚖️ |
| Notification consent | **explicit opt-in** per channel | ⚖️ |
| Company-follow data | private to consumer; used for alerts/relevance only | ⚖️ |
| Behavioral profiles | **none at launch** | ⚖️ |
| Device identifiers | minimal, functional only | ⚖️ |
| Advertising identifiers (GAID/IDFA) | **not used at launch** | ⚖️ |
| Data retention | defined per data class; minimize | ⚖️ |
| Account deletion | self-serve; cascades within tenant after retention | ⚖️ |
| Data export | self-serve (portability) | ⚖️ |
| Children/minors | app not directed to children; age gating if required | ⚖️ **high** |
| Country-specific requirements | GDPR/UK-GDPR/CCPA/CPRA + store rules | ⚖️ **high** |
| Consent withdrawal | one-tap; takes effect immediately | ⚖️ |
| Privacy dashboard | in-app: view/manage consents, export, delete | ⚖️ |

## 3. Advertising safety
- Ads only in Consumer app, only for users **without** the Ad-Free add-on (server-enforced,
  `ENTITLEMENTS.md`).
- **Ad ≠ verified deal:** paid/promotional placement (incl. PrimeBuild and Business-Pro promo exposure)
  is **always labeled** and **never** presented as independently verified information; it must not
  affect search ranking or confidence scoring (`COMPANY_MONITORING.md §12`).
- No third-party ad-network SDK at launch (privacy + store review). First-party event logging only,
  minimal and consented.
- Misleading-ad prevention + moderation (`ADVERTISING.md`).

## 4. Store & platform compliance (⚖️ high)
Google Play Data Safety + Ads policy; Apple App Tracking Transparency + Privacy Nutrition Labels;
consent management for EU/UK; do-not-sell/limited-use signals for US states. Push consent per platform.
All require legal review before mobile release.

## 5. Data-subject rights
Access, export, deletion, correction, consent withdrawal — all self-serve via the privacy dashboard,
backed by tenant-scoped retention/deletion (`PLATFORM_SCHEMA.md §11`).

## 6. Open decisions (all need legal sign-off)
Personalized ads ever?; analytics vendor(s) + data residency; retention windows per class; minors
policy + age gating; consent-management platform; exact regional compliance scope at launch.
