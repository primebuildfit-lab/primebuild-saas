import { useMemo, useState } from "react";
import { Calendar } from "../Calendar";
import {
  Card,
  ChipRow,
  Chip,
  Avatar,
  DateBadge,
  EmptyState,
  PreviewTag,
  Pill,
  Row,
  Search,
  Section,
  Stack,
} from "../ui";
import {
  IconSearch,
  IconSparkle,
  IconHeart,
  IconTicket,
  IconCalendar,
  IconTrend,
} from "../ui/icons";
import { EventHero, EventRow, DayAgenda } from "../ui/events";
import { isoLongEs } from "../lib/date";
import {
  PREVIEW_CATEGORIES,
  PREVIEW_FEATURED,
  PREVIEW_UPCOMING,
  PREVIEW_NEARBY,
  PREVIEW_INVITES,
  PREVIEW_ACTIVITY,
} from "../data/preview";

/**
 * Inicio — the redesigned Home. The calendar is now ONE section inside a fuller
 * discovery experience (featured, upcoming, near you, invitations, activity), so
 * the app no longer feels like "just a calendar". All data-backed sections show
 * clearly-labeled preview content; interactions update local state only.
 */
export function HomeScreen() {
  const todayISO = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof PREVIEW_CATEGORIES)[number]>("Todos");
  const [selectedISO, setSelectedISO] = useState(todayISO);

  const matches = (cat: string) => category === "Todos" || cat === category;
  const featured = PREVIEW_FEATURED.filter((e) => matches(e.category));
  const upcoming = PREVIEW_UPCOMING.filter((e) => matches(e.category));
  const nearby = PREVIEW_NEARBY.filter((e) => matches(e.category));

  return (
    <div className="em-fade-in">
      {/* Greeting + search */}
      <div style={{ marginBottom: 16 }}>
        <h1 className="em-screen-title">Descubre lo que pasa</h1>
        <p className="em-screen-sub">Eventos, ofertas y planes cerca de ti.</p>
      </div>
      <div style={{ marginBottom: 12 }}>
        <Search value={query} onChange={setQuery} placeholder="Buscar eventos, lugares…" icon={<IconSearch size={18} />} />
      </div>
      <ChipRow ariaLabel="Filtrar por categoría">
        {PREVIEW_CATEGORIES.map((c) => (
          <Chip key={c} active={c === category} onClick={() => setCategory(c)}>{c}</Chip>
        ))}
      </ChipRow>

      {/* Featured */}
      <Section title="Destacados" sub="Los planes que más suenan esta semana" tag={<PreviewTag />}>
        {featured.length ? (
          <div className="em-carousel">
            {featured.map((e) => <EventHero key={e.id} event={e} />)}
          </div>
        ) : (
          <EmptyState icon={<IconSparkle />} title="Nada destacado en esta categoría" sub="Prueba con otra categoría para ver más planes." />
        )}
      </Section>

      {/* Próximos eventos */}
      <Section title="Próximos eventos" tag={<PreviewTag />}>
        {upcoming.length ? (
          <Card>{upcoming.map((e) => <EventRow key={e.id} event={e} />)}</Card>
        ) : (
          <EmptyState icon={<IconCalendar />} title="Sin próximos eventos aquí" sub="Cambia de categoría o vuelve más tarde." />
        )}
      </Section>

      {/* Calendario + agenda del día (integrado, ya no protagonista único) */}
      <Section title="Tu calendario" sub="Toca un día para ver su agenda">
        <Stack>
          <Card pad><Calendar selectedISO={selectedISO} onSelect={setSelectedISO} /></Card>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "2px 2px 10px" }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>
                {selectedISO === todayISO ? "Hoy" : "Día seleccionado"}
              </span>
              <span style={{ fontSize: 12.5, color: "var(--em-text-muted)" }}>· {isoLongEs(selectedISO)}</span>
              <span style={{ marginLeft: "auto" }}><PreviewTag /></span>
            </div>
            <DayAgenda iso={selectedISO} />
          </div>
        </Stack>
      </Section>

      {/* Cerca de ti */}
      <Section title="Cerca de ti" sub="Según tu ubicación aproximada" tag={<PreviewTag />}>
        {nearby.length ? (
          <div className="em-carousel">
            {nearby.map((e) => <EventHero key={e.id} event={e} />)}
          </div>
        ) : (
          <EmptyState icon={<IconTrend />} title="Nada cerca en esta categoría" />
        )}
      </Section>

      {/* Invitaciones */}
      <Section title="Invitaciones" tag={<PreviewTag />}>
        <Card>
          {PREVIEW_INVITES.map((inv) => (
            <Row
              key={inv.id}
              leading={<Avatar initials={inv.initials} />}
              title={inv.event}
              sub={`${inv.from} · ${isoLongEs(inv.date)}`}
              trailing={<Pill tone="brand" dot>Nueva</Pill>}
              chevron={false}
            />
          ))}
        </Card>
      </Section>

      {/* Actividad reciente */}
      <Section title="Actividad reciente" tag={<PreviewTag />}>
        <Card>
          {PREVIEW_ACTIVITY.map((a) => (
            <Row
              key={a.id}
              leading={
                <DateBadge
                  day={a.kind === "favorite" ? "♥" : a.kind === "offer" ? "%" : "•"}
                  month=""
                />
              }
              title={a.text}
              sub={a.when}
              chevron={false}
            />
          ))}
        </Card>
      </Section>

      {/* Favoritos — honest empty (no fabricated saved items) */}
      <Section title="Favoritos">
        <EmptyState
          icon={<IconHeart />}
          title="Aún no has guardado nada"
          sub="Toca el corazón en un evento para tenerlo siempre a mano."
        />
      </Section>

      {/* Historial — honest empty */}
      <Section title="Historial">
        <EmptyState
          icon={<IconTicket />}
          title="Tu historial aparecerá aquí"
          sub="Los eventos a los que asistas quedarán registrados en tu cuenta."
        />
      </Section>
    </div>
  );
}
