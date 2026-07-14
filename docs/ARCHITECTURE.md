# Eventra Architecture (`ARCHITECTURE.md`)

> Phase 8 consolidated view. Detailed docs: `BUSINESS_INFORMATION_ARCHITECTURE.md` (Business Nivel B is now
> reorganized around **opportunities** — engine in `apps/business/app/lib/opportunities.ts`, pure/tested,
> shared by dashboard/opportunities/countries/analytics), `PLATFORM_ARCHITECTURE.md`, `DATA_MODEL.md`,
> `INTERNAL_OS_INFORMATION_ARCHITECTURE.md`, `OFFER_ENGINE.md`.

## Monorepo (npm workspaces, 13)

```
apps/
  business/   Nivel B — Shopify-embedded + web marketing/campaign app (React Router)
  admin/      Nivel A — Eventra Internal OS (Vite SPA): offer engine, calendar, companies, AI, commissions
  consumer/   Nivel C — personal app (foundation shell)
packages/
  types, config (canonical plans), entitlements, identity (roles: tenant + platform),
  calendar, ui (shared shell/primitives), testing
services/     api, workers (contracts)
supabase/     0001 tenant schema, 0002 tenant RLS, 0003 reference, 0004 internal-os, 0005 internal-os RLS,
              seeds, rollback, tests
```

## Three levels, strict separation

A (Internal OS, admin) · B (Business) · C (Personal). A platform role can only attach to an admin
principal; tenant roles can never reach platform permissions (`@eventra/identity`, enforced + RLS).

## Canonical sources of truth

- **Plans/entitlements:** `@eventra/config` + `@eventra/entitlements`.
- **Roles/permissions:** `@eventra/identity` (tenant `OrgRole` + platform `PlatformRole`).
- **Offer engine:** `apps/admin/src/engine/*` (pure) ↔ `supabase/migrations/0004`.

## Persistence modes (Business)

`mock` (default) · `file` (dev, survives restart) · `supabase` (real, RLS). No silent fallback in production.

## Boundaries

`scripts/check-boundaries.mjs` forbids app→app and package→app imports and cycles (green).

## Activation state

Deploy config (`railway.json`), health (`/healthz`, `/readyz`), compliance webhooks, PWA — all ready.
Live Supabase + Shopify credentials + deploy/install are Brian-gated. See `FINAL_CERTIFICATION_CHECKLIST.md`.
