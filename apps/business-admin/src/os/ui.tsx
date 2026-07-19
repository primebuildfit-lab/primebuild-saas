/** Business Admin UI kit — small, local, honest. No commercial "create" affordances. */
import type { ReactNode } from "react";
import type { LoadState } from "../data/live/types";

type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "brand";

export function Pill({ tone = "neutral", dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`pill pill--${tone}`}>
      {dot && <span className="pill__dot" />}
      {children}
    </span>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="page-header">
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div className="card" style={style}>{children}</div>;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return <>{Array.from({ length: rows }).map((_, i) => <div key={i} className="skeleton" style={{ width: `${90 - i * 8}%` }} />)}</>;
}

/** A metric tile. `value` is null unless the source is `ready` — then it renders the honest empty label. */
export function Metric({ label, value, icon }: { label: string; value: number | string | null; icon?: ReactNode }) {
  const empty = value === null || value === undefined;
  return (
    <div className="metric">
      <div className="metric__label">{icon}{label}</div>
      <div className={empty ? "metric__value metric__value--empty" : "metric__value"}>
        {empty ? "Sin datos" : value}
      </div>
    </div>
  );
}

/** Small badge naming the current data state. */
export function SourceTag({ state, count }: { state: LoadState<unknown>; count?: number }) {
  if (state.kind === "loading") return <Pill tone="info" dot>Cargando</Pill>;
  if (state.kind === "error") return <Pill tone="danger" dot>Error</Pill>;
  if (state.kind === "not_connected") return <Pill tone="warning" dot>No conectado</Pill>;
  return count === 0 ? <Pill tone="neutral" dot>Vacío</Pill> : <Pill tone="success" dot>Datos reales</Pill>;
}

/**
 * Renders loading / not_connected / error / empty blocks for a screen. Returns
 * null only when the source is `ready` AND has rows, so the screen can render its
 * real table. This is the single choke-point that guarantees no fabricated data.
 */
export function StateBlock({
  state, rows, emptyTitle, emptyHint,
}: { state: LoadState<unknown>; rows?: number; emptyTitle?: string; emptyHint?: string }) {
  if (state.kind === "loading") return <Card><LoadingSkeleton rows={4} /></Card>;
  if (state.kind === "error") return <EmptyState title="No se pudo cargar" hint={state.message} />;
  if (state.kind === "not_connected") return <EmptyState title="No conectado" hint={state.reason} />;
  if ((rows ?? 0) === 0) return <EmptyState title={emptyTitle ?? "Sin datos"} hint={emptyHint} />;
  return null;
}

/** A read-only monitoring table. Columns are headers; rows are already-formatted cells. */
export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table className="data">
        <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

/** Filters bar — inert selects (real filtering activates with the API). */
export function FilterBar({ filters }: { filters: string[] }) {
  return (
    <div className="toolbar">
      {filters.map((f) => <span key={f} className="filter">{f}</span>)}
    </div>
  );
}
