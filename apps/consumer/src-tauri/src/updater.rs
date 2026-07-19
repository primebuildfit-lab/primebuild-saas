//! Automatic updates for the Eventra Mobile desktop shell (Tauri 2).
//!
//! Desktop only. `tauri-plugin-updater` supports Windows/macOS/Linux; on
//! Android/iOS the OS app store owns updates, so this module is compiled out of
//! mobile builds (see the `#[cfg(desktop)]` gate in `lib.rs` and the
//! target-gated dependency in `Cargo.toml`).
//!
//! # Design
//!
//! The update *flow* runs entirely in Rust via `UpdaterExt`, so the web layer
//! never receives the raw updater/process permission surface — the SPA cannot
//! download or install anything, it can only ask for a check, ask to apply an
//! already-verified update, and read state. Downloading and minisign signature
//! verification happen natively; a package whose signature does not match the
//! configured public key is rejected and never installed, so a tampered or
//! truncated download can never break the working install.
//!
//! # Policy
//!
//! * On launch a single non-blocking check runs. It only *reports*; it never
//!   installs behind the user's back.
//! * The user applies the update explicitly (or re-checks on demand) from the
//!   "Cuenta" screen. Every phase — checking, up to date, available,
//!   downloading with progress, installing, failed — is pushed to the UI as a
//!   [`UpdateState`] on the `eventra://update-state` event.
//! * Until a real public key is configured (the base config ships a
//!   placeholder so local builds stay keyless) the updater reports
//!   `notConfigured` and does nothing. It never errors and never blocks startup.
//!
//! # Restart
//!
//! On Windows `Update::install` hands the NSIS installer `/UPDATE` and then
//! calls `std::process::exit(0)` itself — the installer relaunches the app. So
//! the process does **not** return from `apply`, and calling `app.restart()`
//! afterwards would be unreachable. User data is untouched: the updater only
//! replaces program files, never the app-data/config directories.

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_updater::{Update, UpdaterExt};

/// Event carrying every [`UpdateState`] transition to the webview.
pub const UPDATE_STATE_EVENT: &str = "eventra://update-state";

/// Sentinel shipped in the base `tauri.conf.json`. The real key is applied by
/// the release overlay (`tauri.conf.release.json`) in signed CI/release builds,
/// so unsigned local builds cannot pretend to be updatable.
const PLACEHOLDER_PUBKEY: &str = "REPLACE_WITH_PRODUCTION_PUBKEY";

/// Every phase the UI can render. Serialized as a tagged union so the frontend
/// switches on `phase` and gets exactly the fields that phase carries.
#[derive(Clone, Debug, PartialEq, Serialize)]
#[serde(tag = "phase", rename_all = "camelCase")]
pub enum UpdateState {
    /// Nothing has been checked yet in this session.
    Idle { current: String },
    /// No usable public key in the bundled config — updates are inert by design.
    NotConfigured { current: String },
    /// A check is in flight.
    Checking { current: String },
    /// The manifest was reached and this build is the newest.
    UpToDate { current: String },
    /// A newer signed version is published and ready to apply.
    Available {
        current: String,
        version: String,
        notes: Option<String>,
        date: Option<String>,
    },
    /// Downloading the package. `percent` is `None` when the server sends no
    /// content-length (rare); the UI then shows an indeterminate bar.
    Downloading {
        current: String,
        version: String,
        downloaded: u64,
        total: Option<u64>,
        percent: Option<u8>,
    },
    /// Signature verified; handing off to the platform installer.
    Installing { current: String, version: String },
    /// Something went wrong. The app keeps running on the current version.
    Failed { current: String, message: String },
}

/// Shared updater state. `pending` holds the checked-but-not-yet-applied update
/// so "Instalar" does not have to re-query the manifest.
#[derive(Default)]
pub struct UpdaterState {
    state: Mutex<Option<UpdateState>>,
    pending: Mutex<Option<Update>>,
    busy: AtomicBool,
}

/// Guard that clears the busy flag even if the flow returns early or panics, so
/// one failed check can never wedge the updater for the rest of the session.
struct BusyGuard<'a>(&'a AtomicBool);

impl Drop for BusyGuard<'_> {
    fn drop(&mut self) {
        self.0.store(false, Ordering::SeqCst);
    }
}

fn current_version(app: &AppHandle) -> String {
    app.package_info().version.to_string()
}

/// The public key actually baked into this build, or `None` when it is absent,
/// empty or still the placeholder sentinel.
fn configured_pubkey(app: &AppHandle) -> Option<String> {
    let key = app
        .config()
        .plugins
        .0
        .get("updater")?
        .get("pubkey")?
        .as_str()?
        .trim();
    if key.is_empty() || key == PLACEHOLDER_PUBKEY {
        return None;
    }
    Some(key.to_string())
}

/// Store the new state and push it to the webview. Emission failures are logged,
/// never propagated — the flow must not depend on a window being open.
fn set_state(app: &AppHandle, next: UpdateState) {
    if let Some(state) = app.try_state::<UpdaterState>() {
        if let Ok(mut slot) = state.state.lock() {
            *slot = Some(next.clone());
        }
    }
    if let Err(e) = app.emit(UPDATE_STATE_EVENT, &next) {
        log::warn!("updater: could not emit state — {e}");
    }
}

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

/// Build an updater bound to the configured (or overridden) endpoint.
fn build_updater(app: &AppHandle) -> Result<tauri_plugin_updater::Updater, String> {
    let mut builder = app.updater_builder().on_before_exit(|| {
        log::info!("updater: exiting to hand off to the installer");
    });
    if let Some(endpoint) = endpoint_override() {
        log::info!("updater: using endpoint override {endpoint}");
        let url = endpoint.parse().map_err(|e| format!("bad endpoint: {e}"))?;
        builder = builder.endpoints(vec![url]).map_err(|e| e.to_string())?;
    }
    builder.build().map_err(|e| e.to_string())
}

/// Check the manifest and record the outcome. `Ok(true)` means a newer version
/// is now pending. Never panics; every failure becomes a `Failed` state.
async fn check(app: &AppHandle) -> Result<bool, String> {
    let current = current_version(app);

    if configured_pubkey(app).is_none() {
        log::info!("updater: no production public key in this build — updates disabled");
        set_state(app, UpdateState::NotConfigured { current });
        return Ok(false);
    }

    set_state(
        app,
        UpdateState::Checking {
            current: current.clone(),
        },
    );

    let updater = build_updater(app)?;
    match updater.check().await {
        Ok(Some(update)) => {
            log::info!(
                "updater: version {} available (current {current})",
                update.version
            );
            let next = UpdateState::Available {
                current,
                version: update.version.clone(),
                notes: update.body.clone(),
                date: update.date.map(|d| d.to_string()),
            };
            if let Some(state) = app.try_state::<UpdaterState>() {
                if let Ok(mut slot) = state.pending.lock() {
                    *slot = Some(update);
                }
            }
            set_state(app, next);
            Ok(true)
        }
        Ok(None) => {
            log::info!("updater: Eventra Mobile is up to date (v{current})");
            set_state(app, UpdateState::UpToDate { current });
            Ok(false)
        }
        Err(e) => Err(format!("check failed: {e}")),
    }
}

/// Download the pending update with progress, verify its signature, and install.
/// On success this does not return: the platform installer takes over and the
/// process exits (Windows relaunches the app via NSIS `/UPDATE`).
async fn apply(app: &AppHandle) -> Result<(), String> {
    let current = current_version(app);
    let state = app
        .try_state::<UpdaterState>()
        .ok_or_else(|| "updater state unavailable".to_string())?;

    // Take the update out of the slot: it is consumed by this attempt.
    let update = state
        .pending
        .lock()
        .map_err(|_| "updater state poisoned".to_string())?
        .take()
        .ok_or_else(|| "no update pending — check for updates first".to_string())?;

    let version = update.version.clone();
    log::info!("updater: downloading {version}");

    // Progress is emitted only when the whole percent changes, so a fast
    // download cannot flood the IPC channel with thousands of events.
    let mut downloaded: u64 = 0;
    let mut last_percent: Option<u8> = None;
    let progress_app = app.clone();
    let progress_current = current.clone();
    let progress_version = version.clone();

    let bytes = update
        .download(
            move |chunk: usize, total: Option<u64>| {
                downloaded = downloaded.saturating_add(chunk as u64);
                let percent = total.filter(|t| *t > 0).map(|t| {
                    ((downloaded.saturating_mul(100) / t).min(100)) as u8
                });
                if percent != last_percent {
                    last_percent = percent;
                    set_state(
                        &progress_app,
                        UpdateState::Downloading {
                            current: progress_current.clone(),
                            version: progress_version.clone(),
                            downloaded,
                            total,
                            percent,
                        },
                    );
                }
            },
            // Fires when the last byte arrives — verification happens *after*
            // this, inside `download`, so don't claim the package is trusted yet.
            || log::info!("updater: download complete — verifying signature"),
        )
        .await
        .map_err(|e| format!("download/verify failed: {e}"))?;

    // Reaching here means the minisign signature matched the configured public
    // key; `download` returns an error instead of bytes for anything else, so a
    // tampered package never reaches `install`.
    log::info!("updater: signature verified for {version}");
    set_state(
        app,
        UpdateState::Installing {
            current: current.clone(),
            version: version.clone(),
        },
    );
    log::info!("updater: installing {version} — the app will relaunch");

    update
        .install(bytes)
        .map_err(|e| format!("install failed: {e}"))?;

    // Windows exits inside `install`; other platforms return and we relaunch.
    log::info!("updater: install returned — restarting into {version}");
    app.restart();
}

/// Run `flow` under the busy flag, recording any error as a `Failed` state.
/// Returns the resulting state so commands can answer synchronously.
async fn guarded<F, Fut>(app: AppHandle, flow: F) -> UpdateState
where
    F: FnOnce(AppHandle) -> Fut,
    Fut: std::future::Future<Output = Result<(), String>>,
{
    let current = current_version(&app);
    let Some(state) = app.try_state::<UpdaterState>() else {
        return UpdateState::Failed {
            current,
            message: "updater state unavailable".into(),
        };
    };

    if state
        .busy
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        log::info!("updater: an update operation is already running");
        return snapshot(&app);
    }
    let _guard = BusyGuard(&state.busy);

    if let Err(message) = flow(app.clone()).await {
        log::warn!("updater: {message}");
        set_state(&app, UpdateState::Failed { current, message });
    }
    snapshot(&app)
}

/// The last known state, or `Idle` when nothing has run yet.
fn snapshot(app: &AppHandle) -> UpdateState {
    app.try_state::<UpdaterState>()
        .and_then(|s| s.state.lock().ok().and_then(|slot| slot.clone()))
        .unwrap_or_else(|| UpdateState::Idle {
            current: current_version(app),
        })
}

/// Read the current updater state (used by the UI on mount).
#[tauri::command]
pub fn updater_state(app: AppHandle) -> UpdateState {
    snapshot(&app)
}

/// Manual "Buscar actualizaciones". Safe to call repeatedly; concurrent calls
/// return the in-flight state instead of starting a second check.
#[tauri::command]
pub async fn updater_check(app: AppHandle) -> UpdateState {
    guarded(app, |a| async move { check(&a).await.map(|_| ()) }).await
}

/// Apply the pending update: download → verify → install → relaunch. If no
/// update is pending (e.g. the UI was reloaded) it checks first, then applies.
#[tauri::command]
pub async fn updater_install(app: AppHandle) -> UpdateState {
    guarded(app, |a| async move {
        let has_pending = a
            .try_state::<UpdaterState>()
            .and_then(|s| s.pending.lock().ok().map(|slot| slot.is_some()))
            .unwrap_or(false);
        if !has_pending && !check(&a).await? {
            // Nothing to install; `check` already published the real state.
            return Ok(());
        }
        apply(&a).await
    })
    .await
}

/// Unattended mode: apply a found update immediately instead of waiting for the
/// user. Off by default — a desktop user should stay in control of when their
/// app restarts. Enabled with `EVENTRA_UPDATE_AUTO_APPLY=1` for kiosk/managed
/// installs and for the automated end-to-end update test.
fn auto_apply_enabled() -> bool {
    matches!(
        std::env::var("EVENTRA_UPDATE_AUTO_APPLY").as_deref(),
        Ok("1") | Ok("true")
    )
}

/// Fire a non-blocking check right after launch. Never gates startup: on any
/// problem (not configured, offline, bad manifest) it records the state, logs,
/// and returns. It does not install on its own — applying is the user's
/// explicit action, unless unattended mode is enabled (see above).
pub fn spawn_startup_check(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let _ = guarded(app, |a| async move {
            if check(&a).await? && auto_apply_enabled() {
                log::info!("updater: unattended mode — applying automatically");
                apply(&a).await?;
            }
            Ok(())
        })
        .await;
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn state_serializes_as_a_tagged_union_the_ui_can_switch_on() {
        let json = serde_json::to_value(UpdateState::Available {
            current: "0.1.0".into(),
            version: "0.2.0".into(),
            notes: Some("notes".into()),
            date: None,
        })
        .expect("serializes");
        assert_eq!(json["phase"], "available");
        assert_eq!(json["current"], "0.1.0");
        assert_eq!(json["version"], "0.2.0");
        assert_eq!(json["notes"], "notes");
        assert!(json["date"].is_null());
    }

    #[test]
    fn phases_are_camel_case_so_the_ui_contract_stays_stable() {
        let cases = [
            (UpdateState::Idle { current: "1".into() }, "idle"),
            (UpdateState::NotConfigured { current: "1".into() }, "notConfigured"),
            (UpdateState::Checking { current: "1".into() }, "checking"),
            (UpdateState::UpToDate { current: "1".into() }, "upToDate"),
        ];
        for (state, expected) in cases {
            let json = serde_json::to_value(&state).expect("serializes");
            assert_eq!(json["phase"], expected);
        }
    }

    #[test]
    fn downloading_reports_progress_fields() {
        let json = serde_json::to_value(UpdateState::Downloading {
            current: "0.1.0".into(),
            version: "0.2.0".into(),
            downloaded: 512,
            total: Some(1024),
            percent: Some(50),
        })
        .expect("serializes");
        assert_eq!(json["phase"], "downloading");
        assert_eq!(json["downloaded"], 512);
        assert_eq!(json["total"], 1024);
        assert_eq!(json["percent"], 50);
    }

    #[test]
    fn placeholder_pubkey_is_the_value_shipped_in_the_base_config() {
        // Guards the "keyless local build" contract: if the base config's
        // sentinel is ever renamed, this test fails instead of silently
        // letting unsigned builds advertise themselves as updatable.
        let base = include_str!("../tauri.conf.json");
        let cfg: serde_json::Value = serde_json::from_str(base).expect("base config parses");
        assert_eq!(
            cfg["plugins"]["updater"]["pubkey"], PLACEHOLDER_PUBKEY,
            "base config must ship the placeholder sentinel"
        );
    }

    #[test]
    fn release_overlay_supplies_a_real_key_and_updater_artifacts() {
        let overlay = include_str!("../tauri.conf.release.json");
        let cfg: serde_json::Value = serde_json::from_str(overlay).expect("overlay parses");
        let key = cfg["plugins"]["updater"]["pubkey"]
            .as_str()
            .expect("overlay defines a pubkey");
        assert_ne!(key, PLACEHOLDER_PUBKEY, "overlay must carry the real key");
        assert!(!key.is_empty());
        assert_eq!(
            cfg["bundle"]["createUpdaterArtifacts"], true,
            "release builds must emit signed updater artifacts"
        );
    }
}
