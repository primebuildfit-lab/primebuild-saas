/**
 * Internal OS navigation — PLATFORM-CONTROL structure (correction phase).
 *
 * The admin is a platform control centre, NOT a copy of Eventra Business. Daily
 * operational entities (campañas, ofertas, anuncios, estudio, contenido, medios,
 * eventos, oportunidades) are no longer top-level branches — they live as
 * supervision tabs inside Eventra Business / Eventra Mobile / Publicaciones.
 *
 * Five groups: General · Métricas · Datos y configuración · Operaciones de
 * producto · Control. Labels are Spanish; icons come from the local set.
 */
import type { ComponentType, SVGProps } from "react";
import {
  IconHome, IconCalendar, IconSend, IconCard, IconGroup, IconAlert,
  IconActivity, IconSmartphone, IconBarChart, IconTrendUp, IconWallet,
  IconRss, IconGlobe, IconSliders, IconLayout, IconUsers, IconNodes,
  IconMegaphone, IconPlug, IconWorkflow, IconCode, IconRocket,
  IconContent, IconGear,
} from "./icons";

export type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
export type NavSection = "general" | "metricas" | "datos" | "producto" | "control";

/** Sidebar sections, rendered top-to-bottom. `label: null` = no group header. */
export const NAV_SECTIONS: { id: NavSection; label: string | null }[] = [
  { id: "general", label: null },
  { id: "metricas", label: "Métricas" },
  { id: "datos", label: "Datos y configuración" },
  { id: "producto", label: "Operaciones de producto" },
  { id: "control", label: "Control" },
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
  // ── General ──
  { label: "Inicio", to: "/", icon: IconHome, section: "general", purpose: "Métricas y estado de la plataforma Eventra" },
  { label: "Calendario global", to: "/calendar", icon: IconCalendar, section: "general", purpose: "Calendario operacional global (año/mes/semana/agenda)" },
  { label: "Publicaciones", to: "/publications", icon: IconSend, section: "general", purpose: "Cola de publicación, oportunidades y lo publicado a Mobile" },
  { label: "Empresas", to: "/companies", icon: IconCard, section: "general", purpose: "Supervisión global de empresas cliente (tenants)" },
  { label: "Usuarios", to: "/users", icon: IconGroup, section: "general", purpose: "Usuarios de empresas cliente" },
  { label: "Alertas", to: "/alerts", icon: IconAlert, section: "general", purpose: "Alertas derivadas del estado real del sistema" },
  // ── Métricas ──
  { label: "Resumen general", to: "/metrics", icon: IconActivity, section: "metricas", purpose: "Métricas combinadas Mobile + Business" },
  { label: "Métricas Mobile", to: "/metrics/mobile", icon: IconSmartphone, section: "metricas", purpose: "Comportamiento real de Eventra Mobile (D/M/A)" },
  { label: "Métricas Business", to: "/metrics/business", icon: IconBarChart, section: "metricas", purpose: "Empresas, planes e ingresos de Eventra Business (D/M/A)" },
  { label: "Comparaciones", to: "/metrics/compare", icon: IconTrendUp, section: "metricas", purpose: "Comparador transversal Mobile/Business/plan/país/canal" },
  { label: "Inversión y retorno", to: "/metrics/roi", icon: IconWallet, section: "metricas", purpose: "Inversión, ingreso atribuible, ROI, ROAS y costos" },
  // ── Datos y configuración ──
  { label: "Fuentes", to: "/sources", icon: IconRss, section: "datos", purpose: "APIs, RSS y fuentes que alimentan los eventos" },
  { label: "Países", to: "/countries", icon: IconGlobe, section: "datos", purpose: "Países, regiones, idiomas y cobertura" },
  { label: "Parámetros", to: "/parameters", icon: IconSliders, section: "datos", purpose: "Parámetros globales — única fuente de verdad" },
  { label: "Planes y membresías", to: "/plans", icon: IconCard, section: "datos", purpose: "Planes comerciales (fuente de verdad: @eventra/config)" },
  { label: "Plantillas oficiales", to: "/templates", icon: IconLayout, section: "datos", purpose: "Plantillas oficiales globales (no privadas de clientes)" },
  { label: "Audiencias", to: "/audiences", icon: IconUsers, section: "datos", purpose: "Audiencias, segmentos y reglas de recomendación" },
  { label: "Canales", to: "/channels", icon: IconNodes, section: "datos", purpose: "Canales de marketing y publicación" },
  // ── Operaciones de producto ──
  { label: "Eventra Business", to: "/business", icon: IconMegaphone, section: "producto", purpose: "Supervisión del producto para empresas (campañas, ofertas, anuncios…)" },
  { label: "Eventra Mobile", to: "/mobile", icon: IconSmartphone, section: "producto", purpose: "Administración de Eventra Mobile desde la PC" },
  { label: "Integraciones", to: "/integrations", icon: IconPlug, section: "producto", purpose: "Integraciones reales y futuras" },
  { label: "Automatizaciones", to: "/automations", icon: IconWorkflow, section: "producto", purpose: "Jobs, sincronizaciones, alertas, IA" },
  { label: "IA y modelos", to: "/ai", icon: IconCode, section: "producto", purpose: "Modelos de IA de la plataforma y su configuración" },
  { label: "Versiones y publicaciones", to: "/releases", icon: IconRocket, section: "producto", purpose: "Versiones de las apps y publicaciones de plataforma" },
  // ── Control ──
  { label: "Equipos y permisos", to: "/teams", icon: IconGroup, section: "control", purpose: "Operadores, empleados, roles, permisos" },
  { label: "Auditoría", to: "/audit", icon: IconContent, section: "control", purpose: "Registro de escrituras administrativas (actor/antes/después)" },
  { label: "Salud del sistema", to: "/health", icon: IconActivity, section: "control", purpose: "Estado de servicios, entornos y colas" },
  { label: "Configuración general", to: "/settings", icon: IconGear, section: "control", purpose: "Configuración general del Internal OS" },
];

/** Quick-create menu opened from the topbar `+` button. */
export interface QuickAction {
  id: string;
  label: string;
  to: string;
}
export const QUICK_CREATE: QuickAction[] = [
  { id: "qc-publication", label: "Nueva publicación", to: "/publications?create=1" },
  { id: "qc-push", label: "Nueva notificación push", to: "/mobile?create=1" },
  { id: "qc-source", label: "Nueva fuente", to: "/sources?create=1" },
  { id: "qc-country", label: "Nuevo país", to: "/countries?create=1" },
  { id: "qc-template", label: "Nueva plantilla oficial", to: "/templates?create=1" },
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
