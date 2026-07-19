import { useEffect, useState } from "react";
import { Button, Card, Pill } from "./ui";
import { IconShield } from "./ui/icons";
import {
  describe,
  isBusy,
  isTauri,
  onUpdateState,
  updaterCheck,
  updaterInstall,
  updaterState,
  type UpdateState,
} from "./updater";

/**
 * "Actualizaciones" — the user-facing surface of the official Tauri updater.
 *
 * Renders nothing outside the desktop shell (the web/PWA build updates itself
 * by reloading) and nothing when the build has no update channel configured, so
 * we never show a control that cannot do anything.
 *
 * The panel is a pure view over the Rust state machine: it subscribes to
 * `eventra://update-state` and reflects whatever phase the native side reports.
 * It never decides on its own whether an update exists.
 */
export function UpdatePanel() {
  const state = useUpdateState();
  if (!state || state.phase === "unsupported" || state.phase === "notConfigured") {
    return null;
  }

  const busy = isBusy(state);
  const available = state.phase === "available";

  return (
    <>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          color: "var(--em-text-faint)",
          margin: "16px 4px 10px",
          fontWeight: 700,
        }}
      >
        Actualizaciones
      </div>

      <Card pad>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="em-empty-icon"
            style={{ width: 44, height: 44, marginBottom: 0, flexShrink: 0 }}
          >
            <IconShield size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>Eventra Mobile</div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--em-text-muted)",
                marginTop: 2,
              }}
            >
              Versión {state.current || "—"}
            </div>
          </div>
          {available ? (
            <Pill tone="brand" dot>
              Nueva
            </Pill>
          ) : state.phase === "upToDate" ? (
            <Pill tone="muted">Al día</Pill>
          ) : null}
        </div>

        {/* One honest status line for every phase. */}
        <p
          style={{
            fontSize: 12.5,
            color:
              state.phase === "failed" ? "var(--em-err)" : "var(--em-text-muted)",
            margin: "12px 0 0",
          }}
          role="status"
          aria-live="polite"
        >
          {describe(state)}
        </p>

        {state.phase === "available" && state.notes ? (
          <p
            style={{
              fontSize: 12,
              color: "var(--em-text-faint)",
              margin: "6px 0 0",
              whiteSpace: "pre-wrap",
            }}
          >
            {state.notes}
          </p>
        ) : null}

        {state.phase === "downloading" ? (
          <ProgressBar percent={state.percent} />
        ) : null}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {available ? (
            <Button size="sm" onClick={() => void updaterInstall()} disabled={busy}>
              Descargar e instalar
            </Button>
          ) : null}
          <Button
            size="sm"
            variant={available ? "ghost" : "secondary"}
            onClick={() => void updaterCheck()}
            disabled={busy}
          >
            {state.phase === "checking" ? "Buscando…" : "Buscar actualizaciones"}
          </Button>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "var(--em-text-faint)",
            margin: "10px 0 0",
          }}
        >
          Las actualizaciones se verifican con firma digital antes de instalarse. Tus
          datos locales se conservan.
        </p>
      </Card>
    </>
  );
}

/**
 * Determinate when the server reports a content length, indeterminate otherwise.
 */
function ProgressBar({ percent }: { percent: number | null }) {
  const known = typeof percent === "number";
  return (
    <div
      style={{
        marginTop: 12,
        height: 6,
        borderRadius: 999,
        background: "var(--em-border)",
        overflow: "hidden",
      }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={known ? percent : undefined}
      aria-label="Progreso de descarga"
    >
      <div
        style={{
          height: "100%",
          width: known ? `${percent}%` : "40%",
          background: "var(--em-brand)",
          transition: "width .2s ease",
        }}
      />
    </div>
  );
}

/**
 * Reads the current updater state and keeps it in sync with the native events.
 * Returns `null` until the first read resolves, so the panel does not flash.
 */
export function useUpdateState(): UpdateState | null {
  const [state, setState] = useState<UpdateState | null>(
    isTauri() ? null : { phase: "unsupported" },
  );

  useEffect(() => {
    if (!isTauri()) return;
    let alive = true;
    void updaterState().then((s) => {
      if (alive) setState(s);
    });
    const stop = onUpdateState((s) => {
      if (alive) setState(s);
    });
    return () => {
      alive = false;
      stop();
    };
  }, []);

  return state;
}
