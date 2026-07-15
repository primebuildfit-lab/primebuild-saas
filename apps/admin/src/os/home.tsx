/**
 * Internal OS — Inicio (platform dashboard). Answers "¿Cómo está la plataforma
 * Eventra hoy?" — NOT a company's marketing overview (that is Eventra Business).
 *
 * Data discipline:
 *   - Structural counts (empresas, publicaciones, países, fuentes, alertas) come
 *     from clearly-badged DEV fixtures.
 *   - MEASURED outcomes (visitas, ingresos, membresías, Mobile vs Business) have
 *     no live source → honest empty states ("Sin datos"), never fabricated.
 *   - Trends show "Sin comparación" (no historical series exists).
 */
import { useNavigate } from "react-router";
import {
  PageHeader, MetricCard, Card, CardHead, ChartCard, Donut, ActivityFeed, EmptyState,
  DevBadge, Pill, type ActivityItem,
} from "./ui";
import { IconSmartphone, IconCard, IconClock, IconWallet, IconSend, IconAlert, IconRss, IconGlobe } from "./icons";
import { deriveActivity } from "../data/os-seed";
import { devCompanies } from "../data/seed";
import { devCountries } from "../data/global-seed";
import { devPublications } from "../data/mobile-seed";
import { devSources } from "../data/seed";

const PRINCIPAL_FIRST_NAME = "Brian";
const planLabel = (p: string) => ({ "business.free": "Free", "business.starter": "Starter", "business.growth": "Growth", "business.pro": "Pro" }[p] ?? p);

export function HomePage() {
  const navigate = useNavigate();

  // ── Structural counts (real fixtures) ──
  const activeCompanies = devCompanies.filter((c) => c.status === "active").length;
  const trials = devCompanies.filter((c) => c.status === "trial").length;
  const activePubs = devPublications.filter((p) => p.status === "publicado").length;
  const pendingPubs = devPublications.filter((p) => p.status === "borrador" || p.status === "programado");
  const badSources = devSources.filter((s) => s.status === "degraded" || s.status === "down");
  const activeCountries = devCountries.filter((c) => c.status === "activo");
  const alerts = deriveActivity();
  const activity: ActivityItem[] = alerts.map((a) => ({ id: a.id, title: a.title, desc: a.desc, when: a.when, tone: a.tone }));
  const planCounts = ["business.free", "business.starter", "business.growth", "business.pro"].map((p) => ({ plan: planLabel(p), n: devCompanies.filter((c) => c.plan === p).length }));

  return (
    <div>
      <PageHeader
        title={<>Bienvenido, {PRINCIPAL_FIRST_NAME} <span aria-hidden>👋</span></>}
        description="Estado y métricas de la plataforma Eventra (Mobile + Business + operación)."
        actions={<DevBadge />}
      />

      {/* Row 1 — platform metrics */}
      <div className="eos-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        <MetricCard label="Visitas Mobile" value={null} tone="info" icon={<IconSmartphone size={22} />} foot="Sin analítica conectada" />
        <MetricCard label="Empresas activas" value={activeCompanies} tone="success" icon={<IconCard size={22} />} trend={null} />
        <MetricCard label="Trials activos" value={trials} tone="warning" icon={<IconClock size={22} />} trend={null} />
        <MetricCard label="Ingresos totales" value={null} tone="brand" icon={<IconWallet size={22} />} foot="Sin billing conectado" />
      </div>
      {/* Row 2 — platform metrics */}
      <div className="eos-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
        <MetricCard label="Membresías Mobile" value={null} tone="magenta" foot="Sin billing conectado" />
        <MetricCard label="Membresías Business" value={null} tone="magenta" foot="Sin billing conectado" />
        <MetricCard label="Publicaciones activas" value={activePubs} tone="success" icon={<IconSend size={22} />} trend={null} />
        <MetricCard label="Alertas del sistema" value={alerts.length} tone={alerts.length ? "danger" : "success"} icon={<IconAlert size={22} />} trend={null} />
      </div>

      {/* Row 3 — Mobile vs Business + admin activity */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Mobile vs Business" sub="Contribución por aplicación" action={<span className="eos-link" onClick={() => navigate("/metrics")}>Ver métricas</span>}>
          <Donut segments={[]} centerLabel="Total" />
        </ChartCard>
        <Card>
          <CardHead title="Actividad administrativa" action={<span className="eos-link" onClick={() => navigate("/alerts")}>Ver alertas</span>} />
          <div className="eos-card-pad" style={{ paddingTop: 4, paddingBottom: 6 }}><ActivityFeed items={activity} /></div>
        </Card>
      </div>

      {/* Row 4 — platform control blocks */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        <Card>
          <CardHead title="Fuentes con incidencias" action={<span className="eos-link" onClick={() => navigate("/sources")}>Ver fuentes</span>} />
          <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {badSources.length === 0 ? <EmptyState title="Todas las fuentes sanas" /> : badSources.map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconRss size={15} /> {s.name}</span>
                <Pill tone={s.status === "down" ? "danger" : "warning"} dot>{s.status}</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Publicaciones pendientes" action={<span className="eos-link" onClick={() => navigate("/publications")}>Ver publicaciones</span>} />
          <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingPubs.length === 0 ? <EmptyState title="Nada pendiente" /> : pendingPubs.map((p) => (
              <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                <Pill tone={p.status === "programado" ? "info" : "warning"} dot>{p.status}</Pill>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHead title="Países activos" action={<span className="eos-link" onClick={() => navigate("/countries")}>Ver países</span>} />
          <div className="eos-card-pad" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {activeCountries.map((c) => <Pill key={c.code} tone="neutral"><IconGlobe size={12} /> {c.code} · {c.name}</Pill>)}
          </div>
        </Card>
        <Card>
          <CardHead title="Planes (empresas)" action={<span className="eos-link" onClick={() => navigate("/plans")}>Ver planes</span>} />
          <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {planCounts.map((p) => (
              <div key={p.plan} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "var(--text-secondary)" }}>{p.plan}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{p.n}</span>
              </div>
            ))}
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Ingresos por plan: sin billing conectado.</div>
          </div>
        </Card>
        <Card>
          <CardHead title="Estado de productos" action={<span className="eos-link" onClick={() => navigate("/health")}>Ver salud</span>} />
          <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
            <Row k="Base de datos (Supabase)" v={<Pill tone="success" dot>conectado</Pill>} />
            <Row k="Business (Railway)" v={<Pill tone="warning" dot>pendiente</Pill>} />
            <Row k="Shopify App" v={<Pill tone="warning" dot>pendiente</Pill>} />
            <Row k="Mobile PWA" v={<Pill tone="success" dot>conectado</Pill>} />
          </div>
        </Card>
        <Card>
          <CardHead title="Calendario global" action={<span className="eos-link" onClick={() => navigate("/calendar")}>Abrir</span>} />
          <div className="eos-card-pad"><EmptyState title="Calendario operacional" hint="Publicaciones, eventos, campañas, sincronizaciones y versiones — vista año/mes/semana/agenda." icon={<IconClock size={20} />} /></div>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><span style={{ color: "var(--text-secondary)" }}>{k}</span><span>{v}</span></div>;
}
