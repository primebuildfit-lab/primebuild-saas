/**
 * Internal OS — Inicio (dashboard). Answers "¿Cómo está Eventra hoy?".
 * Structure follows the specification exactly (header, 4 metrics, 3-column row,
 * upcoming-tasks table). Data discipline:
 *   - Counts come from real DEV fixtures (badged, development only).
 *   - Trends show "Sin comparación" (no historical series exists — not faked).
 *   - "Rendimiento general", channel performance and popular-offer usage are
 *     MEASURED OUTCOMES with no real source → explicit empty states.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import {
  PageHeader, MetricCard, Card, CardHead, ChartCard, Donut, ActivityFeed,
  DateRangePicker, FilterDropdown, StatusBadge, PriorityBadge, ProgressBar, DevBadge, EmptyState,
  type Column, type ActivityItem,
} from "./ui";
import { IconMegaphone, IconTag, IconChecklist, IconBarChart, IconClock } from "./icons";
import { devOffers } from "../data/seed";
import {
  devCampaigns, devTasks, campaignProgress, companyForCampaign, deriveActivity, weekItems,
  type DevTask, type WeekItem,
} from "../data/os-seed";

const PRINCIPAL_FIRST_NAME = "Brian";

export function HomePage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("Esta semana");
  const [channel, setChannel] = useState("all");

  // ── Real counts from fixtures ──
  const activeCampaigns = devCampaigns.filter((c) => c.status === "active").length;
  const availableOffers = devOffers.filter((o) => o.status === "active" || o.status === "verified").length;
  const pendingTasks = devTasks.filter((t) => t.status === "pending" || t.status === "in_progress" || t.status === "overdue").length;

  const featured = [...devCampaigns].filter((c) => c.status === "active" || c.status === "scheduled" || c.status === "overdue")
    .sort((a, b) => campaignProgress(b) - campaignProgress(a)).slice(0, 3);
  const activity: ActivityItem[] = deriveActivity().map((a) => ({ id: a.id, title: a.title, desc: a.desc, when: a.when, tone: a.tone }));
  const week = weekItems();
  const upcoming = [...devTasks].filter((t) => t.status !== "completed").sort((a, b) => a.due.localeCompare(b.due));

  const channelOptions = [{ value: "all", label: "Todos los canales" }, ...["Shopify", "Email", "Meta", "Instagram", "Blog"].map((c) => ({ value: c.toLowerCase(), label: c }))];

  const taskColumns: Column<DevTask>[] = [
    { key: "sel", header: "", width: 30, render: () => <input type="checkbox" aria-label="Seleccionar tarea" /> },
    { key: "t", header: "Tarea", render: (t) => <span style={{ fontWeight: 600 }}>{t.title}</span> },
    { key: "cmp", header: "Campaña", render: (t) => t.campaignId ? devCampaigns.find((c) => c.id === t.campaignId)?.name ?? "—" : "—" },
    { key: "a", header: "Asignado a", render: (t) => t.assignee },
    { key: "due", header: "Vencimiento", render: (t) => <DueLabel due={t.due} /> },
    { key: "p", header: "Prioridad", render: (t) => <PriorityBadge priority={t.priority} /> },
    { key: "st", header: "Estado", render: (t) => <StatusBadge status={t.status} /> },
  ];

  return (
    <div>
      <PageHeader
        title={<>Bienvenido, {PRINCIPAL_FIRST_NAME} <span aria-hidden>👋</span></>}
        description="Resumen general de tu estrategia de marketing"
        actions={<>
          <DateRangePicker value={range} onChange={setRange} />
          <FilterDropdown value={channel} options={channelOptions} onChange={setChannel} />
        </>}
      />

      <div style={{ marginBottom: 14 }}><DevBadge /></div>

      {/* Row 1 — four metrics */}
      <div className="eos-metrics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
        <MetricCard label="Campañas activas" value={activeCampaigns} tone="brand" icon={<IconMegaphone size={22} />} trend={null} />
        <MetricCard label="Ofertas disponibles" value={availableOffers} tone="success" icon={<IconTag size={22} />} trend={null} />
        <MetricCard label="Tareas pendientes" value={pendingTasks} tone="warning" icon={<IconChecklist size={22} />} trend={null} />
        <MetricCard label="Rendimiento general" value={null} emptyLabel="No disponible" tone="info" icon={<IconBarChart size={22} />}
          trend="none" foot="Fórmula real no conectada" />
      </div>

      {/* Row 2 — 2fr | 1fr | 1fr */}
      <div className="eos-dash-row2" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
        <WeeklyCalendar items={week} />

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <ChartCard title="Rendimiento por canal" sub="Esta semana">
            <Donut segments={[]} centerLabel="Total" />
          </ChartCard>
          <Card>
            <CardHead title="Campañas destacadas" action={<span className="eos-link" onClick={() => navigate("/campaigns")}>Ver todas</span>} />
            <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {featured.length === 0 ? <EmptyState title="No hay campañas destacadas" /> : featured.map((c) => (
                <div key={c.id} style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 13 }}>
                    <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", margin: "3px 0 6px" }}>{companyForCampaign(c)}</div>
                  <ProgressBar value={campaignProgress(c)} tone={c.status === "overdue" ? "danger" : "brand"} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <Card>
            <CardHead title="Actividad reciente" action={<span className="eos-link" onClick={() => navigate("/automations")}>Ver todo</span>} />
            <div className="eos-card-pad" style={{ paddingTop: 4, paddingBottom: 6 }}>
              <ActivityFeed items={activity} />
            </div>
          </Card>
          <Card>
            <CardHead title="Ofertas más populares" action={<span className="eos-link" onClick={() => navigate("/offers")}>Ver todas</span>} />
            <div className="eos-card-pad">
              {/* Usage is a MEASURED outcome with no real source → honest empty state. */}
              <EmptyState title="No hay ofertas utilizadas todavía" hint="El conteo de uso se activa al conectar el seguimiento real." icon={<IconTag size={20} />} />
            </div>
          </Card>
        </div>
      </div>

      {/* Row 3 — upcoming tasks */}
      <Card>
        <CardHead title="Próximas tareas" action={<span className="eos-link" onClick={() => navigate("/tasks")}>Ver todas las tareas</span>} />
        <div style={{ padding: 2 }}>
          <DataTableFlush columns={taskColumns} rows={upcoming} empty="No hay tareas próximas" />
        </div>
      </Card>
    </div>
  );
}

/* Flush table (no outer card) for embedding inside a card. */
function DataTableFlush<T>({ columns, rows, empty }: { columns: Column<T>[]; rows: T[]; empty: string }) {
  if (rows.length === 0) return <div style={{ padding: 8 }}><EmptyState title={empty} /></div>;
  return (
    <div className="eos-table-wrap">
      <table className="eos-table">
        <thead><tr>{columns.map((c) => <th key={c.key} style={{ width: c.width }}>{c.header}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{columns.map((c) => <td key={c.key}>{c.render(row)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function DueLabel({ due }: { due: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const diff = Math.round((new Date(due).getTime() - new Date(today).getTime()) / 86_400_000);
  if (diff < 0) return <span style={{ color: "var(--danger)", fontWeight: 600 }}>Atrasada</span>;
  if (diff === 0) return <span style={{ color: "var(--danger)", fontWeight: 600 }}>Hoy</span>;
  if (diff === 1) return <span style={{ color: "var(--warning)", fontWeight: 600 }}>Mañana</span>;
  return <span style={{ color: "var(--text-secondary)" }}>{due}</span>;
}

/* Weekly calendar — real structure (7 days × hours + current-time line). Week
   items are placed as day chips (times are not tracked → shown as all-day, honest). */
const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const HOURS = [8, 10, 12, 14, 16, 18, 20];
const KIND_TONE: Record<WeekItem["kind"], string> = { campaign: "var(--success)", task: "var(--warning)", offer: "var(--brand-primary)", content: "var(--info)" };

function WeeklyCalendar({ items }: { items: WeekItem[] }) {
  const now = new Date();
  const start = new Date(now); start.setDate(now.getDate() - ((now.getDay() + 6) % 7)); start.setHours(0, 0, 0, 0);
  const dayDates = DAYS.map((_, i) => new Date(start.getTime() + i * 86_400_000));
  const todayIdx = (now.getDay() + 6) % 7;
  const byDay = dayDates.map((d) => items.filter((it) => it.date === d.toISOString().slice(0, 10)));

  return (
    <Card>
      <CardHead title="Calendario de la semana" sub="Eventos, tareas y contenido programado"
        action={<span className="eos-link">Ver calendario completo</span>} />
      <div className="eos-card-pad" style={{ overflowX: "auto" }}>
        {items.length === 0 ? (
          <EmptyState title="No hay actividades programadas esta semana" icon={<IconClock size={20} />} />
        ) : (
          <div style={{ minWidth: 560 }}>
            {/* Day headers */}
            <div style={{ display: "grid", gridTemplateColumns: `44px repeat(7, 1fr)`, gap: 4, marginBottom: 6 }}>
              <span />
              {DAYS.map((d, i) => (
                <div key={d} style={{ textAlign: "center", fontSize: 12 }}>
                  <div style={{ color: i === todayIdx ? "var(--brand-strong)" : "var(--text-secondary)", fontWeight: 600 }}>{d}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{dayDates[i].getDate()}</div>
                </div>
              ))}
            </div>
            {/* All-day chips row */}
            <div style={{ display: "grid", gridTemplateColumns: `44px repeat(7, 1fr)`, gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "var(--text-muted)", alignSelf: "center" }}>día</span>
              {byDay.map((its, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 34 }}>
                  {its.map((it) => (
                    <div key={it.id} title={it.title}
                      style={{ fontSize: 10.5, padding: "3px 6px", borderRadius: 6, background: "var(--surface-elevated)", borderLeft: `3px solid ${KIND_TONE[it.kind]}`, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {it.title}{it.channel ? <span style={{ color: "var(--text-muted)" }}> · {it.channel}</span> : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Hour grid (visual structure) */}
            <div style={{ position: "relative" }}>
              {HOURS.map((h) => (
                <div key={h} style={{ display: "grid", gridTemplateColumns: `44px repeat(7, 1fr)`, gap: 4, height: 30, borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)", transform: "translateY(-6px)" }}>{String(h).padStart(2, "0")}:00</span>
                  {DAYS.map((_, i) => <div key={i} style={i === todayIdx ? { background: "rgba(124,77,255,.05)" } : undefined} />)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap", fontSize: 11, color: "var(--text-muted)" }}>
              <Legend color={KIND_TONE.campaign} label="Campaña" />
              <Legend color={KIND_TONE.task} label="Tarea" />
              <Legend color={KIND_TONE.content} label="Contenido" />
              <span>Horas mostradas como estructura — el horario exacto no se registra aún.</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: color }} />{label}</span>;
}
