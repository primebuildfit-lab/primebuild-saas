/**
 * Internal OS component kit (Phase 7, Bloque 2/22). Information-dense, dark,
 * accessible primitives. Kept in the admin app for now; the shared extraction to
 * `@eventra/ui` for Partnera/Nexus is documented in docs/DESIGN_SYSTEM.md.
 */
import type { CSSProperties, ReactNode } from "react";

const v = {
  surface: "var(--eos-surface, #111827)",
  surface2: "var(--eos-surface-2, #172033)",
  border: "var(--eos-border, #1f2a3a)",
  text: "var(--eos-text, #e5e7eb)",
  strong: "var(--eos-text-strong, #f8fafc)",
  muted: "var(--eos-muted, #94a3b8)",
  brand: "var(--eos-brand, #6366f1)",
  good: "var(--eos-good, #34d399)",
  warn: "var(--eos-warn, #fbbf24)",
  bad: "var(--eos-bad, #f87171)",
  radius: "var(--eos-radius, 10px)",
};

export function Panel({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: v.surface, border: `1px solid ${v.border}`, borderRadius: v.radius, ...style }}>
      {children}
    </div>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 650, color: v.strong }}>{title}</h1>
        {description ? <p style={{ margin: "4px 0 0", color: v.muted, fontSize: 13 }}>{description}</p> : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div> : null}
    </div>
  );
}

export function Btn({ children, onClick, tone = "default", title }: { children: ReactNode; onClick?: () => void; tone?: "default" | "primary"; title?: string }) {
  const tones: Record<string, CSSProperties> = {
    default: { background: v.surface2, color: v.text, border: `1px solid ${v.border}` },
    primary: { background: v.brand, color: "#fff", border: "1px solid transparent" },
  };
  return (
    <button type="button" onClick={onClick} title={title}
      style={{ height: 32, padding: "0 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", ...tones[tone] }}>
      {children}
    </button>
  );
}

export function StatCard({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: "good" | "warn" | "bad" }) {
  const color = tone ? { good: v.good, warn: v.warn, bad: v.bad }[tone] : v.strong;
  return (
    <Panel style={{ padding: "12px 14px" }}>
      <div style={{ fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".04em", color: v.muted }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub ? <div style={{ fontSize: 12, color: v.muted, marginTop: 2 }}>{sub}</div> : null}
    </Panel>
  );
}

type PillTone = "neutral" | "good" | "warn" | "bad" | "info";
export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: PillTone }) {
  const map: Record<PillTone, CSSProperties> = {
    neutral: { background: "rgba(148,163,184,.15)", color: v.muted },
    good: { background: "var(--eos-good-soft, rgba(52,211,153,.15))", color: v.good },
    warn: { background: "var(--eos-warn-soft, rgba(251,191,36,.15))", color: v.warn },
    bad: { background: "var(--eos-bad-soft, rgba(248,113,113,.15))", color: v.bad },
    info: { background: "var(--eos-brand-soft, rgba(99,102,241,.16))", color: "var(--eos-brand-strong,#818cf8)" },
  };
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, fontSize: 11.5, fontWeight: 600, ...map[tone] }}>
      {children}
    </span>
  );
}

export function Money({ minor, currency = "USD" }: { minor: number; currency?: string }) {
  const val = (minor / 100).toLocaleString(undefined, { style: "currency", currency });
  return <span>{val}</span>;
}

export function Percent({ value }: { value: number }) {
  return <span>{(value * 100).toFixed(value < 0.1 ? 1 : 0)}%</span>;
}

export function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? v.good : value >= 60 ? "var(--eos-brand-strong,#818cf8)" : value >= 35 ? v.warn : v.bad;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span aria-hidden style={{ width: 54, height: 6, borderRadius: 4, background: v.surface2, overflow: "hidden", display: "inline-block" }}>
        <span style={{ display: "block", height: "100%", width: `${value}%`, background: color }} />
      </span>
      <span style={{ fontVariantNumeric: "tabular-nums", color: v.text }}>{value}</span>
    </span>
  );
}

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  width?: number | string;
}

export function DataTable<T>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty?: string }) {
  if (rows.length === 0) {
    return <Panel style={{ padding: 32, textAlign: "center", color: v.muted }}>{empty ?? "No records."}</Panel>;
  }
  return (
    <Panel style={{ overflow: "hidden" }}>
      <div className="eos-table-wrap">
        <table className="eos-table">
          <thead>
            <tr>{columns.map((c) => <th key={c.key} style={{ width: c.width }}>{c.header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>{columns.map((c) => <td key={c.key}>{c.render(row)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>{children}</div>;
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label?: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: v.muted }}>
      {label ? <span>{label}</span> : null}
      <select value={value} onChange={(e) => onChange(e.target.value)}
        style={{ height: 32, background: v.surface2, color: v.text, border: `1px solid ${v.border}`, borderRadius: 8, padding: "0 8px", fontSize: 13 }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function DevBadge() {
  return <Pill tone="warn">DEV DATA</Pill>;
}
