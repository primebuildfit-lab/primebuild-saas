/**
 * Business Admin screens. Every screen reads REAL data through a provider and
 * renders an honest state (loading / not connected / error / empty) until the
 * central API exists — never fabricated rows. Structure (columns, filters, tabs)
 * matches the owner's spec so the skeleton is real; only the data source is gated.
 */
import { type ReactNode } from "react";
import { PageHeader, Metric, DataTable, StateBlock, SourceTag, FilterBar, Card, Pill } from "./ui";
import { useLoadState } from "./useLoadState";
import { UpdatesPanel } from "./updatesUi";
import type { LoadState } from "../data/live/types";
import type { OrderState, AdminMarketingItem } from "../data/live/types";
import {
  IconBuilding, IconStore, IconUsers, IconCart, IconCard, IconPlug, IconAlert,
} from "./icons";
import {
  resolveOverview, resolveCompanies, resolveStores, resolveMembers,
  resolveOrders, resolveSales, resolveMarketing, resolveSubscriptions,
  resolveIntegrations, resolveAlerts, resolveAudit,
} from "../data/live/providers";

/** Rows count from a LoadState array (0 unless ready). */
function rowsOf<T>(s: LoadState<T[]>): T[] {
  return s.kind === "ready" ? s.data : [];
}

/** Reusable monitoring screen: header + source tag + (state block OR real table). */
function Monitor<T>({
  title, subtitle, columns, filters, fetcher, mapRow, emptyTitle, footer,
}: {
  title: string;
  subtitle: string;
  columns: string[];
  filters?: string[];
  fetcher: () => Promise<LoadState<T[]>>;
  mapRow: (row: T) => ReactNode[];
  emptyTitle?: string;
  footer?: ReactNode;
}) {
  const { state } = useLoadState(fetcher);
  const rows = rowsOf(state);
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="toolbar">
        <SourceTag state={state} count={rows.length} />
        <div style={{ flex: 1 }} />
      </div>
      {filters && <FilterBar filters={filters} />}
      <StateBlock state={state} rows={rows.length} emptyTitle={emptyTitle} />
      {rows.length > 0 && <DataTable columns={columns} rows={rows.map(mapRow)} />}
      {footer}
    </>
  );
}

// ── Resumen (dashboard) ──────────────────────────────────────────────────────
export function OverviewPage() {
  const { state } = useLoadState(resolveOverview);
  const d = state.kind === "ready" ? state.data : null;
  const v = (n: number | null | undefined) => (state.kind === "ready" ? (n ?? null) : null);
  return (
    <>
      <PageHeader
        title="Resumen"
        subtitle="Panorama real de la plataforma comercial Eventra Business. Solo datos reales: mientras el backend no esté conectado, cada indicador muestra «Sin datos». Sin tiendas de ejemplo ni métricas simuladas."
      />
      <div className="toolbar"><SourceTag state={state} /></div>
      <div className="metric-grid">
        <Metric icon={<IconBuilding size={15} />} label="Empresas registradas" value={v(d?.companiesRegistered)} />
        <Metric label="Empresas activas" value={v(d?.companiesActive)} />
        <Metric label="Empresas suspendidas" value={v(d?.companiesSuspended)} />
        <Metric icon={<IconStore size={15} />} label="Tiendas conectadas" value={v(d?.storesConnected)} />
        <Metric label="Tiendas con errores" value={v(d?.storesWithErrors)} />
        <Metric icon={<IconCart size={15} />} label="Órdenes en vivo" value={v(d?.ordersLive)} />
        <Metric label="Órdenes realizadas" value={v(d?.ordersCompleted)} />
        <Metric label="Órdenes canceladas" value={v(d?.ordersCancelled)} />
        <Metric label="Reembolsos" value={v(d?.refunds)} />
        <Metric label="Ventas del periodo" value={v(d?.salesPeriod)} />
        <Metric label="Anuncios activos" value={v(d?.adsActive)} />
        <Metric label="Campañas activas" value={v(d?.campaignsActive)} />
        <Metric icon={<IconCard size={15} />} label="Suscripciones activas" value={v(d?.subscriptionsActive)} />
        <Metric label="Pagos pendientes" value={v(d?.paymentsPending)} />
        <Metric icon={<IconPlug size={15} />} label="Integraciones con errores" value={v(d?.integrationsWithErrors)} />
        <Metric icon={<IconAlert size={15} />} label="Alertas" value={v(d?.alerts)} />
        <Metric label="Incidencias" value={v(d?.incidents)} />
        <Metric label="Última sincronización" value={d?.lastSyncAt ?? null} />
      </div>
      <StateBlock state={state} rows={d ? 1 : 0}
        emptyTitle="No conectado"
        emptyHint="El panel mostrará indicadores reales cuando la API central esté disponible." />
    </>
  );
}

// ── Empresas ─────────────────────────────────────────────────────────────────
export function CompaniesPage() {
  return (
    <Monitor
      title="Empresas"
      subtitle="Supervisión global de las empresas cliente (tenants) que usan Eventra Business Client."
      filters={["País: todos", "Estado: todos", "Plan: todos"]}
      columns={["Nombre", "ID", "País", "Estado", "Plan", "Suscripción", "Propietario", "Miembros", "Tiendas", "Órdenes", "Ventas", "Campañas", "Integraciones", "Alertas", "Última actividad"]}
      fetcher={resolveCompanies}
      emptyTitle="Sin empresas conectadas"
      mapRow={(c) => [c.name, c.id, c.countryCode ?? "—", c.status, c.plan ?? "—", c.subscriptionStatus ?? "—", c.ownerEmail ?? "—", c.members ?? "—", c.stores ?? "—", c.orders ?? "—", c.sales ?? "—", c.campaigns ?? "—", c.integrations ?? "—", c.alerts ?? "—", c.lastActivityAt ?? "—"]}
    />
  );
}

// ── Tiendas ──────────────────────────────────────────────────────────────────
export function StoresPage() {
  return (
    <Monitor
      title="Tiendas"
      subtitle="Tiendas de comercio conectadas por las empresas cliente y su estado de sincronización."
      filters={["Plataforma: todas", "Estado: todos", "Conexión: todas"]}
      columns={["Nombre", "Dominio", "Plataforma", "Empresa", "País", "Moneda", "Estado", "Conexión", "Órdenes", "Ventas", "Productos", "Integraciones", "Última sync", "Errores"]}
      fetcher={resolveStores}
      emptyTitle="Sin tiendas conectadas"
      mapRow={(s) => [s.name, s.domain ?? "—", s.platform ?? "—", s.companyName ?? "—", s.countryCode ?? "—", s.currency ?? "—", s.status, s.connection, s.orders ?? "—", s.sales ?? "—", s.products ?? "—", s.integrations ?? "—", s.lastSyncAt ?? "—", s.errors ?? "—"]}
    />
  );
}

// ── Miembros ─────────────────────────────────────────────────────────────────
export function MembersPage() {
  return (
    <Monitor
      title="Miembros"
      subtitle="Miembros internos de las empresas cliente. Solo monitoreo — el panel nunca suplanta a un usuario de empresa."
      filters={["Empresa: todas", "Rol: todos", "Estado: todos"]}
      columns={["Nombre", "Email", "Empresa", "Rol", "Estado", "Última conexión"]}
      fetcher={resolveMembers}
      emptyTitle="Sin miembros conectados"
      mapRow={(m) => [m.name, m.email ?? "—", m.companyName ?? "—", m.role ?? "—", m.status ?? "—", m.lastSeenAt ?? "—"]}
    />
  );
}

// ── Órdenes ──────────────────────────────────────────────────────────────────
const ORDER_TITLES: Record<OrderState, string> = {
  LIVE: "Órdenes en vivo", COMPLETED: "Órdenes realizadas", CANCELLED: "Órdenes canceladas",
  REFUNDED: "Reembolsos", FAILED: "Órdenes fallidas", PARTIAL: "Órdenes parciales",
};
export function OrdersPage({ state: orderState }: { state: OrderState }) {
  return (
    <Monitor
      key={orderState}
      title={ORDER_TITLES[orderState]}
      subtitle="Órdenes de las tiendas cliente (monitoreo). El panel administrativo NO crea órdenes."
      filters={["Empresa", "Tienda", "País", "Fecha", "Estado", "Canal", "Método de pago"]}
      columns={["Orden", "Empresa", "Tienda", "Cliente", "Fecha", "Pago", "Fulfillment", "Total", "Moneda", "Canal", "Riesgo", "Errores"]}
      fetcher={() => resolveOrders(orderState)}
      emptyTitle={`Sin ${ORDER_TITLES[orderState].toLowerCase()}`}
      mapRow={(o) => [o.id, o.companyName ?? "—", o.storeName ?? "—", o.customer ?? "—", o.placedAt ?? "—", o.payment ?? "—", o.fulfillment ?? "—", o.total ?? "—", o.currency ?? "—", o.channel ?? "—", o.risk ?? "—", o.errors ?? "—"]}
    />
  );
}

// ── Ventas ───────────────────────────────────────────────────────────────────
export function SalesPage() {
  const { state } = useLoadState(resolveSales);
  const total = state.kind === "ready" ? state.data.periodTotal : null;
  return (
    <>
      <PageHeader title="Ventas" subtitle="Ventas agregadas del periodo, derivadas de órdenes reales de las tiendas cliente." />
      <div className="toolbar"><SourceTag state={state} /></div>
      <div className="metric-grid">
        <Metric label="Ventas del periodo" value={state.kind === "ready" ? total : null} />
        <Metric label="Órdenes del periodo" value={null} />
        <Metric label="Ticket promedio" value={null} />
        <Metric label="Reembolsos del periodo" value={null} />
      </div>
      <StateBlock state={state} rows={total !== null ? 1 : 0}
        emptyTitle="No conectado"
        emptyHint="Las ventas reales aparecerán cuando la API central esté disponible." />
    </>
  );
}

// ── Marketing (monitoreo) ────────────────────────────────────────────────────
const MK_TITLE: Record<AdminMarketingItem["kind"], string> = {
  advertisement: "Anuncios", campaign: "Campañas", offer: "Ofertas", content: "Contenido",
};
export function MarketingPage({ kind }: { kind: AdminMarketingItem["kind"] }) {
  return (
    <Monitor
      key={kind}
      title={MK_TITLE[kind]}
      subtitle="Monitoreo de marketing de las empresas cliente. Acciones permitidas: abrir detalle, revisar, bloquear, marcar incidencia, solicitar corrección. Sin creación comercial."
      filters={["Empresa", "Estado", "Canal", "Fecha"]}
      columns={["Nombre", "Empresa", "Estado", "Canal", "Presupuesto", "Conversiones", "Inicio", "Fin", "Errores"]}
      fetcher={() => resolveMarketing(kind)}
      emptyTitle={`Sin ${MK_TITLE[kind].toLowerCase()} para monitorear`}
      mapRow={(m) => [m.name, m.companyName ?? "—", m.status ?? "—", m.channel ?? "—", m.budget ?? "—", m.conversions ?? "—", m.startAt ?? "—", m.endAt ?? "—", m.errors ?? "—"]}
      footer={<p className="note">Este panel solo supervisa el marketing existente (abrir detalle, revisar, bloquear, marcar incidencia, solicitar corrección). La creación de anuncios, ofertas y promociones ocurre en Eventra Business Client, no aquí.</p>}
    />
  );
}
export function MarketingResultsPage() {
  const { state } = useLoadState(() => resolveMarketing("campaign"));
  return (
    <>
      <PageHeader title="Resultados" subtitle="Resultados y conversiones de marketing, derivados de datos reales. Sin métricas simuladas." />
      <div className="toolbar"><SourceTag state={state} /></div>
      <div className="metric-grid">
        <Metric label="Conversiones" value={null} />
        <Metric label="Presupuesto ejecutado" value={null} />
        <Metric label="Anuncios con errores" value={null} />
        <Metric label="Campañas activas" value={null} />
      </div>
      <StateBlock state={state} rows={0} emptyTitle="No conectado"
        emptyHint="Los resultados reales aparecerán cuando la API central esté disponible." />
    </>
  );
}

// ── Planes y suscripciones ───────────────────────────────────────────────────
export function SubscriptionsPage() {
  return (
    <Monitor
      title="Planes y suscripciones"
      subtitle="Vista administrativa de planes y suscripciones. El operador NO cambia de plan como cliente: cualquier cambio administrativo requiere permiso, motivo, confirmación y auditoría."
      filters={["Plan: todos", "Estado: todos"]}
      columns={["Empresa", "Plan", "Estado", "Inicio", "Renovación", "Uso", "Último pago", "Pago pendiente"]}
      fetcher={resolveSubscriptions}
      emptyTitle="Sin suscripciones conectadas"
      mapRow={(s) => [s.companyName ?? "—", s.plan ?? "—", s.status ?? "—", s.startedAt ?? "—", s.renewsAt ?? "—", s.usage ?? "—", s.lastPayment ?? "—", s.pendingPayment ?? "—"]}
      footer={<p className="note">Cambios administrativos de plan requieren: permiso · motivo · confirmación · persistencia · auditoría (disponible cuando el backend esté conectado).</p>}
    />
  );
}

// ── Integraciones ────────────────────────────────────────────────────────────
export function IntegrationsPage() {
  return (
    <Monitor
      title="Integraciones"
      subtitle="Integraciones configuradas por las empresas cliente y su estado real."
      filters={["Proveedor: todos", "Estado: todos"]}
      columns={["Empresa", "Proveedor", "Estado", "Última sync", "Errores"]}
      fetcher={resolveIntegrations}
      emptyTitle="Sin integraciones conectadas"
      mapRow={(i) => [i.companyName ?? "—", i.provider ?? "—", i.status ?? "—", i.lastSyncAt ?? "—", i.errors ?? "—"]}
    />
  );
}

// ── Alertas ──────────────────────────────────────────────────────────────────
export function AlertsPage() {
  return (
    <Monitor
      title="Alertas"
      subtitle="Alertas e incidencias derivadas del estado real del sistema y de las empresas. Sin alertas de ejemplo."
      filters={["Severidad: todas", "Estado: todos"]}
      columns={["Severidad", "Título", "Empresa", "Fuente", "Generada", "Estado"]}
      fetcher={resolveAlerts}
      emptyTitle="Sin alertas reales"
      mapRow={(a) => [<Pill key="s" tone={a.severity === "critical" ? "danger" : a.severity === "major" ? "warning" : "neutral"} dot>{a.severity}</Pill>, a.title, a.companyName ?? "—", a.source ?? "—", a.raisedAt ?? "—", a.status ?? "—"]}
    />
  );
}

// ── Soporte ──────────────────────────────────────────────────────────────────
export function SupportPage() {
  return (
    <>
      <PageHeader title="Soporte" subtitle="Cola de soporte y tickets de las empresas cliente (monitoreo)." />
      <Card><StateBlockNotConnected hint="La cola de soporte real aparecerá cuando el backend de soporte esté conectado." /></Card>
    </>
  );
}

// ── Salud del servicio ───────────────────────────────────────────────────────
export function HealthPage() {
  return (
    <>
      <PageHeader title="Salud del servicio" subtitle="Estado real de los servicios de plataforma y las sincronizaciones. Un servicio solo se reporta sano tras una verificación exitosa." />
      <div className="metric-grid">
        <Metric label="API central" value={null} />
        <Metric label="Workers" value={null} />
        <Metric label="Base de datos" value={null} />
        <Metric label="Sincronización de tiendas" value={null} />
      </div>
      <div style={{ marginTop: 14 }}>
        <StateBlockNotConnected hint="Sin verificaciones ejecutadas: los servicios se muestran como «Sin datos» hasta que existan probes reales." />
      </div>
    </>
  );
}

// ── Auditoría ────────────────────────────────────────────────────────────────
export function AuditPage() {
  return (
    <Monitor
      title="Auditoría"
      subtitle="Eventos de auditoría reales de las acciones administrativas. Sin eventos ficticios."
      filters={["Actor", "Acción", "Fecha"]}
      columns={["Fecha", "Actor", "Acción", "Objetivo", "Resultado"]}
      fetcher={resolveAudit}
      emptyTitle="Sin eventos de auditoría reales"
      mapRow={(e) => [e.at ?? "—", e.actor ?? "—", e.action ?? "—", e.target ?? "—", e.result ?? "—"]}
    />
  );
}

// ── Configuración ────────────────────────────────────────────────────────────
export function SettingsPage() {
  return (
    <>
      <PageHeader title="Configuración" subtitle="Configuración del panel administrativo (preferencias del operador, conexión a la API central, actualizaciones, permisos)." />
      <UpdatesPanel />
      <Card>
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          Conexión a la API central: <Pill tone="warning" dot>No configurada</Pill>
        </p>
        <p className="note">
          Define <code>VITE_BUSINESS_API_URL</code> y la sesión de operador para activar los datos reales.
          Ninguna configuración crea recursos ni escribe datos hasta que el backend esté disponible.
        </p>
      </Card>
    </>
  );
}

/** Shared "not connected" block for the few non-tabular screens. */
function StateBlockNotConnected({ hint }: { hint: string }) {
  return (
    <StateBlock
      state={{ kind: "not_connected", reason: hint }}
      rows={0}
    />
  );
}
