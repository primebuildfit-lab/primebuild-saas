/**
 * Eventra Mobile — external web opener. Mobile may ONLY open allow-listed HTTPS pages
 * (terms / privacy / support / official web / Business Client). It NEVER launches the
 * internal-tool apps (Internal OS / Business Admin) — those are administrative surfaces
 * and there is deliberately no launcher here. Every URL is re-validated against the
 * @eventra/config web allowlist before opening; anything else is refused (returns false).
 */
import { validateWebTarget, resolveBusinessClientUrl } from "@eventra/config";

function isTauri(): boolean {
  return typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

function readEnv(key: string): string | undefined {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key];
  } catch {
    return undefined;
  }
}

/** Open an allow-listed HTTPS page. Returns false (and does nothing) when refused. */
export async function openAllowedWeb(url: string): Promise<boolean> {
  const validated = validateWebTarget(url);
  if (!validated) return false;
  if (isTauri()) {
    try {
      const { openUrl } = await import("@tauri-apps/plugin-opener");
      await openUrl(validated);
      return true;
    } catch {
      /* fall through to window.open */
    }
  }
  try {
    window.open(validated, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}

/** The configured, validated Business Client web URL, or null when not configured. */
export function businessClientUrl(): string | null {
  return resolveBusinessClientUrl(readEnv);
}

/**
 * The ONLY web destinations Mobile links to. All on the official Eventra brand domains,
 * so they pass the web allowlist. No internal-tool schemes appear here by design.
 */
export const MOBILE_LINKS = {
  terms: "https://eventra.app/terms",
  privacy: "https://eventra.app/privacy",
  support: "https://help.eventra.app",
  web: "https://eventra.app",
} as const;
