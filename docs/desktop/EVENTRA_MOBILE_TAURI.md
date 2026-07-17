# Eventra Mobile — Tauri Build & Auto-Update Guide

> Phone-form-factor Tauri 2 shell around the existing `apps/consumer` web
> SPA/PWA. Same architecture as the Internal OS desktop shell (Option A: static
> frontend served from `../dist`, no server/Prisma), sized for a phone and with
> **automatic updates wired**. All commands run from the monorepo, targeting
> **only** `apps/consumer`.

## 1. What this is (and isn't)

- **Is:** a native shell (WebView2 on Windows) that loads the unchanged
  `apps/consumer` build in a 420×880 phone-shaped window. Product logic,
  routing, and data are untouched — the shell only creates the window, opens
  external links in the system browser, writes secret-free local logs, reveals
  the window after paint, and (on desktop) runs a background auto-update check.
- **Isn't:** a rewrite of the consumer app, and not (yet) a Play/App Store
  build. The Android/iOS targets are prepared but not initialised — see §7.

## 2. Prerequisites

Same as the Internal OS desktop shell:

| Tool | Required | Notes |
|------|----------|-------|
| Node.js | ≥ 20.19 | v24.x works |
| npm | 11.x | workspaces |
| Rust + Cargo | stable **msvc** | `rustup default stable-x86_64-pc-windows-msvc` |
| Visual Studio Build Tools 2022 | "Desktop development with C++" | MSVC linker |
| WebView2 Runtime | current | preinstalled on Win 11 |

## 3. Install dependencies

```powershell
cd D:\Eventra\eventra
npm install            # installs @tauri-apps/cli + plugin-opener into apps/consumer
```

## 4. Develop (hot reload)

```powershell
# from the repo root
npm run desktop:mobile:dev
# or from apps/consumer
npm run desktop:dev
```

Runs `vite` on `http://localhost:1421` and opens the Tauri window against it.
Editing `apps/consumer/src/**` hot-reloads as usual.

## 5. Build the installer

```powershell
# from the repo root
npm run desktop:mobile:build
# or from apps/consumer
npm run desktop:build
```

Runs `vite build` (→ `apps/consumer/dist`) then compiles the Rust shell and
produces the Windows bundles.

### Output locations

```
apps/consumer/src-tauri/target/release/
  └── eventra-mobile.exe                          # raw executable
apps/consumer/src-tauri/target/release/bundle/
  ├── nsis/Eventra Mobile_<ver>_x64-setup.exe     # NSIS installer
  └── msi/Eventra Mobile_<ver>_x64_en-US.msi      # MSI installer
```

> The first build compiles all Rust dependencies — expect several minutes.
> Later builds are incremental.

## 6. Automatic updates (the "Auto-update" requirement)

The updater is **already wired** end-to-end and driven entirely from Rust
(`src-tauri/src/updater.rs` + the `#[cfg(desktop)]` gate in `lib.rs`), so the
web content never gets the updater/process permission surface. On launch a
single non-blocking check runs; if a newer **signed** release exists it is
downloaded, its minisign signature verified natively, installed, and the app
relaunches. A tampered/unsigned package is rejected — the working install is
never left broken. Until the release channel below is configured it reports
"not configured" and no-ops (never errors, never blocks startup).

### Going live — one-time setup

1. **Generate a signing key pair** (keep the private key secret; CI-only):

   ```powershell
   npx @tauri-apps/cli signer generate -w eventra-mobile.key
   # prints a PUBLIC key and writes the PRIVATE key to eventra-mobile.key
   ```

2. **Publish the public key** in `apps/consumer/src-tauri/tauri.conf.json`:

   ```jsonc
   "plugins": { "updater": { "pubkey": "<PUBLIC KEY FROM STEP 1>", ... } }
   ```

3. **Point the endpoint at your release host.** The default is a GitHub Releases
   manifest named `latest-mobile.json` (distinct from the Internal OS
   `latest.json` so the two apps update independently from the same repo).
   Bake the repo at build time via `EVENTRA_UPDATE_OWNER` / `EVENTRA_UPDATE_REPO`
   (or edit the `endpoints` array). `EVENTRA_UPDATE_ENDPOINT` overrides at
   runtime for local end-to-end tests.

4. **Sign artifacts at build time** by exporting the private key so the Tauri
   CLI signs the bundle and emits `.sig` files:

   ```powershell
   $env:TAURI_SIGNING_PRIVATE_KEY = Get-Content eventra-mobile.key -Raw
   $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "<password or empty>"
   npm run desktop:mobile:build
   ```

5. **Publish a release** containing the installer, its `.sig`, and a
   `latest-mobile.json` manifest, e.g.:

   ```json
   {
     "version": "0.2.0",
     "notes": "…",
     "pub_date": "2026-07-17T00:00:00Z",
     "platforms": {
       "windows-x86_64": {
         "signature": "<contents of the .sig file>",
         "url": "https://github.com/<owner>/<repo>/releases/download/v0.2.0/Eventra.Mobile_0.2.0_x64-setup.exe"
       }
     }
   }
   ```

Bump `version` in both `tauri.conf.json` and `Cargo.toml` for each release; the
installed app only applies a build whose manifest `version` is higher **and**
whose signature verifies against the embedded public key.

## 7. Native mobile (Android / iOS) — later

Scripts are in place (`npm run mobile:android:init`, `mobile:android:build`) and
the Rust crate is mobile-ready (`tauri::mobile_entry_point`, updater gated off
mobile). To produce a real APK/AAB you must install the Android SDK/NDK + JDK
and run `tauri android init` first (generates `src-tauri/gen/android`).

> **Auto-update on native mobile is store-managed, not this plugin.**
> `tauri-plugin-updater` supports desktop only; that's why it is compiled out of
> Android/iOS builds. On those platforms updates ship through Google Play / the
> App Store. The auto-update described in §6 applies to the desktop bundles.

## 8. Files

| File | Purpose |
|------|---------|
| `apps/consumer/src-tauri/tauri.conf.json` | product name, identifier, phone window, bundle, updater endpoint + pubkey |
| `apps/consumer/src-tauri/Cargo.toml` | Rust deps; updater gated to desktop targets |
| `apps/consumer/src-tauri/capabilities/default.json` | minimal IPC permissions |
| `apps/consumer/src-tauri/src/lib.rs` | runtime: plugins, window reveal, desktop update check |
| `apps/consumer/src-tauri/src/updater.rs` | desktop auto-update flow (check→verify→install→relaunch) |
