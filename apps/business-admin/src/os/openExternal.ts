/**
 * Open an external URL correctly in BOTH contexts:
 *   • Desktop (Tauri webview): `window.open` is ignored by the webview, so we call the
 *     Tauri opener plugin, which launches the user's default browser.
 *   • Browser (web/dev): a normal `window.open` new tab.
 *
 * Detection is by the Tauri IPC global; the plugin is dynamically imported so the web
 * bundle never hard-depends on it.
 */
function isTauri(): boolean {
  return typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

/**
 * Only http(s) may ever be opened as an "external" link. This blocks dangerous schemes
 * (`javascript:`, `file:`, `data:`, custom app schemes) from being smuggled through the
 * generic opener — cross-app Tauri launches go through the validated launcher instead.
 */
function isSafeExternalUrl(url: string): boolean {
  try {
    const p = new URL(url).protocol;
    return p === "https:" || p === "http:";
  } catch {
    return false;
  }
}

export async function openExternal(url: string): Promise<void> {
  if (!url || !isSafeExternalUrl(url)) return;
  if (isTauri()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(url);
      return;
    } catch {
      /* fall through to window.open */
    }
  }
  try {
    window.open(url, "_blank", "noopener,noreferrer");
  } catch {
    /* nothing else we can safely do */
  }
}
