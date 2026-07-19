/**
 * Eventra Mobile — PREVIEW data (design showcase only).
 *
 * ⚠️ This is clearly-labeled sample content used to show the redesigned layouts
 * with realistic shapes. It is NOT real, NOT fetched, and is always rendered
 * behind a visible "Vista previa" tag (see components). Per CLAUDE.md §7, mock
 * data lives in dedicated files (here) — never scattered inside components, and
 * never presented to the user as genuine data. Swap for a real API later without
 * touching the components: they consume these typed shapes.
 */

export type Importance = "high" | "med" | "low";

export interface PreviewEvent {
  id: string;
  title: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** Human time label, e.g. "20:00". */
  time?: string;
  place: string;
  category: string;
  importance: Importance;
  /** Short accent used by the hero gradient chip. */
  tag: string;
}

export interface PreviewOffer {
  id: string;
  title: string;
  merchant: string;
  discount: string;
  verifiedOn: string;
  category: string;
}

export interface PreviewInvite {
  id: string;
  event: string;
  from: string;
  initials: string;
  date: string;
}

export interface PreviewActivity {
  id: string;
  text: string;
  when: string;
  kind: "favorite" | "offer" | "reminder" | "invite";
}

/** Categories used by the Home filter chips. */
export const PREVIEW_CATEGORIES = [
  "Todos",
  "Música",
  "Gastronomía",
  "Tecnología",
  "Arte",
  "Deporte",
] as const;

export const PREVIEW_FEATURED: PreviewEvent[] = [
  { id: "f1", title: "Noche de Jazz en la Azotea", date: "2026-07-24", time: "20:30", place: "Sky Lounge · Centro", category: "Música", importance: "high", tag: "Destacado" },
  { id: "f2", title: "Feria Gastronómica de Verano", date: "2026-07-26", time: "12:00", place: "Parque de la Ribera", category: "Gastronomía", importance: "med", tag: "Popular" },
  { id: "f3", title: "Cumbre de Diseño de Producto", date: "2026-08-02", time: "09:30", place: "Hub Tecnológico", category: "Tecnología", importance: "high", tag: "Nuevo" },
];

export const PREVIEW_UPCOMING: PreviewEvent[] = [
  { id: "u1", title: "Mercado de Artesanía Local", date: "2026-07-19", time: "10:00", place: "Plaza Mayor", category: "Arte", importance: "low", tag: "" },
  { id: "u2", title: "Ruta de Tapas del Barrio", date: "2026-07-21", time: "19:00", place: "Casco Antiguo", category: "Gastronomía", importance: "med", tag: "" },
  { id: "u3", title: "Torneo de Baloncesto 3x3", date: "2026-07-23", time: "17:00", place: "Polideportivo Norte", category: "Deporte", importance: "low", tag: "" },
  { id: "u4", title: "Concierto acústico al atardecer", date: "2026-07-25", time: "21:00", place: "Anfiteatro del Río", category: "Música", importance: "high", tag: "" },
];

export const PREVIEW_NEARBY: PreviewEvent[] = [
  { id: "n1", title: "Exposición de Fotografía Urbana", date: "2026-07-20", time: "11:00", place: "a 800 m · Galería Norte", category: "Arte", importance: "med", tag: "Cerca" },
  { id: "n2", title: "Cata de Café de Especialidad", date: "2026-07-22", time: "18:00", place: "a 1,2 km · Tostadero", category: "Gastronomía", importance: "low", tag: "Cerca" },
];

export const PREVIEW_INVITES: PreviewInvite[] = [
  { id: "i1", event: "Cena de aniversario", from: "Marta R.", initials: "MR", date: "2026-07-27" },
  { id: "i2", event: "Quedada de senderismo", from: "Club Outdoor", initials: "CO", date: "2026-07-30" },
];

export const PREVIEW_ACTIVITY: PreviewActivity[] = [
  { id: "a1", text: "Guardaste «Noche de Jazz en la Azotea»", when: "hace 2 h", kind: "favorite" },
  { id: "a2", text: "Nueva oferta verificada cerca de ti", when: "ayer", kind: "offer" },
  { id: "a3", text: "Recordatorio activado para la Feria Gastronómica", when: "hace 2 días", kind: "reminder" },
];

export const PREVIEW_OFFERS: PreviewOffer[] = [
  { id: "o1", title: "2x1 en entradas de cine", merchant: "Cines Aurora", discount: "-50%", verifiedOn: "2026-07-16", category: "Ocio" },
  { id: "o2", title: "Menú degustación con descuento", merchant: "La Terraza", discount: "-30%", verifiedOn: "2026-07-15", category: "Gastronomía" },
  { id: "o3", title: "Pase de temporada de museos", merchant: "Red de Museos", discount: "-25%", verifiedOn: "2026-07-14", category: "Arte" },
];

/** Preview markers for the calendar (ISO dates that carry an event dot). */
export const PREVIEW_EVENT_DATES: ReadonlySet<string> = new Set(
  [...PREVIEW_FEATURED, ...PREVIEW_UPCOMING, ...PREVIEW_NEARBY].map((e) => e.date),
);

/** All preview events keyed for quick day lookups (agenda). */
export const PREVIEW_ALL_EVENTS: PreviewEvent[] = [
  ...PREVIEW_FEATURED,
  ...PREVIEW_UPCOMING,
  ...PREVIEW_NEARBY,
];
