/**
 * Estudio (App Studio) DEV fixtures — announcements + custom code blocks.
 *
 * Foundation only: these are development fixtures so the branch renders real
 * lists/editors. Nothing here is published to a live surface and no code is
 * executed — wiring drafts to the real Business/Consumer apps is a later phase.
 * Every record carries `isDev: true`, consistent with the other OS seeds.
 */

/* -------------------------------------------------------------- date helper */
const DAY = 86_400_000;
function dayFromNow(n: number, now = new Date()): string {
  return new Date(now.getTime() + n * DAY).toISOString().slice(0, 10);
}

/* -------------------------------------------------------------- Announcements */
export type AnnouncementAudience = "all" | "business" | "consumer";
export type AnnouncementTone = "info" | "success" | "warning" | "critical";
export type AnnouncementStatus = "draft" | "scheduled" | "published" | "archived";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  tone: AnnouncementTone;
  status: AnnouncementStatus;
  /** ISO date; present when status === "scheduled". */
  publishAt?: string;
  updatedAt: string;
  isDev: true;
}

export const AUDIENCE_LABEL: Record<AnnouncementAudience, string> = {
  all: "Todos",
  business: "Business",
  consumer: "Consumer",
};
export const TONE_LABEL: Record<AnnouncementTone, string> = {
  info: "Información",
  success: "Novedad",
  warning: "Aviso",
  critical: "Crítico",
};

export const devAnnouncements: Announcement[] = [
  {
    id: "anc-welcome",
    title: "Bienvenido a Eventra",
    body: "Tu calendario comercial ya está disponible. Planifica alrededor de las fechas que importan.",
    audience: "consumer",
    tone: "success",
    status: "published",
    updatedAt: dayFromNow(-4),
    isDev: true,
  },
  {
    id: "anc-maintenance",
    title: "Mantenimiento programado",
    body: "El domingo por la noche haremos una breve actualización. La app puede tardar unos minutos en cargar.",
    audience: "all",
    tone: "warning",
    status: "scheduled",
    publishAt: dayFromNow(3),
    isDev: true,
    updatedAt: dayFromNow(-1),
  },
  {
    id: "anc-blackfriday",
    title: "Prepara Black Friday",
    body: "Empieza a preparar tus campañas de Black Friday con antelación desde el panel Business.",
    audience: "business",
    tone: "info",
    status: "draft",
    updatedAt: dayFromNow(0),
    isDev: true,
  },
];

/* -------------------------------------------------------------- Code blocks */
export type CodeLang = "liquid" | "javascript";
export type CodeSurface = "global" | "business" | "consumer";
export type CodePlacement = "head" | "body" | "banner" | "block" | "page";

export interface CodeBlock {
  id: string;
  name: string;
  lang: CodeLang;
  surface: CodeSurface;
  placement: CodePlacement;
  enabled: boolean;
  code: string;
  updatedAt: string;
  isDev: true;
}

export const LANG_LABEL: Record<CodeLang, string> = {
  liquid: "Liquid",
  javascript: "JavaScript",
};
export const SURFACE_LABEL: Record<CodeSurface, string> = {
  global: "Global",
  business: "Business",
  consumer: "Consumer",
};
export const PLACEMENT_LABEL: Record<CodePlacement, string> = {
  head: "<head>",
  body: "Fin de <body>",
  banner: "Banner superior",
  block: "Bloque",
  page: "Página",
};

/** Which placements make sense per language (JS = head/body; Liquid = presentational). */
export const PLACEMENTS_FOR: Record<CodeLang, CodePlacement[]> = {
  javascript: ["head", "body"],
  liquid: ["banner", "block", "page"],
};

export const devCodeBlocks: CodeBlock[] = [
  {
    id: "code-banner",
    name: "Banner de anuncio",
    lang: "liquid",
    surface: "consumer",
    placement: "banner",
    enabled: true,
    code: [
      '<div class="eventra-banner">',
      "  Hola {{ user.first_name }} — bienvenido a {{ shop.name | upcase }}.",
      "  {% if event %}Próximo: {{ event.title }} ({{ event.date }}).{% endif %}",
      "</div>",
    ].join("\n"),
    updatedAt: dayFromNow(-2),
    isDev: true,
  },
  {
    id: "code-analytics",
    name: "Script de analítica",
    lang: "javascript",
    surface: "global",
    placement: "head",
    enabled: false,
    code: [
      "// Se ejecuta en la app publicada, no en esta consola.",
      "window.addEventListener('load', function () {",
      "  console.log('Eventra listo para', '{{ user.plan }}');",
      "});",
    ].join("\n"),
    updatedAt: dayFromNow(-6),
    isDev: true,
  },
];
