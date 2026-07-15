# Eventra Internal OS — Desktop Build Guide

> How to develop, build and package the Eventra Internal OS desktop app.
> All commands run from the monorepo, targeting **only** `apps/admin`.

## 1. Build prerequisites (developer machine)

Verified present on the pilot machine:

| Tool | Required | Notes |
|------|----------|-------|
| Node.js | ≥ 20.19 (repo engines) | v24.x works (`>=22.12` branch) |
| npm | 11.x | workspaces |
| Rust + Cargo | stable **msvc** | `rustup default stable-x86_64-pc-windows-msvc` |
| Visual Studio Build Tools 2022 | "Desktop development with C++" (VC tools + Windows SDK) | provides the MSVC linker |
| WebView2 Runtime | current | preinstalled on Win 11 |
| Git | any | |

Install Rust (if absent): <https://rustup.rs> → `rustup-init.exe` (msvc host).
Ensure `%USERPROFILE%\.cargo\bin` is on `PATH`.

## 2. Install JS dependencies

```powershell
cd D:\Eventra\eventra
npm install            # workspaces; installs @tauri-apps/cli into apps/admin
```

## 3. Develop (hot reload)

```powershell
# from the repo root
npm run desktop:admin:dev
# or from apps/admin
npm run desktop:dev
```

This runs `vite` on `http://localhost:1420` and opens the Tauri window against
it. Editing `apps/admin/src/**` hot-reloads as usual.

## 4. Build the installer

```powershell
# from the repo root
npm run desktop:admin:build
# or from apps/admin
npm run desktop:build
```

This runs `vite build` (→ `apps/admin/dist`) then compiles the Rust shell and
produces the Windows bundles.

### Output locations

```
apps/admin/src-tauri/target/release/
  └── eventra-internal-os.exe                     # raw executable
apps/admin/src-tauri/target/release/bundle/
  ├── nsis/Eventra Internal OS_<ver>_x64-setup.exe   # NSIS installer
  └── msi/Eventra Internal OS_<ver>_x64_en-US.msi    # MSI installer
```

> The first build downloads NSIS (and WiX for the MSI) and compiles all Rust
> dependencies — expect several minutes. Later builds are incremental and fast.

## 5. Icons

Regenerate the icon set from a square PNG (≥ 512×512):

```powershell
cd apps/admin
npm run desktop:icon -- path\to\source.png   # writes src-tauri/icons/*
```

The current icons derive from the Eventra brand mark.

## 6. Configuration files

| File | Purpose |
|------|---------|
| `apps/admin/src-tauri/tauri.conf.json` | product name, identifier, window, bundle targets |
| `apps/admin/src-tauri/Cargo.toml` | Rust deps (tauri + log/window-state/opener plugins) |
| `apps/admin/src-tauri/capabilities/default.json` | minimal IPC permissions |
| `apps/admin/src-tauri/src/lib.rs` | runtime: plugins, window reveal, external links |

## 7. Updates & signing (future)

- **Code signing:** not done for the pilot (`Unknown publisher`). To ship
  broadly, sign the `.exe`/`.msi` with an EV/OV certificate and enable Tauri's
  `bundle > windows > certificateThumbprint` / `signCommand`.
- **Auto-update:** add `tauri-plugin-updater`, host a signed `latest.json` +
  artifacts, and set `plugins.updater.endpoints` + a public key. Intentionally
  omitted for this manual-update pilot.

## 8. Troubleshooting

- **`cargo not found`**: add `%USERPROFILE%\.cargo\bin` to `PATH`.
- **Linker / `link.exe` errors**: install VS Build Tools 2022 "Desktop
  development with C++"; open a fresh shell so the toolchain is discovered.
- **Port 1420 in use** (dev): stop the other process or change the port in
  `beforeDevCommand` + `devUrl`.
- **White window**: check the log file; the window auto-reveals on content load
  and via an 8 s fallback timer.
