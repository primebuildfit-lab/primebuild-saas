//! Automatic updates for the Eventra Mobile desktop shell (Tauri 2).
//!
//! Desktop only. `tauri-plugin-updater` supports Windows/macOS/Linux; on
//! Android/iOS the OS app store owns updates, so this module is compiled out of
//! mobile builds (see the `#[cfg(desktop)]` gate in `lib.rs` and the
//! target-gated dependency in `Cargo.toml`).
//!
//! The whole flow is driven from Rust via `UpdaterExt`, so the web SPA never
//! receives the raw updater/process permission surface (no new capability is
//! needed — capabilities only gate webview→plugin IPC, and nothing here is
//! invoked from the webview). Downloads and minisign signature verification
//! happen natively; a tampered or unsigned package is rejected and never
//! installed, so the working install is never left broken.
//!
//! Policy: a single non-blocking check fires shortly after launch. When a newer
//! signed version exists it is downloaded, verified, installed, and the app
//! relaunches into it. Until a real release endpoint + production public key are
//! configured (see the runbook), the updater reports itself as "not configured"
//! and does nothing — it never errors and never blocks the app.

use tauri::AppHandle;
use tauri_plugin_updater::UpdaterExt;

/// GitHub owner/repo the installed app polls for releases. Baked at build time
/// from `EVENTRA_UPDATE_OWNER` / `EVENTRA_UPDATE_REPO` when present (set by CI),
/// otherwise the documented placeholder so the app degrades honestly until the
/// release channel exists. A runtime `EVENTRA_UPDATE_ENDPOINT` override wins,
/// used for controlled local end-to-end tests.
fn update_owner() -> String {
    option_env!("EVENTRA_UPDATE_OWNER")
        .unwrap_or("primebuildfit-lab")
        .to_string()
}

fn update_repo() -> String {
    option_env!("EVENTRA_UPDATE_REPO")
        .unwrap_or("primebuild-saas")
        .to_string()
}

/// Resolve the manifest endpoint, or `None` when still on the placeholder (no
/// remote yet) so the caller treats the updater as "not configured".
fn resolve_endpoint() -> Option<String> {
    if let Ok(e) = std::env::var("EVENTRA_UPDATE_ENDPOINT") {
        let e = e.trim().to_string();
        if !e.is_empty() {
            return Some(e);
        }
    }
    let (owner, repo) = (update_owner(), update_repo());
    if owner.starts_with("REPLACE_") || repo.starts_with("REPLACE_") {
        return None;
    }
    Some(format!(
        "https://github.com/{owner}/{repo}/releases/latest/download/latest-mobile.json"
    ))
}

/// Fire a non-blocking update check right after launch. Never gates startup: on
/// any problem (not configured, offline, bad manifest) it logs and returns.
pub fn spawn_startup_check(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        match run_update_flow(&app).await {
            Ok(applied) => {
                if !applied {
                    log::info!("updater: no newer version (up to date or not configured)");
                }
            }
            Err(e) => log::warn!("updater: check/apply skipped — {e}"),
        }
    });
}

/// Check → download → verify → install → relaunch. Returns `Ok(true)` only when
/// an update was actually applied (in which case the app is restarting and this
/// call does not return past `restart`).
async fn run_update_flow(app: &AppHandle) -> Result<bool, String> {
    let endpoint = match resolve_endpoint() {
        Some(e) => e,
        None => {
            log::info!("updater: release endpoint not configured yet — skipping");
            return Ok(false);
        }
    };

    // Build the updater with the resolved endpoint (the public key comes from
    // tauri.conf.json). A placeholder/invalid key surfaces here as an error,
    // which we log and swallow rather than crash.
    let url = endpoint.parse().map_err(|e| format!("bad endpoint: {e}"))?;
    let updater = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|e| e.to_string())?
        .build()
        .map_err(|e| e.to_string())?;

    let update = match updater.check().await {
        Ok(Some(u)) => u,
        Ok(None) => {
            log::info!("updater: Eventra Mobile is up to date");
            return Ok(false);
        }
        Err(e) => return Err(format!("check failed: {e}")),
    };

    log::info!(
        "updater: newer version {} available — downloading",
        update.version
    );

    // Download + install; the plugin verifies the signature before applying.
    update
        .download_and_install(|_chunk, _total| {}, || {})
        .await
        .map_err(|e| format!("download/install failed: {e}"))?;

    log::info!("updater: update installed — relaunching into the new version");
    // `restart` diverges (`-> !`), so it never returns past this point.
    app.restart()
}
