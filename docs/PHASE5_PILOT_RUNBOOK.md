# Eventra — Phase 5 Private Pilot Runbook

> How to connect Eventra to Brian's Shopify environment and a **new, separate** Supabase project.
> Private pilot only: **no App Store submission, no public billing, no external merchants.** Never
> touch primebuild-core, the PrimeBuild theme, or its rewards system.
>
> This repo already contains everything that does **not** need credentials: the DB contract
> (`supabase/migrations/*`), reference data, dev seed, minimal Shopify scopes (`read_products`),
> `.env.example`, and the security/enforcement specs. The steps below are the parts that require
> Brian's interactive login, a new Supabase project, and secrets — the sprint's designated stop gates.

## What's prepared (in-repo, no credentials needed)
- `supabase/migrations/0001_schema.sql` — all tables (catalog + tenants + merchant + subscriptions).
- `supabase/migrations/0002_rls.sql` — `is_store_member()`, RLS on every table, member-scoped policies.
- `supabase/migrations/0003_reference_data.sql` — countries, plans, and the 11 official events
  (matches `app/data/*`, including the corrected Black Friday / Cyber Monday rules).
- `supabase/seed.sql` — **dev-only** Demo Store (clearly separated from real data).
- `shopify.app.toml` — `read_products` only (no write scopes; Eventra never writes to the store).
- `.env.example` — every variable the pilot needs, documented.

## Gate A — Shopify: create & link the Eventra app (Brian, interactive)
Requires a Shopify Partner login; Claude cannot authenticate to your Partner account.

```bash
# From the repo root, logged into the Shopify CLI as Brian:
shopify app config link          # pick the Partner org; create a NEW app named "eventra"
                                 # → writes client_id + application_url into shopify.app.toml
                                 # (optionally create a named config: shopify.app.eventra-dev.toml)
shopify app dev --store <your-dev-store>.myshopify.com
                                 # tunnels + installs Eventra on the dev store; opens the embedded app
```
Notes:
- Use a **development/test store** you designate — not a live PrimeBuild store.
- Keep the scope at `read_products`. Approve the install prompt.
- For a future production config, run `shopify app config link` again into `shopify.app.eventra-prod.toml`
  when ready — **do not deploy/publish for this pilot.**

## Gate B — Supabase: create the separate Eventra project (Brian authorizes)
Two options — pick one:
- **B1 (Claude via MCP):** authorize Claude to create the project through the connected Supabase MCP.
  This has a small monthly cost and needs your explicit OK (external-cost gate). Claude will then
  `apply_migration` for 0001–0003.
- **B2 (Brian self-provisions):** create a new project at https://supabase.com/dashboard (any org that
  is **not** primebuild-core), then run the migrations:
  ```bash
  supabase link --project-ref <eventra-ref>
  supabase db push          # applies supabase/migrations/*
  # reference data is in 0003; dev seed (optional, non-prod): psql "$DATABASE_URL" -f supabase/seed.sql
  ```

## Gate C — Secrets (Brian enters into .env, never committed)
From the Shopify app (Gate A) and Supabase project settings (Gate B):
```
SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_APP_URL, SCOPES=read_products
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
EVENTRA_PERSISTENCE=true
```
`SUPABASE_JWT_SECRET` = the project's JWT secret (Supabase → Settings → API). Keep the service role
and JWT secret **server-side only**.

## After the gates — Claude builds & verifies persistence
Once A–C are done (or authorized), Claude will:
1. Add the Supabase server client + real `tenant.server.ts` (resolve Shopify session → provision store +
   owner membership on install; never trust a client storeId).
2. Convert each domain (countries, event prefs, hide/restore, custom events, campaigns + duplication/
   history, templates, store preferences, pilot plan selection) to React Router `loader`/`action`s
   behind `EVENTRA_PERSISTENCE`, keeping the mock path as fallback.
3. Add persistence + tenant-isolation tests (per `docs/SECURITY_PLAN.md §7`) and re-run
   lint / typecheck / test / build.

## How Brian opens & tests Eventra (once wired)
1. `shopify app dev --store <dev-store>` → open the app from the store's Apps menu (embedded).
2. Create a campaign / enable a country / hide an event.
3. Refresh, log out/in, restart the server, reopen from another device on the same store — data persists.
4. Confirm a second store cannot see the first store's data (tenant isolation).
