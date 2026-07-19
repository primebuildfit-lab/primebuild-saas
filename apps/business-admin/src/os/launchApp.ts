/**
 * Secure cross-app launcher (frontend client) for the Eventra Internal OS.
 *
 * Launching an installed sibling Tauri app (Business Admin / Mobile) goes through the
 * Rust command `eventra_launch`, which enforces the scheme+route ALLOWLIST server-side —
 * the web layer can never widen it. Opening the web Business Client goes through the
 * validated `resolveBusinessClientUrl` (HTTPS + host allowlist) and the hardened
 * `openExternal`. Install state comes from the Rust registry probe `eventra_app_installed`
 * (real INSTALLED / NOT_INSTALLED on Windows), degrading honestly to UNKNOWN elsewhere.
 *
 * No filesystem paths, no shell, no hardcoded URLs — everything derives from
 * @eventra/config (the single source of truth).
 */
import {
  EVENTRA_APP_LINKS,
  deepLinkFor,
  resolveBusinessClientUrl,
  type EventraTauriApp,
} from "@eventra/config";
import { openExternal } from "./openExternal";

/** Install/launch states shown per app (orden Fase 9). */
export type AppInstallState =
  | "installed"
  | "not_installed"
  | "unknown"
  | "version_mismatch"
  | "launch_failed";

export const APP_INSTALL_STATE_LABEL: Record<AppInstallState, string> = {
  installed: "Instalada",
  not_installed: "No instalada",
  unknown: "Estado desconocido",
  version_mismatch: "Versión distinta",
  launch_failed: "Fallo al abrir",
};

export interface LaunchResult {
  ok: boolean;
  state: AppInstallState;
  /** Human, safe-to-show reason when ok is false. */
  message?: string;
}

function isTauri(): boolean {
  return typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
}

/** Dynamically import the Tauri IPC bridge so the plain web bundle never hard-depends on it. */
async function invokeTauri<T>(cmd: string, args: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd, args);
}

/** Read a Vite env var (client build), used to resolve the configured Business Client URL. */
function readEnv(key: string): string | undefined {
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key];
  } catch {
    return undefined;
  }
}

/**
 * Probe whether a sibling Tauri app is installed for this user. Real signal on Windows
 * desktop (registry). In a browser/dev context we cannot know → "unknown" (never faked).
 */
export async function probeInstalled(app: EventraTauriApp): Promise<AppInstallState> {
  if (!isTauri()) return "unknown";
  try {
    const installed = await invokeTauri<boolean>("eventra_app_installed", { scheme: app.scheme });
    return installed ? "installed" : "not_installed";
  } catch {
    return "unknown";
  }
}

/**
 * Launch an allow-listed Eventra Tauri app at a validated route. Returns a controlled
 * result — never throws. The route is validated here AND again in Rust.
 */
export async function launchTauriApp(app: EventraTauriApp, route = ""): Promise<LaunchResult> {
  const link = deepLinkFor(app.key, route);
  if (!link) {
    return { ok: false, state: "launch_failed", message: "Destino no permitido." };
  }
  if (!isTauri()) {
    return {
      ok: false,
      state: "unknown",
      message: "Abrir la aplicación instalada solo está disponible desde el escritorio.",
    };
  }
  try {
    await invokeTauri<void>("eventra_launch", { scheme: app.scheme, route });
    return { ok: true, state: "installed" };
  } catch (e) {
    // An unregistered scheme means the target app is not installed for this user.
    return {
      ok: false,
      state: "not_installed",
      message: "La aplicación no está instalada en este equipo.",
    };
  }
}

/** The configured, validated Business Client web URL, or null when not configured. */
export function businessClientUrl(): string | null {
  return resolveBusinessClientUrl(readEnv);
}

/** Open the web Business Client in the default browser (HTTPS + allow-listed host only). */
export async function openBusinessClient(): Promise<LaunchResult> {
  const url = businessClientUrl();
  if (!url) {
    return { ok: false, state: "not_installed", message: "URL de Business Client no configurada." };
  }
  await openExternal(url);
  return { ok: true, state: "installed" };
}

/** The three official Tauri apps + the web client, exposed for the launcher UI. */
export const LAUNCHER_APPS = {
  internalOs: EVENTRA_APP_LINKS.internalOs,
  businessAdmin: EVENTRA_APP_LINKS.businessAdmin,
  mobile: EVENTRA_APP_LINKS.mobile,
  businessClient: EVENTRA_APP_LINKS.businessClient,
} as const;
