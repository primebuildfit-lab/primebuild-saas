/**
 * Eventra Mobile — updater client.
 *
 * A thin, typed wrapper over the three Rust commands that drive the official
 * Tauri updater (see `src-tauri/src/updater.rs`). The webview deliberately has
 * NO updater or process permission: it can only ask for a check, ask to apply
 * an already signature-verified update, and read state. All downloading and
 * minisign verification happens natively.
 *
 * In the browser/PWA build there is no Tauri IPC, so every call resolves to
 * `unsupported` and the UI simply hides the update section.
 */

/** Mirrors the `UpdateState` tagged union serialized by Rust. */
export type UpdateState =
  | { phase: "unsupported" }
  | { phase: "idle"; current: string }
  | { phase: "notConfigured"; current: string }
  | { phase: "checking"; current: string }
  | { phase: "upToDate"; current: string }
  | {
      phase: "available";
      current: string;
      version: string;
      notes: string | null;
      date: string | null;
    }
  | {
      phase: "downloading";
      current: string;
      version: string;
      downloaded: number;
      total: number | null;
      percent: number | null;
    }
  | { phase: "installing"; current: string; version: string }
  | { phase: "failed"; current: string; message: string };

/** Event name the Rust side emits on every state transition. */
const UPDATE_STATE_EVENT = "eventra://update-state";

/** True only inside the Tauri desktop shell. */
export function isTauri(): boolean {
  return (
    typeof window !== "undefined" &&
    ("__TAURI_INTERNALS__" in window || "__TAURI__" in window)
  );
}

/** `true` when this state means an update is ready to be applied. */
export function isUpdateAvailable(state: UpdateState): boolean {
  return state.phase === "available";
}

/** `true` while the app is working (check or download in flight). */
export function isBusy(state: UpdateState): boolean {
  return (
    state.phase === "checking" ||
    state.phase === "downloading" ||
    state.phase === "installing"
  );
}

const UNSUPPORTED: UpdateState = { phase: "unsupported" };

async function call(command: string): Promise<UpdateState> {
  if (!isTauri()) return UNSUPPORTED;
  try {
    const { invoke } = await import("@tauri-apps/api/core");
    return (await invoke(command)) as UpdateState;
  } catch (e) {
    // A transport failure must never break the screen — surface it as state.
    return { phase: "failed", current: "", message: String(e) };
  }
}

/** Read the last known updater state (used when the panel mounts). */
export function updaterState(): Promise<UpdateState> {
  return call("updater_state");
}

/** Manual "Buscar actualizaciones". */
export function updaterCheck(): Promise<UpdateState> {
  return call("updater_check");
}

/**
 * Apply the pending update: download → verify → install → relaunch. On Windows
 * this call does not resolve — the installer takes over and the app exits.
 */
export function updaterInstall(): Promise<UpdateState> {
  return call("updater_install");
}

/**
 * Subscribe to updater state transitions. Returns an unsubscribe function that
 * is safe to call even if the listener never finished attaching.
 */
export function onUpdateState(handler: (state: UpdateState) => void): () => void {
  if (!isTauri()) return () => {};
  let unlisten: (() => void) | undefined;
  let cancelled = false;

  void (async () => {
    try {
      const { listen } = await import("@tauri-apps/api/event");
      const stop = await listen<UpdateState>(UPDATE_STATE_EVENT, (e) =>
        handler(e.payload),
      );
      if (cancelled) stop();
      else unlisten = stop;
    } catch {
      /* no updater events in this context — the panel keeps its polled state */
    }
  })();

  return () => {
    cancelled = true;
    unlisten?.();
  };
}

/** Human-readable byte size for the download progress line. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return mb < 1 ? `${Math.round(bytes / 1024)} KB` : `${mb.toFixed(1)} MB`;
}

/**
 * The single line of copy the UI shows for a state. Spanish, plain, and honest —
 * it never claims an update exists when the channel simply is not configured.
 */
export function describe(state: UpdateState): string {
  switch (state.phase) {
    case "unsupported":
      return "Las actualizaciones automáticas solo están disponibles en la app de escritorio.";
    case "idle":
      return "Sin comprobar todavía.";
    case "notConfigured":
      return "Esta compilación no tiene canal de actualización configurado.";
    case "checking":
      return "Buscando actualizaciones…";
    case "upToDate":
      return `Estás al día. Eventra Mobile ${state.current} es la última versión.`;
    case "available":
      return `Hay una versión nueva disponible: ${state.version}.`;
    case "downloading": {
      const size = formatBytes(state.downloaded);
      return state.percent === null
        ? `Descargando ${state.version}… (${size})`
        : `Descargando ${state.version}… ${state.percent}% (${size})`;
    }
    case "installing":
      return `Instalando ${state.version}. La app se reiniciará sola.`;
    case "failed":
      return `No se pudo completar la comprobación: ${state.message}`;
  }
}
