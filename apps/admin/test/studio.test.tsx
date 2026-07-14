import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent, within } from "@testing-library/react";
import { StudioPage } from "../src/os/studio";
import { renderLiquidPreview, hasLiquidTags, LIQUID_SAMPLE_CONTEXT } from "../src/engine/liquidPreview";

afterEach(cleanup);

describe("renderLiquidPreview (safe, no eval)", () => {
  it("interpolates variable paths from the context", () => {
    expect(renderLiquidPreview("Hola {{ user.first_name }}")).toBe("Hola Carlos");
    expect(renderLiquidPreview("{{ shop.name }} · {{ event.title }}")).toBe("PrimeBuild Fit · Black Friday");
  });

  it("applies the supported string filters", () => {
    expect(renderLiquidPreview("{{ shop.name | upcase }}")).toBe("PRIMEBUILD FIT");
    expect(renderLiquidPreview("{{ user.first_name | downcase }}")).toBe("carlos");
  });

  it("leaves unresolved variables visible instead of blanking them", () => {
    expect(renderLiquidPreview("{{ user.unknown }}")).toBe("{{ user.unknown }}");
  });

  it("does not evaluate control-flow tags", () => {
    const src = "{% if user %}Hola {{ user.first_name }}{% endif %}";
    const out = renderLiquidPreview(src);
    expect(out).toContain("{% if user %}");
    expect(out).toContain("Hola Carlos");
    expect(hasLiquidTags(src)).toBe(true);
  });

  it("never returns anything not derived from the input (no execution)", () => {
    expect(renderLiquidPreview("plain text", LIQUID_SAMPLE_CONTEXT)).toBe("plain text");
  });
});

describe("StudioPage", () => {
  it("renders the branch header and both areas", () => {
    render(<StudioPage />);
    expect(screen.getByRole("heading", { name: "Estudio" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Anuncios/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Código/ })).toBeInTheDocument();
  });

  it("shows seeded announcements and their metric counts", () => {
    render(<StudioPage />);
    expect(screen.getByText("Bienvenido a Eventra")).toBeInTheDocument();
    expect(screen.getByText("Prepara Black Friday")).toBeInTheDocument();
    expect(screen.getByText("Publicados")).toBeInTheDocument();
  });

  it("creates a draft announcement from the composer", () => {
    render(<StudioPage />);
    fireEvent.click(screen.getByRole("button", { name: "Nuevo anuncio" }));
    fireEvent.change(screen.getByPlaceholderText("Ej. Prepara Black Friday"), {
      target: { value: "Anuncio de prueba" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
    expect(screen.getByText("Anuncio de prueba")).toBeInTheDocument();
  });

  it("Código: shows the editor, seeded blocks, and the safety notice", () => {
    render(<StudioPage />);
    fireEvent.click(screen.getByRole("tab", { name: /Código/ }));
    expect(screen.getByText("Banner de anuncio")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument();
    expect(screen.getByText(/nunca se ejecuta/i)).toBeInTheDocument();
  });

  it("Código: Liquid preview substitutes sample variables for the selected block", () => {
    render(<StudioPage />);
    fireEvent.click(screen.getByRole("tab", { name: /Código/ }));
    // The seeded banner block uses {{ user.first_name }} and {{ shop.name | upcase }}.
    const preview = screen.getByText(/bienvenido a PRIMEBUILD FIT/i);
    expect(preview).toBeInTheDocument();
    expect(within(preview).queryByText(/\{\{/)).toBeNull();
  });
});
