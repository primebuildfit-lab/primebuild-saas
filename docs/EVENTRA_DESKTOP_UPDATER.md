# Eventra Internal OS — automatic updates (desktop)

The `apps/admin` Tauri 2 desktop app updates itself: on launch it checks a signed
release manifest, and if a newer version exists it downloads it, verifies the
minisign signature, installs it, and relaunches into the new version. A tampered
or unsigned package is rejected and the working install is left intact.

## Architecture
- **Rust-driven** (`apps/admin/src-tauri/src/updater.rs`): `spawn_startup_check`
  runs a non-blocking check after launch. No web IPC surface is exposed (no new
  capability). Verification + install happen natively.
- Plugin: `tauri-plugin-updater` v2, registered in `src/lib.rs`.
- **Only runs in packaged release builds** — skipped under `tauri dev`.

## Release channel
- **Repo:** `primebuildfit-lab/primebuild-saas` (the app's own repo).
- **Endpoint:** `https://github.com/primebuildfit-lab/primebuild-saas/releases/latest/download/latest.json`
  (owner/repo are also baked from CI env `EVENTRA_UPDATE_OWNER/REPO`, so a repo
  rename keeps working).
- ⚠️ **Shared monorepo caveat:** cut ONLY desktop releases here (tag prefix
  below). The app polls `releases/latest`; an unrelated "latest" release would
  shadow the manifest. If web releases are ever tagged here, move the desktop app
  to a dedicated repo.

## Signing
- Public key: `src-tauri/tauri.conf.json → plugins.updater.pubkey` (production).
- Private key: `C:\Users\carlo\.eventra\updater.key` — **outside the repo**,
  git-ignored (`**/.eventra/`), **no password**. Keep an offline backup: a lost
  key means you can never sign updates again.

## Version = single source of truth
Bump `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`
together (all three must match).

## Tags
`eventra-desktop-vX.Y.Z` (exclusive — the workflow triggers only on this prefix).

## Publish a release
1. One-time: add repo secret `TAURI_SIGNING_PRIVATE_KEY` = full contents of
   `C:\Users\carlo\.eventra\updater.key` (no password secret needed).
2. `git tag eventra-desktop-v0.1.1 && git push origin eventra-desktop-v0.1.1`
3. The `release-eventra-desktop` workflow builds the SPA + NSIS installer, signs
   the updater artifacts (via the CI overlay `tauri.conf.release.json`), and
   publishes a GitHub Release with the installer, `.sig`, and `latest.json`.

## First install
The currently-installed build has NO updater, so it can't auto-update. Install
the FIRST workflow-published release by hand; every later release auto-updates.

## Rollback
Publish a release with a higher version whose payload is the previous good build,
or mark a bad release "not latest" in GitHub so `releases/latest` points back to
the good one. Installed apps never downgrade automatically.

## Artifact paths (CI)
`apps/admin/src-tauri/target/release/bundle/nsis/*-setup.exe`, `*-setup.nsis.zip`,
`*-setup.nsis.zip.sig`, and generated `latest.json`.

## Diagnostics & common errors
- Updater logs go to the app log dir (`tauri-plugin-log`, `eventra-internal-os`).
- "No configurado": owner/repo still placeholder (only in a non-CI local build).
- Signature error: the release was signed with a key that doesn't match the
  pubkey in config — re-sign with `~/.eventra/updater.key`.
- Offline: endpoint unreachable; the app keeps running on the current version.
