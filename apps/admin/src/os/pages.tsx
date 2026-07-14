/**
 * Internal OS branch pages (17 branches; Inicio lives in home.tsx).
 * Each branch renders its real information architecture: metrics, filters,
 * tables/cards. Entities come from clearly-badged DEV fixtures; MEASURED
 * OUTCOMES (revenue, conversions, performance, usage) show honest empty states.
 */
import { useMemo, useState } from "react";
import { platformCan, PLATFORM_PERMISSIONS as PP, type PlatformRole } from "@eventra/identity";
import { BUSINESS_PLANS, BUSINESS_PLAN_ORDER } from "@eventra/config";
import {
  Card, CardHead, PageHeader, MetricCard, DataTable, ChartCard, Donut, Toolbar, FilterDropdown,
  StatusBadge, PriorityBadge, EmptyState, ErrorState, Btn, Money, Percent, ScoreBar, ProgressBar,
  Pill, DevBadge, SystemStatusIndicator, type Column, type Tone,
} from "./ui";
import {
  IconMegaphone, IconTag, IconChecklist, IconBarChart, IconContent, IconImage, IconLayout,
  IconNodes, IconSliders, IconHash, IconWorkflow, IconWallet, IconUsers, IconGear, IconCard, IconCalendar,
} from "./icons";
import {
  devOffers, devSources, devCompanies, devUsers, devJobs, devPlatformMetrics,
  type DevCompany, type DevUser,
} from "../data/seed";
import {
  devCampaigns, devTasks, devChannels, devIntegrations, devTemplates, devContent, devMedia,
  devLabels, devAudiences, devOperators, campaignProgress, companyForCampaign,
  type DevCampaign, type DevTask, type DevChannel, type DevIntegration, type DevTemplate,
  type DevContent, type DevMedia, type DevLabel, type DevAudience, type DevOperator,
} from "../data/os-seed";
import { expandOccurrences } from "../engine/occurrences";
import { byScoreDesc } from "../engine/scoring";
import type { Offer } from "../engine/types";
import { SurfacesSection } from "./surfaces";
import { BusinessPreviewSection } from "./business-preview";
import { ShopifyPreviewSection } from "./shopify-preview";
import { PromoStatsSection } from "./promo-stats";

export const MOCK_PLATFORM_ROLE: PlatformRole = "platform_owner";

/* ------------------------------------------------------------------ helpers */
function MetricsRow({ children }: { children: React.ReactNode }) {
  return <div className="eos-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>{children}</div>;
}
const count = <T,>(rows: T[], pred: (r: T) => boolean) => rows.filter(pred).length;
const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])];
const opt = (xs: string[], allLabel = "Todos") => [{ value: "all", label: allLabel }, ...xs.map((x) => ({ value: x, label: x }))];

/* ================================================================ Calendario */
const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
type CalEvent = { id: string; title: string; month: number; type: string; color: string; status: string };
const EVENT_COLORS: Record<string, string> = {
  plataforma: "var(--brand-primary)", campaña: "var(--success)", contenido: "var(--info)",
  mantenimiento: "var(--warning)", cancelación: "var(--danger)", marketing: "var(--magenta)", archivado: "var(--text-muted)",
};
export function CalendarPage() {
  const [year, setYear] = useState("2026");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [view, setView] = useState("Anual");
  const [selected, setSelected] = useState<CalEvent | null>(null);

  const events: CalEvent[] = useMemo(() => {
    const evs: CalEvent[] = [];
    for (const o of devOffers) {
      if (country !== "all" && o.country !== country) continue;
      const occ = expandOccurrences(o, { fromYear: Number(year), horizonYears: 0 });
      for (const x of occ) {
        const isMkt = o.status === "cancelled" ? "cancelación" : "marketing";
        evs.push({ id: `${o.id}-${x.date}`, title: o.title, month: Number(x.date.slice(5, 7)) - 1, type: isMkt, color: EVENT_COLORS[isMkt], status: o.status });
      }
    }
    for (const c of devCampaigns) {
      const m = Number(c.startDate.slice(5, 7)) - 1;
      const t = c.status === "cancelled" ? "cancelación" : "campaña";
      evs.push({ id: c.id, title: c.name, month: m, type: t, color: EVENT_COLORS[t], status: c.status });
    }
    return type === "all" ? evs : evs.filter((e) => e.type === type);
  }, [year, country, type]);

  const byMonth = MONTHS.map((_, i) => events.filter((e) => e.month === i));

  return (
    <div>
      <PageHeader title="Calendario global" description="Calendario operacional de toda la plataforma Eventra (no es el calendario Business del cliente)." actions={<DevBadge />} />
      <Toolbar>
        <FilterDropdown label="Vista" value={view} options={["Anual", "Trimestral", "Mensual", "Semanal", "Agenda"].map((v) => ({ value: v, label: v }))} onChange={setView} icon={false} />
        <FilterDropdown label="Año" value={year} options={["2026", "2027", "2028", "2029"].map((y) => ({ value: y, label: y }))} onChange={setYear} icon={false} />
        <FilterDropdown label="País" value={country} options={opt(uniq(devOffers.map((o) => o.country)), "Todos los países")} onChange={setCountry} />
        <FilterDropdown label="Tipo" value={type} options={opt(Object.keys(EVENT_COLORS))} onChange={setType} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Años futuros se proyectan por recurrencia — nunca como confirmado.</span>
      </Toolbar>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 300px" : "1fr", gap: 16 }}>
        <div>
          {view === "Agenda" ? (
            events.length === 0 ? <Card style={{ padding: 8 }}><EmptyState title="Sin eventos para estos filtros" /></Card> : (
              <Card><div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {events.map((e) => (
                  <button key={e.id} type="button" onClick={() => setSelected(e)} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: 0, borderLeft: `3px solid ${e.color}`, padding: "7px 10px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", borderRadius: 6 }}>
                    <span style={{ width: 46, fontSize: 11, color: "var(--text-muted)" }}>{MONTHS[e.month]}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{e.title}</span>
                    <StatusBadge status={e.status} />
                  </button>
                ))}
              </div></Card>
            )
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
              {MONTHS.map((mo, i) => (
                <Card key={mo} style={{ padding: 12, minHeight: 96 }}>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>{mo} {year}</div>
                  {byMonth[i].length === 0 ? <div style={{ color: "var(--text-muted)", fontSize: 12 }}>—</div> : byMonth[i].map((e) => (
                    <button key={e.id} type="button" onClick={() => setSelected(e)} title={e.title}
                      style={{ display: "block", width: "100%", textAlign: "left", fontSize: 11.5, padding: "3px 6px", marginBottom: 4, borderRadius: 6, background: "var(--surface-elevated)", borderLeft: `3px solid ${e.color}`, color: "var(--text-primary)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.title}</button>
                  ))}
                </Card>
              ))}
            </div>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, color: "var(--text-muted)" }}>
            {Object.entries(EVENT_COLORS).map(([k, c]) => (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />{k}</span>
            ))}
          </div>
        </div>
        {selected ? (
          <Card>
            <CardHead title={selected.title} action={<button className="eos-link" onClick={() => setSelected(null)}>Cerrar</button>} />
            <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
              <Row k="Mes" v={`${MONTHS[selected.month]} ${year}`} />
              <Row k="Tipo" v={<Pill tone="brand">{selected.type}</Pill>} />
              <Row k="Estado" v={<StatusBadge status={selected.status} />} />
              <Row k="Fuente" v="Fixture dev" />
              <p style={{ color: "var(--text-muted)", fontSize: 12, margin: 0 }}>Descripción, responsable y empresa se conectarán con la fuente real.</p>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span></div>;
}

/* ================================================================ Campañas */
export function CampaignsPage() {
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const rows = devCampaigns.filter((c) => (kind === "all" || c.kind === kind) && (status === "all" || c.status === status));
  const cols: Column<DevCampaign>[] = [
    { key: "n", header: "Campaña", render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: "co", header: "Empresa", render: (c) => companyForCampaign(c) },
    { key: "ct", header: "País", render: (c) => c.country },
    { key: "own", header: "Responsable", render: (c) => c.owner },
    { key: "s", header: "Inicio", render: (c) => c.startDate },
    { key: "e", header: "Fin", render: (c) => c.endDate },
    { key: "st", header: "Estado", render: (c) => <StatusBadge status={c.status} /> },
    { key: "ads", header: "Anuncios", render: (c) => c.ads },
    { key: "pr", header: "Progreso", width: 130, render: (c) => <ProgressBar value={campaignProgress(c)} tone={c.status === "overdue" ? "danger" : "brand"} /> },
    { key: "act", header: "", render: () => <Btn tone="ghost" title="Mock — sin mutación real">···</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Campañas" description="Campañas internas de Eventra, de empresas cliente y automáticas — claramente separadas." actions={<><DevBadge /><Btn tone="primary">Nueva campaña</Btn></>} />
      <MetricsRow>
        <MetricCard label="Activas" value={count(devCampaigns, (c) => c.status === "active")} tone="success" trend="none" />
        <MetricCard label="Programadas" value={count(devCampaigns, (c) => c.status === "scheduled")} tone="warning" trend="none" />
        <MetricCard label="Atrasadas" value={count(devCampaigns, (c) => c.status === "overdue")} tone="danger" trend="none" />
        <MetricCard label="Completadas" value={count(devCampaigns, (c) => c.status === "completed")} tone="neutral" trend="none" />
        <MetricCard label="Canceladas" value={count(devCampaigns, (c) => c.status === "cancelled")} tone="neutral" trend="none" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Tipo" value={kind} options={[{ value: "all", label: "Todos" }, { value: "internal", label: "Internas" }, { value: "company", label: "De empresas" }, { value: "automatic", label: "Automáticas" }]} onChange={setKind} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devCampaigns.map((c) => c.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay campañas con estos filtros" />
    </div>
  );
}

/* ================================================================ Ofertas */
const STATUS_TONE: Record<string, "good" | "warn" | "bad" | "neutral"> = { active: "good", verified: "good", pending_review: "warn", discovered: "warn", cancelled: "bad", expired: "neutral", archived: "neutral" };
export function OffersPage() {
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const canVerify = platformCan(MOCK_PLATFORM_ROLE, PP.offersVerify);
  const rows = useMemo(() => devOffers.filter((o) => (status === "all" || o.status === status) && (country === "all" || o.country === country)).sort(byScoreDesc), [status, country]);
  const cols: Column<Offer>[] = [
    { key: "sel", header: "", width: 30, render: () => <input type="checkbox" aria-label="Seleccionar oferta" /> },
    { key: "t", header: "Oferta", render: (o) => <span style={{ fontWeight: 600 }}>{o.title}</span> },
    { key: "cat", header: "Categoría", render: (o) => o.category ?? "—" },
    { key: "c", header: "País", render: (o) => o.country ?? "—" },
    { key: "st", header: "Estado", render: (o) => <StatusBadge status={o.status} /> },
    { key: "cert", header: "Certeza", render: (o) => <Pill tone={o.certainty === "confirmed" ? "success" : "warning"}>{o.certainty}</Pill> },
    { key: "rel", header: "Fiabilidad", render: (o) => <Percent value={o.reliability} /> },
    { key: "use", header: "Usos", render: () => <span style={{ color: "var(--text-muted)" }}>—</span> },
    { key: "sc", header: "Score", render: (o) => o.score ? <ScoreBar value={o.score.value} /> : "—" },
  ];
  return (
    <div>
      <PageHeader title="Ofertas" description="Ofertas comerciales (descuento, bundle, envío, regalo, precio especial). No confundir con campañas." actions={<><DevBadge /><Btn tone="primary">Nueva oferta</Btn></>} />
      <MetricsRow>
        <MetricCard label="Activas" value={count(devOffers, (o) => o.status === "active" || o.status === "verified")} tone="success" trend="none" />
        <MetricCard label="Borradores" value={count(devOffers, (o) => o.status === "pending_review")} tone="warning" trend="none" />
        <MetricCard label="Descubiertas" value={count(devOffers, (o) => o.status === "discovered")} tone="info" trend="none" />
        <MetricCard label="Canceladas" value={count(devOffers, (o) => o.status === "cancelled")} tone="danger" trend="none" />
        <MetricCard label="Reutilizadas" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" foot="Requiere seguimiento de uso" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devOffers.map((o) => o.status)))} onChange={setStatus} />
        <FilterDropdown label="País" value={country} options={opt(uniq(devOffers.map((o) => o.country)))} onChange={setCountry} />
        <span style={{ flex: 1 }} />
        <Btn tone="primary" title={canVerify ? "Mock — sin mutación real" : "Requiere rol operations"}>Verificar</Btn>
        <Btn title="Mock — sin mutación real">Archivar</Btn>
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay ofertas con estos filtros" />
    </div>
  );
}

/* ================================================================ Contenido */
export function ContentPage() {
  const [scope, setScope] = useState("all");
  const rows = devContent.filter((c) => scope === "all" || c.scope === scope);
  const cols: Column<DevContent>[] = [
    { key: "n", header: "Recurso", render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: "ty", header: "Tipo", render: (c) => c.type },
    { key: "sc", header: "Ámbito", render: (c) => c.scope },
    { key: "ch", header: "Canal", render: (c) => c.channel },
    { key: "au", header: "Autor", render: (c) => c.author },
    { key: "v", header: "Versión", render: (c) => c.version },
    { key: "st", header: "Estado", render: (c) => <StatusBadge status={c.status} /> },
    { key: "up", header: "Actualizado", render: (c) => c.updatedAt },
  ];
  return (
    <div>
      <PageHeader title="Contenido" description="Base de contenido global: Eventra, clientes, campañas, generado por IA e histórico — nunca mezclados." actions={<><DevBadge /><Btn tone="primary">Nuevo contenido</Btn></>} />
      <MetricsRow>
        <MetricCard label="Aprobado" value={count(devContent, (c) => c.status === "approved")} tone="success" trend="none" icon={<IconContent size={20} />} />
        <MetricCard label="En revisión" value={count(devContent, (c) => c.status === "in_review")} tone="warning" trend="none" />
        <MetricCard label="Borradores" value={count(devContent, (c) => c.status === "draft")} tone="neutral" trend="none" />
        <MetricCard label="Generado por IA" value={count(devContent, (c) => c.status === "ai_generated")} tone="brand" trend="none" foot="Requiere revisión humana" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Ámbito" value={scope} options={opt(uniq(devContent.map((c) => c.scope)))} onChange={setScope} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay contenido" />
    </div>
  );
}

/* ================================================================ Tareas */
export function TasksPage() {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const rows = devTasks.filter((t) => (status === "all" || t.status === status) && (priority === "all" || t.priority === priority));
  const cols: Column<DevTask>[] = [
    { key: "sel", header: "", width: 30, render: () => <input type="checkbox" aria-label="Seleccionar" /> },
    { key: "t", header: "Tarea", render: (t) => <span style={{ fontWeight: 600 }}>{t.title}</span> },
    { key: "pr", header: "Proyecto", render: (t) => t.project },
    { key: "cm", header: "Campaña", render: (t) => t.campaignId ? devCampaigns.find((c) => c.id === t.campaignId)?.name ?? "—" : "—" },
    { key: "a", header: "Responsable", render: (t) => t.assignee },
    { key: "d", header: "Vencimiento", render: (t) => t.due },
    { key: "p", header: "Prioridad", render: (t) => <PriorityBadge priority={t.priority} /> },
    { key: "st", header: "Estado", render: (t) => <StatusBadge status={t.status} /> },
    { key: "tg", header: "Etiquetas", render: (t) => t.tags.map((tg) => <Pill key={tg} tone="neutral">{tg}</Pill>) },
  ];
  return (
    <div>
      <PageHeader title="Tareas" description="Gestión del trabajo interno del equipo." actions={<><DevBadge /><Btn tone="primary">Nueva tarea</Btn></>} />
      <MetricsRow>
        <MetricCard label="Pendientes" value={count(devTasks, (t) => t.status === "pending")} tone="warning" trend="none" icon={<IconChecklist size={20} />} />
        <MetricCard label="En progreso" value={count(devTasks, (t) => t.status === "in_progress")} tone="info" trend="none" />
        <MetricCard label="Atrasadas" value={count(devTasks, (t) => t.status === "overdue")} tone="danger" trend="none" />
        <MetricCard label="Bloqueadas" value={count(devTasks, (t) => t.status === "blocked")} tone="magenta" trend="none" />
        <MetricCard label="Completadas" value={count(devTasks, (t) => t.status === "completed")} tone="success" trend="none" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Vista" value="Lista" options={["Lista", "Kanban", "Calendario", "Por persona"].map((v) => ({ value: v, label: v }))} onChange={() => {}} icon={false} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devTasks.map((t) => t.status)))} onChange={setStatus} />
        <FilterDropdown label="Prioridad" value={priority} options={opt(uniq(devTasks.map((t) => t.priority)))} onChange={setPriority} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay tareas" />
    </div>
  );
}

/* ================================================================ Analítica */
function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0" }}>
      <span style={{ width: 130, fontSize: 12, color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ flex: 1, height: 8, background: "var(--surface-elevated)", borderRadius: 4, overflow: "hidden" }}>
        <span style={{ display: "block", height: "100%", width: `${max ? (value / max) * 100 : 0}%`, background: "var(--brand-primary)" }} />
      </span>
      <span style={{ width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
export function AnalyticsPage() {
  const [metric, setMetric] = useState("companies");
  const [dimension, setDimension] = useState("plan");
  const [viz, setViz] = useState("Barras");
  const byPlan = Object.entries(devCompanies.reduce<Record<string, number>>((a, c) => { a[c.plan] = (a[c.plan] ?? 0) + 1; return a; }, {}));
  const byStatus = Object.entries(devOffers.reduce<Record<string, number>>((a, o) => { a[o.status] = (a[o.status] ?? 0) + 1; return a; }, {}));
  const maxPlan = Math.max(...byPlan.map(([, n]) => n), 1);
  const maxStatus = Math.max(...byStatus.map(([, n]) => n), 1);
  return (
    <div>
      <PageHeader title="Analítica" description="Analítica global de la plataforma y comparaciones. Sólo se muestran métricas conectadas." actions={<DevBadge />} />
      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Constructor de consultas" sub="Métrica × dimensión × periodo × comparación × segmento × visualización" />
        <div className="eos-card-pad">
          <Toolbar>
            <FilterDropdown label="Métrica" value={metric} options={[{ value: "companies", label: "Empresas" }, { value: "offers", label: "Ofertas" }, { value: "revenue", label: "Ingresos (no conectado)" }, { value: "conversions", label: "Conversiones (no conectado)" }]} onChange={setMetric} icon={false} />
            <FilterDropdown label="Dimensión" value={dimension} options={[{ value: "plan", label: "Plan" }, { value: "status", label: "Estado" }, { value: "country", label: "País" }, { value: "channel", label: "Canal" }]} onChange={setDimension} icon={false} />
            <FilterDropdown label="Periodo" value="Este año" options={["Hoy", "Este mes", "Este trimestre", "Este año"].map((v) => ({ value: v, label: v }))} onChange={() => {}} icon={false} />
            <FilterDropdown label="Visualización" value={viz} options={["Barras", "Dona", "Tabla"].map((v) => ({ value: v, label: v }))} onChange={setViz} icon={false} />
          </Toolbar>
          {metric === "revenue" || metric === "conversions" ? (
            <ErrorState title="Métrica no conectada" hint="Ingresos y conversiones requieren una fuente de medición real (Shopify/pagos). No se inventan valores." />
          ) : viz === "Dona" ? (
            <Donut segments={(metric === "companies" ? byPlan : byStatus).map(([k, n], i) => ({ label: k.replace("business.", ""), value: n, color: ["var(--brand-primary)", "var(--success)", "var(--info)", "var(--warning)", "var(--magenta)"][i % 5] }))} centerLabel="Total" />
          ) : (
            <div>{(metric === "companies" ? byPlan : byStatus).map(([k, n]) => <Bar key={k} label={k.replace("business.", "")} value={n} max={metric === "companies" ? maxPlan : maxStatus} />)}</div>
          )}
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Empresas por plan"><div>{byPlan.map(([k, n]) => <Bar key={k} label={k.replace("business.", "")} value={n} max={maxPlan} />)}</div></ChartCard>
        <ChartCard title="Rendimiento (ingresos/conversiones)" sub="Requiere fuente real"><EmptyState title="Métrica aún no disponible" hint="Se conecta con Shopify/pagos." icon={<IconBarChart size={20} />} /></ChartCard>
      </div>
    </div>
  );
}

/* ================================================================ Audiencia */
export function AudiencesPage() {
  const cols: Column<DevAudience>[] = [
    { key: "n", header: "Audiencia", render: (a) => <span style={{ fontWeight: 600 }}>{a.name}</span> },
    { key: "sc", header: "Ámbito", render: (a) => <Pill tone={a.scope === "business" ? "brand" : "info"}>{a.scope}</Pill> },
    { key: "sg", header: "Segmento", render: (a) => a.segment },
    { key: "c", header: "País", render: (a) => a.country },
    { key: "sz", header: "Tamaño", render: (a) => a.size == null ? <span style={{ color: "var(--text-muted)" }}>Sin datos</span> : a.size },
  ];
  return (
    <div>
      <PageHeader title="Audiencia" description="Audiencias empresariales y personales — mantenidas estrictamente separadas." actions={<DevBadge />} />
      <Card style={{ marginBottom: 16 }}>
        <CardHead title="Comparaciones" sub="empresa vs personal · país vs país · campaña vs campaña · periodo vs periodo" />
        <div className="eos-card-pad"><EmptyState title="Métrica aún no disponible" hint="El tamaño y el comportamiento de audiencia requieren medición real." icon={<IconUsers size={20} />} /></div>
      </Card>
      <DataTable rows={devAudiences} columns={cols} empty="No hay audiencias" />
    </div>
  );
}

/* ================================================================ Plantillas */
export function TemplatesPage() {
  const [cat, setCat] = useState("all");
  const rows = devTemplates.filter((t) => cat === "all" || t.category === cat);
  const cols: Column<DevTemplate>[] = [
    { key: "n", header: "Plantilla", render: (t) => <span style={{ fontWeight: 600 }}>{t.name}</span> },
    { key: "c", header: "Categoría", render: (t) => t.category },
    { key: "sc", header: "Ámbito", render: (t) => t.scope },
    { key: "v", header: "Versión", render: (t) => t.version },
    { key: "st", header: "Estado", render: (t) => <StatusBadge status={t.status} /> },
    { key: "u", header: "Uso", render: () => <span style={{ color: "var(--text-muted)" }}>—</span> },
    { key: "up", header: "Modificada", render: (t) => t.updatedAt },
  ];
  return (
    <div>
      <PageHeader title="Plantillas" description="Sistemas reutilizables: campañas, anuncios, ofertas, email, Liquid, banners, popups, informes." actions={<><DevBadge /><Btn tone="primary">Nueva plantilla</Btn></>} />
      <SurfacesSection />
      <BusinessPreviewSection />
      <ShopifyPreviewSection />
      <PromoStatsSection />
      <Toolbar><FilterDropdown label="Categoría" value={cat} options={opt(uniq(devTemplates.map((t) => t.category)))} onChange={setCat} /></Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay plantillas" />
    </div>
  );
}

/* ================================================================ Medios */
export function MediaPage() {
  const cols: Column<DevMedia>[] = [
    { key: "n", header: "Archivo", render: (m) => <span style={{ fontWeight: 600 }}>{m.name}</span> },
    { key: "t", header: "Tipo", render: (m) => m.type },
    { key: "s", header: "Tamaño", render: (m) => m.sizeKb > 1024 ? `${(m.sizeKb / 1024).toFixed(1)} MB` : `${m.sizeKb} KB` },
    { key: "o", header: "Propietario", render: (m) => m.owner },
    { key: "sc", header: "Ámbito", render: (m) => m.scope },
    { key: "l", header: "Licencia", render: (m) => m.license },
    { key: "up", header: "Fecha", render: (m) => m.updatedAt },
  ];
  return (
    <div>
      <PageHeader title="Medios" description="Imágenes, videos, documentos, ubicaciones, licencias y versiones." actions={<><DevBadge /><Btn tone="primary">Subir medio</Btn></>} />
      <MetricsRow>
        <MetricCard label="Imágenes" value={count(devMedia, (m) => m.type === "imagen")} tone="info" trend="none" icon={<IconImage size={20} />} />
        <MetricCard label="Videos" value={count(devMedia, (m) => m.type === "video")} tone="brand" trend="none" />
        <MetricCard label="Documentos" value={count(devMedia, (m) => m.type === "documento")} tone="neutral" trend="none" />
        <MetricCard label="Almacenamiento" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" foot="Bytes fuera de Postgres — no conectado" />
      </MetricsRow>
      <DataTable rows={devMedia} columns={cols} empty="No hay medios" />
    </div>
  );
}

/* ================================================================ Integraciones */
const INT_TONE: Record<DevIntegration["status"], Tone> = { connected: "success", pending: "warning", error: "danger", not_configured: "neutral", syncing: "info" };
export function IntegrationsPage() {
  const cats = uniq(devIntegrations.map((i) => i.category));
  return (
    <div>
      <PageHeader title="Integraciones" description="Integraciones reales y futuras. Sin claves en vivo — estados honestos." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Conectadas" value={count(devIntegrations, (i) => i.status === "connected")} tone="success" trend="none" icon={<IconNodes size={20} />} />
        <MetricCard label="Pendientes" value={count(devIntegrations, (i) => i.status === "pending")} tone="warning" trend="none" />
        <MetricCard label="Con error" value={count(devIntegrations, (i) => i.status === "error")} tone="danger" trend="none" />
        <MetricCard label="Sin configurar" value={count(devIntegrations, (i) => i.status === "not_configured")} tone="neutral" trend="none" />
      </MetricsRow>
      {cats.map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <h2 style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: ".04em" }}>{cat}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {devIntegrations.filter((i) => i.category === cat).map((i) => (
              <Card key={i.id} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{i.name}</span>
                  <SystemStatusIndicator status={i.status === "connected" ? "operational" : i.status === "error" ? "down" : i.status === "pending" || i.status === "syncing" ? "degraded" : "unknown"} label={i.status.replace("_", " ")} />
                </div>
                <Row k="Entorno" v={i.environment} />
                <Row k="Última sync" v={i.lastSyncAt ?? "—"} />
                <Row k="Errores" v={i.errors} />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <Btn tone="ghost" title="Mock">Reconectar</Btn>
                  <Btn tone="ghost" title="Mock">Desactivar</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================================================================ General */
export function GeneralPage() {
  const sections = ["Identidad", "Idioma", "Zona horaria", "Formatos", "Moneda", "Notificaciones", "Preferencias del dashboard", "Widgets", "Feature flags"];
  return (
    <div>
      <PageHeader title="General" description="Configuración general del Internal OS." actions={<DevBadge />} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {sections.map((s) => (
          <Card key={s} style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><IconGear size={18} /><span style={{ fontWeight: 600 }}>{s}</span></div>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)" }}>Ajustes de {s.toLowerCase()}. Persistidos en SystemSetting al conectar.</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ Membresías */
export function MembershipsPage() {
  const cols = [
    { key: "n", header: "Plan", render: (id: string) => <span style={{ fontWeight: 600 }}>{BUSINESS_PLANS[id as keyof typeof BUSINESS_PLANS].label}</span> },
    { key: "p", header: "Precio/mes", render: (id: string) => <Money minor={BUSINESS_PLANS[id as keyof typeof BUSINESS_PLANS].priceMonthly * 100} /> },
    { key: "w", header: "Workspaces", render: (id: string) => BUSINESS_PLANS[id as keyof typeof BUSINESS_PLANS].workspaceLimit ?? "∞" },
    { key: "c", header: "Países", render: (id: string) => BUSINESS_PLANS[id as keyof typeof BUSINESS_PLANS].countryLimit ?? "∞" },
    { key: "h", header: "Horizonte", render: (id: string) => `${BUSINESS_PLANS[id as keyof typeof BUSINESS_PLANS].planningHorizonYears} año(s)` },
    { key: "u", header: "Usuarios", render: () => <span style={{ color: "var(--text-muted)" }}>Sin datos</span> },
    { key: "r", header: "Ingresos", render: () => <span style={{ color: "var(--text-muted)" }}>Sin datos</span> },
  ];
  return (
    <div>
      <PageHeader title="Membresías" description="Planes comerciales de Eventra. Fuente canónica: @eventra/config (no se duplican precios)." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Usuarios por plan" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" icon={<IconCard size={20} />} foot="Requiere facturación real" />
        <MetricCard label="Ingresos por plan" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" foot="Requiere facturación real" />
        <MetricCard label="Conversiones" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" />
        <MetricCard label="Cancelaciones" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" />
      </MetricsRow>
      <DataTable rows={[...BUSINESS_PLAN_ORDER]} columns={cols} empty="Sin planes" />
    </div>
  );
}

/* ================================================================ Equipos */
export function TeamsPage() {
  const cols: Column<DevOperator>[] = [
    { key: "n", header: "Usuario", render: (o) => <span style={{ fontWeight: 600 }}>{o.name}</span> },
    { key: "r", header: "Rol", render: (o) => <Pill tone="brand">{o.role}</Pill> },
    { key: "st", header: "Estado", render: (o) => <StatusBadge status={o.status} /> },
    { key: "l", header: "Último acceso", render: (o) => o.lastActiveAt },
    { key: "i", header: "Incidencias", render: () => <span style={{ color: "var(--text-muted)" }}>—</span> },
  ];
  return (
    <div>
      <PageHeader title="Equipos" description="Operadores internos, empleados, administradores y sus permisos." actions={<><DevBadge /><Btn tone="primary">Invitar</Btn></>} />
      <DataTable rows={devOperators} columns={cols} empty="No hay operadores" />
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>Los roles de plataforma no pueden acceder a datos de un tenant sin permiso explícito. Toda escritura queda auditada.</p>
    </div>
  );
}

/* ================================================================ Canales */
const CH_TONE: Record<DevChannel["status"], "operational" | "degraded" | "down" | "unknown"> = { connected: "operational", pending: "degraded", error: "down", not_configured: "unknown" };
export function ChannelsPage() {
  const cols: Column<DevChannel>[] = [
    { key: "n", header: "Canal", render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: "st", header: "Estado", render: (c) => <SystemStatusIndicator status={CH_TONE[c.status]} label={c.status.replace("_", " ")} /> },
    { key: "co", header: "Empresas", render: (c) => c.companies },
    { key: "cm", header: "Campañas", render: (c) => c.campaigns },
    { key: "ct", header: "Contenido", render: (c) => c.content },
    { key: "cv", header: "Conversiones", render: () => <span style={{ color: "var(--text-muted)" }}>Sin datos</span> },
    { key: "la", header: "Última actividad", render: (c) => c.lastActivity ?? "—" },
  ];
  return (
    <div>
      <PageHeader title="Canales" description="Canales de marketing y publicación (Shopify, email, redes, blog, web)." actions={<DevBadge />} />
      <DataTable rows={devChannels} columns={cols} empty="No hay canales" />
    </div>
  );
}

/* ================================================================ Etiquetas */
export function LabelsPage() {
  const cols: Column<DevLabel>[] = [
    { key: "n", header: "Etiqueta", render: (l) => <Pill tone="brand">{l.name}</Pill> },
    { key: "t", header: "Tipo", render: (l) => l.type },
    { key: "u", header: "Usos", render: (l) => l.uses },
    { key: "a", header: "", render: () => <span style={{ display: "flex", gap: 8 }}><Btn tone="ghost">Editar</Btn><Btn tone="ghost">Fusionar</Btn><Btn tone="ghost">Archivar</Btn></span> },
  ];
  return (
    <div>
      <PageHeader title="Etiquetas" description="Taxonomía global: campaña, contenido, empresa, usuario, país, prioridad, estado, fuente." actions={<><DevBadge /><Btn tone="primary">Nueva etiqueta</Btn></>} />
      <DataTable rows={devLabels} columns={cols} empty="No hay etiquetas" />
    </div>
  );
}

/* ================================================================ Automatizaciones */
export function AutomationsPage() {
  const cols = [
    { key: "n", header: "Automatización", render: (j: typeof devJobs[number]) => <span style={{ fontWeight: 600 }}>{j.name}</span> },
    { key: "st", header: "Estado", render: (j: typeof devJobs[number]) => <StatusBadge status={j.status} /> },
    { key: "last", header: "Última ejecución", render: (j: typeof devJobs[number]) => j.lastRunAt.slice(0, 16).replace("T", " ") },
    { key: "next", header: "Próxima", render: (j: typeof devJobs[number]) => j.nextRunAt.slice(0, 16).replace("T", " ") },
    { key: "err", header: "Errores", render: (j: typeof devJobs[number]) => j.errorCount },
    { key: "act", header: "", render: () => <Btn tone="ghost" title="Mock — sin servicio externo">Reintentar</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Automatizaciones" description="Jobs, sincronizaciones, alertas, IA e importaciones (mock — sin servicios externos conectados)." actions={<><DevBadge /><Btn tone="primary">Nueva automatización</Btn></>} />
      <MetricsRow>
        <MetricCard label="Activas" value={count(devJobs, (j) => j.status === "running" || j.status === "idle")} tone="success" trend="none" icon={<IconWorkflow size={20} />} />
        <MetricCard label="Con error" value={count(devJobs, (j) => j.status === "failed")} tone="danger" trend="none" />
        <MetricCard label="Ejecutándose" value={count(devJobs, (j) => j.status === "running")} tone="info" trend="none" />
      </MetricsRow>
      <DataTable rows={devJobs} columns={cols} empty="No hay automatizaciones" />
    </div>
  );
}

/* ================================================================ Facturación */
export function BillingPage() {
  const sections = ["Ingresos", "Planes", "Suscripciones", "Trials", "Facturas", "Pagos", "Devoluciones", "Comisiones", "Impuestos", "Problemas"];
  return (
    <div>
      <PageHeader title="Facturación" description="Facturación global de Eventra — pantalla administrativa y analítica. No mueve dinero ni crea un banco." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Ingresos (MRR)" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" icon={<IconWallet size={20} />} foot="Requiere facturación real (Shopify Billing)" />
        <MetricCard label="Suscripciones activas" value={null} emptyLabel="Sin datos" tone="neutral" trend="none" />
        <MetricCard label="Trials" value={count(devCompanies, (c) => c.status === "trial")} tone="info" trend="none" foot="Desde fixtures de empresas" />
        <MetricCard label="Comisiones modeladas" value={<Money minor={devPlatformMetrics().commissionMinor} />} tone="brand" trend="none" foot="1–2%, no cobradas" />
      </MetricsRow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
        {sections.map((s) => (
          <Card key={s} style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{s}</div>
            <EmptyState title="Sin datos" hint="Se conecta con la facturación real." />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ Scaffold (fallback) */
export function ModulePlaceholder({ title, note }: { title: string; note: string }) {
  return (
    <div>
      <PageHeader title={title} description="Módulo con arquitectura definida; aún no construido." />
      <Card style={{ padding: 8 }}><EmptyState title="Módulo planificado" hint={note} /></Card>
    </div>
  );
}

// Re-exports so App.tsx can import legacy names if needed.
export { devCompanies, devUsers, devSources };
export type { DevCompany, DevUser };
