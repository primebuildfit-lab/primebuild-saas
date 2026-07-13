# Eventra Business — Deploy Guide (`DEPLOY.md`)

> Status: **deploy-ready in code, not deployed.** This document is the exact recipe. Nothing here has
> been executed against a live host — Brian runs it when ready. Health endpoints, build config, and env
> contract are all in place.

## What ships

- **App:** `apps/business` — Shopify React Router app (`@shopify/shopify-app-react-router`).
- **Runtime:** Node ≥ 20.19. Server entry: `react-router-serve ./build/server/index.js` (listens on `PORT`,
  default 3000).
- **Session storage:** Prisma. Default SQLite (`dev.sqlite`); for a hosted deploy point `DATABASE_URL` at
  Postgres and the same Prisma schema applies.
- **Business data:** mock/file by default; **Supabase** when `EVENTRA_PERSISTENCE=true` + all `SUPABASE_*`
  set (see `docs/SUPABASE_SCHEMA.md`, migrations in `supabase/`).

## Health / readiness (already implemented)

| Path | Purpose | Auth | Behavior |
|------|---------|------|----------|
| `/healthz` | Liveness | public | 200 `{status:"ok", version, commit, env, uptimeSeconds}` — no DB |
| `/readyz` | Readiness | public | mock/file → 200; supabase → 200 only if secrets present **and** a catalog read succeeds, else 503 |

Point the platform health check at **`/healthz`** (already set in `railway.json`).

## Option A — Railway (recommended, config provided)

`railway.json` (repo root) uses Nixpacks:

```jsonc
build.buildCommand  = "npm ci && npm run -w @eventra/business prisma -- generate && npm run build --workspace @eventra/business"
deploy.startCommand = "npm run -w @eventra/business prisma -- migrate deploy && npm run start --workspace @eventra/business"
deploy.healthcheckPath = "/healthz"
```

Railway service settings:
1. **Root directory:** repo root (so npm workspaces resolve `@eventra/*`). Do **not** set it to `apps/business`
   — the app depends on sibling workspace packages that are not published.
2. Set the environment variables below.
3. Deploy. First deploy: verify the build resolves workspaces and `/healthz` returns 200.

> The existing `apps/business/Dockerfile` assumes a standalone context and will **not** resolve workspace
> deps on its own — prefer the Nixpacks commands above, or build Docker from the **repo root** with a
> root-context Dockerfile. Flagged in `docs/DECISIONS.md` D75.

## Option B — Any Node host

```bash
npm ci
npm run -w @eventra/business prisma -- generate
npm run build --workspace @eventra/business
# runtime:
npm run -w @eventra/business prisma -- migrate deploy
PORT=3000 npm run start --workspace @eventra/business
```

## Environment variables

Required for a real Shopify + Supabase deploy (put in the host secret store — never in git):

| Var | Needed for | Notes |
|-----|-----------|-------|
| `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` | OAuth | from the Partner app |
| `SHOPIFY_APP_URL` | OAuth callbacks | the public HTTPS URL of this deploy |
| `SCOPES` | install | keep `read_products` |
| `DATABASE_URL` | sessions | Postgres for a hosted deploy (else SQLite) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_JWT_SECRET` | real data | the **separate** Eventra project |
| `EVENTRA_PERSISTENCE=true` | real data | flips mode to `supabase` |
| `NODE_ENV=production` | hardening | fail-loud on missing secrets; preview disabled |

Prepared / optional: `BUILD_VERSION`, `BUILD_COMMIT`, `BUILD_TIME` (surface in `/healthz`), `LOG_LEVEL`,
`OBSERVABILITY_DSN`, `BILLING_TEST_MODE`. See `apps/business/.env.example`.

## Production safety already enforced

- `shopify.server.ts`: in production, missing `SHOPIFY_API_KEY`/`SHOPIFY_API_SECRET` fail loudly (placeholders
  only apply in non-production preview).
- `previewEnabled()` can never be true in production or supabase mode.
- `/readyz` returns 503 (holds traffic) if supabase mode is selected but the DB is unreachable.

## Not done (Brian-gated)

Actual deploy, DNS/HTTPS, setting real secrets, and the first `railway up`. See `docs/DECISIONS.md` D75 and
`docs/FINAL_CERTIFICATION_CHECKLIST.md`.
