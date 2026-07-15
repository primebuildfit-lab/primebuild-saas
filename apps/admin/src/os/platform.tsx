/**
 * Platform-control building blocks for the Internal OS correction.
 *
 * These make every branch a REAL, complete page even before its data source is
 * wired: header + explanation + expected source + connection status + honest
 * empty state + next action. No dead ends, no fabricated numbers.
 *
 *   ConnectionStatus  — honest badge: conectado / pendiente / no conectado
 *   PlatformPage      — full scaffold for a not-yet-connected control page
 *   Tabs              — in-page tabs (used to fold moved operational entities)
 *   DmaBar            — Día / Mes / Año (+ comparación) period control
 *   MetricPanel       — one metric: title, DMA-aware empty state, documented
 *                       formula, expected source, breakdown dimensions
 */
import { useState, type ReactNode } from "react";
import { Card, CardHead, PageHeader, EmptyState, Pill, Btn, DevBadge, type Tone } from "./ui";

/* ---------------------------------------------------------------- ConnectionStatus */
export type ConnState = "connected" | "pending" | "disconnected" | "pb";
const CONN: Record<ConnState, { tone: Tone; label: string; dot: string }> = {
  connected: { tone: "success", label: "Conectado", dot: "var(--success)" },
  pending: { tone: "warning", label: "Pendiente de integración", dot: "var(--warning)" },
  disconnected: { tone: "neutral", label: "No conectado", dot: "var(--text-muted)" },
  pb: { tone: "magenta", label: "Integración PB futura", dot: "var(--magenta)" },
};
export function ConnectionStatus({ state }: { state: ConnState }) {
  const c = CONN[state];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "var(--text-secondary)" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {c.label}
    </span>
  );
}

/* ---------------------------------------------------------------- PlatformPage */
export function PlatformPage({
  title, description, source, state, nextAction, priority, children, actions,
}: {
  title: string;
  description: string;
  /** where the real data will come from */
  source: string;
  state: ConnState;
  /** the concrete next step to make this page live */
  nextAction: string;
  /** roadmap priority label, e.g. "Prioridad 2 · Métricas" */
  priority?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} actions={actions ?? <DevBadge />} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        <Card style={{ padding: "14px 16px" }}>
          <div className="eos-metric-label">Estado de conexión</div>
          <div style={{ marginTop: 8 }}><ConnectionStatus state={state} /></div>
        </Card>
        <Card style={{ padding: "14px 16px" }}>
          <div className="eos-metric-label">Fuente de datos esperada</div>
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-primary)" }}>{source}</div>
        </Card>
        <Card style={{ padding: "14px 16px" }}>
          <div className="eos-metric-label">Próxima acción</div>
          <div style={{ marginTop: 8, fontSize: 13, color: "var(--text-primary)" }}>{nextAction}</div>
        </Card>
        {priority ? (
          <Card style={{ padding: "14px 16px" }}>
            <div className="eos-metric-label">Roadmap</div>
            <div style={{ marginTop: 8 }}><Pill tone="brand">{priority}</Pill></div>
          </Card>
        ) : null}
      </div>
      {children ?? (
        <Card>
          <div className="eos-card-pad">
            <EmptyState title="Sin datos — módulo estructurado, fuente no conectada" hint="Cuando se conecte la fuente indicada arriba, esta página mostrará datos reales. No se inventan cifras." />
          </div>
        </Card>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Tabs */
export function Tabs({ tabs, initial }: { tabs: { id: string; label: string; render: () => ReactNode }[]; initial?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];
  return (
    <div>
      <div role="tablist" aria-label="Secciones" style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--border)", marginBottom: 16, overflowX: "auto" }}>
        {tabs.map((t) => {
          const on = t.id === current?.id;
          return (
            <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => setActive(t.id)}
              style={{ background: "transparent", border: 0, borderBottom: on ? "2px solid var(--brand-primary)" : "2px solid transparent", color: on ? "var(--text-primary)" : "var(--text-muted)", padding: "9px 12px", fontSize: 13.5, fontWeight: on ? 600 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{current?.render()}</div>
    </div>
  );
}

/* ---------------------------------------------------------------- DMA period control */
export type Dma = "D" | "M" | "A";
export const DMA_LABEL: Record<Dma, string> = { D: "Día", M: "Mes", A: "Año" };
export function DmaBar({ value, onChange, compare, onCompare, extra }: {
  value: Dma; onChange: (d: Dma) => void; compare: boolean; onCompare: (b: boolean) => void; extra?: ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
      <div role="group" aria-label="Periodo" style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
        {(["D", "M", "A"] as Dma[]).map((d) => (
          <button key={d} type="button" aria-pressed={value === d} onClick={() => onChange(d)}
            style={{ background: value === d ? "var(--brand-primary)" : "transparent", color: value === d ? "#fff" : "var(--text-secondary)", border: 0, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {DMA_LABEL[d]}
          </button>
        ))}
      </div>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
        <input type="checkbox" checked={compare} onChange={(e) => onCompare(e.target.checked)} />
        Comparar con periodo anterior
      </label>
      {extra}
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Rango: {DMA_LABEL[value]} · sin datos hasta conectar la fuente</span>
    </div>
  );
}

/* ---------------------------------------------------------------- MetricPanel */
export interface MetricDef {
  name: string;
  description?: string;
  /** documented formula (shown verbatim) */
  formula?: string;
  /** dimensions the metric can break down by */
  dims?: string[];
  source: string;
  state: ConnState;
  /** empty-state wording tuned to the metric */
  empty?: "Sin datos" | "No disponible" | "No conectado" | "No calculable todavía" | "Pendiente de integración";
}

export function MetricPanel({ def, dma }: { def: MetricDef; dma: Dma }) {
  const emptyTitle = def.state === "pb" ? "No disponible" : def.empty ?? "Sin datos";
  const hint = def.state === "pb"
    ? "Integración PB futura — no se calcula ningún valor todavía."
    : `Se mostrará por ${DMA_LABEL[dma]} cuando la fuente esté conectada. No se inventan cifras.`;
  return (
    <Card>
      <CardHead title={def.name} action={<ConnectionStatus state={def.state} />} />
      <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {def.description ? <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)" }}>{def.description}</p> : null}
        <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "20px 12px" }}>
          <EmptyState title={emptyTitle} hint={hint} />
        </div>
        {def.formula ? (
          <div style={{ fontSize: 12 }}>
            <span style={{ color: "var(--text-muted)" }}>Fórmula: </span>
            <code style={{ color: "var(--text-primary)", fontFamily: "ui-monospace, monospace" }}>{def.formula}</code>
          </div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Fuente: {def.source}</span>
        </div>
        {def.dims && def.dims.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {def.dims.map((d) => <Pill key={d} tone="neutral">{d}</Pill>)}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

/** Grid of metric panels sharing one DMA state. */
export function MetricGrid({ defs, dma }: { defs: MetricDef[]; dma: Dma }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
      {defs.map((d) => <MetricPanel key={d.name} def={d} dma={dma} />)}
    </div>
  );
}
