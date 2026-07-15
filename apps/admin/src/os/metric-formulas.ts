/**
 * Metric-by-equation engine + shared registry.
 *
 * Operators define metrics as EQUATIONS (e.g. "(ingreso - inversion) / inversion
 * * 100") in the Estudio code panel. Those metrics become selectable options in the
 * marked places (Comparaciones, each metrics page, ROI).
 *
 * SAFE by construction: a tiny recursive-descent arithmetic parser — NO eval, NO
 * Function(). Supports + - * / ( ) and unary +/-. Variables are looked up in a
 * values map; with no data source connected the map is empty, so every metric is
 * honestly "no calculable" (value = null) — never a fabricated number.
 */
import { useSyncExternalStore } from "react";

export type MetricUnit = "number" | "money" | "percent" | "ratio";

export interface MetricFormula {
  id: string;
  name: string;
  expression: string;
  unit: MetricUnit;
  description?: string;
  /** built-in defaults are protected from deletion */
  builtin?: boolean;
}

export const DEFAULT_METRIC_FORMULAS: MetricFormula[] = [
  { id: "roi", name: "Retorno sobre inversión (ROI)", expression: "(ingreso_atribuible - inversion) / inversion * 100", unit: "percent", builtin: true, description: "Beneficio relativo de la inversión." },
  { id: "roas", name: "ROAS", expression: "ingreso_atribuible / inversion_publicitaria", unit: "ratio", builtin: true, description: "Ingreso por cada unidad invertida en anuncios." },
  { id: "costo_visita", name: "Costo por visita", expression: "inversion / visitas_atribuibles", unit: "money", builtin: true },
  { id: "costo_registro", name: "Costo por registro", expression: "inversion / registros_atribuibles", unit: "money", builtin: true },
  { id: "costo_trial", name: "Costo por prueba", expression: "inversion / trials_atribuibles", unit: "money", builtin: true },
  { id: "costo_cliente", name: "Costo por cliente pagado", expression: "inversion / clientes_pagados", unit: "money", builtin: true },
  { id: "costo_conversion", name: "Costo por conversión", expression: "inversion / conversiones", unit: "money", builtin: true },
  { id: "conv_trial", name: "Conversión visita → prueba", expression: "trials_iniciados / visitantes_elegibles * 100", unit: "percent", builtin: true },
  { id: "visitas_por_10", name: "Visitas por cada $10 invertidos", expression: "visitas_atribuibles / inversion * 10", unit: "number", builtin: true },
  { id: "ingreso_neto", name: "Ingreso neto", expression: "bruto - comisiones", unit: "money", builtin: true },
];

/* ------------------------------------------------------------- tokenizer */
type Tok =
  | { t: "num"; v: number }
  | { t: "var"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "lp" }
  | { t: "rp" };

export function tokenize(expr: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < expr.length) {
    const c = expr[i];
    if (c === " " || c === "\t" || c === "\n") { i++; continue; }
    if (c === "(") { out.push({ t: "lp" }); i++; continue; }
    if (c === ")") { out.push({ t: "rp" }); i++; continue; }
    if (c === "+" || c === "-" || c === "*" || c === "/") { out.push({ t: "op", v: c }); i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i + 1;
      while (j < expr.length && /[0-9.]/.test(expr[j])) j++;
      const n = Number(expr.slice(i, j));
      if (Number.isNaN(n)) throw new Error(`Número inválido: "${expr.slice(i, j)}"`);
      out.push({ t: "num", v: n }); i = j; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < expr.length && /[a-zA-Z0-9_]/.test(expr[j])) j++;
      out.push({ t: "var", v: expr.slice(i, j) }); i = j; continue;
    }
    throw new Error(`Carácter no permitido: "${c}"`);
  }
  return out;
}

export function extractVariables(expr: string): string[] {
  try {
    return [...new Set(tokenize(expr).filter((t): t is { t: "var"; v: string } => t.t === "var").map((t) => t.v))];
  } catch {
    return [];
  }
}

class MissingVar extends Error {}

/** Recursive-descent evaluate over a values map. Throws on structural errors. */
function evalTokens(tokens: Tok[], values: Record<string, number>): number {
  let i = 0;
  const peek = () => tokens[i];
  const isOp = (s: string) => { const p = peek(); return !!p && p.t === "op" && p.v === s; };
  const parseExpr = (): number => {
    let v = parseTerm();
    while (isOp("+") || isOp("-")) {
      const op = (tokens[i++] as { v: string }).v;
      const r = parseTerm();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const parseTerm = (): number => {
    let v = parseFactor();
    while (isOp("*") || isOp("/")) {
      const op = (tokens[i++] as { v: string }).v;
      const r = parseFactor();
      if (op === "/") { if (r === 0) throw new Error("División por cero"); v = v / r; } else v = v * r;
    }
    return v;
  };
  const parseFactor = (): number => {
    const tk = peek();
    if (!tk) throw new Error("Expresión incompleta");
    if (tk.t === "op" && tk.v === "-") { i++; return -parseFactor(); }
    if (tk.t === "op" && tk.v === "+") { i++; return parseFactor(); }
    if (tk.t === "num") { i++; return tk.v; }
    if (tk.t === "var") { i++; if (!(tk.v in values)) throw new MissingVar(tk.v); return values[tk.v]; }
    if (tk.t === "lp") { i++; const v = parseExpr(); const c = tokens[i++]; if (!c || c.t !== "rp") throw new Error("Falta «)»"); return v; }
    throw new Error("Token inesperado");
  };
  const result = parseExpr();
  if (i < tokens.length) throw new Error("Sobran tokens en la expresión");
  return result;
}

export interface EvalResult {
  value: number | null;
  variables: string[];
  missing: string[];
  error?: string;
}

/** Evaluate a formula. With no values (no data source) → value null (no calculable). */
export function evaluateFormula(expression: string, values: Record<string, number> = {}): EvalResult {
  const variables = extractVariables(expression);
  const missing = variables.filter((v) => !(v in values));
  try {
    const tokens = tokenize(expression);
    if (tokens.length === 0) return { value: null, variables, missing, error: "Expresión vacía" };
    if (missing.length > 0) return { value: null, variables, missing }; // honest: no calculable sin datos
    const v = evalTokens(tokens, values);
    if (!Number.isFinite(v)) return { value: null, variables, missing, error: "Resultado no finito" };
    return { value: v, variables, missing };
  } catch (e) {
    return { value: null, variables, missing, error: e instanceof Error ? e.message : "Error" };
  }
}

/** Validate structure (ignoring missing values). Used by the equation editor. */
export function validateExpression(expression: string): { ok: boolean; error?: string; variables: string[] } {
  const variables = extractVariables(expression);
  if (expression.trim() === "") return { ok: false, error: "Expresión vacía", variables };
  try {
    const tokens = tokenize(expression);
    evalTokens(tokens, Object.fromEntries(variables.map((v) => [v, 1]))); // probe with dummy values
    return { ok: true, variables };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error", variables };
  }
}

export function formatMetric(value: number | null, unit: MetricUnit): string {
  if (value === null || !Number.isFinite(value)) return "—";
  switch (unit) {
    case "money": return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    case "percent": return `${value.toFixed(1)}%`;
    case "ratio": return `${value.toFixed(2)}×`;
    default: return value.toLocaleString();
  }
}

export const UNIT_LABEL: Record<MetricUnit, string> = { number: "Número", money: "Dinero", percent: "Porcentaje", ratio: "Ratio" };

/* ------------------------------------------------------------- shared store */
let store: MetricFormula[] = [...DEFAULT_METRIC_FORMULAS];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function getMetricFormulas(): MetricFormula[] { return store; }
export function setMetricFormulas(next: MetricFormula[]) { store = next; emit(); }
export function upsertMetricFormula(f: MetricFormula) {
  const i = store.findIndex((x) => x.id === f.id);
  store = i >= 0 ? store.map((x) => (x.id === f.id ? f : x)) : [f, ...store];
  emit();
}
export function removeMetricFormula(id: string) {
  store = store.filter((x) => x.id !== id || x.builtin);
  emit();
}

/** React subscription to the shared metric registry (reflects Estudio edits live). */
export function useMetricFormulas(): MetricFormula[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
    getMetricFormulas,
    getMetricFormulas,
  );
}
