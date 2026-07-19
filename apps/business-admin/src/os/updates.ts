/**
 * Updater client (frontend side of the official Tauri updater).
 *
 * The web layer never touches the updater plugin directly: it calls this app's
 * own Rust commands, which own the endpoint, the public key, the signature
 * verification and the install. Nothing here can point the update at another
 * origin — no URL, path or key crosses the IPC boundary.
 *
 * Outside the desktop app (plain browser, tests) every call degrades honestly to
 * "unsupported" instead of pretending to be up to date.
 */

/** Mirrors the Rust `CheckOutcome` enum 1:1. */
export type CheckOutcome =
  | { kind: "not_configured"; reason: string }
  | { kind: "up_to_date"; currentVersion: string }
  | {
      kind: "available";
      currentVersion: string;
      version: string;
      notes?: string | null;
      date?: string | null;
    }
  | { kind: "failed"; message: string };

/** Mirrors the Rust `UpdaterInfo` struct. */
export interface UpdaterInfo {
  currentVersion: string;
  supported: boolean;
  endpoint: string | null;
  lastCheck: CheckOutcome | null;
}

export interface UpdateProgress {
  downloaded: number;
  total: number | null;
  percent: number | null;
}

export type UpdatePhaseName =
  | "checking"
  | "downloading"
  | "verifying"
  | "installing"
  | "error";

export interface UpdatePhase {
  phase: UpdatePhaseName;
  message: string;
}

export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

/** Dynamic import so the plain web bundle never hard-depends on the IPC bridge. */
async function invokeTauri<T>(cmd: string): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(cmd);
}

async function listenTauri<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  const { listen } = await import("@tauri-apps/api/event");
  return listen<T>(event, (e) => handler(e.payload));
}

/** Honest stand-in used whenever the console runs outside the desktop app. */
export const UNSUPPORTED_INFO: UpdaterInfo = {
  currentVersion: "",
  supported: false,
  endpoint: null,
  lastCheck: {
    kind: "not_configured",
    reason:
      "Las actualizaciones automáticas solo están disponibles en la aplicación de escritorio instalada.",
  },
};

export async function readUpdaterState(): Promise<UpdaterInfo> {
  if (!isTauri()) return UNSUPPORTED_INFO;
  try {
    return await invokeTauri<UpdaterInfo>("updater_state");
  } catch (e) {
    return {
      ...UNSUPPORTED_INFO,
      lastCheck: { kind: "failed", message: errorText(e) },
    };
  }
}

/** Manual "Buscar actualizaciones". Never throws. */
export async function checkForUpdates(): Promise<CheckOutcome> {
  if (!isTauri()) return UNSUPPORTED_INFO.lastCheck as CheckOutcome;
  try {
    return await invokeTauri<CheckOutcome>("updater_check");
  } catch (e) {
    return { kind: "failed", message: errorText(e) };
  }
}

/**
 * Download, verify and install. On success the process is replaced by the
 * installer and this promise never settles, so callers must keep showing
 * progress rather than waiting for a return value.
 */
export async function installUpdate(): Promise<{ ok: boolean; message?: string }> {
  if (!isTauri()) {
    return {
      ok: false,
      message:
        "Las actualizaciones automáticas solo están disponibles en la aplicación de escritorio instalada.",
    };
  }
  try {
    await invokeTauri<void>("updater_install");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: errorText(e) };
  }
}

export async function onUpdateState(
  handler: (outcome: CheckOutcome) => void,
): Promise<() => void> {
  if (!isTauri()) return () => {};
  try {
    return await listenTauri<CheckOutcome>("eventra://update-state", handler);
  } catch {
    return () => {};
  }
}

export async function onUpdateProgress(
  handler: (p: UpdateProgress) => void,
): Promise<() => void> {
  if (!isTauri()) return () => {};
  try {
    return await listenTauri<UpdateProgress>("eventra://update-progress", handler);
  } catch {
    return () => {};
  }
}

export async function onUpdatePhase(
  handler: (p: UpdatePhase) => void,
): Promise<() => void> {
  if (!isTauri()) return () => {};
  try {
    return await listenTauri<UpdatePhase>("eventra://update-phase", handler);
  } catch {
    return () => {};
  }
}

function errorText(e: unknown): string {
  if (typeof e === "string") return e;
  if (e instanceof Error) return e.message;
  return "Error desconocido del actualizador.";
}

/* --------------------------------------------------------------------------
 * Pure presentation helpers (unit-tested)
 * ------------------------------------------------------------------------ */

export type OutcomeTone = "success" | "brand" | "warning" | "danger";

export interface OutcomeView {
  tone: OutcomeTone;
  /** Short status shown in the pill / topbar. */
  label: string;
  /** Full sentence shown in the settings panel. */
  detail: string;
  /** Whether an install can be offered. */
  canInstall: boolean;
}

/** Turn a check outcome into exactly what the operator should read. */
export function describeOutcome(outcome: CheckOutcome | null): OutcomeView {
  if (!outcome) {
    return {
      tone: "brand",
      label: "Comprobando",
      detail: "Buscando actualizaciones…",
      canInstall: false,
    };
  }
  switch (outcome.kind) {
    case "up_to_date":
      return {
        tone: "success",
        label: "Actualizada",
        detail: `La aplicación está actualizada (versión ${outcome.currentVersion}).`,
        canInstall: false,
      };
    case "available":
      return {
        tone: "brand",
        label: `Actualización ${outcome.version}`,
        detail: `Hay una nueva versión disponible: ${outcome.version} (tienes la ${outcome.currentVersion}).`,
        canInstall: true,
      };
    case "not_configured":
      return {
        tone: "warning",
        label: "No disponible",
        detail: outcome.reason,
        canInstall: false,
      };
    case "failed":
      return {
        tone: "danger",
        label: "Error",
        detail: outcome.message,
        canInstall: false,
      };
  }
}

/** Human size for the download counter. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(1)} MB`;
}

/** Progress line: percentage when known, otherwise the downloaded amount. */
export function formatProgress(p: UpdateProgress | null): string {
  if (!p) return "";
  if (p.percent !== null && p.total !== null) {
    return `${p.percent}% · ${formatBytes(p.downloaded)} de ${formatBytes(p.total)}`;
  }
  return `${formatBytes(p.downloaded)} descargados`;
}
