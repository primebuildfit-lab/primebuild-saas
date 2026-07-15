/**
 * Platform-control pages for the corrected Internal OS:
 *   GENERAL      — Publicaciones, Empresas, Usuarios, Alertas
 *   DATOS/CONFIG — Parámetros
 *   PRODUCTO     — Eventra Business (tabs), Eventra Mobile (tabs), IA y modelos,
 *                  Versiones y publicaciones
 *   CONTROL      — Auditoría, Salud del sistema
 *
 * Operational entities that used to be top-level branches (Campañas, Ofertas,
 * Anuncios, Estudio, Contenido, Medios, Eventos, Oportunidades, and the Mobile
 * sub-pages) are folded in here as SUPERVISION tabs — the admin oversees, it does
 * not do a client company's daily work. DEV fixtures are badged; measured outcomes
 * are honest empty states; write actions are permission-gated (mock).
 */
import { useState } from "react";
import { platformCan, PLATFORM_PERMISSIONS as PP } from "@eventra/identity";
import {
  PageHeader, Card, CardHead, DataTable, Toolbar, FilterDropdown, EmptyState, Btn, DevBadge,
  Pill, ProgressBar, MetricCard, type Column,
} from "./ui";
import { PlatformPage, Tabs, ConnectionStatus } from "./platform";
import { MetricsRow, StatePill } from "./branches";
import {
  MOCK_PLATFORM_ROLE, CampaignsPage, OffersPage, ContentPage, MediaPage,
} from "./pages";
import { EventsPage, OpportunitiesPage, AdsPage } from "./branches";
import { StudioPage } from "./studio";
import {
  MobileHomePage, MobilePublicationsPage, MobileNotificationsPage, MobileUsersPage,
  MobileReleasesPage, MobileAnalyticsPage, MobileSettingsPage,
} from "./mobile";
import { devCompanies, devUsers, type DevCompany, type DevUser } from "../data/seed";
import { deriveActivity } from "../data/os-seed";
import { devPublications, type DevPublication } from "../data/mobile-seed";

const num = <T,>(rows: T[], p: (r: T) => boolean) => rows.filter(p).length;
const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])];
const opt = (xs: string[], all = "Todos") => [{ value: "all", label: all }, ...xs.map((x) => ({ value: x, label: x }))];
const planLabel = (p: string) => ({ "business.free": "Free", "business.starter": "Starter", "business.growth": "Growth", "business.pro": "Pro" }[p] ?? p);

/* ================================================================ Publicaciones */
export function PublicationsPage() {
  const cols: Column<DevPublication>[] = [
    { key: "t", header: "Publicación", render: (p) => <span style={{ fontWeight: 600 }}>{p.title}</span> },
    { key: "k", header: "Tipo", render: (p) => <Pill tone="brand">{p.kind}</Pill> },
    { key: "c", header: "País", render: (p) => p.country },
    { key: "a", header: "Audiencia", render: (p) => p.audience },
    { key: "s", header: "Estado", render: (p) => <StatePill status={p.status} /> },
    { key: "d", header: "Fecha", render: (p) => p.date },
  ];
  return (
    <div>
      <PageHeader title="Publicaciones" description="El admin revisa y publica información al ecosistema. Aquí se controla la cola de publicación (eventos y oportunidades) y lo ya publicado a Mobile." actions={<DevBadge />} />
      <Tabs tabs={[
        { id: "queue", label: "Cola de publicación", render: () => <EventsPage /> },
        { id: "opps", label: "Oportunidades", render: () => <OpportunitiesPage /> },
        { id: "published", label: "Publicado a Mobile", render: () => (
          <div>
            <MetricsRow>
              <MetricCard label="Publicadas" value={num(devPublications, (p) => p.status === "publicado")} tone="success" trend="none" />
              <MetricCard label="Programadas" value={num(devPublications, (p) => p.status === "programado")} tone="info" trend="none" />
              <MetricCard label="Borradores" value={num(devPublications, (p) => p.status === "borrador")} tone="warning" trend="none" />
              <MetricCard label="Alcance" value={null} tone="magenta" foot="Sin fuente de medición" />
            </MetricsRow>
            <DataTable rows={devPublications} columns={cols} empty="Sin publicaciones" />
          </div>
        ) },
      ]} />
    </div>
  );
}

/* ================================================================ Empresas */
export function CompaniesPage() {
  const [plan, setPlan] = useState("all");
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const rows = devCompanies.filter((c) => (plan === "all" || c.plan === plan) && (status === "all" || c.status === status) && (country === "all" || c.country === country));
  const cols: Column<DevCompany>[] = [
    { key: "n", header: "Empresa", render: (c) => <span style={{ fontWeight: 600 }}>{c.name}</span> },
    { key: "p", header: "Plan", render: (c) => <Pill tone="brand">{planLabel(c.plan)}</Pill> },
    { key: "c", header: "País", render: (c) => c.country },
    { key: "i", header: "Industria", render: (c) => c.industry },
    { key: "s", header: "Estado", render: (c) => <StatePill status={c.status} /> },
    { key: "r", header: "Registro", render: (c) => c.registeredAt },
    { key: "iss", header: "Incidencias", render: (c) => (c.openIssues ? <span style={{ color: "var(--danger)" }}>{c.openIssues}</span> : "0") },
    { key: "rk", header: "Riesgo", width: 110, render: (c) => <ProgressBar value={Math.round(c.riskScore * 100)} tone={c.riskScore > 0.6 ? "danger" : c.riskScore > 0.3 ? "warning" : "success"} /> },
  ];
  return (
    <div>
      <PageHeader title="Empresas" description="Supervisión global de empresas cliente (tenants de Eventra Business). El admin observa estado, plan, riesgo e incidencias — no gestiona el contenido privado de cada empresa." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Total" value={devCompanies.length} tone="brand" trend="none" />
        <MetricCard label="Activas" value={num(devCompanies, (c) => c.status === "active")} tone="success" trend="none" />
        <MetricCard label="En trial" value={num(devCompanies, (c) => c.status === "trial")} tone="info" trend="none" />
        <MetricCard label="Suspendidas" value={num(devCompanies, (c) => c.status === "suspended")} tone="danger" trend="none" />
        <MetricCard label="Ingresos" value={null} tone="magenta" foot="Sin billing conectado" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Plan" value={plan} options={opt(uniq(devCompanies.map((c) => c.plan)).map((p) => p), "Todos")} onChange={setPlan} />
        <FilterDropdown label="País" value={country} options={opt(uniq(devCompanies.map((c) => c.country)))} onChange={setCountry} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devCompanies.map((c) => c.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay empresas con estos filtros" />
    </div>
  );
}

/* ================================================================ Usuarios */
export function UsersPage() {
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const companyName = (id: string) => devCompanies.find((c) => c.id === id)?.name ?? id;
  const rows = devUsers.filter((u) => (role === "all" || u.role === role) && (status === "all" || u.status === status));
  const cols: Column<DevUser>[] = [
    { key: "n", header: "Usuario", render: (u) => <span style={{ fontWeight: 600 }}>{u.name}</span> },
    { key: "co", header: "Empresa", render: (u) => companyName(u.companyId) },
    { key: "r", header: "Rol", render: (u) => <Pill tone="neutral">{u.role}</Pill> },
    { key: "s", header: "Estado", render: (u) => <StatePill status={u.status} /> },
    { key: "la", header: "Último acceso", render: (u) => u.lastActiveAt.slice(0, 10) },
  ];
  return (
    <div>
      <PageHeader title="Usuarios" description="Usuarios de empresas cliente (miembros de tenants Business). Supervisión de rol, estado y actividad. Los usuarios de la app móvil se miden en Mobile Operations." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Total" value={devUsers.length} tone="brand" trend="none" />
        <MetricCard label="Activos" value={num(devUsers, (u) => u.status === "active")} tone="success" trend="none" />
        <MetricCard label="Invitados" value={num(devUsers, (u) => u.status === "invited")} tone="info" trend="none" />
        <MetricCard label="Deshabilitados" value={num(devUsers, (u) => u.status === "disabled")} tone="neutral" trend="none" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Rol" value={role} options={opt(uniq(devUsers.map((u) => u.role)))} onChange={setRole} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devUsers.map((u) => u.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay usuarios con estos filtros" />
    </div>
  );
}

/* ================================================================ Alertas */
export function AlertsPage() {
  const alerts = deriveActivity();
  return (
    <div>
      <PageHeader title="Alertas del sistema" description="Alertas derivadas de estados reales de los fixtures (fuentes caídas, jobs fallidos, campañas atrasadas, empresas suspendidas). No es una lista escrita a mano — se deriva del estado." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Alertas activas" value={alerts.length} tone={alerts.length ? "danger" : "success"} trend="none" />
        <MetricCard label="Críticas" value={num(alerts, (a) => a.tone === "danger")} tone="danger" trend="none" />
        <MetricCard label="Advertencias" value={num(alerts, (a) => a.tone === "warning")} tone="warning" trend="none" />
      </MetricsRow>
      <Card>
        <CardHead title="Alertas" />
        <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.length === 0 ? <EmptyState title="Sin alertas" /> : alerts.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <Pill tone={a.tone === "danger" ? "danger" : a.tone === "warning" ? "warning" : "neutral"} dot>{a.tone === "danger" ? "crítica" : "aviso"}</Pill>
                <span style={{ color: "var(--text-primary)", fontSize: 13 }}>{a.title}</span>
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.when}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ================================================================ Parámetros */
type Param = { label: string; value: string; tone?: "success" | "info" | "warning" | "neutral" | "brand" };
const PARAM_SECTIONS: { group: string; items: Param[] }[] = [
  { group: "Scoring y oportunidades", items: [
    { label: "Pesos de scoring (relevancia, alcance, potencial…)", value: "Config por defecto", tone: "info" },
    { label: "Umbral de publicación de oportunidades", value: "Score ≥ 60", tone: "brand" },
    { label: "Revisión manual obligatoria", value: "Activada", tone: "success" },
  ] },
  { group: "Importancia y confiabilidad", items: [
    { label: "Escala de importancia", value: "alta · media · baja", tone: "neutral" },
    { label: "Confiabilidad mínima para auto-verificar", value: "No activada", tone: "warning" },
  ] },
  { group: "Planes y trial", items: [
    { label: "Fuente de verdad de planes", value: "@eventra/config", tone: "success" },
    { label: "Duración de trial (planes pagados)", value: "45 días", tone: "brand" },
    { label: "Planes activos", value: "Free · Starter · Growth · Pro", tone: "info" },
  ] },
  { group: "Publicaciones y anuncios", items: [
    { label: "Publicación automática", value: "Desactivada", tone: "neutral" },
    { label: "Tipos de anuncio habilitados", value: "banner · popup · liquid · email · social", tone: "info" },
  ] },
  { group: "Métricas, fórmulas y atribución", items: [
    { label: "Modelo de atribución", value: "No configurado", tone: "warning" },
    { label: "Convención de periodo", value: "D / M / A", tone: "brand" },
    { label: "Cálculo de PB", value: "No disponible (integración futura)", tone: "neutral" },
  ] },
  { group: "Países, canales y fuentes", items: [
    { label: "Países activos", value: "US · CA · GB", tone: "info" },
    { label: "Canales", value: "Storefront · Email · Social · Web", tone: "neutral" },
    { label: "Fuentes globales", value: "5 configuradas (2 con incidencia)", tone: "warning" },
  ] },
  { group: "Comportamiento de productos", items: [
    { label: "Eventra Business", value: "Ver Operaciones · Business", tone: "brand" },
    { label: "Eventra Mobile", value: "Ver Operaciones · Mobile", tone: "brand" },
  ] },
  { group: "Feature flags", items: [
    { label: "Métricas en vivo", value: "Off (sin fuente)", tone: "neutral" },
    { label: "Publicación a Mobile", value: "Manual", tone: "info" },
    { label: "IA y modelos", value: "Off", tone: "neutral" },
  ] },
];
export function ParametersPage() {
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.settingsManage);
  return (
    <div>
      <PageHeader title="Parámetros" description="Parámetros globales de la plataforma — la única fuente de verdad. Business y Mobile solo consumen esta configuración. Edición mock (sin mutación real), gateada por permiso." actions={<DevBadge />} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16, alignItems: "start" }}>
        {PARAM_SECTIONS.map((sec) => (
          <Card key={sec.group}>
            <CardHead title={sec.group} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sec.items.map((it, i) => (
                <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "11px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                  <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{it.label}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, flex: "none" }}>
                    <Pill tone={it.tone ?? "neutral"}>{it.value}</Pill>
                    <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso settings:manage"}>Editar</Btn>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================ Eventra Business (ops) */
export function BusinessOpsPage() {
  const activeByStatus = (s: string) => num(devCompanies, (c) => c.status === s);
  return (
    <div>
      <PageHeader title="Eventra Business" description="Operaciones y supervisión del producto para empresas. El admin observa (campañas, ofertas, anuncios, estudio, contenido) — la creación diaria vive en la app del cliente." actions={<DevBadge />} />
      <Tabs tabs={[
        { id: "resume", label: "Resumen", render: () => (
          <div>
            <MetricsRow>
              <MetricCard label="Empresas activas" value={activeByStatus("active")} tone="success" trend="none" />
              <MetricCard label="En trial" value={activeByStatus("trial")} tone="info" trend="none" />
              <MetricCard label="Suspendidas" value={activeByStatus("suspended")} tone="danger" trend="none" />
              <MetricCard label="Uso por plan" value={null} tone="brand" foot="Ver Métricas Business" />
              <MetricCard label="Ingresos" value={null} tone="magenta" foot="Sin billing conectado" />
            </MetricsRow>
            <Card><div className="eos-card-pad"><EmptyState title="Supervisión de producto" hint="Campañas, ofertas, anuncios, estudio y contenido en las pestañas. Las cifras medidas viven en Métricas Business." /></div></Card>
          </div>
        ) },
        { id: "campaigns", label: "Campañas", render: () => <CampaignsPage /> },
        { id: "offers", label: "Tipos de oferta", render: () => <OffersPage /> },
        { id: "ads", label: "Anuncios", render: () => <AdsPage /> },
        { id: "studio", label: "Estudio y constructor", render: () => <StudioPage /> },
        { id: "content", label: "Contenido", render: () => <ContentPage /> },
        { id: "media", label: "Recursos", render: () => <MediaPage /> },
      ]} />
    </div>
  );
}

/* ================================================================ Eventra Mobile (ops) */
export function MobileOpsPage() {
  return (
    <div>
      <PageHeader title="Eventra Mobile" description="Centro de administración de Eventra Mobile (apps/consumer) desde la PC. No es una 4ª app. Publicaciones, notificaciones, usuarios, versiones, analítica y configuración." actions={<DevBadge />} />
      <Tabs tabs={[
        { id: "resume", label: "Resumen", render: () => <MobileHomePage /> },
        { id: "pubs", label: "Publicaciones", render: () => <MobilePublicationsPage /> },
        { id: "push", label: "Notificaciones", render: () => <MobileNotificationsPage /> },
        { id: "users", label: "Usuarios", render: () => <MobileUsersPage /> },
        { id: "releases", label: "Versiones", render: () => <MobileReleasesPage /> },
        { id: "analytics", label: "Analítica", render: () => <MobileAnalyticsPage /> },
        { id: "settings", label: "Configuración", render: () => <MobileSettingsPage /> },
      ]} />
    </div>
  );
}

/* ================================================================ IA y modelos */
export function AiModelsPage() {
  return (
    <PlatformPage
      title="IA y modelos"
      description="Modelos de IA de la plataforma: generación de contenido, scoring asistido, clasificación de eventos y recomendaciones. Configuración y estado global — solo el Internal OS los define."
      source="Proveedor de modelos + registro de uso (pendiente de conectar)"
      state="disconnected"
      nextAction="Conectar proveedor de modelos y definir feature flags en Parámetros"
      priority="Prioridad futura · Producto"
    />
  );
}

/* ================================================================ Versiones y publicaciones */
export function ReleasesPage() {
  return (
    <div>
      <PageHeader title="Versiones y publicaciones" description="Versiones de las aplicaciones (Mobile PWA/Android/iOS) y publicaciones de plataforma. Sin despliegue real todavía." actions={<DevBadge />} />
      <Tabs tabs={[
        { id: "releases", label: "Versiones", render: () => <MobileReleasesPage /> },
        { id: "pubs", label: "Publicaciones", render: () => <PublicationsPage /> },
      ]} />
    </div>
  );
}

/* ================================================================ Auditoría */
export function AuditPage() {
  const canRead = platformCan(MOCK_PLATFORM_ROLE, PP.auditRead);
  return (
    <PlatformPage
      title="Auditoría"
      description="Registro de cada escritura administrativa: actor, acción, antes/después, marca de tiempo, request-id. Deny-by-default; requiere permiso audit:read."
      source="Log de auditoría de plataforma (pendiente de persistir)"
      state="disconnected"
      nextAction={canRead ? "Persistir eventos de auditoría en Supabase y exponerlos aquí" : "Requiere permiso audit:read"}
      priority="Prioridad 8 · Control"
    >
      <Card>
        <CardHead title="Eventos de auditoría" action={<ConnectionStatus state="disconnected" />} />
        <div className="eos-card-pad">
          <EmptyState title="Sin eventos de auditoría" hint="Columnas previstas: actor · acción · recurso · antes → después · fecha · request-id. Se llenará cuando se persistan las escrituras administrativas." />
        </div>
      </Card>
    </PlatformPage>
  );
}

/* ================================================================ Salud del sistema */
type Service = { name: string; state: "connected" | "pending" | "disconnected"; detail: string };
const SERVICES: Service[] = [
  { name: "Base de datos (Supabase)", state: "connected", detail: "Proyecto eventra · RLS validado · migraciones 0001-0006" },
  { name: "Business (Railway)", state: "pending", detail: "Despliegue pendiente de acceso" },
  { name: "Shopify App", state: "pending", detail: "Instalación en Partner pendiente" },
  { name: "API service", state: "disconnected", detail: "Solo contratos (services/api)" },
  { name: "Workers", state: "disconnected", detail: "Solo contratos (services/workers)" },
  { name: "Mobile PWA", state: "connected", detail: "Service worker + manifest presentes" },
];
export function HealthPage() {
  return (
    <div>
      <PageHeader title="Salud del sistema" description="Estado de servicios, entornos y colas de Eventra. Estados honestos según lo realmente disponible — no se simula 'todo verde'." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Conectados" value={num(SERVICES, (s) => s.state === "connected")} tone="success" trend="none" />
        <MetricCard label="Pendientes" value={num(SERVICES, (s) => s.state === "pending")} tone="warning" trend="none" />
        <MetricCard label="No conectados" value={num(SERVICES, (s) => s.state === "disconnected")} tone="neutral" trend="none" />
        <MetricCard label="Incidencias" value={null} tone="magenta" foot="Sin monitor conectado" />
      </MetricsRow>
      <Card>
        <CardHead title="Servicios" />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {SERVICES.map((s, i) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.detail}</div>
              </div>
              <ConnectionStatus state={s.state} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
