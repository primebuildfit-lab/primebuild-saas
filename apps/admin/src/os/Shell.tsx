/**
 * Internal OS shell — dark command center.
 *   InternalSidebar : brand + 18 branches (operational + CONFIGURACIONES) + collapse
 *   InternalTopbar  : hamburger, ⌘K search, quick-create (+), notifications, help, profile
 *   SearchCommand   : ⌘K command palette over every branch + quick actions
 * Own identity; organizational inspiration only (Stripe/Linear/Vercel/Grafana).
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { OS_NAV, OS_COMMANDS, QUICK_CREATE } from "./nav";
import {
  IconMenu, IconSearch, IconPlus, IconBell, IconHelp, IconChevronDown, IconChevronLeft,
} from "./icons";
import { SystemStatusIndicator } from "./ui";
import "./theme.css";

/* ---------------------------------------------------------------- Env badge */
function envName(): "development" | "production" {
  try {
    if ((import.meta as unknown as { env?: { PROD?: boolean } }).env?.PROD) return "production";
  } catch { /* noop */ }
  return "development";
}
function EnvBadge() {
  const env = envName();
  const tone = env === "production" ? "var(--danger)" : "var(--warning)";
  return (
    <span title={`Entorno: ${env}`} className="eos-hide-sm"
      style={{ fontSize: 10.5, fontWeight: 700, color: tone, border: `1px solid ${tone}`, borderRadius: 6, padding: "2px 7px", textTransform: "uppercase", letterSpacing: ".05em" }}>
      {env}
    </span>
  );
}

/* ---------------------------------------------------------------- Dropdown */
function Dropdown({ trigger, children, align = "right" }: { trigger: (open: boolean, toggle: () => void) => ReactNode; children: (close: () => void) => ReactNode; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      {trigger(open, () => setOpen((o) => !o))}
      {open ? <div className="eos-menu" style={{ [align]: 0, marginTop: 8 } as React.CSSProperties}>{children(() => setOpen(false))}</div> : null}
    </div>
  );
}

/* ---------------------------------------------------------------- Sidebar */
function Sidebar({ open, collapsed, onCollapse, onNavigate, workspace }: {
  open: boolean; collapsed: boolean; onCollapse: () => void; onNavigate: () => void; workspace: string;
}) {
  const { pathname } = useLocation();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const main = OS_NAV.filter((n) => n.section === "main");
  const config = OS_NAV.filter((n) => n.section === "config");

  const renderItem = (n: (typeof OS_NAV)[number]) => {
    const Icon = n.icon;
    const active = isActive(n.to);
    return (
      <Link key={n.to} to={n.to} onClick={onNavigate} title={n.purpose}
        className={`eos-navitem${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>
        <span className="eos-navicon"><Icon size={18} /></span>
        <span className="eos-nav-label">{n.label}</span>
      </Link>
    );
  };

  return (
    <aside className={`eos-sidebar${open ? " open" : ""}`} aria-label="Navegación del Internal OS">
      <div className="eos-brand">
        <span className="eos-brand-mark" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8.5" /><path d="M12 6.5v5.5l3.5 2" /></svg>
        </span>
        <span className="eos-brand-name">Eventra</span>
        <button type="button" className="eos-collapse-btn" onClick={onCollapse} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>
          <IconChevronLeft size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none" }} />
        </button>
      </div>
      <div className="eos-sidebar-scroll">
        <nav aria-label="Principal">
          {main.map(renderItem)}
          <div className="eos-navsep" />
          <div className="eos-navgroup">Configuraciones</div>
          {config.map(renderItem)}
        </nav>
      </div>
      <div className="eos-sidefoot">
        <div className="eos-sidefoot-card">
          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{workspace}</div>
          <div style={{ marginTop: 4 }}><SystemStatusIndicator status="unknown" label="Fuentes sin conectar" /></div>
        </div>
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- Topbar */
function Topbar({ onMenu, onOpenPalette, principalName, principalRole }: {
  onMenu: () => void; onOpenPalette: () => void; principalName: string; principalRole: string;
}) {
  const navigate = useNavigate();
  const initials = principalName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <header className="eos-topbar">
      <button type="button" className="eos-iconbtn" aria-label="Alternar navegación" onClick={onMenu}><IconMenu size={20} /></button>

      <button type="button" className="eos-search" onClick={onOpenPalette} aria-label="Buscar en Eventra">
        <IconSearch size={16} />
        <span style={{ color: "var(--text-muted)" }}>Buscar en Eventra…</span>
        <span className="eos-kbd">⌘K</span>
      </button>

      <div style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <EnvBadge />

        {/* Quick create */}
        <Dropdown trigger={(open, toggle) => (
          <button type="button" className="eos-iconbtn" aria-label="Crear" aria-expanded={open} onClick={toggle}
            style={{ background: "var(--brand-primary)", color: "#fff" }}><IconPlus size={18} /></button>
        )}>
          {(close) => (
            <>
              <div style={{ padding: "6px 10px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)" }}>Crear</div>
              {QUICK_CREATE.map((q) => (
                <button key={q.id} type="button" className="eos-menu-item" onClick={() => { navigate(q.to); close(); }}>{q.label}</button>
              ))}
            </>
          )}
        </Dropdown>

        {/* Notifications — honest: no fabricated count. */}
        <Dropdown trigger={(open, toggle) => (
          <button type="button" className="eos-iconbtn" aria-label="Notificaciones" aria-expanded={open} onClick={toggle}><IconBell size={19} /></button>
        )}>
          {() => (
            <div style={{ width: 260, padding: 16, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>Notificaciones</div>
              No hay notificaciones
            </div>
          )}
        </Dropdown>

        <a href="https://help.eventra.app" target="_blank" rel="noopener noreferrer" className="eos-iconbtn eos-hide-sm" aria-label="Ayuda"><IconHelp size={19} /></a>

        {/* Profile */}
        <Dropdown trigger={(open, toggle) => (
          <button type="button" className="eos-profile" aria-label="Perfil" aria-expanded={open} onClick={toggle}>
            <span className="eos-avatar">{initials}</span>
            <span className="eos-hide-sm" style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, textAlign: "left" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{principalName}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{principalRole}</span>
            </span>
            <IconChevronDown size={15} className="eos-hide-sm" />
          </button>
        )}>
          {(close) => (
            <div style={{ width: 220 }}>
              <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{principalName}</div>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{principalRole}</div>
              </div>
              <button type="button" className="eos-menu-item" onClick={() => { navigate("/general"); close(); }}>Configuración general</button>
              <button type="button" className="eos-menu-item" onClick={() => { navigate("/teams"); close(); }}>Equipos y permisos</button>
              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <button type="button" className="eos-menu-item" style={{ color: "var(--text-muted)" }} title="La sesión real la gestiona el proveedor de identidad" disabled>Cerrar sesión</button>
            </div>
          )}
        </Dropdown>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- Command palette */
function SearchCommand({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const results = OS_COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()) || (c.hint ?? "").toLowerCase().includes(q.toLowerCase()));
  return (
    <div role="dialog" aria-label="Paleta de comandos" className="eos-overlay" onClick={onClose}
      style={{ display: "flex", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: "min(600px, 92vw)", height: "fit-content", background: "var(--surface-elevated)", border: "1px solid var(--border-strong)", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.55)" }}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar una acción o ir a…" aria-label="Buscar comando"
          style={{ width: "100%", height: 50, background: "transparent", border: 0, borderBottom: "1px solid var(--border)", color: "var(--text-primary)", padding: "0 18px", fontSize: 15, outline: "none" }} />
        <div style={{ maxHeight: 340, overflowY: "auto", padding: 6 }}>
          {results.length === 0 ? (
            <div style={{ padding: 16, color: "var(--text-secondary)", fontSize: 13 }}>Sin coincidencias.</div>
          ) : results.map((c) => (
            <button key={c.id} type="button" className="eos-menu-item" style={{ justifyContent: "space-between" }}
              onClick={() => { if (c.to) navigate(c.to); onClose(); }}>
              <span>{c.label}</span>
              {c.hint ? <span style={{ color: "var(--text-muted)", fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 260 }}>{c.hint}</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Shell */
export function Shell({ children, principalName, principalRole, workspace = "Eventra Inc." }: {
  children: ReactNode; principalName: string; principalRole: string; workspace?: string;
}) {
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
      <div className={`eos-layout${collapsed ? " collapsed" : ""}`}>
        <Sidebar open={drawer} collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} onNavigate={() => setDrawer(false)} workspace={workspace} />
        {drawer ? <div className="eos-overlay" style={{ zIndex: 65 }} onClick={() => setDrawer(false)} aria-hidden /> : null}
        <div className="eos-main">
          <Topbar onMenu={() => setDrawer((d) => !d)} onOpenPalette={() => setPalette(true)} principalName={principalName} principalRole={principalRole} />
          <main className="eos-content">{children}</main>
        </div>
      </div>
      {palette ? <SearchCommand onClose={() => setPalette(false)} /> : null}
    </div>
  );
}
