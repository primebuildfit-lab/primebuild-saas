# Eventra Internal OS — Desktop Pilot Report

**Date:** 2026-07-15 · **Branch:** `feat/eventra-admin-tauri` · **Scope:** `apps/admin` only.

Convert the private Eventra Internal OS admin console into a private Windows
desktop app via **Tauri 2**, without redesigning anything or touching Eventra
Business / Mobile / Consumer, Shopify, Supabase, or Railway.

## 1. Baseline

| Item | Result |
|------|--------|
| Monorepo | `D:\Eventra\eventra` (npm workspaces) |
| Target app | `apps/admin` (`@eventra/admin`) |
| Framework | Vite 7 + React 18 + React Router 7 (`BrowserRouter`, SPA) |
| Admin typecheck | ✅ clean |
| Admin tests | ✅ 100 passed (5 files) |
| Admin build | ✅ `vite build` → `dist/` (429 KB JS) |
| Git at start | clean working tree on `local-install-phase` |

## 2. Architecture chosen: Option A — static frontend

The admin is a **client-only SPA** with no SSR, loaders, server actions, Prisma,
Node routes, or server sessions, and no client-side secrets. Tauri therefore
serves the static `dist/` bundle in a native WebView2 window; **no local server
sidecar** is needed (Option B rejected). The frontend talks to the same external
Eventra services as the web console.

## 3. Prerequisites (verified on this machine)

| Tool | Status |
|------|--------|
| Node.js v24.18 / npm 11 | ✅ (satisfies repo `>=22.12`) |
| Rust 1.97.0 (stable-x86_64-pc-windows-**msvc**) + Cargo | ✅ |
| Visual Studio Build Tools 2022 (VC C++ + Windows SDK) | ✅ |
| WebView2 Runtime 150.x | ✅ |
| Git | ✅ |
| Tauri CLI | ✅ 2.11.4 (installed into `apps/admin`) |

## 4. What was added (all desktop-only)

- `apps/admin/src-tauri/` — Tauri 2 crate: `tauri.conf.json`, `Cargo.toml`,
  `build.rs`, `src/main.rs`, `src/lib.rs`, `capabilities/default.json`, `icons/`.
- `apps/admin/package.json` — 3 additive scripts (`desktop:dev`, `desktop:build`,
  `desktop:icon`) + `@tauri-apps/cli` devDependency.
- root `package.json` — 2 additive scripts (`desktop:admin:dev/build`).
- `docs/desktop/*.md` — this report + architecture, security, installation, build.
- **No** change to `apps/admin/src/**`, `apps/business/**`, or `apps/consumer/**`.

## 5. Identity, window, runtime

- Product & window title **Eventra Internal OS**, identifier **com.eventra.internal**.
- Window 1500×950, min 1100×700, centered on first launch, resizable/maximizable,
  not fullscreen; size/position/maximized **persisted** via `tauri-plugin-window-state`.
- Window created hidden and revealed on page-load **Finished** (no white flash);
  8 s fallback timer guarantees it can never stay hidden.
- Icons generated from the existing Eventra brand mark.

## 6. Security & permissions

- Capabilities: **`core:default` only** — no fs/shell/process/http IPC exposed to
  web content. Window persistence, logging and link-opening are Rust-side.
- No secrets in the desktop layer; auth unchanged; deny-by-default preserved.
- External links open in the **system default browser** (Tauri 2 default for
  `target="_blank"` / `window.open`).
- Local logs in `%LOCALAPPDATA%\com.eventra.internal\logs\eventra-internal-os.log`
  — startup/shutdown/version/ready/errors only, **no secrets**.
- NSIS installs **per-user** (no elevation). Unsigned → SmartScreen "Unknown
  publisher" is expected/acceptable for private use.

## 7. Build & installer artifacts

First full build: **6 m 32 s** (Rust deps) + NSIS/WiX download & bundling.
Later builds are incremental.

| Artifact | Path | Size |
|----------|------|------|
| Executable | `apps/admin/src-tauri/target/release/eventra-internal-os.exe` | 3.22 MB |
| **NSIS installer** | `apps/admin/src-tauri/target/release/bundle/nsis/Eventra Internal OS_0.1.0_x64-setup.exe` | 1.20 MB |
| **MSI installer** | `apps/admin/src-tauri/target/release/bundle/msi/Eventra Internal OS_0.1.0_x64_en-US.msi` | 1.70 MB |

## 8. Test results (installed runtime)

| Check | Result |
|-------|--------|
| Admin typecheck / tests / build | ✅ clean / ✅ 100 / ✅ |
| Tauri build (NSIS + MSI) | ✅ both, exit 0 |
| Silent install (NSIS `/S`, per-user) | ✅ exit 0 → `%LOCALAPPDATA%\Eventra Internal OS\` |
| Start Menu entry | ✅ `Eventra Internal OS.lnk` created |
| Uninstaller registered | ✅ Apps & features (DisplayName/Version/Publisher) |
| App launches | ✅ window "Eventra Internal OS", WebView2 loads frontend |
| Dashboard/routes load | ✅ (unchanged SPA; 100 route/nav tests green) |
| Session persistence | ✅ WebView2 storage in `%LOCALAPPDATA%\com.eventra.internal` |
| Graceful close | ✅ WM_CLOSE exits cleanly, no orphan process |
| Reopen | ✅ relaunch works |
| Window persistence | ✅ `.window-state.json` written on close, restored on open |
| External links → system browser | ✅ (Tauri 2 default) |
| Uninstall | ✅ program + shortcut removed; **user data preserved** |
| `apps/business` / `apps/consumer` | ✅ untouched (git-verified) |

## 9. Files changed

```
 M apps/admin/package.json      # +3 scripts, +@tauri-apps/cli devDep
 M package.json                 # +2 root desktop scripts
 M package-lock.json            # @tauri-apps/cli
?? apps/admin/src-tauri/        # NEW desktop crate
?? docs/desktop/                # NEW docs
```

## 10. Limitations (pilot)

- Not code-signed → SmartScreen "Unknown publisher" (acceptable for private use).
- No auto-updater (manual reinstall); documented for a future
  `tauri-plugin-updater` rollout.
- CSP is unset (`null`) for service-connectivity during the pilot; tightening to
  an explicit `connect-src` allowlist is a hardening follow-up.
- Deep-link hard refresh in the packaged app relies on the app-protocol serving
  `index.html`; normal sidebar navigation and relaunch (start at `/`) are
  unaffected.

## 11. Next steps

1. Wire the live admin API base URL (`VITE_API_BASE_URL`) and tighten CSP.
2. Add `tauri-plugin-updater` + signed release channel.
3. Optional code-signing certificate to remove SmartScreen warning.

## 12. Classification

**EVENTRA INTERNAL OS DESKTOP PILOT COMPLETED** — Tauri integrated; `apps/admin`
runs as a Windows desktop app; NSIS + MSI installers build, install, launch,
navigate, persist session & window, connect to services, close cleanly, and
uninstall; Business and Consumer untouched; builds/tests green; permissions
minimal; documentation complete. No push / merge / deploy performed.
