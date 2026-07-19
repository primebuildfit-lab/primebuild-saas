// Eventra Internal OS — desktop runtime (Tauri 2).
//
// This is a thin desktop shell around the existing `apps/admin` web SPA. It does
// NOT reimplement any product logic, routing, metrics, or data. The frontend is
// the unchanged Vite/React build served from `../dist`; this crate only:
//   * creates the desktop window (geometry from config, persisted across runs),
//   * opens external links in the system browser (allowlisted hosts),
//   * writes local diagnostic logs (no secrets),
//   * reveals the window once content has painted (no white flash).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod launcher;
mod updater;

use tauri::{Emitter, Manager};

/// Validate an inbound deep link (`eventra-internal://<route>`) and, if the scheme and
/// route are allow-listed, focus the window and emit `eventra://open-route` with the
/// route for the frontend to navigate to. Invalid links are logged and ignored — never
/// executed, never turned into a file path or command.
fn forward_deep_links(app: &tauri::AppHandle, urls: &[String]) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();
    }
    for raw in urls {
        let Some((scheme, rest)) = raw.split_once("://") else { continue };
        let route = rest.trim_end_matches('/');
        if launcher::ALLOWED_SCHEMES.contains(&scheme) && launcher::route_valid(route) {
            log::info!("deep link accepted: {scheme}://{route}");
            let _ = app.emit("eventra://open-route", route.to_string());
        } else {
            log::warn!("deep link rejected: {raw}");
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // single-instance MUST be the FIRST plugin: a second launch (e.g. a deep link)
        // focuses the running window and forwards the URL instead of spawning a duplicate.
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            forward_deep_links(app, &argv);
        }))
        // Automatic updates (checks a signed release manifest in the background).
        .plugin(tauri_plugin_updater::Builder::new().build())
        // Local, secret-free diagnostics in the app data/log directory.
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("eventra-internal-os".into()),
                    },
                ))
                .level(log::LevelFilter::Info)
                .build(),
        )
        // Remembers window size, position and maximized state between runs.
        .plugin(tauri_plugin_window_state::Builder::default().build())
        // Opens external URLs in the user's default browser.
        .plugin(tauri_plugin_opener::init())
        // Registers/receives the eventra-internal:// URI scheme.
        .plugin(tauri_plugin_deep_link::init())
        // Secure cross-app launcher IPC (allow-listed schemes + validated routes only).
        .invoke_handler(tauri::generate_handler![
            launcher::eventra_launch,
            launcher::eventra_app_installed,
        ])
        .setup(|app| {
            let version = app.package_info().version.to_string();
            log::info!("Eventra Internal OS starting — v{version}");

            // Register this app's URI scheme for the current user (dev + a runtime
            // fallback; the NSIS installer also registers it in production). Then listen
            // for inbound deep links and forward validated routes to the frontend.
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

            // Non-blocking automatic update check. If a newer signed release is
            // published it is downloaded, verified and installed, then the app
            // relaunches. Never gates startup; no-ops until the release channel
            // is configured.
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
        .expect("error while running Eventra Internal OS");
}
