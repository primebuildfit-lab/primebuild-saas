# Eventra — Repository Architecture (recommendation)

> Target monorepo for the three-surface platform. **Do not reorganize yet** — the exact steps are in
> `MIGRATION_PLAN.md`. Goal: editable, modular, project-owned code; **no no-code/proprietary lock-in**.

## 1. Target structure
```
apps/
  consumer/      # Eventra Consumer (web/PWA → Android/iOS shell later)
  business/      # Eventra Business (current React Router app; Shopify embedded host)
  admin/         # Eventra Admin Console (web, desktop-first)
packages/
  ui/            # design system + primitives (shared)
  identity/      # principals, auth adapters, session→RLS-JWT bridge
  calendar/      # event/date engine (events, planning, calendar, dates, recurrence)
  deals/         # deal classification, confidence, monitoring contracts
  notifications/ # notification service client + types
  billing/       # orchestration abstractions (BillingProvider/Resolver/Verifier/…)
  analytics/     # event schema + client
  advertising/   # ad selection + fair-use contracts
  integrations/  # CommerceConnection adapters (shopify/woo/wix/squarespace/custom)
  config/        # SINGLE source: prices, limits, plan→entitlement maps, flags
  types/         # shared domain types
  testing/       # test utils, fixtures, RLS/isolation harness
services/
  api/           # shared backend API/RPC (if not colocated with apps' server routes)
  workers/       # monitoring, notification fan-out, billing webhooks, reconciliation
  monitoring/    # health checks, job orchestration
supabase/
  migrations/    # schema (platform)
  policies/      # RLS
  seeds/         # dev/demo (clearly separated)
  tests/         # pgTAP/isolation tests
docs/
```

## 2. Package boundaries & dependency rules
- **Direction:** `apps/*` → `packages/*` → (`config`, `types`). `packages/*` **never** import `apps/*`.
- `config` and `types` are leaf packages (no app deps) — the single source of truth.
- Cross-surface logic lives in `packages/*`; surface-specific UI/routes live in `apps/*`.
- `integrations/*` implement a common interface from `packages/integrations`; adding one is additive.
- `services/workers` depend on `packages/*` + `supabase`; never on `apps/*`.
- Enforce with lint boundary rules (e.g., no `apps/*` import from another app; no upward imports).

## 3. What is shared vs not
- **Shared:** `ui`, `calendar`, `identity`, `config`, `types`, `billing`, `notifications`, `deals`,
  `advertising`, `integrations`, `analytics`, `testing`.
- **Not shared (surface-specific):** onboarding, navigation, branding variants, per-surface routes, and
  each product's page composition — Consumer and Business must **feel like distinct products**.
- **Never shared across tenants:** any customer/business/consumer data (enforced by RLS, not packaging).

## 4. Environments & deployment
- **Environments:** local · staging · production, each with isolated Supabase project + secrets.
- **Deployment units:** each `apps/*` deploys independently (own build/release); `services/workers`
  deploy separately; `supabase` migrations gated per environment.
- **Feature flags** decouple release from exposure (`ADMIN_CONFIGURATION.md`).
- **Versioning:** independent app versions (Consumer/Business/Admin) + min-supported gate for mobile
  (`ADMIN_CONSOLE.md → Versions`). Shared packages semver-versioned within the monorepo.

## 5. Tooling (recommended, editable/open)
Monorepo manager (npm/pnpm workspaces or Nx/Turborepo) — all standard, no lock-in. TypeScript
everywhere; Vitest for units; pgTAP/SQL tests for RLS; the existing React Router setup carries into
`apps/business` (and is a strong base for `apps/consumer`/`apps/admin`).

## 6. Open decisions
Workspace tool (pnpm+Turborepo recommended); whether `services/api` is separate or colocated in each
app's server routes (RR loaders/actions can serve much of it); mobile shell tech for Consumer (PWA/TWA
first, native later).
