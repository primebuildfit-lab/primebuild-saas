# Eventra — Shopify Dev-Store Install Runbook (MM5, Part 14)

> The exact, ordered steps to install Eventra Business into a Shopify **development** store. Written to be
> executed by a new developer/AI **without chat history**. Steps marked ⛔ **require Brian** (login,
> store selection, secrets) and must NOT be automated. Do not run the gated steps until Brian authorizes.

## 0. What this installs
Eventra Business — an embedded Shopify app (React Router + App Bridge). Persistence runs in `mock` (or
`file`) mode until a separate Supabase project is provisioned; you can install and use the app without
Supabase.

## 1. Prerequisites
- Node **≥ 20.19** (`node -v`). Repo dev machine runs v24 — fine.
- **Shopify CLI** installed: `shopify version` (install: `npm i -g @shopify/cli @shopify/theme` if missing).
- A **Shopify Partner account** and a **development store** you are authorized to use.
- ⛔ **Never select PrimeBuild production** (`primebuildfit.com`) as the install target. Dev store only.
- Repo cloned; from repo root run `npm install` (this machine: if postinstall scripts were blocked, run
  `npm approve-scripts` or `node node_modules/esbuild/install.js` once — see `MEMORY`/handoff).

## 2. Verify readiness (safe, no external access)
```
npm run preinstall:check          # must print: READY FOR SHOPIFY AUTHORIZATION
npm run verify:persistence        # file-mode persistence + reload proof
```
If `preinstall:check` prints NOT READY, fix the listed blockers first.

## 3. ⛔ Brian: Shopify authentication
```
cd apps/business
shopify auth logout      # optional clean slate
shopify app config link  # opens browser → Brian logs in, selects the Partner ORG + app
```
This populates `client_id` in `shopify.app.toml` and creates `.env` values. **Brian performs the login
and org selection.** Do not proceed past this without it.

## 4. ⛔ Brian: development store
When `shopify app dev` first runs it asks which **development store** to use. **Brian selects the approved
dev store.** Never choose PrimeBuild production.

## 5. Environment values
Copy the template and fill Shopify values (Brian provides secrets):
```
cp apps/business/.env.example apps/business/.env
# SHOPIFY_API_KEY / SHOPIFY_API_SECRET / SHOPIFY_APP_URL are set by the CLI/link step.
# Leave EVENTRA_PERSISTENCE=false for the first install (mock/file mode). No Supabase needed.
```

## 6. Start the app (installs on first load)
```
cd apps/business
shopify app dev
```
The CLI builds, opens a tunnel, sets `SHOPIFY_APP_URL`, and prints a preview URL. Opening it triggers the
**OAuth/install** flow on the selected dev store (⛔ Brian approves the install prompt).

## 7. Open Eventra in Shopify Admin
- Follow the CLI's preview link, or go to the dev store Admin → **Apps** → **eventra**.
- The embedded app loads at `/app`; the sidebar/topbar shell renders with the Business surface.

## 8. Verify the install
- **Session storage:** a Prisma/SQLite `Session` row is created (dev DB `apps/business/prisma/*`). The app
  loading past `/auth` confirms the session token works.
- **Embedded navigation:** click through Dashboard → Calendar → Campaigns → Settings; App Bridge keeps the
  Admin frame; no full-page reloads escape the iframe.
- **Persistence (mock/file):** create a campaign; in `file` mode reload — it survives (see
  `EVENTRA_PERSISTENCE_MODE=file`). In `mock` mode it resets on server restart (expected).

## 9. Stop / restart
- Stop: `Ctrl-C` in the `shopify app dev` terminal.
- Restart: `shopify app dev` again (session + config persist).

## 10. Uninstall safely
- Dev store Admin → **Apps** → **eventra** → **Uninstall**. This fires the `app/uninstalled` webhook
  (`routes/webhooks.app.uninstalled.tsx`) which clears the app's sessions. No merchant data is written by
  Eventra (visual-only V1), so uninstall is clean.

## 11. Troubleshooting
| Symptom | Fix |
|---------|-----|
| `shopify app dev` asks to create an app | Run `shopify app config link` first (Brian). |
| Blank/redirect loop at `/app` | Check `SHOPIFY_APP_URL` matches the tunnel; re-run `dev`. |
| `Missing SHOPIFY_API_KEY` | `.env` not populated — re-run `config link`. |
| Prisma errors | `cd apps/business && npx prisma generate && npx prisma migrate deploy`. |
| Want to inspect UI without Shopify | `EVENTRA_PREVIEW=true EVENTRA_PERSISTENCE_MODE=file npx react-router dev` (labeled preview; no OAuth). |

## 12. Later: enable real Supabase persistence (separate gate)
Provision a **new, separate** Eventra Supabase project, apply `supabase/migrations/0001 → policies/0002 →
migrations/0003 → seeds/seed` and `supabase/tests/preinstall_rls_matrix.sql`, set the `SUPABASE_*` vars +
`EVENTRA_PERSISTENCE=true`, then restart. See `docs/PHASE5_PILOT_RUNBOOK.md`.

## STOP POINT
Automated preparation ends at **§3**. Steps §3–§6 require Brian's Shopify authentication, dev-store
selection, and secrets. Do not perform them autonomously.
