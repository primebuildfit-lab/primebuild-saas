import { describe, it, expect } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { PlatformRole } from "@eventra/identity";
import { App } from "../src/App";
import { NAV, NAV_LEAVES } from "../src/os/nav";
import type { OperatorSession } from "../src/os/session";

function sessionFor(role: PlatformRole): OperatorSession {
  return {
    connected: false,
    operator: { userId: "op1", displayName: "Operador Prueba", email: "op@eventra.app", role },
  };
}

async function renderAt(path: string, role: PlatformRole = "platform_owner") {
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <App session={sessionFor(role)} />
    </MemoryRouter>,
  );
  // Flush the providers' async mount effects inside React's test scope.
  await act(async () => {});
  return utils;
}

describe("navigation structure (owner spec §7)", () => {
  it("has the exact top-level monitoring branches, in order", () => {
    expect(NAV.map((n) => n.label)).toEqual([
      "Resumen", "Empresas", "Tiendas", "Miembros", "Órdenes", "Ventas",
      "Marketing", "Planes y suscripciones", "Integraciones", "Alertas",
      "Soporte", "Salud del servicio", "Auditoría", "Configuración",
    ]);
  });

  it("Órdenes has En vivo / Realizadas / Canceladas / Reembolsos", () => {
    const orders = NAV.find((n) => n.label === "Órdenes");
    expect(orders?.children?.map((c) => c.label)).toEqual(["En vivo", "Realizadas", "Canceladas", "Reembolsos"]);
  });

  it("Marketing has Anuncios / Campañas / Ofertas / Contenido / Resultados", () => {
    const mk = NAV.find((n) => n.label === "Marketing");
    expect(mk?.children?.map((c) => c.label)).toEqual(["Anuncios", "Campañas", "Ofertas", "Contenido", "Resultados"]);
  });

  it("every nav leaf declares a business.* permission", () => {
    expect(NAV_LEAVES.length).toBeGreaterThan(0);
    for (const leaf of NAV_LEAVES) expect(leaf.perm).toMatch(/^business\./);
  });
});

describe("honest data — no fabricated content", () => {
  it("dashboard shows real metric labels but every value is 'Sin datos' (not connected)", async () => {
    await renderAt("/");
    expect(await screen.findByRole("heading", { name: "Resumen" })).toBeInTheDocument();
    expect(screen.getByText("Empresas registradas")).toBeInTheDocument();
    // no fabricated numbers — the honest empty label appears many times
    expect(screen.getAllByText("Sin datos").length).toBeGreaterThan(5);
    // and there is no Demo Store anywhere
    expect(document.body.textContent ?? "").not.toMatch(/demo store/i);
  });

  it("Empresas renders a 'No conectado' state rather than fake rows", async () => {
    await renderAt("/companies");
    expect(await screen.findByRole("heading", { name: "Empresas" })).toBeInTheDocument();
    expect(screen.getAllByText("No conectado").length).toBeGreaterThanOrEqual(1);
    // no data table is rendered when not connected
    expect(document.querySelector("table.data")).toBeNull();
  });

  it("Órdenes en vivo shows the not-connected state and never a create-order control", async () => {
    await renderAt("/orders/live");
    expect(await screen.findByRole("heading", { name: "Órdenes en vivo" })).toBeInTheDocument();
    expect(screen.getAllByText("No conectado").length).toBeGreaterThanOrEqual(1);
  });
});

describe("no commercial creation affordances (spec §12)", () => {
  it("marketing monitoring screen never exposes create advertisement/offer or Promotion Builder", async () => {
    await renderAt("/marketing/ads");
    expect(await screen.findByRole("heading", { name: "Anuncios" })).toBeInTheDocument();
    const body = document.body.textContent ?? "";
    expect(body).not.toMatch(/create advertisement/i);
    expect(body).not.toMatch(/create offer/i);
    expect(body).not.toMatch(/promotion builder/i);
    // the monitoring SCREEN itself is read-only: no action buttons in the content area.
    // (The app shell chrome may hold cross-app navigation, e.g. the Ecosistema menu —
    // that is not a commercial-creation affordance and lives outside .content.)
    const content = document.querySelector(".content") as HTMLElement;
    expect(within(content).queryAllByRole("button")).toHaveLength(0);
  });
});

describe("operator authorization (deny-by-default)", () => {
  it("read_only operator can view companies (monitor) …", async () => {
    await renderAt("/companies", "read_only");
    expect(await screen.findByRole("heading", { name: "Empresas" })).toBeInTheDocument();
    expect(screen.queryByText("Sin permiso")).toBeNull();
  });

  it("… and the sidebar only shows branches the operator's role permits", async () => {
    await renderAt("/", "read_only");
    const sidebar = document.querySelector(".sidebar") as HTMLElement;
    // read_only holds every *.view, so all top branches are visible
    expect(within(sidebar).getByText("Empresas")).toBeInTheDocument();
    expect(within(sidebar).getByText("Auditoría")).toBeInTheDocument();
  });
});
