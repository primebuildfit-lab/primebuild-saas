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

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
        .setup(|app| {
            let version = app.package_info().version.to_string();
            log::info!("Eventra Internal OS starting — v{version}");

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
