/**
 * Surfaces — the Eventra apps this Admin console hosts, rendered as BIG boxes
 * ("recuadros grandes") at the top of the Plantillas branch. Config-driven: the
 * entries live in surfaces.config.ts — to change an app you edit ONLY that file.
 *
 * Each box is a REAL connection to its host and shows LIVE status so the link
 * never "silently disconnects": it probes the host (no-cors reachability check),
 * shows En línea / Apagado, re-checks on an interval and on window focus, and when
 * a host is down it tells you the exact command to bring it back. Opening a box
 * launches the host in a NEW WINDOW.
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pill } from "./ui";
import { IconCard, IconCalendar, IconLayout, IconMegaphone, IconNodes, IconExternal } from "./icons";
import { SURFACES, type SurfaceAccent, type SurfaceIcon, type SurfaceEntry } from "./surfaces.config";

const ACCENT: Record<SurfaceAccent, { color: string; soft: string }> = {
  brand: { color: "var(--brand-primary)", soft: "var(--brand-soft)" },
  info: { color: "var(--info)", soft: "var(--info-soft)" },
  magenta: { color: "var(--magenta)", soft: "var(--magenta-soft)" },
  success: { color: "var(--success)", soft: "var(--success-soft)" },
};

const ICONS: Record<SurfaceIcon, (p: { size?: number }) => ReactNode> = {
  business: (p) => <IconCard {...p} />,
  mobile: (p) => <IconCalendar {...p} />,
  templates: (p) => <IconLayout {...p} />,
  ads: (p) => <IconMegaphone {...p} />,
  layout: (p) => <IconLayout {...p} />,
  link: (p) => <IconNodes {...p} />,
};

/* ------------------------------------------------------------ live reachability */
type Reach = "checking" | "online" | "offline";
const RECHECK_MS = 20_000;
const PROBE_TIMEOUT_MS = 4000;

/**
 * Probe a host without CORS: a `no-cors` fetch resolves (opaque) when the host
 * answers and rejects when the connection is refused. It never reads the
 * response, so it is safe cross-origin. A timeout guards against a hung socket.
 */
async function probe(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(url, { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Live status for one host: checks on mount, on an interval, and on refocus. */
function useReach(url: string): { state: Reach; recheck: () => void } {
  const [state, setState] = useState<Reach>("checking");
  const alive = useRef(true);

  const recheck = useCallback(() => {
    setState((s) => (s === "online" ? s : "checking"));
    probe(url).then((ok) => {
      if (alive.current) setState(ok ? "online" : "offline");
    });
  }, [url]);

  useEffect(() => {
    alive.current = true;
    recheck();
    const id = setInterval(recheck, RECHECK_MS);
    const onFocus = () => recheck();
    window.addEventListener("focus", onFocus);
    return () => {
      alive.current = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [recheck]);

  return { state, recheck };
}

const REACH_META: Record<Reach, { tone: "success" | "warning" | "neutral"; label: string }> = {
  checking: { tone: "neutral", label: "Comprobando…" },
  online: { tone: "success", label: "En línea" },
  offline: { tone: "warning", label: "Apagado" },
};

/* ------------------------------------------------------------------------ box */
function SurfaceBox({ s }: { s: SurfaceEntry }) {
  const a = ACCENT[s.accent];
  const Icon = ICONS[s.icon] ?? ICONS.link;
  const { state, recheck } = useReach(s.url);
  const meta = REACH_META[state];

  const open = () => window.open(s.url, "_blank", "noopener,noreferrer");
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <div
      className="eos-card eos-surface-box"
      role="link"
      tabIndex={0}
      aria-label={`Abrir ${s.name} en una ventana nueva`}
      onClick={open}
      onKeyDown={onKey}
      style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", minHeight: 230 }}
    >
      {/* Big accent header */}
      <div style={{ background: `linear-gradient(135deg, ${a.soft}, transparent 70%)`, borderBottom: "1px solid var(--border)", padding: "22px 24px 20px", display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ width: 60, height: 60, borderRadius: 16, background: a.soft, color: a.color, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{Icon({ size: 28 })}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 21, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>{s.name}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{s.kind}</div>
        </div>
        <span style={{ marginLeft: "auto", alignSelf: "flex-start" }}><Pill tone={meta.tone} dot>{meta.label}</Pill></span>
      </div>

      {/* Body */}
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{s.desc}</p>

        {/* Offline hint: exactly how to reconnect this host. */}
        {state === "offline" ? (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "var(--warning-soft)", border: "1px solid var(--warning)", borderRadius: 10, padding: "9px 12px" }}>
            <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Host apagado. Arráncalo con{" "}
              <code style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", color: "var(--text-primary)", background: "var(--surface-elevated)", padding: "1px 6px", borderRadius: 5 }}>{s.launch}</code>
              {" "}y volverá a conectarse solo.
            </span>
          </div>
        ) : null}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: a.color, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 11 }}>
            Abrir aplicación <IconExternal size={16} />
          </span>
          <button
            type="button"
            className="eos-link"
            onClick={(e) => { e.stopPropagation(); recheck(); }}
            style={{ background: "transparent", border: 0, color: "var(--text-muted)", fontSize: 12.5, cursor: "pointer", padding: 4 }}
          >
            Recomprobar
          </button>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "ui-monospace, Menlo, Consolas, monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0, textAlign: "right" }}>{s.url}</span>
        </div>
      </div>
    </div>
  );
}

export function SurfacesSection() {
  return (
    <div style={{ marginBottom: 26 }}>
      <h2 style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px", textTransform: "uppercase", letterSpacing: ".04em" }}>
        Aplicaciones y superficies
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 18 }}>
        {SURFACES.map((s) => <SurfaceBox key={s.id} s={s} />)}
      </div>
    </div>
  );
}
