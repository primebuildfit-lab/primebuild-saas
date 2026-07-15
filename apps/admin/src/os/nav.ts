/**
 * Internal OS navigation — DEFINITIVE information architecture (Eventra Principal).
 *
 * Four sections, aligned to the ecosystem master spec (the 21 platform branches +
 * a Mobile Operations centre that lives INSIDE apps/admin, never as a 4th app):
 *   operacion  — the daily operational core (Inicio → Tareas)
 *   datos      — analysis & global catalogs (Analítica → Países)
 *   mobile     — Mobile Operations: administer Eventra Mobile from the PC
 *   config     — platform configuration (General → Facturación)
 *
 * Labels are Spanish (the console's language); icons come from the local set.
 * Global data belongs to this console; Business/Mobile only consume it.
 */
import type { ComponentType, SVGProps } from "react";
import {
  IconHome, IconCalendar, IconInbox, IconTrendUp, IconMegaphone, IconTag, IconSpeaker,
  IconCode, IconContent, IconChecklist, IconBarChart, IconUsers, IconLayout, IconImage,
  IconRss, IconGlobe, IconSmartphone, IconSend, IconBell, IconGroup, IconRocket, IconActivity,
  IconGear, IconCard, IconNodes, IconWorkflow, IconSliders, IconHash, IconWallet,
} from "./icons";

export type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
export type NavSection = "operacion" | "datos" | "mobile" | "config";

/** Sidebar sections, rendered top-to-bottom. `label: null` = no group header. */
export const NAV_SECTIONS: { id: NavSection; label: string | null }[] = [
  { id: "operacion", label: null },
  { id: "datos", label: "Datos y análisis" },
  { id: "mobile", label: "Mobile Operations" },
  { id: "config", label: "Configuraciones" },
];

export interface OsNavItem {
  label: string;
  to: string;
  icon: IconCmp;
  section: NavSection;
  /** one-line purpose, shown in the command palette and as a title tooltip */
  purpose: string;
}

export const OS_NAV: OsNavItem[] = [
  // ── Operación ──
  { label: "Inicio", to: "/", icon: IconHome, section: "operacion", purpose: "¿Cómo está Eventra hoy?" },
  { label: "Calendario", to: "/calendar", icon: IconCalendar, section: "operacion", purpose: "Calendario operacional global de Eventra" },
  { label: "Eventos y noticias", to: "/events", icon: IconInbox, section: "operacion", purpose: "Bandeja global de eventos, noticias y temporadas por revisar" },
  { label: "Oportunidades", to: "/opportunities", icon: IconTrendUp, section: "operacion", purpose: "Motor de oportunidades: score, país, importancia" },
  { label: "Campañas", to: "/campaigns", icon: IconMegaphone, section: "operacion", purpose: "Campañas internas, de empresas y automáticas" },
  { label: "Ofertas", to: "/offers", icon: IconTag, section: "operacion", purpose: "Biblioteca global de tipos de oferta" },
  { label: "Anuncios", to: "/ads", icon: IconSpeaker, section: "operacion", purpose: "Tipos de anuncio y su estado (borrador → activo → archivado)" },
  { label: "Estudio", to: "/studio", icon: IconCode, section: "operacion", purpose: "Composición de anuncios y personalización (JavaScript + Liquid)" },
  { label: "Contenido", to: "/content", icon: IconContent, section: "operacion", purpose: "Base de contenido global de Eventra" },
  { label: "Tareas", to: "/tasks", icon: IconChecklist, section: "operacion", purpose: "Trabajo interno del equipo" },
  // ── Datos y análisis ──
  { label: "Analítica", to: "/analytics", icon: IconBarChart, section: "datos", purpose: "Analítica global y comparaciones" },
  { label: "Audiencia", to: "/audiences", icon: IconUsers, section: "datos", purpose: "Audiencias empresariales y personales" },
  { label: "Plantillas", to: "/templates", icon: IconLayout, section: "datos", purpose: "Sistemas reutilizables" },
  { label: "Medios", to: "/media", icon: IconImage, section: "datos", purpose: "Imágenes, videos, documentos, licencias" },
  { label: "Fuentes", to: "/sources", icon: IconRss, section: "datos", purpose: "APIs, RSS y fuentes que alimentan los eventos" },
  { label: "Países", to: "/countries", icon: IconGlobe, section: "datos", purpose: "Países, regiones, idiomas y cobertura" },
  // ── Mobile Operations ──
  { label: "Resumen móvil", to: "/mobile", icon: IconSmartphone, section: "mobile", purpose: "Estado de la app Eventra Mobile" },
  { label: "Publicaciones", to: "/mobile/publications", icon: IconSend, section: "mobile", purpose: "Qué se publica a los usuarios móviles" },
  { label: "Notificaciones", to: "/mobile/notifications", icon: IconBell, section: "mobile", purpose: "Notificaciones push a la app móvil" },
  { label: "Usuarios móviles", to: "/mobile/users", icon: IconGroup, section: "mobile", purpose: "Usuarios de la app móvil (agregado, con privacidad)" },
  { label: "Versiones", to: "/mobile/releases", icon: IconRocket, section: "mobile", purpose: "Versiones y despliegues Android / iOS / PWA" },
  { label: "Analítica móvil", to: "/mobile/analytics", icon: IconActivity, section: "mobile", purpose: "Retención, pantallas y uso de la app móvil" },
  { label: "Configuración móvil", to: "/mobile/settings", icon: IconSliders, section: "mobile", purpose: "Parámetros y comportamiento de Eventra Mobile" },
  // ── Configuración ──
  { label: "General", to: "/general", icon: IconGear, section: "config", purpose: "Configuración general del Internal OS" },
  { label: "Membresías", to: "/memberships", icon: IconCard, section: "config", purpose: "Planes comerciales de Eventra" },
  { label: "Equipos", to: "/teams", icon: IconUsers, section: "config", purpose: "Operadores, empleados, permisos" },
  { label: "Integraciones", to: "/integrations", icon: IconNodes, section: "config", purpose: "Integraciones reales y futuras" },
  { label: "Automatizaciones", to: "/automations", icon: IconWorkflow, section: "config", purpose: "Jobs, sincronizaciones, alertas, IA" },
  { label: "Canales", to: "/channels", icon: IconSliders, section: "config", purpose: "Canales de marketing y publicación" },
  { label: "Etiquetas", to: "/labels", icon: IconHash, section: "config", purpose: "Taxonomía global" },
  { label: "Facturación", to: "/billing", icon: IconWallet, section: "config", purpose: "Facturación global (administrativa, no mueve dinero)" },
];

/** Quick-create menu opened from the topbar `+` button. */
export interface QuickAction {
  id: string;
  label: string;
  to: string;
}
export const QUICK_CREATE: QuickAction[] = [
  { id: "qc-campaign", label: "Nueva campaña", to: "/campaigns?create=1" },
  { id: "qc-ad", label: "Nuevo anuncio", to: "/ads?create=1" },
  { id: "qc-offer", label: "Nueva oferta", to: "/offers?create=1" },
  { id: "qc-opportunity", label: "Nueva oportunidad", to: "/opportunities?create=1" },
  { id: "qc-event", label: "Nuevo evento", to: "/events?create=1" },
  { id: "qc-task", label: "Nueva tarea", to: "/tasks?create=1" },
  { id: "qc-content", label: "Nuevo contenido", to: "/content?create=1" },
  { id: "qc-push", label: "Nueva notificación push", to: "/mobile/notifications?create=1" },
  { id: "qc-automation", label: "Nueva automatización", to: "/automations?create=1" },
];

/** Command palette (⌘K): every branch as a navigation + the quick-create actions. */
export interface Command {
  id: string;
  label: string;
  to?: string;
  hint?: string;
}
export const OS_COMMANDS: Command[] = [
  ...OS_NAV.map((n) => ({ id: `go-${n.to}`, label: `Ir a ${n.label}`, to: n.to, hint: n.purpose })),
  ...QUICK_CREATE.map((q) => ({ id: q.id, label: q.label, to: q.to, hint: "Crear" })),
];
