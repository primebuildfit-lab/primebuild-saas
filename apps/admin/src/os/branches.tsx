/**
 * Internal OS — global branch pages added in the definitive IA:
 *   Eventos y noticias · Oportunidades · Anuncios · Fuentes · Países
 *
 * Same posture as the rest of the console: real information architecture (metrics,
 * filters, tables) driven by clearly-badged DEV fixtures. MEASURED OUTCOMES with no
 * live source (impressions, CTR, conversion, acceptance rate) render as honest
 * empty states — never fabricated. Write actions are gated by the platform
 * permission matrix and are mock (no live mutation).
 */
import { useMemo, useState } from "react";
import { platformCan, PLATFORM_PERMISSIONS as PP } from "@eventra/identity";
import {
  PageHeader, MetricCard, DataTable, Toolbar, FilterDropdown, EmptyState, Btn, DevBadge,
  Pill, Percent, ScoreBar, ProgressBar, Card, CardHead, type Column, type Tone,
} from "./ui";
import { MOCK_PLATFORM_ROLE } from "./pages";
import { devSources } from "../data/seed";
import {
  devEvents, devOpportunities, devAds, devCountries,
  type DevEvent, type DevOpportunity, type DevAd, type DevCountry,
} from "../data/global-seed";

/* ------------------------------------------------------------------ shared kit */
export function MetricsRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>{children}</div>;
}
const num = <T,>(rows: T[], pred: (r: T) => boolean) => rows.filter(pred).length;
const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])];
const opt = (xs: string[], allLabel = "Todos") => [{ value: "all", label: allLabel }, ...xs.map((x) => ({ value: x, label: x }))];

/** Spanish state → tone. Keeps colour coding consistent across the new branches. */
const TONE_MAP: Record<string, Tone> = {
  activo: "success", verified: "success", accepted: "success", publicada: "success", publicado: "success", enviada: "success", producción: "success", saludable: "success", healthy: "success", activa: "success",
  beta: "info", en_revisión: "info", programado: "info", programada: "info", nueva: "info", desarrollo: "info", planificado: "info",
  borrador: "warning", pending_review: "warning", pausado: "warning", dudoso: "warning", discovered: "warning", degradada: "warning", degraded: "warning", parcial: "warning",
  fallido: "danger", rejected: "danger", rechazada: "danger", down: "danger", caída: "danger",
  finalizado: "neutral", archivado: "neutral", archivada: "neutral", retirado: "neutral", descartada: "neutral", cancelada: "neutral", básica: "neutral",
};
export function StatePill({ status }: { status: string }) {
  return <Pill tone={TONE_MAP[status] ?? "neutral"} dot>{status.replace(/_/g, " ")}</Pill>;
}

/** A compact "count by key" distribution bar list — for the right rail. */
function Distribution({ title, items }: { title: string; items: { label: string; value: number; tone?: Tone }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <Card>
      <CardHead title={title} />
      <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.every((i) => i.value === 0) ? <EmptyState title="Sin datos para estos filtros" /> : items.map((i) => (
          <div key={i.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
              <span style={{ color: "var(--text-secondary)" }}>{i.label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{i.value}</span>
            </div>
            <ProgressBar value={Math.round((i.value / max) * 100)} tone={i.tone ?? "brand"} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ================================================================ Eventos y noticias */
const EVENT_KINDS = ["noticia", "celebración", "temporada", "deportivo", "cultural", "gubernamental", "comercial"];
export function EventsPage() {
  const [kind, setKind] = useState("all");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.offersWrite);

  const rows = devEvents.filter(
    (e) => (kind === "all" || e.kind === kind) && (country === "all" || e.country === country) && (status === "all" || e.status === status),
  );
  const cols: Column<DevEvent>[] = [
    { key: "t", header: "Evento / noticia", render: (e) => <span style={{ fontWeight: 600 }}>{e.title}</span> },
    { key: "k", header: "Tipo", render: (e) => <Pill tone="brand">{e.kind}</Pill> },
    { key: "c", header: "País", render: (e) => e.country },
    { key: "d", header: "Fecha", render: (e) => e.date },
    { key: "imp", header: "Importancia", render: (e) => <Pill tone={e.importance === "alta" ? "danger" : e.importance === "media" ? "warning" : "neutral"}>{e.importance}</Pill> },
    { key: "rel", header: "Confiabilidad", width: 120, render: (e) => <ProgressBar value={Math.round(e.reliability * 100)} tone={e.reliability > 0.8 ? "success" : e.reliability > 0.6 ? "warning" : "danger"} /> },
    { key: "s", header: "Estado", render: (e) => <StatePill status={e.status} /> },
    { key: "act", header: "", render: () => (
      <span style={{ display: "inline-flex", gap: 6 }}>
        <Btn tone="ghost" title={canWrite ? "Mock — sin mutación real" : "Requiere permiso event:write"} disabled={!canWrite}>Aceptar</Btn>
        <Btn tone="ghost" title={canWrite ? "Mock — sin mutación real" : "Requiere permiso event:write"} disabled={!canWrite}>Rechazar</Btn>
      </span>
    ) },
  ];
  return (
    <div>
      <PageHeader title="Eventos y noticias" description="Bandeja global: noticias, celebraciones, temporadas y eventos que alimentan las oportunidades. Los operadores aceptan, rechazan, verifican o marcan dudoso." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite} title={canWrite ? undefined : "Requiere permiso event:write"}>Nuevo evento</Btn></>} />
      <MetricsRow>
        <MetricCard label="Por revisar" value={num(devEvents, (e) => e.status === "pending_review" || e.status === "discovered")} tone="warning" trend="none" />
        <MetricCard label="Verificados" value={num(devEvents, (e) => e.status === "verified")} tone="success" trend="none" />
        <MetricCard label="Dudosos" value={num(devEvents, (e) => e.status === "dudoso")} tone="warning" trend="none" />
        <MetricCard label="Rechazados" value={num(devEvents, (e) => e.status === "rejected")} tone="neutral" trend="none" />
        <MetricCard label="Aceptación (30 d)" value={null} tone="info" foot="Sin fuente de medición" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Tipo" value={kind} options={opt(EVENT_KINDS)} onChange={setKind} />
        <FilterDropdown label="País" value={country} options={opt(uniq(devEvents.map((e) => e.country)), "Todos los países")} onChange={setCountry} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devEvents.map((e) => e.status)))} onChange={setStatus} />
      </Toolbar>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
        <DataTable rows={rows} columns={cols} empty="No hay eventos con estos filtros" />
        <Distribution title="Por tipo" items={EVENT_KINDS.map((k) => ({ label: k, value: num(rows, (e) => e.kind === k) })).filter((i) => i.value > 0)} />
      </div>
    </div>
  );
}

/* ================================================================ Oportunidades */
export function OpportunitiesPage() {
  const [country, setCountry] = useState("all");
  const [industry, setIndustry] = useState("all");
  const [status, setStatus] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.offersWrite);

  const rows = devOpportunities
    .filter((o) => (country === "all" || o.country === country) && (industry === "all" || o.industry === industry) && (status === "all" || o.status === status))
    .sort((a, b) => b.score - a.score);
  const avgScore = devOpportunities.length ? Math.round(devOpportunities.reduce((s, o) => s + o.score, 0) / devOpportunities.length) : 0;
  const cols: Column<DevOpportunity>[] = [
    { key: "t", header: "Oportunidad", render: (o) => <span style={{ fontWeight: 600 }}>{o.title}</span> },
    { key: "c", header: "País", render: (o) => o.country },
    { key: "ind", header: "Industria", render: (o) => o.industry },
    { key: "imp", header: "Import.", render: (o) => o.importance },
    { key: "urg", header: "Urgencia", render: (o) => o.urgency },
    { key: "dif", header: "Dificultad", render: (o) => o.difficulty },
    { key: "sc", header: "Score", width: 130, render: (o) => <ScoreBar value={o.score} /> },
    { key: "s", header: "Estado", render: (o) => <StatePill status={o.status} /> },
    { key: "act", header: "", render: () => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso"}>Publicar</Btn> },
  ];
  const bands = [
    { label: "Alta (80-100)", value: num(rows, (o) => o.score >= 80), tone: "success" as Tone },
    { label: "Media (60-79)", value: num(rows, (o) => o.score >= 60 && o.score < 80), tone: "warning" as Tone },
    { label: "Baja (<60)", value: num(rows, (o) => o.score < 60), tone: "neutral" as Tone },
  ];
  return (
    <div>
      <PageHeader title="Oportunidades" description="Motor de oportunidades comerciales: cada una nace de un evento y se puntúa por importancia, urgencia, confiabilidad y dificultad. El Internal OS define el score y qué se publica." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Nueva oportunidad</Btn></>} />
      <MetricsRow>
        <MetricCard label="Nuevas" value={num(devOpportunities, (o) => o.status === "nueva")} tone="info" trend="none" />
        <MetricCard label="Publicadas" value={num(devOpportunities, (o) => o.status === "publicada")} tone="success" trend="none" />
        <MetricCard label="En revisión" value={num(devOpportunities, (o) => o.status === "en_revisión")} tone="warning" trend="none" />
        <MetricCard label="Score medio" value={avgScore} tone="brand" trend="none" foot="Sobre fixtures DEV" />
        <MetricCard label="Conversión a campaña" value={null} tone="magenta" foot="Sin fuente de medición" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="País" value={country} options={opt(uniq(devOpportunities.map((o) => o.country)), "Todos los países")} onChange={setCountry} />
        <FilterDropdown label="Industria" value={industry} options={opt(uniq(devOpportunities.map((o) => o.industry)))} onChange={setIndustry} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devOpportunities.map((o) => o.status)))} onChange={setStatus} />
      </Toolbar>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
        <DataTable rows={rows} columns={cols} empty="No hay oportunidades con estos filtros" />
        <Distribution title="Por score" items={bands} />
      </div>
    </div>
  );
}

/* ================================================================ Anuncios */
const AD_TYPES = ["banner", "popup", "bloque", "liquid", "email", "producto", "colección", "social", "landing"];
export function AdsPage() {
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.offersWrite);

  const rows = devAds.filter((a) => (type === "all" || a.type === type) && (status === "all" || a.status === status) && (channel === "all" || a.channel === channel));
  const cols: Column<DevAd>[] = [
    { key: "n", header: "Anuncio", render: (a) => <span style={{ fontWeight: 600 }}>{a.name}</span> },
    { key: "t", header: "Tipo", render: (a) => <Pill tone="brand">{a.type}</Pill> },
    { key: "ch", header: "Canal", render: (a) => a.channel },
    { key: "cmp", header: "Campaña", render: (a) => a.campaign },
    { key: "o", header: "Responsable", render: (a) => a.owner },
    { key: "s", header: "Estado", render: (a) => <StatePill status={a.status} /> },
    { key: "u", header: "Actualizado", render: (a) => a.updatedAt },
    { key: "act", header: "", render: () => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso"}>···</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Anuncios" description="Catálogo global de tipos de anuncio (banner, popup, bloque Liquid, email, producto, social…) y su ciclo de vida. La composición concreta se hace en Estudio." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Nuevo anuncio</Btn></>} />
      <MetricsRow>
        <MetricCard label="Activos" value={num(devAds, (a) => a.status === "activo")} tone="success" trend="none" />
        <MetricCard label="Programados" value={num(devAds, (a) => a.status === "programado")} tone="info" trend="none" />
        <MetricCard label="Borradores" value={num(devAds, (a) => a.status === "borrador")} tone="warning" trend="none" />
        <MetricCard label="Impresiones" value={null} tone="brand" foot="Sin fuente de medición" />
        <MetricCard label="CTR" value={null} tone="magenta" foot="Sin fuente de medición" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Tipo" value={type} options={opt(AD_TYPES)} onChange={setType} />
        <FilterDropdown label="Canal" value={channel} options={opt(uniq(devAds.map((a) => a.channel)))} onChange={setChannel} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devAds.map((a) => a.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay anuncios con estos filtros" />
    </div>
  );
}

/* ================================================================ Fuentes */
export function SourcesPage() {
  const [method, setMethod] = useState("all");
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.sourcesWrite);

  const rows = devSources.filter(
    (s) => (method === "all" || s.method === method) && (status === "all" || s.status === status) && (country === "all" || (s.country ?? "—") === country),
  );
  const avgRel = devSources.length ? Math.round((devSources.reduce((a, s) => a + s.reliability, 0) / devSources.length) * 100) : 0;
  const cols: Column<(typeof devSources)[number]>[] = [
    { key: "n", header: "Fuente", render: (s) => <span style={{ fontWeight: 600 }}>{s.name}</span> },
    { key: "c", header: "País", render: (s) => s.country ?? "Global" },
    { key: "m", header: "Método", render: (s) => <Pill tone="neutral">{s.method}</Pill> },
    { key: "st", header: "Estado", render: (s) => <StatePill status={s.status} /> },
    { key: "f", header: "Frecuencia", render: (s) => (s.frequencyHours ? `${s.frequencyHours} h` : "Manual") },
    { key: "rel", header: "Confiabilidad", width: 120, render: (s) => <ProgressBar value={Math.round(s.reliability * 100)} tone={s.reliability > 0.8 ? "success" : s.reliability > 0.6 ? "warning" : "danger"} /> },
    { key: "err", header: "Errores", render: (s) => (s.errorCount ? <span style={{ color: "var(--danger)" }}>{s.errorCount}</span> : "0") },
    { key: "ls", header: "Última sinc.", render: (s) => (s.lastSyncAt ? s.lastSyncAt.slice(0, 10) : "—") },
    { key: "act", header: "", render: (s) => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso sources:write"}>{s.status === "down" ? "Reactivar" : "Pausar"}</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Fuentes" description="Las fuentes que alimentan los eventos globales: APIs, RSS, calendarios públicos, feeds gubernamentales y curación manual. Solo el Internal OS activa o desactiva fuentes globales." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Añadir fuente</Btn></>} />
      <MetricsRow>
        <MetricCard label="Saludables" value={num(devSources, (s) => s.status === "healthy")} tone="success" trend="none" />
        <MetricCard label="Degradadas" value={num(devSources, (s) => s.status === "degraded")} tone="warning" trend="none" />
        <MetricCard label="Caídas" value={num(devSources, (s) => s.status === "down")} tone="danger" trend="none" />
        <MetricCard label="Confiabilidad media" value={<Percent value={avgRel / 100} />} tone="brand" trend="none" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Método" value={method} options={opt(uniq(devSources.map((s) => s.method)))} onChange={setMethod} />
        <FilterDropdown label="País" value={country} options={opt(uniq(devSources.map((s) => s.country)), "Todos")} onChange={setCountry} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devSources.map((s) => s.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay fuentes con estos filtros" />
    </div>
  );
}

/* ================================================================ Países */
export function CountriesPage() {
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.settingsManage);

  const rows = devCountries.filter((c) => (region === "all" || c.region === region) && (status === "all" || c.status === status));
  const cols: Column<DevCountry>[] = [
    { key: "c", header: "País", render: (c) => <span style={{ fontWeight: 600 }}>{c.code} · {c.name}</span> },
    { key: "r", header: "Región", render: (c) => c.region },
    { key: "l", header: "Idioma", render: (c) => c.language },
    { key: "tz", header: "Zona horaria", render: (c) => c.timezone },
    { key: "src", header: "Fuentes", render: (c) => c.sources },
    { key: "ev", header: "Eventos", render: (c) => c.events },
    { key: "cov", header: "Cobertura", render: (c) => <StatePill status={c.coverage} /> },
    { key: "s", header: "Estado", render: (c) => <StatePill status={c.status} /> },
    { key: "act", header: "", render: (c) => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso country:write"}>{c.status === "activo" ? "Desactivar" : "Activar"}</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Países" description="Catálogo global de países, regiones, idiomas y cobertura. Business solo activa países permitidos por su plan; Mobile solo consume los disponibles para el usuario." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Añadir país</Btn></>} />
      <MetricsRow>
        <MetricCard label="Activos" value={num(devCountries, (c) => c.status === "activo")} tone="success" trend="none" />
        <MetricCard label="En beta" value={num(devCountries, (c) => c.status === "beta")} tone="info" trend="none" />
        <MetricCard label="Planificados" value={num(devCountries, (c) => c.status === "planificado")} tone="warning" trend="none" />
        <MetricCard label="Cobertura completa" value={num(devCountries, (c) => c.coverage === "completa")} tone="brand" trend="none" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Región" value={region} options={opt(uniq(devCountries.map((c) => c.region)))} onChange={setRegion} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devCountries.map((c) => c.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay países con estos filtros" />
    </div>
  );
}
