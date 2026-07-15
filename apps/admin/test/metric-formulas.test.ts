import { describe, it, expect, afterEach } from "vitest";
import {
  extractVariables, evaluateFormula, validateExpression, formatMetric,
  getMetricFormulas, setMetricFormulas, upsertMetricFormula, removeMetricFormula,
  DEFAULT_METRIC_FORMULAS, type MetricFormula,
} from "../src/os/metric-formulas";

afterEach(() => setMetricFormulas([...DEFAULT_METRIC_FORMULAS]));

describe("metric formula parser", () => {
  it("extracts variables (unique, ignores numbers/operators)", () => {
    expect(extractVariables("(ingreso - inversion) / inversion * 100").sort()).toEqual(["ingreso", "inversion"]);
  });

  it("evaluates a valid expression with real values", () => {
    const r = evaluateFormula("(ingreso - inversion) / inversion * 100", { ingreso: 150, inversion: 100 });
    expect(r.value).toBeCloseTo(50);
    expect(r.missing).toEqual([]);
  });

  it("respects precedence and parentheses", () => {
    expect(evaluateFormula("2 + 3 * 4", {}).value).toBe(14);
    expect(evaluateFormula("(2 + 3) * 4", {}).value).toBe(20);
    expect(evaluateFormula("-a + 10", { a: 4 }).value).toBe(6);
  });

  it("returns null (no calculable) when a variable has no value — never fabricates", () => {
    const r = evaluateFormula("inversion / visitas", { inversion: 100 });
    expect(r.value).toBeNull();
    expect(r.missing).toEqual(["visitas"]);
  });

  it("returns null on division by zero", () => {
    expect(evaluateFormula("a / b", { a: 1, b: 0 }).value).toBeNull();
  });

  it("rejects invalid syntax without throwing", () => {
    expect(validateExpression("a + ").ok).toBe(false);
    expect(validateExpression("a * (b").ok).toBe(false);
    expect(validateExpression("a @ b").ok).toBe(false);
    expect(validateExpression("(ingreso - inversion) / inversion").ok).toBe(true);
  });

  it("formats by unit", () => {
    expect(formatMetric(50, "percent")).toBe("50.0%");
    expect(formatMetric(2.5, "ratio")).toBe("2.50×");
    expect(formatMetric(null, "money")).toBe("—");
  });
});

describe("metric formula registry (shared store)", () => {
  it("ships the documented default equations", () => {
    const ids = getMetricFormulas().map((f) => f.id);
    for (const id of ["roi", "roas", "costo_visita", "conv_trial", "visitas_por_10"]) {
      expect(ids).toContain(id);
    }
  });

  it("upserts a new formula and can remove non-builtin ones", () => {
    const f: MetricFormula = { id: "custom_1", name: "Mi métrica", expression: "a / b", unit: "ratio" };
    upsertMetricFormula(f);
    expect(getMetricFormulas().some((x) => x.id === "custom_1")).toBe(true);
    removeMetricFormula("custom_1");
    expect(getMetricFormulas().some((x) => x.id === "custom_1")).toBe(false);
  });

  it("protects builtin formulas from deletion", () => {
    removeMetricFormula("roi");
    expect(getMetricFormulas().some((x) => x.id === "roi")).toBe(true);
  });
});
