import { describe, it, expect } from "vitest";
import { validateLiquid } from "~/lib/liquid";

describe("validateLiquid", () => {
  it("accepts a balanced snippet", () => {
    const r = validateLiquid("{% if product.available %}{{ product.title }}{% endif %}");
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it("flags unbalanced tags", () => {
    const r = validateLiquid("{% if x %}no end");
    expect(r.ok).toBe(false);
    expect(r.errors.join(" ")).toMatch(/if/i);
  });

  it("flags unbalanced outputs", () => {
    const r = validateLiquid("{{ product.title ");
    expect(r.ok).toBe(false);
  });

  it("warns (not errors) on inline scripts", () => {
    const r = validateLiquid("<script>alert(1)</script>");
    expect(r.ok).toBe(true);
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("treats empty input as valid", () => {
    expect(validateLiquid("").ok).toBe(true);
  });
});
