# Eventra — Documentation Impact & Self-Audit (MEGA MODULE 1 + 2)

> Project impact + self-audit. Classifies every existing doc and records contradictions found and fixed.
> **No prior decision is deleted — only marked.** §1–§6 are from MM1; §7 is the MM2 architecture-lock
> self-audit. MM2 added 13 implementation-ready docs (see `DECISIONS.md` D47–D59).

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

## 3. New documentation status
**Delivered in MM2:** `ENTITLEMENTS`, `CONSUMER_PLANS`, `BUSINESS_PLANS`, `PLATFORM_SCHEMA`,
`RLS_SECURITY_MODEL`, `BILLING_ARCHITECTURE`, `TRIALS_AND_DOWNGRADES`, `COMPANY_MONITORING`,
`NOTIFICATIONS`, `AD_PRIVACY`, `ADMIN_CONFIGURATION`, `REPOSITORY_ARCHITECTURE`, `MIGRATION_PLAN`.
**Still needed (future modules):** `INTEGRATIONS.md` (per-adapter contracts), `DESIGN_SYSTEM.md`
(cross-surface brand variants), `API_CONTRACTS.md` (shared API/RPC). `AD_PRIVACY.md` covers the privacy/
compliance framework.

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

---

## 7. MEGA MODULE 2 — Architecture-Lock Self-Audit (risk register)
Every risk the lock must withstand, with its mitigation and where it's specified.

| Risk | Mitigation | Where |
|------|-----------|-------|
| Contradictory entitlements | Single entitlement engine + one config source; superseded items marked | `ENTITLEMENTS.md`, `DECISIONS.md` |
| Impossible plan combinations | Consumer = two orthogonal axes (only 4 states A–D); resolver enumerated | `ENTITLEMENTS.md §3`, `CONSUMER_PLANS.md §1` |
| Ad-Free wrongly bundled into $30 | Locked as independent add-on; ads gated by `addon.ad_free` only; docs corrected | `CONSUMER_PLANS.md`, `ADVERTISING.md`, `ENTITLEMENTS.md` |
| Hidden billing edge cases | Orchestration layer: dup-sub protection, restore, grace, reconciliation, idempotent webhooks | `BILLING_ARCHITECTURE.md §6` |
| Cross-product data leaks | Per-principal RLS + server checks; consumers see only published data; isolation-test matrix | `RLS_SECURITY_MODEL.md §6–7` |
| Privacy problems | Contextual-first, explicit consent, minimal data, dashboard; every item ⚖️ legal review | `AD_PRIVACY.md` |
| Misleading verified-deal claims | 5 classes; uncertainty visually distinct; never "guaranteed"; human verify for push | `COMPANY_MONITORING.md §5`, `VERIFIED_DEALS.md` |
| Ad vs verification conflict | Paid placement always labeled + separate; must not affect ranking/confidence | `AD_PRIVACY.md §3`, `COMPANY_MONITORING.md §12` |
| Unbounded free-ad inventory | Frequency caps + global per-user daily cap + pacing; no interstitial spam | `ADVERTISING.md §5` |
| Abuse of unlimited Pro workspaces | "Unlimited" = fair-use with technical protection threshold | `BUSINESS_PLANS.md §7`, `ENTITLEMENTS.md` |
| Notification spam | Dedupe keys, per-type + global caps, quiet hours, opt-out, job rate limits | `NOTIFICATIONS.md §6` |
| AI hallucination | Source-required promotions; classify + confidence-gate; human verify; never fabricate a source | `COMPANY_MONITORING.md §11` |
| Illegal/restricted monitoring | Legal/approved public sources only; no auth bypass/hidden-data extraction | `COMPANY_MONITORING.md §2`, `RLS_SECURITY_MODEL.md §8` |
| Storefront widget abuse | Merchant-approved, frequency controls, easy disable, accessibility, no user-trapping | `BUSINESS_PLANS.md §3` |
| Mobile billing conflicts | Store-billing mandate flagged as open decision; orchestration supports either | `BILLING_ARCHITECTURE.md §7` |
| Restore-purchase problems | Re-verify receipts → idempotent re-resolve → clear read-only | `BILLING_ARCHITECTURE.md §6` |
| Trial exploitation | One trial per identity (permanent record); dup-account signals; no silent conversion | `TRIALS_AND_DOWNGRADES.md §5` |
| Duplicate accounts | Anti-abuse signals; unique constraints; flagged (residual risk — needs product policy) | `RLS_SECURITY_MODEL.md`, open decision |
| Business downgrade data loss | Never delete; excess → read-only; customer chooses active workspaces; restore on upgrade | `TRIALS_AND_DOWNGRADES.md §3` |
| Admin over-permission | RBAC + audit on every write; sensitive actions need confirmation/2nd admin | `RLS_SECURITY_MODEL.md`, `ADMIN_CONSOLE.md §1` |
| Repository coupling | Package boundaries + dependency direction rules + lint enforcement | `REPOSITORY_ARCHITECTURE.md §2` |
| Future migration risk | Incremental migration, green tests each step, isolation-test gates | `MIGRATION_PLAN.md §6–7` |

**Approved rules NOT changed** (flagged if they were a concern, but preserved): the four consumer prices
and independence, the four business plans + workspace limits + year-horizons, the 45-day/30-day trials,
and PrimeBuild's non-privileged status. No approved price or core feature was altered.
