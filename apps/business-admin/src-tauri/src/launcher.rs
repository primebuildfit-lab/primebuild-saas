//! Secure cross-app launcher for the Eventra ecosystem.
//!
//! The ONLY apps that can ever be opened are the three official Eventra Tauri apps,
//! addressed by their REGISTERED URI SCHEME — never by a filesystem path, never through
//! an arbitrary shell, never an operator-supplied executable. The route that follows the
//! scheme is validated against a strict grammar (lowercase path segments only; no
//! traversal, query, scheme, whitespace or backslash) before anything is opened. The
//! allowlist lives here in Rust (trusted), so a compromised or buggy web layer cannot
//! widen it. Mirrors the pure validators in `@eventra/config` (appLinks.ts).

use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

/// The three — and only — Eventra URI schemes a launch may ever target.
pub const ALLOWED_SCHEMES: [&str; 3] =
    ["eventra-internal", "eventra-business-admin", "eventra-mobile"];

fn scheme_allowed(scheme: &str) -> bool {
    ALLOWED_SCHEMES.contains(&scheme)
}

/// Validate a deep-link route: empty (app root), or slash-separated segments of
/// lowercase-alphanumeric + internal dashes. Mirrors `isValidDeepLinkRoute` in
/// @eventra/config. Rejects traversal, absolute paths, schemes, queries and whitespace.
pub fn route_valid(route: &str) -> bool {
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

/// Build a validated `scheme://route`, or None when either part is disallowed.
pub fn build_deep_link(scheme: &str, route: &str) -> Option<String> {
    if !scheme_allowed(scheme) || !route_valid(route) {
        return None;
    }
    Some(if route.is_empty() {
        format!("{scheme}://")
    } else {
        format!("{scheme}://{route}")
    })
}

/// Open one of the allow-listed Eventra apps by scheme + validated route via the OS
/// (the registered URI-scheme handler). Rejects anything outside the allowlist. Windows
/// returns an error when the scheme is unregistered (the target app is not installed);
/// the frontend maps that to a controlled NOT_INSTALLED / LAUNCH_FAILED state.
#[tauri::command]
pub fn eventra_launch(app: AppHandle, scheme: String, route: String) -> Result<(), String> {
    let target = build_deep_link(&scheme, &route)
        .ok_or_else(|| format!("rejected: scheme='{scheme}' route='{route}'"))?;
    app.opener()
        .open_url(target, None::<&str>)
        .map_err(|e| e.to_string())
}

/// Best-effort install probe. On Windows a per-user scheme handler is registered under
/// `HKCU\Software\Classes\<scheme>`; its presence means the target app is installed for
/// this user. Only allow-listed schemes may be probed. Non-Windows builds return false
/// (the caller treats "cannot determine" as INSTALLATION_UNKNOWN, never a fake installed).
#[tauri::command]
pub fn eventra_app_installed(scheme: String) -> Result<bool, String> {
    if !scheme_allowed(&scheme) {
        return Err(format!("scheme not allowed: {scheme}"));
    }
    #[cfg(windows)]
    {
        use winreg::enums::HKEY_CURRENT_USER;
        use winreg::RegKey;
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let path = format!("Software\\Classes\\{scheme}");
        Ok(hkcu.open_subkey(path).is_ok())
    }
    #[cfg(not(windows))]
    {
        let _ = scheme;
        Ok(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn only_eventra_schemes_allowed() {
        assert!(scheme_allowed("eventra-internal"));
        assert!(scheme_allowed("eventra-business-admin"));
        assert!(scheme_allowed("eventra-mobile"));
        assert!(!scheme_allowed("file"));
        assert!(!scheme_allowed("com.partnera.creator"));
        assert!(!scheme_allowed(""));
    }

    #[test]
    fn routes_are_strictly_validated() {
        assert!(route_valid(""));
        assert!(route_valid("dashboard"));
        assert!(route_valid("marketing/campaigns"));
        assert!(!route_valid("../secret"));
        assert!(!route_valid("/etc/passwd"));
        assert!(!route_valid("dashboard?x=1"));
        assert!(!route_valid("UP"));
        assert!(!route_valid("a b"));
        assert!(!route_valid("C:\\Windows"));
    }

    #[test]
    fn deep_links_reject_disallowed_input() {
        assert_eq!(
            build_deep_link("eventra-mobile", "events").as_deref(),
            Some("eventra-mobile://events")
        );
        assert_eq!(build_deep_link("eventra-mobile", ""), Some("eventra-mobile://".into()));
        assert!(build_deep_link("file", "x").is_none());
        assert!(build_deep_link("eventra-mobile", "../x").is_none());
    }
}
