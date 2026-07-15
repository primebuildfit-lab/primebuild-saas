/**
 * DEV fixtures for the Mobile Operations centre (administered from apps/admin,
 * NOT a fourth app). Same discipline as the rest of the console: badged DEV
 * entities describe STRUCTURE (publications, push notifications, releases). Real
 * MEASURED OUTCOMES — active users, retention, screen usage, delivery rates —
 * have no live source yet and render as honest empty states in the pages.
 */
import { devDay } from "./global-seed";

/* ───────────────────────── Publicaciones (a la app móvil) ───────────────────────── */
export type PublicationKind = "evento" | "oportunidad" | "noticia" | "contenido" | "destacado";
export type PublicationStatus = "borrador" | "programado" | "publicado" | "retirado";

export interface DevPublication {
  id: string;
  title: string;
  kind: PublicationKind;
  country: string;
  audience: string;
  status: PublicationStatus;
  date: string;
  isDev: true;
}

export const devPublications: DevPublication[] = [
  { id: "pub_bf", title: "Black Friday llega pronto", kind: "evento", country: "US", audience: "Todos", status: "programado", date: devDay(130), isDev: true },
  { id: "pub_backschool", title: "Guía de regreso a clases", kind: "contenido", country: "US", audience: "Compradores", status: "borrador", date: devDay(20), isDev: true },
  { id: "pub_ca_thx", title: "Ideas para Acción de Gracias", kind: "oportunidad", country: "CA", audience: "Todos", status: "publicado", date: devDay(-2), isDev: true },
  { id: "pub_summer", title: "Rebajas de verano (finalizada)", kind: "destacado", country: "CA", audience: "Todos", status: "retirado", date: devDay(-14), isDev: true },
  { id: "pub_localfair", title: "Feria local esta semana", kind: "noticia", country: "GB", audience: "Seguidores GB", status: "publicado", date: devDay(-1), isDev: true },
];

/* ───────────────────────── Notificaciones push ───────────────────────── */
export type PushStatus = "borrador" | "programada" | "enviada" | "cancelada";

export interface DevPush {
  id: string;
  title: string;
  body: string;
  segment: string;
  status: PushStatus;
  scheduledFor: string;
  isDev: true;
}

export const devPush: DevPush[] = [
  { id: "push_bf", title: "Black Friday se acerca", body: "Prepara tu lista de deseos.", segment: "US · Todos", status: "programada", scheduledFor: devDay(130), isDev: true },
  { id: "push_ca_thx", title: "Ofertas de Acción de Gracias", body: "Descúbrelas en la app.", segment: "CA · Todos", status: "enviada", scheduledFor: devDay(-2), isDev: true },
  { id: "push_welcome", title: "Bienvenido a Eventra", body: "Sigue países y categorías.", segment: "Nuevos usuarios", status: "borrador", scheduledFor: devDay(1), isDev: true },
  { id: "push_expo", title: "Regional Expo", body: "Evento cancelado.", segment: "US · Interesados", status: "cancelada", scheduledFor: devDay(18), isDev: true },
];

/* ───────────────────────── Versiones / releases ───────────────────────── */
export type Platform = "Android" | "iOS" | "PWA";
export type ReleaseStatus = "desarrollo" | "beta" | "producción" | "rechazada";

export interface DevRelease {
  id: string;
  version: string;
  platform: Platform;
  status: ReleaseStatus;
  date: string;
  notes: string;
  isDev: true;
}

export const devReleases: DevRelease[] = [
  { id: "rel_pwa_1", version: "1.0.0", platform: "PWA", status: "producción", date: devDay(-30), notes: "Primera PWA instalable (calendario + offline).", isDev: true },
  { id: "rel_pwa_2", version: "1.1.0", platform: "PWA", status: "beta", date: devDay(-3), notes: "Descubrimiento y favoritos (en pruebas).", isDev: true },
  { id: "rel_and_1", version: "1.0.0", platform: "Android", status: "desarrollo", date: devDay(2), notes: "Empaquetado TWA pendiente de firma.", isDev: true },
  { id: "rel_ios_1", version: "1.0.0", platform: "iOS", status: "desarrollo", date: devDay(5), notes: "Wrapper y revisión App Store pendientes.", isDev: true },
];
