// Eventra Mobile — phone-form-factor runtime (Tauri 2).
//
// This is a thin shell around the existing `apps/consumer` web SPA/PWA. It does
// NOT reimplement any product logic, routing, or data. The frontend is the
// unchanged Vite/React build served from `../dist`; this crate only:
//   * creates the (phone-sized) window (geometry from config, persisted across runs),
//   * opens external links in the system browser (allowlisted hosts),
//   * writes local diagnostic logs (no secrets),
//   * reveals the window once content has painted (no white flash),
//   * on desktop, runs a background auto-update check (store-managed on mobile).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Auto-update is desktop-only; on Android/iOS the app store owns updates.
#[cfg(desktop)]
mod updater;

use tauri::{Emitter, Manager};

/// The Eventra URI schemes this app accepts inbound. Mobile is a LAUNCH TARGET only: it
/// accepts its own `eventra-mobile://` deep links and NEVER opens the internal-tool
/// schemes (Internal OS / Business Admin) — those are administrative surfaces.
const MOBILE_SCHEME: &str = "eventra-mobile";

/// Validate a deep-link route: empty, or slash-separated lowercase-alphanumeric+dash
/// segments. Rejects traversal, absolute paths, schemes, queries and whitespace.
fn route_valid(route: &str) -> bool {
    if route.is_empty() {
        return true;
    }
    if route.len() > 128 || route.contains("..") {
        return false;
    }
    route.split('/').all(|seg| {
        !seg.is_empty()
            && !seg.starts_with('-')
            && !seg.ends_with('-')
            && seg
                .chars()
                .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    })
}

/// Validate an inbound `eventra-mobile://<route>` deep link and, if valid, focus the
/// window and emit `eventra://open-route` for the frontend. Any other scheme, or an
/// invalid route, is logged and ignored — never executed.
fn forward_deep_links(app: &tauri::AppHandle, urls: &[String]) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
    for raw in urls {
        let Some((scheme, rest)) = raw.split_once("://") else { continue };
        let route = rest.trim_end_matches('/');
        if scheme == MOBILE_SCHEME && route_valid(route) {
            log::info!("deep link accepted: {scheme}://{route}");
            let _ = app.emit("eventra://open-route", route.to_string());
        } else {
            log::warn!("deep link rejected: {raw}");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();

    // single-instance MUST be the FIRST plugin (desktop only): a relaunch / deep link
    // focuses the running window and forwards the URL instead of spawning a duplicate.
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            forward_deep_links(app, &argv);
        }));
    }

    // Automatic updates (checks a signed release manifest in the background).
    // Desktop only — the plugin does not support mobile targets. The webview gets
    // only these three thin commands; it never touches the updater plugin's own
    // IPC surface, so it cannot download or install anything on its own.
    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_updater::Builder::new().build())
            .manage(updater::UpdaterState::default())
            .invoke_handler(tauri::generate_handler![
                updater::updater_state,
                updater::updater_check,
                updater::updater_install,
            ]);
    }

    builder
        // Local, secret-free diagnostics in the app data/log directory.
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("eventra-mobile".into()),
                    },
                ))
                .level(log::LevelFilter::Info)
                .build(),
        )
        // Remembers window size, position and maximized state between runs.
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // Opens external URLs in the user's default browser.
        .plugin(tauri_plugin_opener::init())
        // Registers/receives the eventra-mobile:// URI scheme (launch target only).
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            let version = app.package_info().version.to_string();
            log::info!("Eventra Mobile starting — v{version}");

            // Register this app's URI scheme for the current user and forward validated
            // inbound deep links to the frontend (desktop; mobile uses OS app-link config).
            #[cfg(desktop)]
            {
                use tauri_plugin_deep_link::DeepLinkExt;
                if let Err(e) = app.deep_link().register_all() {
                    log::warn!("deep-link scheme registration skipped: {e}");
                }
                let handle = app.handle().clone();
                app.deep_link().on_open_url(move |event| {
                    let urls: Vec<String> = event.urls().iter().map(|u| u.to_string()).collect();
                    forward_deep_links(&handle, &urls);
                });
            }

            // Non-blocking automatic update check (desktop only). It only
            // REPORTS — the result is pushed to the UI, and applying an update
            // is always the user's explicit action (see updater.rs). Never
            // gates startup; no-ops until the release channel is configured.
            #[cfg(desktop)]
            updater::spawn_startup_check(app.handle().clone());

            // Safety net: never leave a permanently hidden window if the page
            // load event is somehow not observed (e.g. a bundling error).
            let handle = app.handle().clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(8));
                if let Some(main) = handle.get_webview_window("main") {
                    if !main.is_visible().unwrap_or(true) {
                        let _ = main.show();
                        log::warn!(
                            "main window revealed via fallback timer (page-load not observed)"
                        );
                    }
                }
            });
            Ok(())
        })
        // Reveal the main window only once its content has finished painting,
        // so the user never sees a blank/white window.
        .on_page_load(|webview, payload| {
            if webview.label() == "main"
                && payload.event() == tauri::webview::PageLoadEvent::Finished
            {
                if let Some(main) = webview.app_handle().get_webview_window("main") {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
                log::info!("main webview ready");
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Eventra Mobile");
}
