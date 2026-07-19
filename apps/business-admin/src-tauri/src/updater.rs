//! Automatic updates for the Eventra Business Admin desktop shell (Tauri 2).
//!
//! Uses the OFFICIAL `tauri-plugin-updater` end to end — no custom download,
//! extraction or patching logic. Every network fetch, minisign signature check
//! and installer invocation is performed by the plugin itself.
//!
//! Design
//! ------
//! * The flow is driven from Rust. The webview never receives the updater
//!   plugin's permission surface; it only talks to this app's own commands
//!   (`updater_state`, `updater_check`, `updater_install`), which are the single
//!   narrow entry point. Nothing here accepts a URL, a path or a key from the
//!   frontend, so the web layer cannot redirect the update to another origin.
//! * A non-blocking check runs shortly after launch and its outcome is cached in
//!   [`UpdaterState`] and emitted as `eventra://update-state`. The frontend
//!   reads the cache on mount and listens for the event, so it can never miss
//!   the result nor trigger a second network call.
//! * The check NEVER installs by itself. Installing replaces the running
//!   executable and terminates the process, so it must be the operator's
//!   explicit decision — this console is used for live supervision and a
//!   surprise restart mid-review would lose their place.
//! * Download progress is reported per chunk via `eventra://update-progress`.
//!
//! Safety / rollback
//! -----------------
//! The plugin verifies the minisign signature of the downloaded package against
//! `plugins.updater.pubkey` (tauri.conf.json) BEFORE anything is installed. An
//! unsigned, tampered or truncated package fails verification and the download
//! is discarded — the working installation is never touched, which is the
//! rollback: on any failure the operator stays on the version they had. Local
//! data (window state, logs, app-data) lives outside the program directory and
//! is preserved by the NSIS `/UPDATE` install.
//!
//! Windows note: `Update::install` hands the installer to the shell and calls
//! `std::process::exit(0)` itself — the NSIS `/UPDATE` run relaunches the app.
//! There is therefore no `app.restart()` here; that call would be unreachable.
//!
//! Release channel: the Business Admin has its OWN manifest
//! (`latest-business-admin.json`) published under its own rolling tag, so it can
//! never be shadowed by another Eventra product's release. The endpoint lives in
//! tauri.conf.json (single source of truth); `EVENTRA_UPDATE_ENDPOINT` overrides
//! it at runtime for controlled end-to-end tests only.

use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_updater::UpdaterExt;

/// Runtime override used ONLY for controlled local update tests.
const ENDPOINT_ENV: &str = "EVENTRA_UPDATE_ENDPOINT";

/// Test-only hook: install automatically at startup instead of waiting for the
/// operator, so the full check→verify→install→relaunch cycle can be exercised
/// end to end without a human clicking. It is deliberately inert unless
/// [`ENDPOINT_ENV`] also points the app at a private manifest, so it can never
/// change behaviour against the real release channel.
const AUTOINSTALL_ENV: &str = "EVENTRA_UPDATE_AUTOINSTALL";

fn endpoint_override() -> Option<String> {
    std::env::var(ENDPOINT_ENV)
        .ok()
        .map(|raw| raw.trim().to_string())
        .filter(|raw| !raw.is_empty())
}

/// True only in a controlled test: a private endpoint AND the opt-in flag.
fn autoinstall_requested() -> bool {
    endpoint_override().is_some()
        && std::env::var(AUTOINSTALL_ENV).is_ok_and(|v| v == "1")
}

/// Outcome of an update check, mirrored 1:1 by the frontend union type.
#[derive(Debug, Clone, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case", rename_all_fields = "camelCase")]
pub enum CheckOutcome {
    /// No release channel configured (or a dev build): the app degrades honestly.
    NotConfigured { reason: String },
    /// Checked successfully; the installed version is the newest published one.
    UpToDate { current_version: String },
    /// A newer signed version exists.
    Available {
        current_version: String,
        version: String,
        notes: Option<String>,
        date: Option<String>,
    },
    /// The check could not complete (offline, bad manifest, 404…). Never fatal.
    Failed { message: String },
}

/// Cached result of the most recent check, so the UI can render immediately.
#[derive(Default)]
pub struct UpdaterState {
    last: Mutex<Option<CheckOutcome>>,
}

impl UpdaterState {
    fn store(&self, outcome: &CheckOutcome) {
        if let Ok(mut slot) = self.last.lock() {
            *slot = Some(outcome.clone());
        }
    }
}

/// Static facts the UI needs before any check has run.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdaterInfo {
    /// Version of the running build (from tauri.conf.json / Cargo.toml).
    current_version: String,
    /// False for `tauri dev` builds, where there is no installer to replace.
    supported: bool,
    /// Release manifest the installed app polls, when configured.
    endpoint: Option<String>,
    /// Cached outcome of the automatic startup check, if it has completed.
    last_check: Option<CheckOutcome>,
}

/// Download progress, emitted as `eventra://update-progress`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Progress {
    downloaded: u64,
    total: Option<u64>,
    /// 0–100, only when the server sent a Content-Length.
    percent: Option<u8>,
}

/// Coarse phase of an install, emitted as `eventra://update-phase`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct Phase {
    phase: &'static str,
    message: String,
}

fn emit_phase(app: &AppHandle, phase: &'static str, message: impl Into<String>) {
    let message = message.into();
    log::info!("updater: [{phase}] {message}");
    let _ = app.emit("eventra://update-phase", Phase { phase, message });
}

/// The manifest URL actually in force: the test override when set, otherwise the
/// first endpoint declared in tauri.conf.json. Returned for display only — the
/// plugin reads the same configuration itself.
fn configured_endpoint(app: &AppHandle) -> Option<String> {
    if let Some(raw) = endpoint_override() {
        return Some(raw);
    }
    app.config()
        .plugins
        .0
        .get("updater")
        .and_then(|cfg| cfg.get("endpoints"))
        .and_then(|e| e.as_array())
        .and_then(|a| a.first())
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
}

/// Build the plugin's updater. The public key and the endpoints come from
/// tauri.conf.json; only the documented test override replaces the endpoint.
fn build_updater(app: &AppHandle) -> Result<tauri_plugin_updater::Updater, String> {
    let mut builder = app.updater_builder();
    if let Some(raw) = endpoint_override() {
        let url = raw
            .parse()
            .map_err(|e| format!("endpoint de prueba inválido ({ENDPOINT_ENV}): {e}"))?;
        builder = builder
            .endpoints(vec![url])
            .map_err(|e| format!("no se pudo fijar el endpoint de prueba: {e}"))?;
    }
    builder
        .build()
        .map_err(|e| format!("no se pudo inicializar el actualizador: {e}"))
}

/// Human, safe-to-display reason for a failed check. The raw plugin error is
/// logged in full; the UI gets a message an operator can act on.
fn explain(err: &tauri_plugin_updater::Error) -> String {
    let raw = err.to_string();
    log::warn!("updater: {raw}");
    let lower = raw.to_lowercase();
    if lower.contains("signature") || lower.contains("minisign") {
        "La firma de la actualización no es válida. Se descartó la descarga y la aplicación sigue en la versión actual.".into()
    } else if lower.contains("404")
        || lower.contains("not found")
        // What the plugin actually reports when the manifest URL 404s — observed
        // against the real channel before any release had been published.
        || lower.contains("valid release json")
        || lower.contains("successful status code")
    {
        "Aún no hay un manifiesto de versiones publicado para esta aplicación.".into()
    } else if lower.contains("dns") || lower.contains("connect") || lower.contains("network")
        || lower.contains("timed out") || lower.contains("timeout")
    {
        "No se pudo contactar el servidor de actualizaciones. Comprueba la conexión e inténtalo de nuevo.".into()
    } else {
        format!("No se pudo comprobar actualizaciones: {raw}")
    }
}

/// Run a check and cache/broadcast its outcome. Never returns an error: any
/// problem becomes a `Failed` outcome the UI can show.
async fn check_now(app: &AppHandle) -> CheckOutcome {
    let current = app.package_info().version.to_string();

    if cfg!(debug_assertions) {
        return CheckOutcome::NotConfigured {
            reason: "Las actualizaciones automáticas solo funcionan en la aplicación instalada, no en modo desarrollo.".into(),
        };
    }
    if configured_endpoint(app).is_none() {
        return CheckOutcome::NotConfigured {
            reason: "No hay un canal de publicación configurado para esta aplicación.".into(),
        };
    }

    let updater = match build_updater(app) {
        Ok(u) => u,
        Err(message) => return CheckOutcome::Failed { message },
    };

    match updater.check().await {
        Ok(Some(update)) => CheckOutcome::Available {
            current_version: current,
            version: update.version.clone(),
            notes: update.body.clone(),
            date: update.date.map(|d| d.to_string()),
        },
        Ok(None) => CheckOutcome::UpToDate {
            current_version: current,
        },
        Err(e) => CheckOutcome::Failed {
            message: explain(&e),
        },
    }
}

/// Check, cache, emit. Shared by the startup check and the manual button.
async fn check_and_publish(app: &AppHandle) -> CheckOutcome {
    let outcome = check_now(app).await;
    match &outcome {
        CheckOutcome::Available { version, .. } => {
            log::info!("updater: nueva versión disponible: {version}")
        }
        CheckOutcome::UpToDate { current_version } => {
            log::info!("updater: al día (v{current_version})")
        }
        CheckOutcome::NotConfigured { reason } => log::info!("updater: sin canal — {reason}"),
        CheckOutcome::Failed { message } => log::warn!("updater: comprobación fallida — {message}"),
    }
    app.state::<UpdaterState>().store(&outcome);
    let _ = app.emit("eventra://update-state", outcome.clone());
    outcome
}

/// Non-blocking automatic check fired shortly after launch. Never gates startup
/// and never installs on its own.
pub fn spawn_startup_check(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let outcome = check_and_publish(&app).await;

        // Controlled end-to-end test only (private endpoint + explicit opt-in).
        if matches!(outcome, CheckOutcome::Available { .. }) && autoinstall_requested() {
            log::warn!("updater: {AUTOINSTALL_ENV}=1 con endpoint privado — instalando automáticamente (modo prueba)");
            if let Err(e) = updater_install(app.clone()).await {
                log::error!("updater: instalación automática de prueba fallida — {e}");
            }
        }
    });
}

/// Current version, support and the cached startup-check result.
#[tauri::command]
pub fn updater_state(app: AppHandle, state: tauri::State<'_, UpdaterState>) -> UpdaterInfo {
    UpdaterInfo {
        current_version: app.package_info().version.to_string(),
        supported: !cfg!(debug_assertions),
        endpoint: configured_endpoint(&app),
        last_check: state.last.lock().ok().and_then(|s| s.clone()),
    }
}

/// Manual "Buscar actualizaciones". Same path as the automatic check.
#[tauri::command]
pub async fn updater_check(app: AppHandle) -> CheckOutcome {
    emit_phase(&app, "checking", "Buscando actualizaciones…");
    check_and_publish(&app).await
}

/// Download the newer signed package, verify it and install it.
///
/// On success this call does not return: the plugin launches the installer and
/// exits the process, and the NSIS `/UPDATE` run relaunches the app. Any failure
/// before that leaves the current installation untouched.
#[tauri::command]
pub async fn updater_install(app: AppHandle) -> Result<(), String> {
    if cfg!(debug_assertions) {
        return Err("No se puede instalar una actualización en modo desarrollo.".into());
    }

    let updater = build_updater(&app)?;
    emit_phase(&app, "checking", "Confirmando la versión publicada…");

    let update = match updater.check().await {
        Ok(Some(u)) => u,
        Ok(None) => return Err("La aplicación ya está actualizada.".into()),
        Err(e) => return Err(explain(&e)),
    };

    let version = update.version.clone();
    emit_phase(&app, "downloading", format!("Descargando la versión {version}…"));

    let progress_app = app.clone();
    let mut downloaded: u64 = 0;
    let finished_app = app.clone();

    let bytes = update
        .download(
            move |chunk, total| {
                downloaded += chunk as u64;
                let percent = total.and_then(|t| {
                    (t > 0).then(|| ((downloaded.min(t) * 100) / t).min(100) as u8)
                });
                let _ = progress_app.emit(
                    "eventra://update-progress",
                    Progress { downloaded, total, percent },
                );
            },
            move || {
                // Fires after the last byte, before signature verification.
                emit_phase(&finished_app, "verifying", "Verificando la firma…");
            },
        )
        .await
        .map_err(|e| {
            let message = explain(&e);
            emit_phase(&app, "error", message.clone());
            message
        })?;

    emit_phase(&app, "installing", format!("Instalando la versión {version}…"));

    // Terminates the process on success (NSIS relaunches the new build).
    update.install(bytes).map_err(|e| {
        let message = format!("No se pudo instalar la actualización: {e}. La aplicación sigue en la versión actual.");
        log::error!("updater: {message}");
        emit_phase(&app, "error", message.clone());
        message
    })?;

    Ok(())
}
