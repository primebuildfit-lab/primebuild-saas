/**
 * Calendario global — a REAL calendar (not a list). Views: Año / Mes / Semana /
 * Agenda, default Mes. Uses the shared @eventra/calendar engine for date math.
 *
 * It aggregates cross-app items from clearly-badged DEV fixtures into a single
 * platform calendar, colour-coded by application/type (spec §12). Clicking an item
 * opens a detail drawer. MEASURED outcomes are never invented — this shows planned
 * structure (events, publications, campaigns, syncs, releases), not results.
 */
import { useMemo, useState } from "react";
import { monthGridDays, yearMonths, toISODate, type WeekStart } from "@eventra/calendar";
import { PageHeader, Card, FilterDropdown, Pill, Btn, DevBadge, EmptyState } from "./ui";
import { devEvents } from "../data/global-seed";
import { devPublications, devReleases } from "../data/mobile-seed";
import { devCampaigns } from "../data/os-seed";
import { devSources } from "../data/seed";
import { devDay } from "../data/global-seed";

type App = "plataforma" | "business" | "mobile";
interface CalItem {
  id: string; title: string; date: string; app: App; type: string; status: string;
  country?: string; source?: string; owner?: string; color: string;
}

const C = {
  violet: "var(--brand-primary)", blue: "var(--info)", green: "var(--success)",
  orange: "var(--warning)", red: "var(--danger)", pink: "var(--magenta)", gray: "var(--text-muted)",
};
const CANCEL = ["cancelled", "cancelada", "rechazada", "down", "fallido", "rejected"];
const DONE = ["archivado", "archivada", "completed", "retirado", "finalizado", "expired"];
function colorFor(app: App, type: string, status: string): string {
  if (CANCEL.includes(status)) return C.red;
  if (DONE.includes(status)) return C.gray;
  if (type === "sincronización" || type === "versión") return C.orange;
  if (type === "marketing" || type === "campaña") return C.green;
  if (app === "mobile") return C.blue;
  if (app === "business") return C.green;
  return C.violet;
}

/** Unified cross-app calendar items from DEV fixtures. */
const ITEMS: CalItem[] = [
  ...devEvents.map((e): CalItem => ({ id: e.id, title: e.title, date: e.date, app: "plataforma", type: "evento", status: e.status, country: e.country, source: e.sourceId, color: colorFor("plataforma", "evento", e.status) })),
  ...devCampaigns.map((c): CalItem => ({ id: c.id, title: c.name, date: c.startDate, app: "business", type: "campaña", status: c.status, country: c.country, owner: c.owner, color: colorFor("business", "campaña", c.status) })),
  ...devPublications.map((p): CalItem => ({ id: p.id, title: p.title, date: p.date, app: "mobile", type: "publicación", status: p.status, country: p.country, color: colorFor("mobile", "publicación", p.status) })),
  ...devReleases.map((r): CalItem => ({ id: r.id, title: `${r.platform} ${r.version}`, date: r.date, app: "mobile", type: "versión", status: r.status, color: colorFor("mobile", "versión", r.status) })),
  ...devSources.filter((s) => s.nextSyncAt).map((s): CalItem => ({ id: `sync-${s.id}`, title: `Sinc. ${s.name}`, date: s.nextSyncAt!.slice(0, 10), app: "plataforma", type: "sincronización", status: s.status, country: s.country, color: colorFor("plataforma", "sincronización", s.status) })),
];

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const WEEK_START: WeekStart = 1;
const LEGEND: { label: string; color: string }[] = [
  { label: "Plataforma", color: C.violet }, { label: "Mobile", color: C.blue }, { label: "Business", color: C.green },
  { label: "Sinc./mantenimiento", color: C.orange }, { label: "Errores/cancelaciones", color: C.red },
  { label: "Marketing", color: C.pink }, { label: "Archivado/completado", color: C.gray },
];

const TODAY = devDay(0);
type View = "Año" | "Mes" | "Semana" | "Agenda";

export function CalendarPage() {
  const [view, setView] = useState<View>("Mes");
  const [anchor, setAnchor] = useState(() => new Date(`${TODAY}T00:00:00`));
  const [app, setApp] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [country, setCountry] = useState("all");
  const [selected, setSelected] = useState<CalItem | null>(null);

  const items = useMemo(() => ITEMS.filter(
    (i) => (app === "all" || i.app === app) && (type === "all" || i.type === type) && (status === "all" || i.status === status) && (country === "all" || i.country === country),
  ), [app, type, status, country]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalItem[]>();
    for (const it of items) { const a = m.get(it.date) ?? []; a.push(it); m.set(it.date, a); }
    return m;
  }, [items]);

  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const shiftMonth = (d: number) => setAnchor(new Date(year, month + d, 1));

  const uniq = (xs: (string | undefined)[]) => [...new Set(xs.filter(Boolean) as string[])];
  const opt = (xs: string[], all = "Todos") => [{ value: "all", label: all }, ...xs.map((x) => ({ value: x, label: x }))];

  return (
    <div>
      <PageHeader title="Calendario global" description="Calendario operacional de toda la plataforma Eventra (no es el calendario Business del cliente). Publicaciones, eventos, campañas supervisadas, sincronizaciones y versiones — un calendario real, no una lista." actions={<DevBadge />} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div role="group" aria-label="Vista" style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 8, overflow: "hidden" }}>
          {(["Año", "Mes", "Semana", "Agenda"] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}
              style={{ background: view === v ? "var(--brand-primary)" : "transparent", color: view === v ? "#fff" : "var(--text-secondary)", border: 0, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{v}</button>
          ))}
        </div>
        {view !== "Año" ? (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Btn tone="ghost" onClick={() => shiftMonth(-1)} title="Anterior">‹</Btn>
            <span style={{ minWidth: 150, textAlign: "center", fontWeight: 600, color: "var(--text-primary)" }}>{MONTHS[month]} {year}</span>
            <Btn tone="ghost" onClick={() => shiftMonth(1)} title="Siguiente">›</Btn>
          </div>
        ) : (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Btn tone="ghost" onClick={() => setAnchor(new Date(year - 1, 0, 1))}>‹</Btn>
            <span style={{ minWidth: 80, textAlign: "center", fontWeight: 600, color: "var(--text-primary)" }}>{year}</span>
            <Btn tone="ghost" onClick={() => setAnchor(new Date(year + 1, 0, 1))}>›</Btn>
          </div>
        )}
        <Btn tone="ghost" onClick={() => setAnchor(new Date(`${TODAY}T00:00:00`))}>Hoy</Btn>
        <span style={{ flex: 1 }} />
        <FilterDropdown label="App" value={app} options={[{ value: "all", label: "Todas" }, { value: "plataforma", label: "Plataforma" }, { value: "business", label: "Business" }, { value: "mobile", label: "Mobile" }]} onChange={setApp} />
        <FilterDropdown label="Tipo" value={type} options={opt(uniq(ITEMS.map((i) => i.type)))} onChange={setType} />
        <FilterDropdown label="Estado" value={status} options={opt(uniq(ITEMS.map((i) => i.status)))} onChange={setStatus} />
        <FilterDropdown label="País" value={country} options={opt(uniq(ITEMS.map((i) => i.country)), "Todos")} onChange={setCountry} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 320px" : "1fr", gap: 16, alignItems: "start" }}>
        <div>
          {view === "Mes" ? <MonthView year={year} month={month} byDay={byDay} onPick={setSelected} /> : null}
          {view === "Año" ? <YearView year={year} items={items} onOpenMonth={(mo) => { setAnchor(new Date(year, mo, 1)); setView("Mes"); }} /> : null}
          {view === "Semana" ? <WeekView anchor={anchor} byDay={byDay} onPick={setSelected} /> : null}
          {view === "Agenda" ? <AgendaView items={items} onPick={setSelected} /> : null}
          <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap", fontSize: 11.5, color: "var(--text-muted)" }}>
            {LEGEND.map((l) => (
              <span key={l.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: l.color }} />{l.label}</span>
            ))}
          </div>
        </div>
        {selected ? <DetailDrawer item={selected} onClose={() => setSelected(null)} /> : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Month */
function MonthView({ year, month, byDay, onPick }: { year: number; month: number; byDay: Map<string, CalItem[]>; onPick: (i: CalItem) => void }) {
  const days = monthGridDays(new Date(year, month, 1), WEEK_START);
  return (
    <Card style={{ padding: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {WEEKDAYS.map((w) => <div key={w} style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-muted)", textAlign: "center", padding: "2px 0" }}>{w}</div>)}
        {days.map((d) => {
          const iso = toISODate(d);
          const inMonth = d.getMonth() === month;
          const items = byDay.get(iso) ?? [];
          const isToday = iso === TODAY;
          return (
            <div key={iso} style={{ minHeight: 92, border: "1px solid var(--border)", borderRadius: 8, padding: 6, background: inMonth ? "var(--surface)" : "transparent", opacity: inMonth ? 1 : 0.45 }}>
              <div style={{ fontSize: 11.5, fontWeight: isToday ? 700 : 500, color: isToday ? "var(--brand-primary)" : "var(--text-secondary)", textAlign: "right" }}>{d.getDate()}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 3 }}>
                {items.slice(0, 3).map((it) => (
                  <button key={it.id} type="button" onClick={() => onPick(it)} title={it.title}
                    style={{ display: "block", width: "100%", textAlign: "left", fontSize: 10.5, padding: "2px 5px", borderRadius: 5, border: 0, background: "var(--surface-elevated)", borderLeft: `3px solid ${it.color}`, color: "var(--text-primary)", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</button>
                ))}
                {items.length > 3 ? <span style={{ fontSize: 10, color: "var(--text-muted)" }}>+{items.length - 3} más</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ Year */
function YearView({ year, items, onOpenMonth }: { year: number; items: CalItem[]; onOpenMonth: (m: number) => void }) {
  const months = yearMonths(year);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
      {months.map((mDate, mi) => {
        const monthItems = items.filter((it) => { const d = new Date(`${it.date}T00:00:00`); return d.getFullYear() === year && d.getMonth() === mi; });
        return (
          <Card key={mi} style={{ padding: 14, cursor: "pointer" }}>
            <button type="button" onClick={() => onOpenMonth(mi)} style={{ all: "unset", cursor: "pointer", display: "block", width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{MONTHS[mi]}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{monthItems.length}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginTop: 10, minHeight: 22 }}>
                {monthItems.length === 0 ? <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>—</span> : monthItems.slice(0, 16).map((it) => <span key={it.id} title={it.title} style={{ width: 8, height: 8, borderRadius: 2, background: it.color }} />)}
              </div>
            </button>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Week */
function WeekView({ anchor, byDay, onPick }: { anchor: Date; byDay: Map<string, CalItem[]>; onPick: (i: CalItem) => void }) {
  // Monday-start week containing the anchor.
  const start = new Date(anchor); const dow = (start.getDay() + 6) % 7; start.setDate(start.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
      {days.map((d, i) => {
        const iso = toISODate(d); const items = byDay.get(iso) ?? []; const isToday = iso === TODAY;
        return (
          <Card key={iso} style={{ padding: 10, minHeight: 220 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: isToday ? "var(--brand-primary)" : "var(--text-secondary)", marginBottom: 8 }}>{WEEKDAYS[i]} {d.getDate()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {items.length === 0 ? <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>—</span> : items.map((it) => (
                <button key={it.id} type="button" onClick={() => onPick(it)} style={{ textAlign: "left", fontSize: 11, padding: "5px 7px", borderRadius: 6, border: 0, background: "var(--surface-elevated)", borderLeft: `3px solid ${it.color}`, color: "var(--text-primary)", cursor: "pointer" }}>{it.title}</button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ Agenda */
function AgendaView({ items, onPick }: { items: CalItem[]; onPick: (i: CalItem) => void }) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return <Card style={{ padding: 8 }}><EmptyState title="Sin eventos para estos filtros" /></Card>;
  return (
    <Card>
      <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {sorted.map((it) => (
          <button key={it.id} type="button" onClick={() => onPick(it)} style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: 0, borderLeft: `3px solid ${it.color}`, padding: "7px 10px", color: "var(--text-primary)", cursor: "pointer", textAlign: "left", borderRadius: 6 }}>
            <span style={{ width: 84, fontSize: 11.5, color: "var(--text-muted)" }}>{it.date}</span>
            <span style={{ flex: 1, fontSize: 13 }}>{it.title}</span>
            <Pill tone="neutral">{it.app}</Pill>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ Drawer */
function DetailDrawer({ item, onClose }: { item: CalItem; onClose: () => void }) {
  const rows: [string, string | undefined][] = [
    ["Aplicación", item.app], ["Tipo", item.type], ["Fecha", item.date], ["Estado", item.status],
    ["País", item.country], ["Fuente", item.source], ["Responsable", item.owner],
  ];
  return (
    <Card>
      <div className="eos-card-head"><div><div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</div></div><button className="eos-link" onClick={onClose} style={{ background: "transparent", border: 0, color: "var(--brand-primary)", cursor: "pointer" }}>Cerrar</button></div>
      <div className="eos-card-pad" style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} /><span style={{ color: "var(--text-secondary)" }}>Color por aplicación/estado</span></span>
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span style={{ color: "var(--text-muted)" }}>{k}</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span></div>
        ))}
        <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>Historial, errores y acciones se conectarán con la fuente real. Sin datos medidos inventados.</p>
      </div>
    </Card>
  );
}
