# Eventra — Documentation Impact & Self-Audit (MEGA MODULE 1)

> Part 11 (project impact) + Part 13 (self-audit). Classifies every existing doc and records
> contradictions found and fixed. **No prior decision is deleted — only marked.**

## 1. Impact matrix — every document
Legend: ✅ Still valid · ✏️ Modified (valid but updated/rescoped) · 🔻 Deprecated (kept for history) ·
🔁 Replaced (superseded by a new doc).

| Document | Status | Note |
|----------|--------|------|
| `PLATFORM_VISION.md` | ✅ new | Umbrella vision + doc index. |
| `PLATFORM_ARCHITECTURE.md` | ✅ new | Shared/isolated, security, domains, migration, phases. |
| `CONSUMER_PRODUCT.md` | ✅ new | Complete consumer design. |
| `BUSINESS_PRODUCT.md` | ✅ new | Platform-first business design. |
| `ADMIN_CONSOLE.md` | ✅ new | Complete admin design. |
| `MONETIZATION.md` | ✅ new | All pricing + future lines. |
| `VERIFIED_DEALS.md` | ✅ new | Full verified-deal architecture. |
| `ADVERTISING.md` | ✅ new | Full ad-system design. |
| `USER_FLOWS.md` | ✅ new | Journeys for all three principals. |
| `PLATFORM_ROADMAP.md` | ✅ new | New phased roadmap. |
| `DOC_IMPACT.md` | ✅ new | This file. |
| `DECISIONS.md` | ✏️ Modified | D1–D35 preserved; old Shopify-first/plan items marked rescoped/superseded; D36–D46 added. |
| `BUILD_STATUS.md` | ✏️ Modified | Platform-review-pending; Phase 5 DB paused. |
| `ARCHITECTURE_REVIEW.md` | ✏️ Modified (scoped) | Now the **Eventra Business** architecture review; platform-level superseded by `PLATFORM_ARCHITECTURE.md`. Banner added. |
| `PRODUCT_ROADMAP.md` | 🔁 Replaced (phases) / ✅ (product def) | Phase plan replaced by `PLATFORM_ROADMAP.md`; the Business product definition + rules remain valid for Business. Old plan/price table superseded. Banner added. |
| `BUSINESS_RULES.md` | ✏️ Modified | Valid for Eventra Business; the subscription/pricing block is superseded by `MONETIZATION.md`. Banner added. |
| `PLAN_ENFORCEMENT.md` | ✏️ Modified | Mechanism valid + extends to trial-grace; the §1 plan table (old prices) is superseded by the new business plans. Banner added. |
| `SECURITY_PLAN.md` | ✏️ Modified | Valid; extends from `store`→`org` and adds consumer/admin principals at platform scope. |
| `SUPABASE_SCHEMA.md` | ✏️ Modified | Becomes the **Business slice** of the platform schema; `store`→`org`; platform tables (consumer/ads/deals/notifications) to be added. |
| `STATE_ARCHITECTURE.md` | ✅ Still valid | Business state model; `store`→`org` rename at implementation. |
| `ROUTING.md` | ✏️ Modified | Business routing valid; `/app/*`→`/business/*` rescope + `/app` embedded host. |
| `RECURRENCE.md` | ✅ Still valid | Shared calendar engine — used by Consumer + Business. |
| `PROJECT_AUDIT.md` | ✅ Still valid | Historical audit of the Business codebase + dispositions. |
| `SOP.md` | ✅ Still valid | Dev SOP; Shopify-first references now read as "Business surface". |
| `PHASE1_CORRECTION_PLAN.md` | 🔻 Deprecated (historical) | Completed one-time plan; kept for record. |
| `PHASE5_PILOT_RUNBOOK.md` | ✏️ Modified | Runbook valid for the Business pilot, but **rescoped** to the platform schema and **paused** (see `PLATFORM_ARCHITECTURE.md §19`). |
| `CLAUDE.md` (root) | ✏️ Modified | Permanent rules valid; product identity + plan section rescoped to Business by the platform expansion. Banner added; content preserved. |

## 2. New documentation required (created here)
`PLATFORM_VISION`, `PLATFORM_ARCHITECTURE`, `CONSUMER_PRODUCT`, `BUSINESS_PRODUCT`, `ADMIN_CONSOLE`,
`MONETIZATION`, `VERIFIED_DEALS`, `ADVERTISING`, `USER_FLOWS`, `PLATFORM_ROADMAP`, `DOC_IMPACT`.

## 3. New documentation still needed (future modules)
- `PLATFORM_SCHEMA.md` — the full multi-principal DB schema + RLS (expands `SUPABASE_SCHEMA.md`).
- `NOTIFICATIONS.md` — detailed notification service spec (channels, scheduling, templates).
- `INTEGRATIONS.md` — per-adapter contracts (Shopify/Woo/Wix/Squarespace/custom).
- `DESIGN_SYSTEM.md` — cross-surface UI/brand variants (Consumer vs Business vs Admin).
- `API_CONTRACTS.md` — shared backend API/RPC contracts.
- `PRIVACY_COMPLIANCE.md` — consent, data export/delete, store data-safety, ads.

## 4. Self-audit — issues found & fixed
| Issue | Where | Resolution |
|-------|-------|-----------|
| **Plan/pricing contradiction** (old Free/$10/$20/VIP vs new $15/$30/$45 + trial) | `BUSINESS_RULES`, `PRODUCT_ROADMAP`, `PLAN_ENFORCEMENT`, `CLAUDE.md` | Added "superseded — see MONETIZATION.md" banners; kept originals (history). |
| **"Do not use Pro"** vs new **"Business Pro"** | `CLAUDE.md §9`, `DECISIONS D10` | Amended in `DECISIONS` (D10) + `CLAUDE.md` banner: "Business Pro" is the approved top tier. |
| **"Shopify app first / Shopify is the product"** framing | `CLAUDE.md`, `PRODUCT_ROADMAP`, `ARCHITECTURE_REVIEW`, `SOP` | Rescoped via banners: Shopify = one Business integration (D5 rescoped). |
| **`store` vs `org` tenancy** | `SUPABASE_SCHEMA`, `SECURITY_PLAN`, `STATE_ARCHITECTURE`, `ROUTING` | Noted as a rename at implementation (D17/D24 generalized); flagged in matrix. |
| **Duplicate ad/verified-deal content** across `MONETIZATION`/`PLATFORM_ARCHITECTURE` | — | Detailed designs moved to `ADVERTISING.md` + `VERIFIED_DEALS.md`; others cross-reference (no duplication). |
| **Missing** dedicated user-flow + roadmap docs | — | Added `USER_FLOWS.md`, `PLATFORM_ROADMAP.md`. |

## 5. Residual contradictions (intentional, tracked)
- Old docs still describe a Shopify-only product in their *body*. This is **intentional history**; the
  banners + this matrix are the authoritative reconciliation. Full rewrites happen per future module
  (§3) when the corresponding code is built — not now (docs-only scope).
- Numeric entitlements remain **proposed** (not contradictions, but open decisions in `DECISIONS.md`).

## 6. Security / scalability / migration risks noted during audit
- **Data-boundary leaks** (consumer↔business↔admin) — the top risk; mitigated by per-principal RLS +
  isolation tests (`SECURITY_PLAN`, `PLATFORM_ARCHITECTURE §11`).
- **Identity multiplexing** complexity (4 auth sources → 1 RLS model).
- **Store/App billing** economics for consumer mobile.
- **Verified-deal trust** depends on real sources + moderation.
- **Scope** — 3–4× expansion; mitigate by landing Business persistence (P2) before new surfaces.
