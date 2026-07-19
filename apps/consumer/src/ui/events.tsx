import { Card, DateBadge, Pill, Row } from "./index";
import { IconClock, IconPin } from "./icons";
import { isoDay, isoMonthShort, isoLongEs } from "../lib/date";
import { PREVIEW_ALL_EVENTS, type Importance, type PreviewEvent } from "../data/preview";

/**
 * Eventra Mobile — event display compositions (built on DS primitives).
 * Reused by Home, Offers and the agenda so event cards look identical everywhere.
 */

const IMPORTANCE_TONE: Record<Importance, "high" | "med" | "low"> = {
  high: "high",
  med: "med",
  low: "low",
};
const IMPORTANCE_LABEL: Record<Importance, string> = {
  high: "Alta demanda",
  med: "Popular",
  low: "Tranquilo",
};

/** Big featured card for the horizontal carousel. */
export function EventHero({ event }: { event: PreviewEvent }) {
  return (
    <button type="button" className="em-hero em-card-interactive">
      <div style={{ display: "flex", gap: 8, marginBottom: "auto" }}>
        <Pill tone="brand">{event.tag || event.category}</Pill>
        <Pill tone={IMPORTANCE_TONE[event.importance]} dot>{IMPORTANCE_LABEL[event.importance]}</Pill>
      </div>
      <div className="em-hero-title">{event.title}</div>
      <div className="em-hero-sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconPin size={14} /> {event.place}
      </div>
      <div className="em-hero-sub" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconClock size={14} /> {isoLongEs(event.date)}{event.time ? ` · ${event.time}` : ""}
      </div>
    </button>
  );
}

/** Compact list row with a date badge. */
export function EventRow({ event, brand }: { event: PreviewEvent; brand?: boolean }) {
  return (
    <Row
      leading={<DateBadge day={isoDay(event.date)} month={isoMonthShort(event.date)} brand={brand} />}
      title={event.title}
      sub={`${event.time ? event.time + " · " : ""}${event.place}`}
      trailing={<Pill tone={IMPORTANCE_TONE[event.importance]} dot>{IMPORTANCE_LABEL[event.importance]}</Pill>}
    />
  );
}

/** Timeline agenda for a given ISO day (preview events on that day). */
export function DayAgenda({ iso }: { iso: string }) {
  const items = PREVIEW_ALL_EVENTS
    .filter((e) => e.date === iso)
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));

  if (items.length === 0) {
    return (
      <Card pad>
        <div style={{ fontSize: 12.5, color: "var(--em-text-muted)" }}>
          No hay eventos para este día.
        </div>
      </Card>
    );
  }
  return (
    <Card pad>
      <div className="em-agenda">
        {items.map((e) => (
          <div key={e.id} className="em-agenda-item">
            <div className="em-agenda-time">{e.time ?? "Todo el día"}</div>
            <div className="em-agenda-title">{e.title}</div>
            <div className="em-agenda-sub">{e.place} · {e.category}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
