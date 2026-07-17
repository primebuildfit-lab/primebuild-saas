import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromotionTemplates } from "~/features/templates/PromotionTemplates";
import { PROMO_TEMPLATES } from "@eventra/promotions";

describe("PromotionTemplates (Business)", () => {
  it("lists every promo template from the shared catalog, collapsed by default", () => {
    render(<PromotionTemplates />);
    expect(screen.getByText("Promotion blocks")).toBeInTheDocument();
    for (const t of PROMO_TEMPLATES) {
      expect(screen.getByRole("button", { name: new RegExp(t.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) })).toBeInTheDocument();
    }
    // Collapsed: no previews rendered yet.
    expect(screen.queryByTitle(/Vista previa de/)).toBeNull();
  });

  it("expands a template to reveal its preview and a prepared (disabled) Shopify publish action", async () => {
    const user = userEvent.setup();
    render(<PromotionTemplates />);
    const first = PROMO_TEMPLATES[0];
    await user.click(screen.getByRole("button", { name: new RegExp(first.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) }));

    expect(screen.getByTitle(`Vista previa de ${first.name}`)).toBeInTheDocument();
    const publish = screen.getByRole("button", { name: /Publicar en Shopify/ });
    expect(publish).toBeDisabled();
    expect(screen.getByRole("button", { name: /Copiar código/ })).toBeInTheDocument();
  });
});
