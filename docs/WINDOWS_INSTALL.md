# Eventra — Windows Installation & Desktop Integration

> How Eventra Business is installed on Windows 11 so Brian can launch it like any desktop app — a Desktop
> icon and a Start Menu entry that open the app in the browser. **Local only**: no Shopify, no Supabase, no
> deploy. Companion to `docs/LOCAL_USAGE.md` (daily use).

## What "installed" means here
Eventra runs from the project folder (`D:\Eventra\eventra`) as a local dev server in **preview + file**
mode. "Installing" on Windows = creating shortcuts (Desktop + Start Menu) that start it. There is **no**
MSI/EXE installer and **no** Windows service — it is a foreground app whose console window hosts the server.

## One-time setup
1. Install **Node.js 20.19+** (`node -v`).
2. From the project root: `npm install` (if scripts were blocked: `npm approve-scripts`, then re-run).
3. Create the shortcuts:
   ```
   npm run shortcuts:install
   ```
   This generates the app icon (`assets/eventra.ico`) if needed and creates:
   - **Desktop:** `Eventra Business`
   - **Start Menu:** `Eventra ▸ Eventra Business`

## Launching
- **Double-click** the Desktop **Eventra Business** icon, or find **Eventra Business** in the Start Menu.
- A console window opens (the running app) and your browser opens to **http://localhost:3000/app**.
- The yellow **Preview mode** banner confirms it's local and not connected to any store.

Alternate launch methods (all equivalent):
| Method | Command |
|--------|---------|
| Batch (double-click) | `Eventra-Local.cmd` |
| npm | `npm run start:local` |
| PowerShell | `pwsh scripts/eventra-local.ps1` |
| Node directly | `node scripts/eventra-local.mjs` |
| Custom port | `npm run start:local -- 4000` |
| Don't auto-open browser | `npm run start:local -- --no-open` |

## Stopping
Close the console window, or press **Ctrl-C** in it. The server stops cleanly and frees the port.

## Updating
```
npm run update:local     # safe fast-forward pull + npm install (never discards your work)
```
If the project folder is **moved or renamed**, re-run `npm run shortcuts:install` to repoint the shortcuts.

## Removing
- Remove the shortcuts only (keep the app): `npm run shortcuts:uninstall`.
- Remove everything: delete the project folder after uninstalling the shortcuts.
- Your local data lives in `apps/business/.eventra/` (git-ignored). Delete it or run `npm run reset:local`.

## Launcher hardening (Windows-safe)
- `Eventra-Local.cmd` sets **UTF-8** codepage (`chcp 65001`), a window **title** (`Eventra - Local`),
  the working directory, forwards arguments (`%*`), and returns the child **exit code** (pausing only on
  error).
- `scripts/eventra-local.ps1` forces UTF-8 console output encoding.
- `scripts/eventra-local.mjs` prints **ASCII-only** output (renders on any codepage), detects an
  **already-running** instance (HTTP probe on `localhost`, IPv4/IPv6-agnostic) and just opens the browser
  instead of double-starting, auto-opens the browser when ready, and reports missing dependencies / start
  failures with clear messages and non-zero exit codes.

## First-run experience
On first launch (or after `npm run reset:local`) Eventra seeds a **Demo Store** workspace (Growth plan,
sample campaigns, US + Canada). It verifies configuration implicitly (mock/file mode needs none), prints
the URL + data location, and **never crashes on missing optional services** — with no Shopify/Supabase
configured it runs fully in local mode.

## Windows QA — verified
| Scenario | Result |
|----------|--------|
| Fresh install (shortcuts + icon) | ✅ created, correct target/workdir/icon, no temp paths |
| Existing install (re-run installer) | ✅ idempotent, exit 0 |
| Desktop shortcut launch | ✅ HTTP 200 on `/app`, title `Eventra Business`, preview banner |
| Start Menu shortcut launch | ✅ HTTP 200 on `/app` |
| Startup | ✅ browser auto-opens when ready |
| Shutdown | ✅ Ctrl-C / close window → port released |
| Restart | ✅ data survives (file mode) |
| Multiple launches | ✅ second launch detects running instance, opens browser, exits 0 |
| Missing configuration (no `.env`) | ✅ runs in mock/file mode |
| Invalid configuration (bad mode value) | ✅ falls back to mock (unit-tested) |
| Missing dependencies | ✅ friendly "run npm install" error, exit 1 |
| Update | ✅ ff-only + install; refuses on uncommitted changes |

## Known Windows limitations
- **Foreground app, not a service:** the console window must stay open while using Eventra; closing it
  stops the app. (By design — this is a local dev runtime.)
- **First launch is slow** (~15–40s) while Vite compiles; subsequent loads are fast.
- **No packaged installer** (MSI/EXE) and **no auto-start on login**.
- **Runs from the source folder:** moving/renaming it breaks the shortcuts until you re-run
  `shortcuts:install`.
- **Icon cache:** if the icon is regenerated, Windows may show the old one until the icon cache refreshes
  (log off/on).
- **Desktop location:** with OneDrive, the Desktop shortcut lands in the OneDrive-redirected Desktop
  (handled automatically).
- **SmartScreen/antivirus** may prompt the first time the `.cmd` runs.
- **Package manager:** the project uses **npm workspaces**; pnpm/yarn are not supported here.
- **Requires Node.js** installed and on `PATH`.

## Hard stops (not part of local install)
Installing into a real Shopify Admin (`docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md`) and cloud persistence
(Supabase) remain **Brian-gated** and are never triggered by the Windows shortcuts.
