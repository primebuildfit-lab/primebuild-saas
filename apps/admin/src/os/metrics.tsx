/**
 * MÉTRICAS — the definitive metrics section (spec §6–§11). Three groups
 * (Mobile / Business / Generales) + two cross-cutting views (Comparaciones,
 * Inversión y retorno). Every metric has a D/M/A toggle, documented formula,
 * expected source and dimensions — and an HONEST EMPTY STATE, because no billing
 * / analytics / attribution source is connected yet. No number is fabricated.
 * All PB metrics are permanently "No disponible · Integración PB futura".
 */
import { useState } from "react";
import { PageHeader, DevBadge, Toolbar, FilterDropdown } from "./ui";
import { DmaBar, MetricGrid, type Dma, type MetricDef } from "./platform";

const NO_ANALYTICS = "Analítica de producto (pendiente de conectar)";
const NO_BILLING = "Billing real (pendiente de conectar)";
const NO_ATTR = "Atribución de marketing (pendiente de conectar)";
const PB_SOURCE = "Integración PB (futura)";

/* Reusable filters row with self-contained state (visual — no data to filter yet). */
function Filters({ specs }: { specs: { label: string; options: string[] }[] }) {
  const [vals, setVals] = useState<Record<string, string>>({});
  return (
    <Toolbar>
      {specs.map((s) => (
        <FilterDropdown key={s.label} label={s.label} value={vals[s.label] ?? "all"}
          options={[{ value: "all", label: "Todos" }, ...s.options.map((o) => ({ value: o, label: o }))]}
          onChange={(v) => setVals((p) => ({ ...p, [s.label]: v }))} />
      ))}
    </Toolbar>
  );
}

function MetricsPage({ title, description, defs, filters }: {
  title: string; description: string; defs: MetricDef[]; filters?: { label: string; options: string[] }[];
}) {
  const [dma, setDma] = useState<Dma>("M");
  const [compare, setCompare] = useState(false);
  return (
    <div>
      <PageHeader title={title} description={description} actions={<DevBadge />} />
      <DmaBar value={dma} onChange={setDma} compare={compare} onCompare={setCompare} />
      {filters ? <Filters specs={filters} /> : null}
      <MetricGrid defs={defs} dma={dma} />
    </div>
  );
}

const PLANS = ["Free", "Starter", "Growth", "Pro"]; // nombres reales de @eventra/config (Pro = "VIP" en la spec)

/* ================================================================ Métricas Mobile */
export function MobileMetricsPage() {
  const defs: MetricDef[] = [
    { name: "Visitas Mobile", description: "Visitas, visitantes únicos, sesiones y promedio por usuario.", dims: ["País", "Dispositivo", "Android", "iOS", "PWA", "Versión"], source: NO_ANALYTICS, state: "pending", empty: "Sin datos" },
    { name: "Conversiones a prueba gratuita", description: "Personas que iniciaron prueba y tasa visita → prueba.", formula: "iniciaron_trial / visitantes_elegibles", dims: ["Fuente", "Plan", "País", "Plataforma"], source: NO_ANALYTICS, state: "pending", empty: "Sin datos" },
    { name: "Usuarios que pagan anuncios", description: "Personas de Mobile que compran anuncios (no empresas Business).", dims: ["País", "Plan", "Tipo de anuncio", "Canal"], source: NO_BILLING, state: "pending", empty: "Sin datos" },
    { name: "Membresías Mobile activas", description: "Nuevas, activas, renovaciones, cancelaciones, trials, expiradas, ingresos.", dims: ["País", "Plan"], source: NO_BILLING, state: "pending", empty: "Sin datos" },
    { name: "Usuarios con membresía y anuncios", description: "Solapamiento membresía + compra de anuncios; gasto/ingreso promedio, retención.", dims: ["País", "Plan"], source: NO_BILLING, state: "pending", empty: "Sin datos" },
    { name: "Ingresos Mobile", description: "Membresías, anuncios, compras, otros — bruto, comisiones, neto.", formula: "bruto - comisiones = neto", dims: ["País", "Plan", "Canal"], source: NO_BILLING, state: "pending", empty: "No disponible" },
    { name: "PB generado por Mobile", description: "Puntos PB generados desde Mobile.", source: PB_SOURCE, state: "pb", empty: "No disponible" },
  ];
  return <MetricsPage title="Métricas Mobile" description="Comportamiento real de Eventra Mobile. Cada métrica admite D/M/A, comparación con periodo anterior y desgloses. Sin fuente conectada → estado vacío honesto."
    defs={defs} filters={[{ label: "País", options: ["US", "CA", "GB"] }, { label: "Plataforma", options: ["Android", "iOS", "PWA"] }, { label: "Plan", options: PLANS }, { label: "Versión", options: ["1.0.0", "1.1.0"] }]} />;
}

/* ================================================================ Métricas Business */
export function BusinessMetricsPage() {
  const perPlanDist: MetricDef[] = PLANS.map((p) => ({
    name: `Plan ${p}`, description: "Activos, nuevos, cancelaciones, upgrades/downgrades, trials, conversiones.",
    dims: ["D/M/A", "País"], source: NO_BILLING, state: "pending", empty: "Sin datos",
  }));
  const perPlanPay: MetricDef[] = ["Starter", "Growth", "Pro"].map((p) => ({
    name: `Empresas pagando ${p}`, description: "Cantidad, ingreso, crecimiento, cancelaciones, comparación.",
    dims: ["D/M/A"], source: NO_BILLING, state: "pending", empty: "No disponible",
  }));
  const defs: MetricDef[] = [
    { name: "Empresas registradas", description: "Registros nuevos, total acumulado, activadas, pendientes, suspendidas, canceladas.", dims: ["Plan", "País", "Instalación", "Shopify"], source: "Registro de instalaciones (parcial)", state: "pending", empty: "Sin datos" },
    ...perPlanDist,
    { name: "Trials de planes pagados", description: "Empresas en prueba, plan, días restantes, fin, conversiones, cancelaciones antes de cobrar.", dims: ["Plan"], source: NO_BILLING, state: "pending", empty: "Sin datos" },
    { name: "Empresas con membresía pagada", description: "Total, nuevas, renovadas, canceladas, atrasadas, fallidas.", dims: ["Plan", "País"], source: NO_BILLING, state: "pending", empty: "No disponible" },
    ...perPlanPay,
    { name: "Empresas en Free", description: "Cantidad y evolución (no genera ingreso, pero se mide).", dims: ["País"], source: "Registro de instalaciones (parcial)", state: "pending", empty: "Sin datos" },
    { name: "PB generado por Business", description: "Puntos PB generados desde Business.", source: PB_SOURCE, state: "pb", empty: "No disponible" },
  ];
  return <MetricsPage title="Métricas Business" description="Mide Eventra Business (empresas). Cada plan (Free · Starter · Growth · Pro) tiene su propia tarjeta y serie, nunca una sola cifra agregada. Sin billing conectado → estado vacío honesto."
    defs={defs} filters={[{ label: "Plan", options: PLANS }, { label: "País", options: ["US", "CA", "GB"] }, { label: "Estado", options: ["Activa", "Pendiente", "Suspendida", "Cancelada"] }, { label: "Instalación", options: ["Shopify", "Standalone (futuro)"] }]} />;
}

/* ================================================================ Resumen general */
export function MetricsOverviewPage() {
  const defs: MetricDef[] = [
    { name: "Ingresos totales", description: "Mobile + Business — bruto, comisiones, neto.", formula: "mobile + business = total ; bruto - comisiones = neto", dims: ["Mobile", "Business"], source: NO_BILLING, state: "pending", empty: "No disponible" },
    { name: "PB generado", description: "Total de PB del ecosistema.", source: PB_SOURCE, state: "pb", empty: "No disponible" },
    { name: "Mobile vs Business", description: "Visitas, registros, trials, membresías, conversiones, ingresos, crecimiento, uso.", dims: ["Barras", "Líneas", "% contribución"], source: NO_ANALYTICS, state: "pending", empty: "Sin datos" },
    { name: "Visitas totales del ecosistema", description: "Mobile + Business (+ Admin si aplica) — únicos, sesiones.", dims: ["Mobile", "Business"], source: NO_ANALYTICS, state: "pending", empty: "Sin datos" },
    { name: "Visitas por cada $10 invertidos", description: "Costo por visita atribuible.", formula: "(visitas_atribuibles / inversión) × 10", dims: ["Canal", "App", "Campaña"], source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Conversiones de marketing", description: "Total, Mobile, Business, por canal/campaña/país; costo por conversión y tasa.", dims: ["Canal", "Campaña", "País"], source: NO_ATTR, state: "pending", empty: "Sin datos" },
    { name: "Inversión total", description: "Suma de importes reales: anuncios, campañas, promociones, contenido pagado, herramientas.", dims: ["D/M/A"], source: "Registro de inversión (pendiente)", state: "pending", empty: "Sin datos" },
    { name: "Retorno sobre inversión", description: "ROI del ecosistema.", formula: "((ingreso_atribuible - inversión_total) / inversión_total) × 100", dims: ["Total", "Mobile", "Business", "Campaña", "Canal", "País"], source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
  ];
  return <MetricsPage title="Resumen general" description="Combina Eventra Mobile y Eventra Business. Toggle D/M/A y comparación con periodo anterior. Sin fuentes conectadas → estados vacíos honestos; PB siempre No disponible."
    defs={defs} filters={[{ label: "App", options: ["Mobile", "Business"] }, { label: "País", options: ["US", "CA", "GB"] }, { label: "Canal", options: ["Storefront", "Email", "Social", "Web"] }]} />;
}

/* ================================================================ Comparaciones */
export function ComparePage() {
  const defs: MetricDef[] = [
    { name: "Comparación seleccionada", description: "Elige métrica, dimensión, periodo, segmento, app y visualización para comparar (Mobile vs Business, mes vs mes, plan vs plan, país vs país, inversión vs ingreso, visitas vs conversiones, anuncios vs membresías).", dims: ["Métrica", "Dimensión", "Periodo", "Segmento", "App", "Visualización"], source: "Múltiples (según selección) — pendiente", state: "pending", empty: "Sin datos" },
  ];
  return <MetricsPage title="Comparaciones" description="Comparador transversal: Mobile vs Business, día/mes/año, plan vs plan, país vs país, canal vs canal, inversión vs ingreso, visitas vs conversiones, anuncios vs membresías. No es una tabla estática — se activa al conectar las fuentes."
    defs={defs} filters={[{ label: "Métrica", options: ["Visitas", "Ingresos", "Conversiones", "Membresías"] }, { label: "Dimensión", options: ["App", "Plan", "País", "Canal"] }, { label: "Periodo", options: ["Día", "Mes", "Año"] }, { label: "Visualización", options: ["Barras", "Líneas", "% contribución"] }]} />;
}

/* ================================================================ Inversión y retorno */
export function RoiPage() {
  const defs: MetricDef[] = [
    { name: "Inversión total", dims: ["D/M/A", "Canal", "App"], source: "Registro de inversión (pendiente)", state: "pending", empty: "Sin datos" },
    { name: "Ingreso atribuible", dims: ["App", "Campaña"], source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Retorno (ROI)", formula: "((ingreso_atribuible - inversión) / inversión) × 100", dims: ["Total", "Mobile", "Business"], source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "ROAS", formula: "ingreso_atribuible / inversión_publicitaria", source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Costo por visita", formula: "inversión / visitas_atribuibles", source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Costo por registro", formula: "inversión / registros_atribuibles", source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Costo por trial", formula: "inversión / trials_atribuibles", source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Costo por cliente pagado", formula: "inversión / clientes_pagados_atribuibles", source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Costo por conversión", formula: "inversión / conversiones_atribuibles", source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
    { name: "Recuperación / comparación Mobile-Business", description: "Payback y contribución por app.", dims: ["Mobile", "Business"], source: NO_ATTR, state: "pending", empty: "No calculable todavía" },
  ];
  return <MetricsPage title="Inversión y retorno" description="Inversión, ingreso atribuible, ROI, ROAS y costos unitarios. Solo se calcula con fuentes de inversión y atribución conectadas; hasta entonces, estado honesto 'No calculable todavía'."
    defs={defs} filters={[{ label: "App", options: ["Mobile", "Business"] }, { label: "Canal", options: ["Storefront", "Email", "Social", "Web"] }, { label: "Periodo", options: ["Día", "Mes", "Año"] }]} />;
}
