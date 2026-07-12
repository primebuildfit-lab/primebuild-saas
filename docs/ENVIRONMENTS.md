# Eventra — Environment Strategy

> Templates + rules for environment configuration. **No real secrets committed; no services connected.**

## Environments
`local` · `test` · `development` · `staging` · `production`. Each real environment gets its **own**
Supabase project + secrets (no shared production secret file).

## Per-surface separation
| Surface | Env file | Exposure |
|---------|----------|----------|
| Consumer | `apps/consumer/.env.example` | client SPA — only `VITE_` non-secrets |
| Business | `apps/business/.env.example` | Shopify app server + client |
| Admin | `apps/admin/.env.example` | private client SPA — only `VITE_` non-secrets |
| API / services | `services/api/.env.example` | **server-only** secrets (service role, JWT secret, Shopify secret) |
| Workers | (uses services env) | server-only |

## Rules
- **No real secrets in git.** `.env` / `.env.*` are gitignored (`!.env.example` kept).
- **Client apps** may only read `VITE_`-prefixed **non-secret** values; secrets never reach the bundle.
- **Server secrets** (Supabase service role + JWT secret, Shopify secret, PSP keys) live only in the
  API/workers env and a future **secret manager** (e.g. platform env vars / a managed secrets store) —
  documented, not implemented.
- **Safe local defaults**: foundation runs on mock data with `EVENTRA_PERSISTENCE=false` and no
  connected providers.
- **Validation**: each app validates its required env at startup (schema validation to be added with the
  API in a later module).

## Required vs optional (current foundation)
All service/provider vars are **optional** now (foundation runs on mocks). They become **required** in
the phase that connects the corresponding service (Supabase persistence, billing, ads) — gated per
`docs/PHASE5_PILOT_RUNBOOK.md` / `docs/PLATFORM_ROADMAP.md`.
