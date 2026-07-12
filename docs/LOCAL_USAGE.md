# Eventra — Local Usage Guide (for Brian)

> How to run and use Eventra Business on your own machine, every day, with **no Shopify, no Supabase, and
> no external services**. This is "preview + file" mode: the full Business UI, with your data saved to a
> local file that survives restarts. Nothing here connects to the internet or any store.

## First-time setup (once)
1. Install Node.js **20.19+** (or newer). Check: `node -v`.
2. From the project folder (`D:\Eventra\eventra`), install dependencies once:
   ```
   npm install
   ```
   If it warns about blocked scripts (Prisma/esbuild), run `npm approve-scripts` once, then `npm install`
   again.

## Start it (daily)
**Easiest (Windows):** double-click **`Eventra-Local.cmd`** in the project folder.

**Or from a terminal:**
```
npm run start:local
```
Then open the URL it prints — **http://localhost:3000/app** — in your browser.
Use a different port: `npm run start:local -- 4000`.

You'll see a yellow **"Preview mode"** banner at the top. That's expected: it means you're running locally,
not connected to any Shopify store.

## Stop it
Press **Ctrl-C** in the terminal window (or just close the `Eventra-Local.cmd` window). The app stops
cleanly and frees the port.

## Your data & persistence
- Everything you create (campaigns, custom events, templates, settings, country toggles, notes) is saved to
  **`apps/business/.eventra/dev-store.json`**.
- It **survives** browser refreshes, navigation, and full app restarts.
- It is **local only** and **git-ignored** — it never leaves your machine and is never committed.

## First-run experience
On the very first start (or after a reset) Eventra seeds a **Demo Store** workspace on the **Growth** plan
with sample campaigns and the US + Canada catalog, so every screen has realistic content to explore.

## Start fresh (reset)
To wipe your local data and get the clean demo again (stop the app first):
```
npm run reset:local
```

## Update to the latest version
```
npm run update:local
```
This fast-forwards your current branch and reinstalls dependencies. It **never** discards uncommitted work
— if you have local changes it stops and tells you. After updating, start again with `npm run start:local`.

## Configuration (optional)
Local mode needs **no configuration**. Advanced options (in `apps/business/.env`, all optional):
| Setting | Effect |
|---------|--------|
| `EVENTRA_PERSISTENCE_MODE=file` | (launcher sets this) save to disk, survives restarts |
| `EVENTRA_PERSISTENCE_MODE=` (unset) | in-memory only (resets each restart) |
| `EVENTRA_PERSISTENCE_FILE=path` | change where the data file is stored |
| `PORT=4000` | change the port |

Shopify/Supabase settings are **not needed** for local use and should stay blank.

## What works locally (everything in the Business product)
Dashboard · Calendar (year/month/day) · Countries · Events + custom events + hide/restore · Campaigns
(create/edit/status/duplicate/memory) · Templates · Library · Search · Analytics · Billing/plans ·
Settings/Appearance · in-app Admin. Plan limits are enforced by the server (e.g. country limits per plan).

## What is NOT available locally (by design)
- Installing into a real Shopify Admin (needs Shopify authorization — see
  `docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md`).
- Cloud database / multi-device sync (needs a Supabase project).
These are deliberate stop points; local mode never connects to them.

## Troubleshooting
| Problem | Fix |
|---------|-----|
| "Port already in use" | Something's on 3000 — stop it, or `npm run start:local -- 4000`. |
| Page won't load | Wait ~10s for the first build, then refresh `http://localhost:3000/app`. |
| Want the demo back | `npm run reset:local`, then start again. |
| "Dependencies not installed" | Run `npm install` from the project root. |
| Data seems stuck/corrupt | `npm run reset:local` for a clean slate (this deletes local data). |

## Health check (optional)
Confirm everything is sound without starting the UI:
```
npm run preinstall:check      # prints READY FOR SHOPIFY AUTHORIZATION
npm run verify:persistence    # proves data survives restarts
```
