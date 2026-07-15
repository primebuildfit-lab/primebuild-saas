/**
 * UI for equation-defined metrics: a panel that renders one formula honestly
 * (equation + variables + result, which stays "no calculable" until a data source
 * is connected) and a picker that lets the operator CHOOSE a defined metric in the
 * marked places (Comparaciones, each metrics page, ROI).
 */
import { useState } from "react";
import { Card, CardHead, Pill, FilterDropdown, EmptyState } from "./ui";
import { ConnectionStatus } from "./platform";
import {
  evaluateFormula, formatMetric, UNIT_LABEL, useMetricFormulas, type MetricFormula,
} from "./metric-formulas";

/** One equation-metric rendered honestly. `values` is empty by default → no calculable. */
export function FormulaPanel({ formula, values }: { formula: MetricFormula; values?: Record<string, number> }) {
  const res = evaluateFormula(formula.expression, values ?? {});
  const calculable = res.value !== null;
  return (
    <Card>
      <CardHead title={formula.name} action={<ConnectionStatus state={calculable ? "connected" : "pending"} />} />
      <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {formula.description ? <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-secondary)" }}>{formula.description}</p> : null}
        <div style={{ border: "1px dashed var(--border)", borderRadius: 10, padding: "18px 12px", textAlign: "center" }}>
          {calculable ? (
            <div style={{ fontSize: 30, fontWeight: 700, color: "var(--text-primary)" }}>{formatMetric(res.value, formula.unit)}</div>
          ) : (
            <EmptyState title="No calculable" hint={res.error ? res.error : `Faltan datos: ${res.missing.join(", ") || "—"}. Se calculará al conectar la fuente.`} />
          )}
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: "var(--text-muted)" }}>Ecuación: </span>
          <code style={{ color: "var(--text-primary)", fontFamily: "ui-monospace, monospace" }}>{formula.name.split(" ")[0].toLowerCase()} = {formula.expression}</code>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Unidad: {UNIT_LABEL[formula.unit]} ·</span>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Variables:</span>
          {res.variables.length === 0 ? <span style={{ fontSize: 12, color: "var(--text-muted)" }}>—</span> : res.variables.map((v) => <Pill key={v} tone="neutral">{v}</Pill>)}
        </div>
      </div>
    </Card>
  );
}

/**
 * Marked place: pick a metric defined by equation and show it. Options come from
 * the shared registry, so metrics created in the Estudio code panel appear here.
 */
export function FormulaPicker({ label = "Métrica (por ecuación)", initialId }: { label?: string; initialId?: string }) {
  const formulas = useMetricFormulas();
  const [id, setId] = useState(initialId ?? formulas[0]?.id ?? "");
  const selected = formulas.find((f) => f.id === id) ?? formulas[0];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <FilterDropdown label={label} value={selected?.id ?? ""} icon={false}
          options={formulas.map((f) => ({ value: f.id, label: f.name }))} onChange={setId} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Definidas en Estudio · Código → Métricas ({formulas.length})</span>
      </div>
      {selected ? <FormulaPanel formula={selected} /> : <Card style={{ padding: 8 }}><EmptyState title="Sin métricas definidas" hint="Crea una en Estudio → Código → Métricas." /></Card>}
    </div>
  );
}
