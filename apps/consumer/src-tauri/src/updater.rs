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

/// The manifest endpoint the installed app polls. By default this comes from
/// `plugins.updater.endpoints` in the bundled config — a **fixed** release tag
/// (`.../releases/download/eventra-mobile/latest-mobile.json`) so it is never
/// shadowed by another app's `releases/latest` in this shared monorepo repo.
/// A runtime `EVENTRA_UPDATE_ENDPOINT` override wins, used for controlled local
/// end-to-end tests; when unset we let the plugin use the config endpoint.
fn endpoint_override() -> Option<String> {
    match std::env::var("EVENTRA_UPDATE_ENDPOINT") {
        Ok(e) if !e.trim().is_empty() => Some(e.trim().to_string()),
        _ => None,
    }
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
    // Build the updater. The public key and (by default) the endpoint come from
    // the bundled config; only override the endpoint when the env var is set for
    // a local test. A placeholder/invalid key surfaces here as an error, which we
    // log and swallow rather than crash — so keyless local builds simply no-op.
    let mut builder = app.updater_builder();
    if let Some(endpoint) = endpoint_override() {
        let url = endpoint.parse().map_err(|e| format!("bad endpoint: {e}"))?;
        builder = builder.endpoints(vec![url]).map_err(|e| e.to_string())?;
    }
    let updater = builder.build().map_err(|e| e.to_string())?;

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
