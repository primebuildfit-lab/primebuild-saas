/**
 * Internal OS — Mobile Operations. Administered from apps/admin (the PC console),
 * NEVER a fourth app: this is where Eventra Mobile (apps/consumer) is operated —
 * publications, push, users, releases, analytics and settings.
 *
 * Structure fixtures (publications/push/releases) are badged DEV. Real MEASURED
 * OUTCOMES — active users, retention, delivery/open rate, screen usage — have no
 * live source yet and render as honest empty states, never fabricated numbers.
 */
import { useState } from "react";
import { platformCan, PLATFORM_PERMISSIONS as PP } from "@eventra/identity";
import {
  PageHeader, MetricCard, DataTable, Toolbar, FilterDropdown, EmptyState, Btn, DevBadge,
  Pill, Card, CardHead, ProgressBar, type Column,
} from "./ui";
import { MOCK_PLATFORM_ROLE } from "./pages";
import { MetricsRow, StatePill } from "./branches";
import {
  devPublications, devPush, devReleases,
  type DevPublication, type DevPush, type DevRelease,
} from "../data/mobile-seed";

const num = <T,>(rows: T[], pred: (r: T) => boolean) => rows.filter(pred).length;
const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])];
const opt = (xs: string[], allLabel = "Todos") => [{ value: "all", label: allLabel }, ...xs.map((x) => ({ value: x, label: x }))];

/* ================================================================ Resumen móvil */
export function MobileHomePage() {
  const prod = devReleases.find((r) => r.status === "producción");
  const pubCols: Column<DevPublication>[] = [
    { key: "t", header: "Publicación", render: (p) => <span style={{ fontWeight: 600 }}>{p.title}</span> },
    { key: "k", header: "Tipo", render: (p) => <Pill tone="brand">{p.kind}</Pill> },
    { key: "c", header: "País", render: (p) => p.country },
    { key: "s", header: "Estado", render: (p) => <StatePill status={p.status} /> },
    { key: "d", header: "Fecha", render: (p) => p.date },
  ];
  return (
    <div>
      <PageHeader title="Resumen móvil" description="Estado de Eventra Mobile (apps/consumer) administrado desde el Internal OS. La app es una PWA instalable; Android/iOS se empaquetan desde Versiones." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Publicaciones activas" value={num(devPublications, (p) => p.status === "publicado")} tone="success" trend="none" />
        <MetricCard label="Push enviadas" value={num(devPush, (p) => p.status === "enviada")} tone="info" trend="none" />
        <MetricCard label="Versión en producción" value={prod ? `${prod.platform} ${prod.version}` : "—"} tone="brand" trend="none" />
        <MetricCard label="Usuarios activos" value={null} tone="magenta" foot="Sin fuente de medición" />
        <MetricCard label="Retención 30 d" value={null} tone="warning" foot="Sin fuente de medición" />
      </MetricsRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
        <Card>
          <CardHead title="Últimas publicaciones" />
          <div style={{ padding: "0 2px 2px" }}><DataTable rows={devPublications.slice(0, 5)} columns={pubCols} /></div>
        </Card>
        <Card>
          <CardHead title="Versiones" />
          <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {devReleases.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 13 }}><Pill tone="neutral">{r.platform}</Pill> <span style={{ marginLeft: 6, color: "var(--text-primary)" }}>{r.version}</span></span>
                <StatePill status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================ Publicaciones */
const PUB_KINDS = ["evento", "oportunidad", "noticia", "contenido", "destacado"];
export function MobilePublicationsPage() {
  const [kind, setKind] = useState("all");
  const [country, setCountry] = useState("all");
  const [status, setStatus] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.offersWrite);

  const rows = devPublications.filter((p) => (kind === "all" || p.kind === kind) && (country === "all" || p.country === country) && (status === "all" || p.status === status));
  const cols: Column<DevPublication>[] = [
    { key: "t", header: "Publicación", render: (p) => <span style={{ fontWeight: 600 }}>{p.title}</span> },
    { key: "k", header: "Tipo", render: (p) => <Pill tone="brand">{p.kind}</Pill> },
    { key: "c", header: "País", render: (p) => p.country },
    { key: "a", header: "Audiencia", render: (p) => p.audience },
    { key: "s", header: "Estado", render: (p) => <StatePill status={p.status} /> },
    { key: "d", header: "Fecha", render: (p) => p.date },
    { key: "act", header: "", render: () => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso"}>···</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Publicaciones" description="Qué se publica a los usuarios de la app móvil: eventos, oportunidades, noticias y contenido destacado. El Internal OS controla la visibilidad; Mobile solo consume." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Nueva publicación</Btn></>} />
      <MetricsRow>
        <MetricCard label="Publicadas" value={num(devPublications, (p) => p.status === "publicado")} tone="success" trend="none" />
        <MetricCard label="Programadas" value={num(devPublications, (p) => p.status === "programado")} tone="info" trend="none" />
        <MetricCard label="Borradores" value={num(devPublications, (p) => p.status === "borrador")} tone="warning" trend="none" />
        <MetricCard label="Alcance" value={null} tone="magenta" foot="Sin fuente de medición" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Tipo" value={kind} options={opt(PUB_KINDS)} onChange={setKind} />
        <FilterDropdown label="País" value={country} options={opt(uniq(devPublications.map((p) => p.country)), "Todos")} onChange={setCountry} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devPublications.map((p) => p.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay publicaciones con estos filtros" />
    </div>
  );
}

/* ================================================================ Notificaciones */
export function MobileNotificationsPage() {
  const [status, setStatus] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.offersWrite);

  const rows = devPush.filter((p) => status === "all" || p.status === status);
  const cols: Column<DevPush>[] = [
    { key: "t", header: "Notificación", render: (p) => <div><div style={{ fontWeight: 600 }}>{p.title}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.body}</div></div> },
    { key: "seg", header: "Segmento", render: (p) => p.segment },
    { key: "s", header: "Estado", render: (p) => <StatePill status={p.status} /> },
    { key: "d", header: "Programada", render: (p) => p.scheduledFor },
    { key: "act", header: "", render: () => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso"}>···</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Notificaciones push" description="Notificaciones push a la app móvil. Las tasas de entrega y apertura requieren un proveedor real conectado — hasta entonces se muestran como estado vacío honesto." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Nueva notificación</Btn></>} />
      <MetricsRow>
        <MetricCard label="Enviadas" value={num(devPush, (p) => p.status === "enviada")} tone="success" trend="none" />
        <MetricCard label="Programadas" value={num(devPush, (p) => p.status === "programada")} tone="info" trend="none" />
        <MetricCard label="Borradores" value={num(devPush, (p) => p.status === "borrador")} tone="warning" trend="none" />
        <MetricCard label="Tasa de entrega" value={null} tone="brand" foot="Sin proveedor conectado" />
        <MetricCard label="Tasa de apertura" value={null} tone="magenta" foot="Sin proveedor conectado" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devPush.map((p) => p.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay notificaciones con estos filtros" />
    </div>
  );
}

/* ================================================================ Usuarios móviles */
export function MobileUsersPage() {
  return (
    <div>
      <PageHeader title="Usuarios móviles" description="Usuarios de la app móvil, siempre en AGREGADO y respetando la privacidad. No existe todavía una fuente de analítica de usuarios conectada, así que las métricas se muestran como estado vacío honesto — nunca inventadas." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Usuarios totales" value={null} foot="Sin fuente de medición" />
        <MetricCard label="Activos (30 d)" value={null} foot="Sin fuente de medición" />
        <MetricCard label="Nuevos (30 d)" value={null} foot="Sin fuente de medición" />
        <MetricCard label="Retención" value={null} foot="Sin fuente de medición" />
      </MetricsRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHead title="Por país" sub="Agregado, con privacidad" />
          <div className="eos-card-pad"><EmptyState title="Sin datos de usuarios" hint="Se conectará cuando exista analítica de la app móvil con consentimiento." /></div>
        </Card>
        <Card>
          <CardHead title="Por versión" sub="Distribución de instalaciones" />
          <div className="eos-card-pad"><EmptyState title="Sin datos de instalaciones" hint="Requiere telemetría de versión desde la PWA / stores." /></div>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================ Versiones */
export function MobileReleasesPage() {
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.integrationsManage);

  const rows = devReleases.filter((r) => (platform === "all" || r.platform === platform) && (status === "all" || r.status === status));
  const cols: Column<DevRelease>[] = [
    { key: "v", header: "Versión", render: (r) => <span style={{ fontWeight: 600 }}>{r.version}</span> },
    { key: "p", header: "Plataforma", render: (r) => <Pill tone="neutral">{r.platform}</Pill> },
    { key: "s", header: "Estado", render: (r) => <StatePill status={r.status} /> },
    { key: "d", header: "Fecha", render: (r) => r.date },
    { key: "n", header: "Notas", render: (r) => <span style={{ color: "var(--text-secondary)" }}>{r.notes}</span> },
    { key: "act", header: "", render: () => <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso"}>···</Btn> },
  ];
  return (
    <div>
      <PageHeader title="Versiones" description="Versiones y despliegues de Eventra Mobile: la PWA es la base instalable; Android (TWA) e iOS (wrapper) se empaquetan desde aquí. Sin deploy real todavía." actions={<><DevBadge /><Btn tone="primary" disabled={!canWrite}>Nueva versión</Btn></>} />
      <MetricsRow>
        <MetricCard label="En producción" value={num(devReleases, (r) => r.status === "producción")} tone="success" trend="none" />
        <MetricCard label="En beta" value={num(devReleases, (r) => r.status === "beta")} tone="info" trend="none" />
        <MetricCard label="En desarrollo" value={num(devReleases, (r) => r.status === "desarrollo")} tone="warning" trend="none" />
        <MetricCard label="Plataformas" value={uniq(devReleases.map((r) => r.platform)).length} tone="brand" trend="none" />
      </MetricsRow>
      <Toolbar>
        <FilterDropdown label="Plataforma" value={platform} options={opt(uniq(devReleases.map((r) => r.platform)))} onChange={setPlatform} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(devReleases.map((r) => r.status)))} onChange={setStatus} />
      </Toolbar>
      <DataTable rows={rows} columns={cols} empty="No hay versiones con estos filtros" />
    </div>
  );
}

/* ================================================================ Analítica móvil */
export function MobileAnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analítica móvil" description="Retención, pantallas más vistas, sesiones y uso de la app móvil. Estas son MÉTRICAS MEDIDAS: sin una fuente de telemetría conectada se muestran como estado vacío honesto, nunca inventadas." actions={<DevBadge />} />
      <MetricsRow>
        <MetricCard label="Sesiones (30 d)" value={null} foot="Sin telemetría conectada" />
        <MetricCard label="Duración media" value={null} foot="Sin telemetría conectada" />
        <MetricCard label="Retención D7" value={null} foot="Sin telemetría conectada" />
        <MetricCard label="Crash-free" value={null} foot="Sin telemetría conectada" />
      </MetricsRow>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <CardHead title="Pantallas más vistas" />
          <div className="eos-card-pad"><EmptyState title="Sin datos de pantallas" hint="Requiere eventos de navegación desde la app." /></div>
        </Card>
        <Card>
          <CardHead title="Retención por cohorte" />
          <div className="eos-card-pad"><EmptyState title="Sin datos de cohortes" hint="Se calculará cuando exista telemetría con consentimiento." /></div>
        </Card>
      </div>
    </div>
  );
}

/* ================================================================ Configuración móvil */
type MobileSetting = { label: string; value: string; tone?: "success" | "info" | "warning" | "neutral" | "brand"; note?: string };
const MOBILE_SETTINGS: { group: string; items: MobileSetting[] }[] = [
  {
    group: "Publicación",
    items: [
      { label: "Publicación automática de eventos verificados", value: "Desactivada", tone: "neutral", note: "Los eventos se publican manualmente por ahora" },
      { label: "Países visibles en la app", value: "US · CA · GB", tone: "info", note: "Derivado de Países (Internal OS)" },
      { label: "Idioma por defecto", value: "es-ES", tone: "brand" },
    ],
  },
  {
    group: "Notificaciones",
    items: [
      { label: "Proveedor push", value: "No configurado", tone: "warning", note: "Se conecta en Integraciones" },
      { label: "Ventana horaria de envío", value: "09:00–20:00 (local)", tone: "info" },
    ],
  },
  {
    group: "App",
    items: [
      { label: "Modo offline", value: "Activado", tone: "success", note: "Service worker en la PWA" },
      { label: "Instalación (PWA)", value: "Disponible", tone: "success" },
      { label: "Android / iOS", value: "En preparación", tone: "warning", note: "Ver Versiones" },
    ],
  },
];
export function MobileSettingsPage() {
  const canWrite = platformCan(MOCK_PLATFORM_ROLE, PP.settingsManage);
  return (
    <div>
      <PageHeader title="Configuración móvil" description="Parámetros y comportamiento de Eventra Mobile. Estos valores son la fuente de verdad del Internal OS; la app móvil solo los consume. Edición mock (sin mutación real)." actions={<DevBadge />} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {MOBILE_SETTINGS.map((sec) => (
          <Card key={sec.group}>
            <CardHead title={sec.group} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {sec.items.map((it, i) => (
                <div key={it.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--border)" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: "var(--text-primary)", fontWeight: 500 }}>{it.label}</div>
                    {it.note ? <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{it.note}</div> : null}
                  </div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, flex: "none" }}>
                    <Pill tone={it.tone ?? "neutral"}>{it.value}</Pill>
                    <Btn tone="ghost" disabled={!canWrite} title={canWrite ? "Mock — sin mutación real" : "Requiere permiso"}>Editar</Btn>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
