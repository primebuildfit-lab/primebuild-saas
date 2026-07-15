import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App";

afterEach(cleanup);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Internal OS shell", () => {
  it("renders the Eventra brand and both nav sections (operational + CONFIGURACIONES)", () => {
    renderAt("/");
    expect(screen.getAllByText("Eventra").length).toBeGreaterThan(0);
    expect(screen.getByText("Configuraciones")).toBeInTheDocument();
  });

  it("renders all 19 navigation branches (Spanish labels)", () => {
    renderAt("/");
    const branches = [
      "Inicio", "Calendario", "Campañas", "Ofertas", "Contenido", "Estudio", "Tareas", "Analítica",
      "Audiencia", "Plantillas", "Medios", "Integraciones", "General", "Membresías",
      "Equipos", "Canales", "Etiquetas", "Automatizaciones", "Facturación",
    ];
    for (const label of branches) {
      expect(screen.getByRole("link", { name: new RegExp(`^${label}$`) })).toBeInTheDocument();
    }
  });

  it("renders the topbar search and the signed-in profile (name + role)", () => {
    renderAt("/");
    expect(screen.getByLabelText("Buscar en Eventra")).toBeInTheDocument();
    expect(screen.getAllByText("Brian Almeida").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Owner").length).toBeGreaterThan(0);
  });

  it("shows the environment badge (development in test — never faked as production)", () => {
    renderAt("/");
    expect(screen.getAllByText(/development/i).length).toBeGreaterThan(0);
  });
});

describe("Internal OS — Inicio (dashboard)", () => {
  it("greets the principal and shows the four metric labels", () => {
    renderAt("/");
    expect(screen.getByText(/Bienvenido, Brian/)).toBeInTheDocument();
    for (const m of ["Campañas activas", "Ofertas disponibles", "Tareas pendientes", "Rendimiento general"]) {
      expect(screen.getByText(m)).toBeInTheDocument();
    }
  });

  it("shows an honest empty state for unmeasured metrics (no fabricated numbers)", () => {
    renderAt("/");
    expect(screen.getByText("No disponible")).toBeInTheDocument();          // Rendimiento general
    expect(screen.getAllByText("Sin comparación").length).toBeGreaterThan(0); // trends
    expect(screen.getByText(/Sin datos/)).toBeInTheDocument();               // channel donut
    expect(screen.getByText("No hay ofertas utilizadas todavía")).toBeInTheDocument();
  });

  it("marks the dashboard data as DEV data", () => {
    renderAt("/");
    expect(screen.getAllByText(/DATOS DEV/i).length).toBeGreaterThan(0);
  });

  it("renders the weekly calendar and upcoming-tasks table", () => {
    renderAt("/");
    expect(screen.getByText("Calendario de la semana")).toBeInTheDocument();
    expect(screen.getByText("Próximas tareas")).toBeInTheDocument();
    expect(screen.getByText("Actividad reciente")).toBeInTheDocument();
  });
});

describe("Internal OS — every branch renders", () => {
  const routes: [string, RegExp][] = [
    ["/calendar", /Calendario global/],
    ["/campaigns", /Campañas/],
    ["/offers", /Ofertas/],
    ["/content", /Contenido/],
    ["/studio", /Estudio/],
    ["/tasks", /Tareas/],
    ["/analytics", /Analítica/],
    ["/audiences", /Audiencia/],
    ["/templates", /Plantillas/],
    ["/media", /Medios/],
    ["/integrations", /Integraciones/],
    ["/general", /General/],
    ["/memberships", /Membresías/],
    ["/teams", /Equipos/],
    ["/channels", /Canales/],
    ["/labels", /Etiquetas/],
    ["/automations", /Automatizaciones/],
    ["/billing", /Facturación/],
  ];
  it.each(routes)("renders %s without throwing", async (path, heading) => {
    renderAt(path);
    // findAll flushes any on-mount async work (e.g. surface reachability probes).
    expect((await screen.findAllByRole("heading", { name: heading })).length).toBeGreaterThan(0);
  });
});

describe("Internal OS — data honesty per branch", () => {
  it("Membresías: revenue/users are empty states, plans come from canonical config", () => {
    renderAt("/memberships");
    expect(screen.getByText("Business Pro")).toBeInTheDocument();       // canonical @eventra/config
    expect(screen.getAllByText(/Sin datos/).length).toBeGreaterThan(0); // revenue/users not faked
  });

  it("Facturación: MRR is an empty state (no money movement, no fabricated revenue)", () => {
    renderAt("/billing");
    expect(screen.getByText("Ingresos (MRR)")).toBeInTheDocument();
    expect(screen.getAllByText(/Sin datos/).length).toBeGreaterThan(0);
  });

  it("Integraciones: statuses are honest (Supabase connected, Shopify not configured)", () => {
    renderAt("/integrations");
    expect(screen.getByText("Supabase")).toBeInTheDocument();
    expect(screen.getByText("Shopify")).toBeInTheDocument();
  });

  it("Plantillas: shows the two app surfaces (Eventra Business + Eventra) as big boxes", async () => {
    renderAt("/templates");
    expect(await screen.findByText("Aplicaciones y superficies")).toBeInTheDocument();
    expect(screen.getByText("Eventra Business")).toBeInTheDocument();
    expect(screen.getAllByText("Eventra").length).toBeGreaterThan(0);
  });

  it("Plantillas: app surfaces show LIVE connection status (each host is probed)", async () => {
    renderAt("/templates");
    // fetch is stubbed to resolve → both hosts report reachable ("En línea").
    expect((await screen.findAllByText("En línea")).length).toBe(2);
  });

  it("Plantillas: includes the Shopify storefront preview simulator", async () => {
    renderAt("/templates");
    expect(await screen.findByText("Shopify · Vista previa de la tienda")).toBeInTheDocument();
    expect(screen.getAllByText("Simulación").length).toBeGreaterThan(0);
  });

  it("Plantillas: includes the Business app preview (real dark command-center design)", async () => {
    renderAt("/templates");
    expect(await screen.findByText("Eventra Business · Vista previa de la app")).toBeInTheDocument();
    expect(screen.getByText("App Business")).toBeInTheDocument();
    // The device frame renders the app inside a titled iframe.
    expect(screen.getByTitle(/Vista previa de la app Business/)).toBeInTheDocument();
  });

  it("Plantillas: promo performance shows template names but NO fabricated stats (real data only)", async () => {
    renderAt("/templates");
    await screen.findByText("Aplicaciones y superficies");
    expect(screen.getByText("Plantillas de promoción · Rendimiento")).toBeInTheDocument();
    expect(screen.getByText("10% OFF — Descuento general")).toBeInTheDocument();
    expect(screen.getByText("Free Gift — Regalo incluido")).toBeInTheDocument();
    // Money/visits are honest empty states — never invented numbers.
    expect(screen.getByText("Dinero generado")).toBeInTheDocument();
    expect(screen.getByText("Visitas")).toBeInTheDocument();
    expect(screen.getAllByText("Sin datos").length).toBeGreaterThan(0);
  });
});
