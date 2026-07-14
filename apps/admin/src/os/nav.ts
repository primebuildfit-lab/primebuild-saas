/**
 * Internal OS navigation — 18 branches exactly as specified, in two sections:
 * the operational branches (Inicio → Integraciones) and, after a divider labelled
 * CONFIGURACIONES, the configuration branches (General → Facturación).
 * Labels are Spanish (the console's language); icons come from the local set.
 */
import type { ComponentType, SVGProps } from "react";
import {
  IconHome, IconCalendar, IconMegaphone, IconTag, IconContent, IconChecklist,
  IconBarChart, IconUsers, IconLayout, IconImage, IconNodes, IconGear, IconCard,
  IconGroup, IconSliders, IconHash, IconWorkflow, IconWallet, IconCode,
} from "./icons";

export type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface OsNavItem {
  label: string;
  to: string;
  icon: IconCmp;
  section: "main" | "config";
  /** one-line purpose, shown in the command palette and as a title tooltip */
  purpose: string;
}

export const OS_NAV: OsNavItem[] = [
  // ── Operational ──
  { label: "Inicio", to: "/", icon: IconHome, section: "main", purpose: "¿Cómo está Eventra hoy?" },
  { label: "Calendario", to: "/calendar", icon: IconCalendar, section: "main", purpose: "Calendario operacional global de Eventra" },
  { label: "Campañas", to: "/campaigns", icon: IconMegaphone, section: "main", purpose: "Campañas internas, de empresas y automáticas" },
  { label: "Ofertas", to: "/offers", icon: IconTag, section: "main", purpose: "Ofertas comerciales (descuentos, bundles, envíos…)" },
  { label: "Contenido", to: "/content", icon: IconContent, section: "main", purpose: "Base de contenido global de Eventra" },
  { label: "Estudio", to: "/studio", icon: IconCode, section: "main", purpose: "Anuncios y personalización de la app (JavaScript + Liquid)" },
  { label: "Tareas", to: "/tasks", icon: IconChecklist, section: "main", purpose: "Trabajo interno del equipo" },
  { label: "Analítica", to: "/analytics", icon: IconBarChart, section: "main", purpose: "Analítica global y comparaciones" },
  { label: "Audiencia", to: "/audiences", icon: IconUsers, section: "main", purpose: "Audiencias empresariales y personales" },
  { label: "Plantillas", to: "/templates", icon: IconLayout, section: "main", purpose: "Sistemas reutilizables" },
  { label: "Medios", to: "/media", icon: IconImage, section: "main", purpose: "Imágenes, videos, documentos, licencias" },
  { label: "Integraciones", to: "/integrations", icon: IconNodes, section: "main", purpose: "Integraciones reales y futuras" },
  // ── Configuración ──
  { label: "General", to: "/general", icon: IconGear, section: "config", purpose: "Configuración general del Internal OS" },
  { label: "Membresías", to: "/memberships", icon: IconCard, section: "config", purpose: "Planes comerciales de Eventra" },
  { label: "Equipos", to: "/teams", icon: IconGroup, section: "config", purpose: "Operadores, empleados, permisos" },
  { label: "Canales", to: "/channels", icon: IconSliders, section: "config", purpose: "Canales de marketing y publicación" },
  { label: "Etiquetas", to: "/labels", icon: IconHash, section: "config", purpose: "Taxonomía global" },
  { label: "Automatizaciones", to: "/automations", icon: IconWorkflow, section: "config", purpose: "Jobs, sincronizaciones, alertas, IA" },
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
  { id: "qc-announcement", label: "Nuevo anuncio", to: "/studio?create=1" },
  { id: "qc-offer", label: "Nueva oferta", to: "/offers?create=1" },
  { id: "qc-task", label: "Nueva tarea", to: "/tasks?create=1" },
  { id: "qc-content", label: "Nuevo contenido", to: "/content?create=1" },
  { id: "qc-event", label: "Nuevo evento", to: "/calendar?create=1" },
  { id: "qc-template", label: "Nueva plantilla", to: "/templates?create=1" },
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
