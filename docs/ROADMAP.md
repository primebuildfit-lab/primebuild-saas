# Eventra Roadmap (`ROADMAP.md`)

> Consolidated forward view. Source specs: `PLATFORM_ROADMAP.md`, `PRODUCT_ROADMAP.md`. This is the
> phase-level status after Phase 7.

## Done (in code, verified green — not deployed)

- **Phase 8 (Business UI reorg):** Business (Nivel B) re-centered on **opportunities → campaigns → content →
  results → memory → reuse**. Opportunity engine, opportunity-first navigation, control-center dashboard,
  Analytics builder, and new architecture modules (Content/Audiences/Media/Sources/Integrations/Automations/
  Jobs/AI/Team/Account). Presentation + read-model only; LIVE Supabase untouched. See
  `BUSINESS_INFORMATION_ARCHITECTURE.md`. **Follow-ups:** full annual-engine Calendar; Settings 8-section
  split; persisting new-module data (needs schema → later gate).
- **Phase 1–4:** Business product, mock-driven (dashboard, calendar, campaigns, memory, templates, …).
- **MM3–MM5:** monorepo; org/workspace persistence + RLS (designed); pre-install readiness.
- **Stabilization:** canonical plans (`@eventra/config`) + roles/permissions (`@eventra/identity`) with
  server enforcement; PWA.
- **Phase 6:** compliance webhooks, health/readiness, observability, deploy config, certification checklist.
- **Phase 7:** Internal OS (Nivel A) — dark shell + Home/Calendar/Offers/Sources/Companies/Users/Commissions/
  Jobs/Analytics/AI screens; offer engine (scoring/horizon/cancellation), AI port + fake, commissions,
  platform roles — all tested; offer-engine schema + RLS (0004/0005) designed; doc set.

## Next (Brian-gated activation)

1. Credentials: Shopify (`client_id` + secrets), separate Supabase project.
2. Apply migrations (tenant + internal-os); run live RLS isolation matrices.
3. Deploy (Railway); verify `/healthz` + `/readyz`.
4. Install on a Shopify dev store; certify (`FINAL_CERTIFICATION_CHECKLIST.md`).
5. Install PWA on device.

## Next (development, after activation)

- Extract the Internal OS design system into `@eventra/ui` (share with Partnera/Nexus).
- Build scaffolded modules (Cancellations queue, Content builder, Templates, Media, Audiences, Integrations,
  Countries, Health, Logs, Audit, Settings, Plans).
- Real source connectors + job scheduler/queue (authorized sources only).
- Real AI provider behind the port (authorized).
- Shopify Billing + real commissions (authorized).
- Playwright E2E harness; formal a11y/performance audits.
- Merchant-facing Business plan price/name flip (D71 — Brian decision).

## Not in scope (blocked/forbidden)

Scraping that violates ToS; spam tooling; auto-publishing low-confidence AI; real charges without
authorization; deploy/install/merge/push without authorization.
