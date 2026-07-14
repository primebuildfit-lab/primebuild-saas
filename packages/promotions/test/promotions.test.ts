import { describe, it, expect } from "vitest";
import { renderPromo, promoPreviewDoc, PROMO_PREVIEW_CONTEXT } from "../src/render";
import { PROMO_TEMPLATES } from "../src/templates";

describe("renderPromo (safe, no eval)", () => {
  it("resolves assigns and interpolates variables, stripping assign tags", () => {
    const out = renderPromo(`{% assign discount_percent = 10 %}
{% assign title = "Save 10%" %}
<h2>{{ title }}</h2><span>{{ discount_percent }}% OFF</span>`);
    expect(out).toContain("<h2>Save 10%</h2>");
    expect(out).toContain("10% OFF");
    expect(out).not.toContain("{% assign");
  });

  it("applies the money filter", () => {
    const out = renderPromo(`{% assign minimum_amount = 50 %}Min {{ minimum_amount | money }}`);
    expect(out).toContain("Min $50.00");
  });

  it("resolves the customer if/else (signed-in shows the member branch)", () => {
    const src = `{% if customer %}MEMBER{% else %}SIGN IN{% endif %}`;
    expect(renderPromo(src, { customer: true })).toContain("MEMBER");
    expect(renderPromo(src, { customer: true })).not.toContain("SIGN IN");
    expect(renderPromo(src, { customer: false })).toContain("SIGN IN");
  });

  it("maps routes.account_login_url and leaves unknown vars visible", () => {
    expect(renderPromo(`{% assign u = routes.account_login_url %}{{ u }}`)).toBe("/account/login");
    expect(renderPromo(`{{ mystery }}`)).toBe("{{ mystery }}");
  });

  it("never executes code — inline scripts are passed through as text only", () => {
    const src = `<button onclick="navigator.clipboard.writeText('x')">{{ code }}</button>`;
    const out = renderPromo(`{% assign code = "SAVE10" %}${src}`);
    expect(out).toContain(">SAVE10<");
    expect(out).toContain("onclick="); // preserved as markup, not run
  });

  it("wraps rendered output in a self-contained preview document", () => {
    const doc = promoPreviewDoc(PROMO_TEMPLATES[0].code, PROMO_PREVIEW_CONTEXT);
    expect(doc.startsWith("<!doctype html>")).toBe(true);
    expect(doc).toContain("eventra-promo");
  });
});

describe("PROMO_TEMPLATES catalog", () => {
  it("has 12 templates, each with a unique id, name, tag and Liquid code", () => {
    expect(PROMO_TEMPLATES).toHaveLength(12);
    const ids = new Set(PROMO_TEMPLATES.map((t) => t.id));
    expect(ids.size).toBe(12);
    for (const t of PROMO_TEMPLATES) {
      expect(t.name.trim().length).toBeGreaterThan(0);
      expect(t.tag.trim().length).toBeGreaterThan(0);
      expect(t.code).toContain("{% assign");
    }
  });

  it("every template renders to non-empty HTML with no leftover assign tags", () => {
    for (const t of PROMO_TEMPLATES) {
      const out = renderPromo(t.code);
      expect(out.length).toBeGreaterThan(0);
      expect(out).not.toContain("{% assign");
    }
  });
});
