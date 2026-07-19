/**
 * Updater UI — the operator-facing half of the official Tauri updater.
 *
 * `useUpdater` owns the whole lifecycle: it reads the cached outcome of the
 * automatic startup check, subscribes to the state/progress/phase events, and
 * exposes the manual check + install actions. Two views consume it: a compact
 * `UpdateIndicator` in the topbar and the full `UpdatesPanel` in Configuración.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Card, Pill } from "./ui";
import {
  checkForUpdates,
  describeOutcome,
  formatProgress,
  installUpdate,
  onUpdatePhase,
  onUpdateProgress,
  onUpdateState,
  readUpdaterState,
  type CheckOutcome,
  type UpdatePhase,
  type UpdateProgress,
  type UpdaterInfo,
} from "./updates";

export interface UpdaterView {
  info: UpdaterInfo | null;
  outcome: CheckOutcome | null;
  checking: boolean;
  installing: boolean;
  progress: UpdateProgress | null;
  phase: UpdatePhase | null;
  error: string | null;
  check: () => Promise<void>;
  install: () => Promise<void>;
}

export function useUpdater(): UpdaterView {
  const [info, setInfo] = useState<UpdaterInfo | null>(null);
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [phase, setPhase] = useState<UpdatePhase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const unsubs: Array<() => void> = [];

    // Cached result of the automatic check fired at startup by the Rust shell.
    void readUpdaterState().then((s) => {
      if (!alive.current) return;
      setInfo(s);
      if (s.lastCheck) setOutcome(s.lastCheck);
    });

    void onUpdateState((o) => {
      if (!alive.current) return;
      setOutcome(o);
      setChecking(false);
    }).then((u) => unsubs.push(u));

    void onUpdateProgress((p) => {
      if (alive.current) setProgress(p);
    }).then((u) => unsubs.push(u));

    void onUpdatePhase((p) => {
      if (!alive.current) return;
      setPhase(p);
      if (p.phase === "error") {
        setError(p.message);
        setInstalling(false);
      }
    }).then((u) => unsubs.push(u));

    return () => {
      alive.current = false;
      unsubs.forEach((u) => u());
    };
  }, []);

  const check = useCallback(async () => {
    setChecking(true);
    setError(null);
    setPhase(null);
    const o = await checkForUpdates();
    if (!alive.current) return;
    setOutcome(o);
    setChecking(false);
  }, []);

  const install = useCallback(async () => {
    setInstalling(true);
    setError(null);
    setProgress(null);
    const res = await installUpdate();
    // On success the process is replaced by the installer, so reaching here with
    // ok === true is unusual; only a failure is actionable.
    if (!alive.current) return;
    if (!res.ok) {
      setError(res.message ?? "No se pudo instalar la actualización.");
      setInstalling(false);
    }
  }, []);

  return { info, outcome, checking, installing, progress, phase, error, check, install };
}

/**
 * One updater lifecycle per window, shared by the topbar indicator and the
 * Configuración panel — two independent hooks would mean duplicate listeners
 * and a manual check whose result only one of them could see.
 */
const UpdaterContext = createContext<UpdaterView | null>(null);

export function UpdaterProvider({ children }: { children: ReactNode }) {
  const updater = useUpdater();
  return <UpdaterContext.Provider value={updater}>{children}</UpdaterContext.Provider>;
}

/** Null outside the provider (e.g. a component rendered in isolation in tests). */
export function useUpdaterContext(): UpdaterView | null {
  return useContext(UpdaterContext);
}

/** Compact topbar status. Silent when there is nothing worth interrupting for. */
export function UpdateIndicator() {
  const updater = useUpdaterContext();
  if (!updater) return null;
  const { outcome, installing } = updater;
  if (installing) {
    return (
      <span className="topbar__update" title="Instalando la actualización">
        <Pill tone="brand" dot>Actualizando…</Pill>
      </span>
    );
  }
  if (!outcome || outcome.kind !== "available") return null;
  return (
    <span
      className="topbar__update"
      title={`Nueva versión ${outcome.version} disponible — ve a Configuración para instalarla`}
    >
      <Pill tone="brand" dot>Actualización {outcome.version}</Pill>
    </span>
  );
}

/** Full panel: state, versions, manual check, download progress, install. */
export function UpdatesPanel() {
  const updater = useUpdaterContext();
  if (!updater) {
    return (
      <Card>
        <p className="note">El estado de actualizaciones no está disponible en este contexto.</p>
      </Card>
    );
  }
  const { info, outcome, checking, installing, progress, phase, error, check, install } = updater;
  const view = describeOutcome(checking ? null : outcome);
  const version = info?.currentVersion;

  return (
    <Card>
      <div className="updates__head">
        <div>
          <strong>Actualizaciones automáticas</strong>
          <p className="note" style={{ marginTop: 4 }}>
            {version ? `Versión instalada ${version}. ` : ""}
            La aplicación busca actualizaciones al iniciarse. Las descargas se
            verifican con firma digital antes de instalarse.
          </p>
        </div>
        <Pill tone={view.tone} dot>{view.label}</Pill>
      </div>

      <p style={{ margin: "12px 0 0", color: "var(--text-secondary)" }}>{view.detail}</p>

      {installing && (
        <div className="updates__progress" role="status" aria-live="polite">
          <div className="progress">
            <div
              className="progress__bar"
              style={{ width: progress?.percent != null ? `${progress.percent}%` : "100%" }}
              data-indeterminate={progress?.percent == null ? "true" : "false"}
            />
          </div>
          <p className="note">
            {phase?.message ?? "Preparando la descarga…"}
            {progress ? ` · ${formatProgress(progress)}` : ""}
          </p>
        </div>
      )}

      {error && <p className="updates__error">{error}</p>}

      <div className="updates__actions">
        <button
          type="button"
          className="btn"
          onClick={() => void check()}
          disabled={checking || installing}
        >
          {checking ? "Buscando…" : "Buscar actualizaciones"}
        </button>
        {view.canInstall && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => void install()}
            disabled={installing}
          >
            {installing ? "Instalando…" : "Instalar y reiniciar"}
          </button>
        )}
      </div>

      {info?.endpoint && (
        <p className="note updates__endpoint">Canal de publicación: <code>{info.endpoint}</code></p>
      )}
    </Card>
  );
}
