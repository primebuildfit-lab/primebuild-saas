/**
 * Internal OS component kit — dark, information-dense, accessible primitives.
 * These are the obligatory shared components used across every branch. Data is
 * always passed in; components NEVER fabricate values — when a source is empty
 * they render an explicit empty/error/loading state instead.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { IconChevronDown, IconFilter, IconCalendar, IconTrendUp, IconTrendDown, IconInbox, IconAlert } from "./icons";

/* ============================================================================
   Card / page header
   ========================================================================== */
export function Card({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return <div className={`eos-card${className ? " " + className : ""}`} style={style}>{children}</div>;
}
/** Back-compat alias (older pages import Panel). */
export const Panel = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => <Card style={style}>{children}</Card>;

export function CardHead({ title, sub, action }: { title: ReactNode; sub?: string; action?: ReactNode }) {
  return (
    <div className="eos-card-head">
      <div>
        <h2 className="eos-card-title">{title}</h2>
        {sub ? <p className="eos-card-sub">{sub}</p> : null}
      </div>
      {action ? <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{action}</div> : null}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: ReactNode; description?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{title}</h1>
        {description ? <p style={{ margin: "5px 0 0", color: "var(--text-secondary)", fontSize: 14 }}>{description}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}
/** Back-compat alias. */
export const PageTitle = PageHeader;

/* ============================================================================
   Buttons
   ========================================================================== */
export function Btn({ children, onClick, tone = "default", title, disabled }: { children: ReactNode; onClick?: () => void; tone?: "default" | "primary" | "ghost"; title?: string; disabled?: boolean }) {
  const tones: Record<string, CSSProperties> = {
    default: { background: "var(--surface-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" },
    primary: { background: "var(--brand-primary)", color: "#fff", border: "1px solid transparent", boxShadow: "0 4px 14px rgba(124,77,255,.3)" },
    ghost: { background: "transparent", color: "var(--text-secondary)", border: "1px solid transparent" },
  };
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled}
      style={{ height: 36, padding: "0 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 7, ...tones[tone] }}>
      {children}
    </button>
  );
}
/** Prominent action tile / button used on the dashboard. */
export function QuickActionButton({ icon, label, onClick, tone = "var(--brand-primary)" }: { icon: ReactNode; label: string; onClick?: () => void; tone?: string }) {
  return (
    <button type="button" onClick={onClick}
      style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 14, cursor: "pointer", color: "var(--text-primary)" }}>
      <span style={{ width: 38, height: 38, borderRadius: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--brand-soft)", color: tone }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

/* ============================================================================
   Metric card + trend
   ========================================================================== */
export type Tone = "brand" | "success" | "info" | "warning" | "danger" | "magenta" | "neutral";
const TONE_COLOR: Record<Tone, string> = {
  brand: "var(--brand-primary)", success: "var(--success)", info: "var(--info)",
  warning: "var(--warning)", danger: "var(--danger)", magenta: "var(--magenta)", neutral: "var(--text-secondary)",
};
const TONE_SOFT: Record<Tone, string> = {
  brand: "var(--brand-soft)", success: "var(--success-soft)", info: "var(--info-soft)",
  warning: "var(--warning-soft)", danger: "var(--danger-soft)", magenta: "var(--magenta-soft)", neutral: "rgba(148,163,184,.14)",
};

/** A change vs. a previous period. `delta` null → no real comparison exists. */
export function MetricTrend({ delta, unit = "%", vs = "vs. periodo anterior" }: { delta: number | null; unit?: string; vs?: string }) {
  if (delta === null || delta === undefined) {
    return <span className="eos-metric-trend" style={{ color: "var(--text-muted)" }}>Sin comparación</span>;
  }
  const up = delta >= 0;
  return (
    <span className="eos-metric-trend" style={{ color: up ? "var(--success)" : "var(--danger)" }}>
      {up ? <IconTrendUp size={14} /> : <IconTrendDown size={14} />}
      {up ? "+" : ""}{delta}{unit} <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{vs}</span>
    </span>
  );
}

/**
 * A KPI card. `value` may be a number/string OR null. When null (no real source)
 * it shows the provided `emptyLabel` in a muted style — never a fabricated number.
 */
export function MetricCard({ label, value, emptyLabel = "Sin datos", icon, tone = "brand", trend, foot }: {
  label: string; value: ReactNode | null; emptyLabel?: string; icon?: ReactNode; tone?: Tone;
  trend?: number | null | "none"; foot?: ReactNode;
}) {
  const hasValue = value !== null && value !== undefined;
  return (
    <Card className="eos-metric" style={{ padding: "16px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <span className="eos-metric-label">{label}</span>
        {icon ? <span className="eos-metric-icon" style={{ background: TONE_SOFT[tone], color: TONE_COLOR[tone] }}>{icon}</span> : null}
      </div>
      <div className={`eos-metric-value${hasValue ? "" : " muted"}`}>{hasValue ? value : emptyLabel}</div>
      {trend === "none" ? null : trend !== undefined ? <div><MetricTrend delta={trend as number | null} /></div> : null}
      {foot ? <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)" }}>{foot}</div> : null}
    </Card>
  );
}
/** Back-compat: simple stat card used by older pages. */
export function StatCard({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: "good" | "warn" | "bad" }) {
  const color = tone ? { good: "var(--success)", warn: "var(--warning)", bad: "var(--danger)" }[tone] : "var(--text-primary)";
  return (
    <Card style={{ padding: "13px 15px" }}>
      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text-secondary)" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 5 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3 }}>{sub}</div> : null}
    </Card>
  );
}

/* ============================================================================
   Chart card + donut
   ========================================================================== */
export function ChartCard({ title, sub, action, children }: { title: string; sub?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardHead title={title} sub={sub} action={action} />
      <div className="eos-card-pad">{children}</div>
    </Card>
  );
}

/** SVG donut. `segments` empty → empty state (container + legend preserved). */
export function Donut({ segments, centerLabel = "Total", centerValue }: {
  segments: { label: string; value: number; color: string }[];
  centerLabel?: string; centerValue?: ReactNode;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  if (segments.length === 0 || total === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "8px 0" }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", border: "14px solid var(--surface-elevated)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 12 }}>Sin datos</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Métrica aún no disponible</div>
      </div>
    );
  }
  const R = 60, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width="150" height="150" viewBox="0 0 150 150" role="img" aria-label="Distribución por canal">
        <circle cx="75" cy="75" r={R} fill="none" stroke="var(--surface-elevated)" strokeWidth="16" />
        {segments.map((s) => {
          const frac = s.value / total;
          const dash = `${frac * C} ${C}`;
          const el = <circle key={s.label} cx="75" cy="75" r={R} fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={dash} strokeDashoffset={-acc * C} transform="rotate(-90 75 75)" strokeLinecap="butt" />;
          acc += frac; return el;
        })}
        <text x="75" y="70" textAnchor="middle" fill="var(--text-muted)" fontSize="11">{centerLabel}</text>
        <text x="75" y="90" textAnchor="middle" fill="var(--text-primary)" fontSize="20" fontWeight="700">{centerValue ?? total}</text>
      </svg>
      <div style={{ flex: 1, minWidth: 130, display: "flex", flexDirection: "column", gap: 7 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: s.color, flex: "none" }} />
            <span style={{ flex: 1, color: "var(--text-secondary)" }}>{s.label}</span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   Table
   ========================================================================== */
export interface Column<T> { key: string; header: ReactNode; render: (row: T) => ReactNode; width?: number | string; }

export function DataTable<T>({ columns, rows, empty, emptyHint }: { columns: Column<T>[]; rows: T[]; empty?: string; emptyHint?: string }) {
  if (rows.length === 0) {
    return <Card style={{ padding: 8 }}><EmptyState title={empty ?? "Sin registros"} hint={emptyHint} /></Card>;
  }
  return (
    <Card style={{ overflow: "hidden" }}>
      <div className="eos-table-wrap">
        <table className="eos-table">
          <thead><tr>{columns.map((c) => <th key={c.key} style={{ width: c.width }}>{c.header}</th>)}</tr></thead>
          <tbody>{rows.map((row, i) => <tr key={i}>{columns.map((c) => <td key={c.key}>{c.render(row)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================================================================
   Badges
   ========================================================================== */
type PillTone = "neutral" | "success" | "warning" | "danger" | "info" | "brand" | "magenta";
const PILL: Record<PillTone, CSSProperties> = {
  neutral: { background: "rgba(148,163,184,.14)", color: "var(--text-secondary)" },
  success: { background: "var(--success-soft)", color: "var(--success)" },
  warning: { background: "var(--warning-soft)", color: "var(--warning)" },
  danger: { background: "var(--danger-soft)", color: "var(--danger)" },
  info: { background: "var(--info-soft)", color: "var(--info)" },
  brand: { background: "var(--brand-soft)", color: "var(--brand-strong)" },
  magenta: { background: "var(--magenta-soft)", color: "var(--magenta)" },
};
export function Pill({ children, tone = "neutral", dot }: { children: ReactNode; tone?: PillTone; dot?: boolean }) {
  return <span className="eos-pill" style={PILL[tone]}>{dot ? <span className="eos-pill-dot" /> : null}{children}</span>;
}
/** Back-compat tone aliases (older code passes good/warn/bad). */
const STATUS_TONE: Record<string, PillTone> = {
  active: "success", verified: "success", healthy: "success", succeeded: "success", connected: "success", completed: "success", operational: "success", good: "success",
  trial: "info", running: "info", syncing: "info", in_progress: "info",
  pending: "warning", pending_review: "warning", discovered: "warning", modified: "warning", degraded: "warning", estimated: "warning", scheduled: "warning", draft: "warning", warn: "warning",
  suspended: "danger", cancelled: "danger", down: "danger", failed: "danger", rejected: "danger", error: "danger", blocked: "danger", overdue: "danger", bad: "danger",
  expired: "neutral", archived: "neutral", idle: "neutral", not_configured: "neutral", disabled: "neutral",
};
export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] ?? "neutral";
  return <Pill tone={tone} dot>{status.replace(/_/g, " ")}</Pill>;
}
export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, PillTone> = { critical: "magenta", critica: "magenta", high: "danger", alta: "danger", medium: "warning", media: "warning", low: "success", baja: "success" };
  return <Pill tone={map[priority] ?? "neutral"}>{priority}</Pill>;
}

/* ============================================================================
   Empty / error / loading states
   ========================================================================== */
export function EmptyState({ title, hint, icon }: { title: string; hint?: string; icon?: ReactNode }) {
  return (
    <div className="eos-empty">
      <span className="eos-empty-icon">{icon ?? <IconInbox size={20} />}</span>
      <div style={{ color: "var(--text-secondary)", fontWeight: 600, fontSize: 13.5 }}>{title}</div>
      {hint ? <div style={{ color: "var(--text-muted)", fontSize: 12.5, maxWidth: 320 }}>{hint}</div> : null}
    </div>
  );
}
export function ErrorState({ title = "No se pudo cargar", hint, onRetry }: { title?: string; hint?: string; onRetry?: () => void }) {
  return (
    <div className="eos-empty">
      <span className="eos-empty-icon" style={{ color: "var(--danger)" }}><IconAlert size={20} /></span>
      <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 13.5 }}>{title}</div>
      {hint ? <div style={{ color: "var(--text-muted)", fontSize: 12.5, maxWidth: 320 }}>{hint}</div> : null}
      {onRetry ? <Btn onClick={onRetry}>Reintentar</Btn> : null}
    </div>
  );
}
export function LoadingSkeleton({ rows = 3, height = 14 }: { rows?: number; height?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }} aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="eos-skel" style={{ height, width: `${100 - (i % 3) * 12}%` }} />
      ))}
    </div>
  );
}

/* ============================================================================
   Activity feed
   ========================================================================== */
export interface ActivityItem { id: string; icon?: ReactNode; title: string; desc?: string; when: string; tone?: PillTone; }
export function ActivityFeed({ items, empty = "No hay actividad reciente" }: { items: ActivityItem[]; empty?: string }) {
  if (items.length === 0) return <EmptyState title={empty} />;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {items.map((a) => (
        <div key={a.id} style={{ display: "flex", gap: 11, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, flex: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", ...PILL[a.tone ?? "neutral"] }}>
            {a.icon ?? <IconActivityDot />}
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{a.title}</div>
            {a.desc ? <div style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.desc}</div> : null}
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", flex: "none" }}>{a.when}</span>
        </div>
      ))}
    </div>
  );
}
function IconActivityDot() { return <span style={{ width: 7, height: 7, borderRadius: 4, background: "currentColor" }} />; }

/* ============================================================================
   Controls: DateRangePicker, FilterDropdown, Select, Toolbar
   ========================================================================== */
function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

export function DateRangePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const options = ["Hoy", "Esta semana", "Este mes", "Últimos 30 días", "Este trimestre", "Este año"];
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}>
        <IconCalendar size={15} /> {value} <IconChevronDown size={14} />
      </button>
      {open ? (
        <div className="eos-menu" style={{ right: 0, marginTop: 6 }}>
          {options.map((o) => (
            <button key={o} type="button" className="eos-menu-item" onClick={() => { onChange(o); setOpen(false); }}>{o}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function FilterDropdown({ label, value, options, onChange, icon = true }: { label?: string; value: string; options: { value: string; label: string }[]; onChange: (v: string) => void; icon?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(() => setOpen(false));
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 12px", borderRadius: 9, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: 13, cursor: "pointer" }}>
        {icon ? <IconFilter size={15} /> : null}{label ? <span style={{ color: "var(--text-muted)" }}>{label}:</span> : null} {current} <IconChevronDown size={14} />
      </button>
      {open ? (
        <div className="eos-menu" style={{ right: 0, marginTop: 6, maxHeight: 280, overflowY: "auto" }}>
          {options.map((o) => (
            <button key={o.value} type="button" className="eos-menu-item" onClick={() => { onChange(o.value); setOpen(false); }}
              style={o.value === value ? { background: "var(--surface-hover)" } : undefined}>{o.label}</button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
/** Back-compat native select used by older pages. */
export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string }) {
  return <FilterDropdown label={label} value={value} options={options} onChange={onChange} icon={false} />;
}
export function Toolbar({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>{children}</div>;
}

/* ============================================================================
   System status + misc formatters
   ========================================================================== */
export function SystemStatusIndicator({ status, label }: { status: "operational" | "degraded" | "down" | "unknown"; label?: string }) {
  const map = { operational: "var(--success)", degraded: "var(--warning)", down: "var(--danger)", unknown: "var(--text-muted)" };
  const txt = { operational: "Operativo", degraded: "Degradado", down: "Caído", unknown: "Desconocido" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-secondary)" }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: map[status] }} />
      {label ?? txt[status]}
    </span>
  );
}

export function Money({ minor, currency = "USD" }: { minor: number; currency?: string }) {
  return <span>{(minor / 100).toLocaleString(undefined, { style: "currency", currency })}</span>;
}
export function Percent({ value }: { value: number }) {
  return <span>{(value * 100).toFixed(value < 0.1 ? 1 : 0)}%</span>;
}
export function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? "var(--success)" : value >= 60 ? "var(--brand-strong)" : value >= 35 ? "var(--warning)" : "var(--danger)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden style={{ width: 54, height: 6, borderRadius: 4, background: "var(--surface-elevated)", overflow: "hidden", display: "inline-block" }}>
        <span style={{ display: "block", height: "100%", width: `${value}%`, background: color }} />
      </span>
      <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{value}</span>
    </span>
  );
}
export function ProgressBar({ value, tone = "brand" }: { value: number; tone?: Tone }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "100%" }}>
      <span style={{ flex: 1, height: 6, borderRadius: 4, background: "var(--surface-elevated)", overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${Math.max(0, Math.min(100, value))}%`, background: TONE_COLOR[tone] }} />
      </span>
      <span style={{ fontSize: 12, fontVariantNumeric: "tabular-nums", color: "var(--text-secondary)", width: 34, textAlign: "right" }}>{value}%</span>
    </span>
  );
}
export function DevBadge() { return <Pill tone="warning">DATOS DEV</Pill>; }
