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

## 6. Automatic updates — how "ship once, updates forever" works

The updater is **wired and driven entirely from Rust** (`src-tauri/src/updater.rs`
+ the `#[cfg(desktop)]` gate in `lib.rs`), so the web content never gets the
updater/process permission surface. On launch a single non-blocking check runs;
if a newer **signed** release exists it is downloaded, its minisign signature
verified natively, installed, and the app relaunches. A tampered/unsigned package
is rejected — the working install is never left broken.

**Config split (so local dev stays keyless):**
- Base `tauri.conf.json` ships a **placeholder** pubkey → local builds don't sign
  and the updater no-ops. `npm run desktop:mobile:build` works with no key.
- Release overlay `tauri.conf.release.json` adds the **real** pubkey +
  `createUpdaterArtifacts` → only CI builds are signed and updatable.

**Dedicated channel, not `/latest/`:** the installed app polls a **fixed** tag —
`…/releases/download/eventra-mobile/latest-mobile.json` — so it is never shadowed
by the desktop app's `releases/latest` in this shared monorepo repo.
`EVENTRA_UPDATE_ENDPOINT` overrides at runtime for local end-to-end tests.

### One-time setup (already done in code; only the secrets remain)

The signing keypair is generated at `C:\Users\carlo\.eventra-keys\eventra-mobile.key`
(private, outside the repo) and its public key is baked into
`tauri.conf.release.json`. The GitHub Actions pipeline
`.github/workflows/release-eventra-mobile.yml` builds + signs + publishes.

**You only need to add two repository secrets once** (GitHub → Settings → Secrets
and variables → Actions):

| Secret | Value |
|--------|-------|
| `TAURI_SIGNING_PRIVATE_KEY` | the full contents of `C:\Users\carlo\.eventra-keys\eventra-mobile.key` |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | empty (add the secret with no value) |

### Shipping a new version (every time, forever)

1. Bump `"version"` in `apps/consumer/src-tauri/tauri.conf.json` **and**
   `Cargo.toml`.
2. Commit, then tag & push:

   ```powershell
   git tag eventra-mobile-v0.2.0
   git push origin eventra-mobile-v0.2.0
   ```

   (Or press **Run workflow** on `release-eventra-mobile` in the Actions tab.)

CI builds, signs, and refreshes the `eventra-mobile` release. **Every installed
app updates itself on its next launch** — you never build/sign/upload by hand.
The installed app only applies a build whose manifest `version` is higher **and**
whose signature verifies against the embedded public key.

> The very first update requires at least one installed build carrying the **real**
> pubkey — i.e. built by CI (or a local overlay build). The base-config installer
> you may have side-loaded for testing has the placeholder key and won't auto-update;
> install a CI build once, and it self-updates from then on.

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
| `apps/consumer/src-tauri/tauri.conf.json` | product name, identifier, phone window, bundle, updater endpoint (fixed tag) + **placeholder** pubkey (keyless local builds) |
| `apps/consumer/src-tauri/tauri.conf.release.json` | CI overlay: real pubkey + `createUpdaterArtifacts` (signed, updatable builds) |
| `apps/consumer/src-tauri/Cargo.toml` | Rust deps; updater gated to desktop targets |
| `apps/consumer/src-tauri/capabilities/default.json` | minimal IPC permissions |
| `apps/consumer/src-tauri/src/lib.rs` | runtime: plugins, window reveal, desktop update check |
| `apps/consumer/src-tauri/src/updater.rs` | desktop auto-update flow (check→verify→install→relaunch) |
| `.github/workflows/release-eventra-mobile.yml` | CI: build + sign + publish the `eventra-mobile` auto-update channel |
