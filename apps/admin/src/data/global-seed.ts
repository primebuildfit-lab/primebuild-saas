/**
 * DEV fixtures for the global Internal OS branches added in the definitive IA:
 * Eventos y noticias, Oportunidades, Anuncios y Países.
 *
 * DATA DISCIPLINE: these are clearly-badged DEVELOPMENT entities (isDev: true) so
 * the branches feel like a real product. They describe STRUCTURE (what an event /
 * opportunity / ad / country record looks like), never MEASURED OUTCOMES — revenue,
 * conversions, real usage and real user counts stay as honest empty states in the
 * pages themselves. When a real source is wired in, these fixtures are replaced.
 */

const DAY = 86_400_000;
/** ISO date N days from a fixed dev "today" (2026-07-15), stable across renders. */
export function devDay(offset: number): string {
  return new Date(Date.parse("2026-07-15T00:00:00Z") + offset * DAY).toISOString().slice(0, 10);
}

/* ───────────────────────────── Eventos y noticias ───────────────────────────── */
export type EventKind = "noticia" | "celebración" | "temporada" | "deportivo" | "cultural" | "gubernamental" | "comercial";
export type EventStatus = "discovered" | "pending_review" | "verified" | "accepted" | "rejected" | "dudoso" | "archived";

export interface DevEvent {
  id: string;
  title: string;
  kind: EventKind;
  country: string;
  date: string;
  importance: "alta" | "media" | "baja";
  reliability: number; // 0..1
  status: EventStatus;
  sourceId: string;
  isDev: true;
}

export const devEvents: DevEvent[] = [
  { id: "ev_bf", title: "Black Friday 2026", kind: "comercial", country: "US", date: devDay(135), importance: "alta", reliability: 0.96, status: "verified", sourceId: "src_retail_cal", isDev: true },
  { id: "ev_cyber", title: "Cyber Monday", kind: "comercial", country: "US", date: devDay(138), importance: "alta", reliability: 0.95, status: "accepted", sourceId: "src_retail_cal", isDev: true },
  { id: "ev_backschool", title: "Regreso a clases", kind: "temporada", country: "US", date: devDay(28), importance: "media", reliability: 0.9, status: "pending_review", sourceId: "src_retail_cal", isDev: true },
  { id: "ev_ca_thx", title: "Acción de Gracias (Canadá)", kind: "celebración", country: "CA", date: devDay(85), importance: "media", reliability: 0.92, status: "verified", sourceId: "src_ca_events", isDev: true },
  { id: "ev_worldcup", title: "Clasificatorio mundial", kind: "deportivo", country: "GB", date: devDay(40), importance: "alta", reliability: 0.6, status: "dudoso", sourceId: "src_partner_feed", isDev: true },
  { id: "ev_taxchange", title: "Cambio de IVA minorista", kind: "gubernamental", country: "GB", date: devDay(60), importance: "alta", reliability: 0.7, status: "pending_review", sourceId: "src_partner_feed", isDev: true },
  { id: "ev_localfair", title: "Feria local de comercio", kind: "cultural", country: "GB", date: devDay(15), importance: "baja", reliability: 0.55, status: "discovered", sourceId: "src_manual", isDev: true },
  { id: "ev_expo_cancel", title: "Regional Expo (cancelada)", kind: "comercial", country: "US", date: devDay(20), importance: "media", reliability: 0.8, status: "rejected", sourceId: "src_manual", isDev: true },
  { id: "ev_summer", title: "Rebajas de verano", kind: "temporada", country: "CA", date: devDay(-10), importance: "media", reliability: 0.85, status: "archived", sourceId: "src_ca_events", isDev: true },
];

/* ───────────────────────────── Oportunidades ───────────────────────────── */
export type OppStatus = "nueva" | "publicada" | "en_revisión" | "descartada" | "archivada";

export interface DevOpportunity {
  id: string;
  title: string;
  eventId: string;
  country: string;
  industry: string;
  category: string;
  importance: number; // 0..100
  urgency: number; // 0..100
  reliability: number; // 0..100
  difficulty: number; // 0..100
  score: number; // 0..100 (derived, precomputed here for the fixture)
  status: OppStatus;
  isDev: true;
}

export const devOpportunities: DevOpportunity[] = [
  { id: "opp_bf", title: "Preparar Black Friday", eventId: "ev_bf", country: "US", industry: "retail", category: "major_sales", importance: 98, urgency: 70, reliability: 96, difficulty: 40, score: 92, status: "publicada", isDev: true },
  { id: "opp_cyber", title: "Ofertas Cyber Monday", eventId: "ev_cyber", country: "US", industry: "retail", category: "major_sales", importance: 90, urgency: 68, reliability: 95, difficulty: 42, score: 88, status: "publicada", isDev: true },
  { id: "opp_backschool", title: "Campaña regreso a clases", eventId: "ev_backschool", country: "US", industry: "retail", category: "seasonal", importance: 74, urgency: 85, reliability: 90, difficulty: 35, score: 79, status: "nueva", isDev: true },
  { id: "opp_ca_thx", title: "Acción de Gracias — bundles", eventId: "ev_ca_thx", country: "CA", industry: "food", category: "holiday", importance: 66, urgency: 40, reliability: 92, difficulty: 30, score: 71, status: "en_revisión", isDev: true },
  { id: "opp_taxchange", title: "Aviso cambio de IVA", eventId: "ev_taxchange", country: "GB", industry: "general", category: "regulatory", importance: 80, urgency: 88, reliability: 70, difficulty: 55, score: 68, status: "nueva", isDev: true },
  { id: "opp_localfair", title: "Feria local — presencia", eventId: "ev_localfair", country: "GB", industry: "services", category: "local", importance: 40, urgency: 50, reliability: 55, difficulty: 25, score: 44, status: "descartada", isDev: true },
];

/* ───────────────────────────── Anuncios ───────────────────────────── */
export type AdType = "banner" | "popup" | "bloque" | "liquid" | "email" | "producto" | "colección" | "social" | "landing";
export type AdStatus = "borrador" | "programado" | "activo" | "pausado" | "finalizado" | "fallido" | "archivado";

export interface DevAd {
  id: string;
  name: string;
  type: AdType;
  channel: string;
  campaign: string;
  owner: string;
  status: AdStatus;
  updatedAt: string;
  isDev: true;
}

export const devAds: DevAd[] = [
  { id: "ad_bf_hero", name: "Black Friday — Hero banner", type: "banner", channel: "Storefront", campaign: "Northwind — Black Friday", owner: "Alex Owner", status: "programado", updatedAt: devDay(-1), isDev: true },
  { id: "ad_bf_popup", name: "Black Friday — Popup email", type: "popup", channel: "Storefront", campaign: "Northwind — Black Friday", owner: "Alex Owner", status: "borrador", updatedAt: devDay(-1), isDev: true },
  { id: "ad_launch_liquid", name: "Lanzamiento — Bloque Liquid", type: "liquid", channel: "Storefront", campaign: "Lanzamiento marca Eventra", owner: "Brian Almeida", status: "activo", updatedAt: devDay(-2), isDev: true },
  { id: "ad_acme_prod", name: "Acme — Producto destacado", type: "producto", channel: "Storefront", campaign: "Acme — Recurrente mensual", owner: "Automatización", status: "activo", updatedAt: devDay(-3), isDev: true },
  { id: "ad_globex_email", name: "Globex — Email bienvenida", type: "email", channel: "Email", campaign: "Globex — Bienvenida trial", owner: "Riya Viewer", status: "finalizado", updatedAt: devDay(-6), isDev: true },
  { id: "ad_holiday_social", name: "Navidad — Contenido social", type: "social", channel: "Social", campaign: "Calendario navideño (interno)", owner: "Brian Almeida", status: "pausado", updatedAt: devDay(-4), isDev: true },
  { id: "ad_expo_land", name: "Expo — Landing (cancelada)", type: "landing", channel: "Web", campaign: "Regional Expo (cancelada)", owner: "—", status: "archivado", updatedAt: devDay(-8), isDev: true },
  { id: "ad_summer_banner", name: "Verano — Banner", type: "banner", channel: "Storefront", campaign: "Rebajas de verano", owner: "Automatización", status: "fallido", updatedAt: devDay(-9), isDev: true },
];

/* ───────────────────────────── Países ───────────────────────────── */
export interface DevCountry {
  code: string;
  name: string;
  region: string;
  language: string;
  timezone: string;
  sources: number;
  events: number;
  coverage: "completa" | "parcial" | "básica";
  status: "activo" | "beta" | "planificado";
  isDev: true;
}

export const devCountries: DevCountry[] = [
  { code: "US", name: "Estados Unidos", region: "Norteamérica", language: "en-US", timezone: "America/New_York", sources: 2, events: devEvents.filter((e) => e.country === "US").length, coverage: "completa", status: "activo", isDev: true },
  { code: "CA", name: "Canadá", region: "Norteamérica", language: "en-CA", timezone: "America/Toronto", sources: 1, events: devEvents.filter((e) => e.country === "CA").length, coverage: "parcial", status: "activo", isDev: true },
  { code: "GB", name: "Reino Unido", region: "Europa", language: "en-GB", timezone: "Europe/London", sources: 1, events: devEvents.filter((e) => e.country === "GB").length, coverage: "parcial", status: "beta", isDev: true },
  { code: "ES", name: "España", region: "Europa", language: "es-ES", timezone: "Europe/Madrid", sources: 0, events: 0, coverage: "básica", status: "planificado", isDev: true },
  { code: "MX", name: "México", region: "Latinoamérica", language: "es-MX", timezone: "America/Mexico_City", sources: 0, events: 0, coverage: "básica", status: "planificado", isDev: true },
];
