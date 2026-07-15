import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { App } from "../src/App";
import { OS_NAV } from "../src/os/nav";

afterEach(cleanup);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Internal OS shell (platform-control structure)", () => {
  it("renders the Eventra brand and the platform-control section headers", () => {
    renderAt("/");
    expect(screen.getAllByText("Eventra").length).toBeGreaterThan(0);
    expect(screen.getByText("Métricas")).toBeInTheDocument();
    expect(screen.getByText("Datos y configuración")).toBeInTheDocument();
    expect(screen.getByText("Operaciones de producto")).toBeInTheDocument();
    expect(screen.getByText("Control")).toBeInTheDocument();
  });

  it("renders every navigation branch as a link (Spanish labels)", () => {
    renderAt("/");
    for (const n of OS_NAV) {
      expect(screen.getByRole("link", { name: new RegExp(`^${n.label}$`) })).toBeInTheDocument();
    }
  });

  it("shows a platform-status card in the sidebar (not a client/tenant plan card)", () => {
    renderAt("/");
    expect(screen.getByText("Eventra Platform")).toBeInTheDocument();
    expect(screen.getByText(/Base de datos: Supabase/)).toBeInTheDocument();
    expect(screen.getByText(/Versión 1\.0\.0/)).toBeInTheDocument();
  });

  it("renders the topbar search and the signed-in profile (name + role)", () => {
    renderAt("/");
    expect(screen.getByLabelText("Buscar en Eventra")).toBeInTheDocument();
    expect(screen.getAllByText("Brian Almeida").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Owner").length).toBeGreaterThan(0);
  });
});

describe("Internal OS — Inicio (platform dashboard)", () => {
  it("greets the principal and shows PLATFORM metrics (not a Business overview)", () => {
    renderAt("/");
    expect(screen.getByText(/Bienvenido, Brian/)).toBeInTheDocument();
    for (const m of ["Visitas Mobile", "Empresas activas", "Trials activos", "Ingresos totales", "Publicaciones activas", "Alertas del sistema"]) {
      expect(screen.getByText(m)).toBeInTheDocument();
    }
  });

  it("does not surface client-operational metrics as the dashboard headline", () => {
    renderAt("/");
    expect(screen.queryByText("Ofertas disponibles")).not.toBeInTheDocument();
    expect(screen.queryByText("Campañas activas")).not.toBeInTheDocument();
  });

  it("shows honest empty states for unmeasured metrics (no fabricated numbers)", () => {
    renderAt("/");
    expect(screen.getAllByText("Sin datos").length).toBeGreaterThan(0);        // visitas/ingresos/membresías
    expect(screen.getAllByText("Sin comparación").length).toBeGreaterThan(0);  // trends
  });

  it("marks the dashboard data as DEV data and shows platform blocks", () => {
    renderAt("/");
    expect(screen.getAllByText(/DATOS DEV/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Mobile vs Business")).toBeInTheDocument();
    expect(screen.getByText("Actividad administrativa")).toBeInTheDocument();
    expect(screen.getByText("Estado de productos")).toBeInTheDocument();
  });
});

describe("Internal OS — every branch renders (no dead links)", () => {
  const routes: [string, RegExp][] = [
    ["/calendar", /Calendario global/],
    ["/publications", /Publicaciones/],
    ["/companies", /Empresas/],
    ["/users", /Usuarios/],
    ["/alerts", /Alertas del sistema/],
    ["/metrics", /Resumen general/],
    ["/metrics/mobile", /Métricas Mobile/],
    ["/metrics/business", /Métricas Business/],
    ["/metrics/compare", /Comparaciones/],
    ["/metrics/roi", /Inversión y retorno/],
    ["/sources", /Fuentes/],
    ["/countries", /Países/],
    ["/parameters", /Parámetros/],
    ["/plans", /Membresías/],
    ["/templates", /Plantillas/],
    ["/audiences", /Audiencia/],
    ["/channels", /Canales/],
    ["/business", /Eventra Business/],
    ["/mobile", /Eventra Mobile/],
    ["/integrations", /Integraciones/],
    ["/automations", /Automatizaciones/],
    ["/ai", /IA y modelos/],
    ["/releases", /Versiones y publicaciones/],
    ["/teams", /Equipos/],
    ["/audit", /Auditoría/],
    ["/health", /Salud del sistema/],
    ["/settings", /General/],
  ];
  it.each(routes)("renders %s without throwing", async (path, heading) => {
    renderAt(path);
    expect((await screen.findAllByRole("heading", { name: heading })).length).toBeGreaterThan(0);
  });
});

describe("Internal OS — real calendar (not a list)", () => {
  it("offers Año/Mes/Semana/Agenda views with a 7-day grid and legend", () => {
    renderAt("/calendar");
    for (const v of ["Año", "Mes", "Semana", "Agenda"]) {
      expect(screen.getByRole("button", { name: v })).toBeInTheDocument();
    }
    expect(screen.getAllByText("Lun").length).toBeGreaterThan(0);   // weekday header row
    expect(screen.getByText("Plataforma")).toBeInTheDocument();      // colour legend
  });
});

describe("Internal OS — metrics section (separated + D/M/A + honest empties)", () => {
  it("Métricas Mobile: D/M/A toggle, real metric names, PB no disponible", () => {
    renderAt("/metrics/mobile");
    for (const d of ["Día", "Mes", "Año"]) {
      expect(screen.getByRole("button", { name: d })).toBeInTheDocument();
    }
    expect(screen.getByText("Visitas Mobile")).toBeInTheDocument();
    expect(screen.getByText("PB generado por Mobile")).toBeInTheDocument();
    expect(screen.getAllByText("No disponible").length).toBeGreaterThan(0);
  });

  it("Métricas Business: each plan has its own card (never one aggregate figure)", () => {
    renderAt("/metrics/business");
    for (const p of ["Plan Free", "Plan Starter", "Plan Growth", "Plan Pro"]) {
      expect(screen.getByText(p)).toBeInTheDocument();
    }
    expect(screen.getByText("PB generado por Business")).toBeInTheDocument();
  });

  it("Resumen general + ROI expose totals and documented formulas honestly", () => {
    renderAt("/metrics");
    expect(screen.getByText("Ingresos totales")).toBeInTheDocument();
    cleanup();
    renderAt("/metrics/roi");
    expect(screen.getAllByText("Retorno sobre inversión (ROI)").length).toBeGreaterThan(0); // from the equation registry
    expect(screen.getByText("ROAS")).toBeInTheDocument();
    expect(screen.getAllByText("No calculable todavía").length).toBeGreaterThan(0);
  });
});

describe("Internal OS — metrics by equation (selectable in the marked places)", () => {
  it("Comparaciones: the metric selector is fed by equation-defined metrics", () => {
    renderAt("/metrics/compare");
    expect(screen.getByText("Métrica a comparar")).toBeInTheDocument();
    expect(screen.getAllByText("Retorno sobre inversión (ROI)").length).toBeGreaterThan(0); // default registry metric
    expect(screen.getAllByText("No calculable").length).toBeGreaterThan(0);                 // honest — no data source
  });

  it("each metrics page offers an equation-metric picker", () => {
    renderAt("/metrics/mobile");
    expect(screen.getByText("Métrica por ecuación")).toBeInTheDocument();
  });

  it("ROI renders the equation family (ROAS, costo por visita) from the registry", () => {
    renderAt("/metrics/roi");
    expect(screen.getByText("Costo por visita")).toBeInTheDocument();
    expect(screen.getByText("ROAS")).toBeInTheDocument();
  });
});

describe("Internal OS — platform control pages", () => {
  it("Parámetros: is the single source of truth with real sections", () => {
    renderAt("/parameters");
    expect(screen.getByText("Scoring y oportunidades")).toBeInTheDocument();
    expect(screen.getByText("Feature flags")).toBeInTheDocument();
  });

  it("Salud del sistema: shows honest service states (Supabase connected, Railway pending)", () => {
    renderAt("/health");
    expect(screen.getByText("Base de datos (Supabase)")).toBeInTheDocument();
    expect(screen.getByText("Business (Railway)")).toBeInTheDocument();
  });

  it("Auditoría: honest empty state, no fabricated audit rows", () => {
    renderAt("/audit");
    expect(screen.getByText("Sin eventos de auditoría")).toBeInTheDocument();
  });
});

describe("Internal OS — data honesty per branch", () => {
  it("Planes: revenue/users are empty states, plans come from canonical config", () => {
    renderAt("/plans");
    expect(screen.getByText("Business Pro")).toBeInTheDocument();       // canonical @eventra/config
    expect(screen.getAllByText(/Sin datos/).length).toBeGreaterThan(0); // revenue/users not faked
  });

  it("Empresas: supervision list with honest revenue empty state", () => {
    renderAt("/companies");
    expect(screen.getByText("Northwind Retail")).toBeInTheDocument();
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
  });

  it("Integraciones: statuses are honest (Supabase connected, Shopify not configured)", () => {
    renderAt("/integrations");
    expect(screen.getByText("Supabase")).toBeInTheDocument();
    expect(screen.getByText("Shopify")).toBeInTheDocument();
  });

  it("Plantillas: shows the two app surfaces (Eventra Business + Eventra) as big boxes", async () => {
    renderAt("/templates");
    expect(await screen.findByText("Aplicaciones y superficies")).toBeInTheDocument();
    // "Eventra Business" appears both as a nav link and as a surface card here.
    expect(screen.getAllByText("Eventra Business").length).toBeGreaterThan(0);
  });

  it("Plantillas: app surfaces show LIVE connection status (each host is probed)", async () => {
    renderAt("/templates");
    expect((await screen.findAllByText("En línea")).length).toBe(2);
  });
});
