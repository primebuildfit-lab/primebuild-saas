/**
 * Internal OS shell (Phase 7, Bloque 3): dark sidebar (grouped, collapsible,
 * mobile drawer) + topbar (global search, command palette, environment badge,
 * profile) + main content. Own identity — Shopify ergonomics only.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { OS_NAV, OS_COMMANDS } from "./nav";
import "./theme.css";

function EnvBadge() {
  // Vite PROD flag; dev/preview otherwise. Never claims production falsely.
  let env = "development";
  try {
    if ((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD) env = "production";
  } catch {
    /* noop */
  }
  const tone = env === "production" ? "#f87171" : "#fbbf24";
  return (
    <span title={`Environment: ${env}`}
      style={{ fontSize: 11, fontWeight: 700, color: tone, border: `1px solid ${tone}`, borderRadius: 6, padding: "2px 7px", textTransform: "uppercase", letterSpacing: ".04em" }}>
      {env}
    </span>
  );
}

function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { pathname } = useLocation();
  const groups = useMemo(() => [...new Set(OS_NAV.map((n) => n.group))], []);
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  return (
    <aside className={`eos-sidebar${open ? " open" : ""}`} aria-label="Internal OS navigation">
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 10px", fontWeight: 700, color: "var(--eos-text-strong)" }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--eos-brand)", display: "inline-block" }} />
        Eventra <span style={{ color: "var(--eos-muted)", fontWeight: 600 }}>Internal OS</span>
      </div>
      {groups.map((g) => (
        <div key={g || "_top"}>
          {g ? <div className="eos-navgroup">{g}</div> : null}
          {OS_NAV.filter((n) => n.group === g).map((n) => (
            <Link key={n.to} to={n.to} onClick={onNavigate}
              className={`eos-navitem${isActive(n.to) ? " active" : ""}`}
              aria-current={isActive(n.to) ? "page" : undefined}>
              <span className="dot" />
              <span style={{ flex: 1 }}>{n.label}</span>
              {!n.real ? <span title="Scaffolded" style={{ fontSize: 9, color: "var(--eos-faint)" }}>soon</span> : null}
            </Link>
          ))}
        </div>
      ))}
    </aside>
  );
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = OS_COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div role="dialog" aria-label="Command palette" onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 60, display: "flex", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 92vw)", height: "fit-content", background: "var(--eos-surface)", border: "1px solid var(--eos-border)", borderRadius: 12, overflow: "hidden" }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search…"
          aria-label="Command search"
          style={{ width: "100%", boxSizing: "border-box", height: 46, background: "transparent", border: 0, borderBottom: "1px solid var(--eos-border)", color: "var(--eos-text)", padding: "0 16px", fontSize: 15, outline: "none" }} />
        <div style={{ maxHeight: 320, overflowY: "auto", padding: 6 }}>
          {results.length === 0 ? (
            <div style={{ padding: 16, color: "var(--eos-muted)", fontSize: 13 }}>No matching commands.</div>
          ) : results.map((c) => (
            <button key={c.id} type="button"
              onClick={() => { if (c.to) navigate(c.to); onClose(); }}
              style={{ display: "flex", width: "100%", textAlign: "left", justifyContent: "space-between", gap: 12, background: "transparent", border: 0, color: "var(--eos-text)", padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
              <span>{c.label}</span>
              {c.hint ? <span style={{ color: "var(--eos-faint)", fontSize: 11 }}>{c.hint}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Shell({ children, principalLabel }: { children: ReactNode; principalLabel: string }) {
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette(true); }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="eos">
      <div className="eos-layout">
        <Sidebar open={drawer} onNavigate={() => setDrawer(false)} />
        <div className="eos-main">
          <header className="eos-topbar">
            <button type="button" aria-label="Toggle navigation" onClick={() => setDrawer((d) => !d)}
              style={{ background: "transparent", border: 0, color: "var(--eos-muted)", fontSize: 18, cursor: "pointer", display: "inline-flex" }}>☰</button>
            <button type="button" onClick={() => setPalette(true)}
              style={{ flex: 1, maxWidth: 460, textAlign: "left", height: 34, background: "var(--eos-surface-2)", border: "1px solid var(--eos-border)", color: "var(--eos-muted)", borderRadius: 8, padding: "0 12px", cursor: "pointer", fontSize: 13 }}>
              Search offers, companies, users…  <span style={{ float: "right", fontSize: 11 }}>⌘K</span>
            </button>
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 12 }}>
              <EnvBadge />
              <span title="Signed in" style={{ fontSize: 12, color: "var(--eos-muted)" }}>{principalLabel}</span>
            </span>
          </header>
          <main className="eos-content">{children}</main>
        </div>
      </div>
      {palette ? <CommandPalette onClose={() => setPalette(false)} /> : null}
    </div>
  );
}
