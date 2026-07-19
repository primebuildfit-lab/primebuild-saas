/**
 * Business Admin navigation — MONITORING structure (owner's spec §7).
 *
 * This is a supervision console over the commercial Business Client, NOT a copy of
 * it. There are NO global commercial "create" buttons (no Create advertisement /
 * offer / Promotion Builder): the admin monitors, reviews, and intervenes with
 * permissions. Each item declares the `business.*` permission that gates it
 * (`@eventra/identity`), so the UI is deny-by-default and testable.
 */
import type { ComponentType, SVGProps } from "react";
import { BUSINESS_ADMIN_PERMISSIONS as BA } from "@eventra/identity";
import {
  IconHome, IconBuilding, IconStore, IconUsers, IconCart, IconChart,
  IconMegaphone, IconCard, IconPlug, IconAlert, IconLifebuoy, IconPulse,
  IconShield, IconGear, IconEye,
} from "./icons";

export type IconCmp = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface NavItem {
  label: string;
  to: string;
  icon?: IconCmp;
  /** the business.* permission required to see/reach this item */
  perm: string;
  purpose: string;
  /** sub-items (e.g. Órdenes, Marketing) rendered indented under the parent */
  children?: { label: string; to: string; purpose: string }[];
}

export const NAV: NavItem[] = [
  { label: "Resumen", to: "/", icon: IconHome, perm: BA.view,
    purpose: "Panorama real de la plataforma comercial (sin datos ficticios)" },

  { label: "Empresas", to: "/companies", icon: IconBuilding, perm: BA.companiesView,
    purpose: "Supervisión de empresas cliente (tenants)" },
  { label: "Tiendas", to: "/stores", icon: IconStore, perm: BA.storesView,
    purpose: "Tiendas conectadas por las empresas cliente" },
  { label: "Miembros", to: "/members", icon: IconUsers, perm: BA.companiesView,
    purpose: "Miembros internos de las empresas cliente (monitoreo, sin suplantación)" },

  { label: "Órdenes", to: "/orders", icon: IconCart, perm: BA.ordersView,
    purpose: "Órdenes de las tiendas cliente (el admin no crea órdenes)",
    children: [
      { label: "En vivo", to: "/orders/live", purpose: "Órdenes en curso en tiempo real" },
      { label: "Realizadas", to: "/orders/completed", purpose: "Órdenes completadas" },
      { label: "Canceladas", to: "/orders/cancelled", purpose: "Órdenes canceladas" },
      { label: "Reembolsos", to: "/orders/refunds", purpose: "Órdenes reembolsadas" },
    ] },

  { label: "Ventas", to: "/sales", icon: IconChart, perm: BA.ordersView,
    purpose: "Ventas agregadas del periodo (derivadas de datos reales)" },

  { label: "Marketing", to: "/marketing", icon: IconMegaphone, perm: BA.marketingView,
    purpose: "Monitoreo de marketing (sin creación comercial)",
    children: [
      { label: "Anuncios", to: "/marketing/ads", purpose: "Anuncios de las empresas (monitoreo)" },
      { label: "Campañas", to: "/marketing/campaigns", purpose: "Campañas (monitoreo)" },
      { label: "Ofertas", to: "/marketing/offers", purpose: "Ofertas (monitoreo)" },
      { label: "Contenido", to: "/marketing/content", purpose: "Contenido (monitoreo)" },
      { label: "Resultados", to: "/marketing/results", purpose: "Resultados y conversiones (monitoreo)" },
    ] },

  { label: "Planes y suscripciones", to: "/subscriptions", icon: IconCard, perm: BA.subscriptionsView,
    purpose: "Estado administrativo de planes y suscripciones" },
  { label: "Integraciones", to: "/integrations", icon: IconPlug, perm: BA.integrationsView,
    purpose: "Integraciones de las empresas y su estado" },
  { label: "Alertas", to: "/alerts", icon: IconAlert, perm: BA.alertsView,
    purpose: "Alertas e incidencias derivadas del estado real" },
  { label: "Soporte", to: "/support", icon: IconLifebuoy, perm: BA.view,
    purpose: "Cola de soporte y tickets (monitoreo)" },
  { label: "Salud del servicio", to: "/health", icon: IconPulse, perm: BA.view,
    purpose: "Estado real de servicios y sincronizaciones" },
  { label: "Auditoría", to: "/audit", icon: IconShield, perm: BA.auditView,
    purpose: "Eventos de auditoría reales" },
  { label: "Configuración", to: "/settings", icon: IconGear, perm: BA.view,
    purpose: "Configuración del panel administrativo" },
];

/** Flatten parents + children into routable leaves with their gating permission. */
export interface NavLeaf { label: string; to: string; perm: string; purpose: string; icon?: IconCmp; }
export const NAV_LEAVES: NavLeaf[] = NAV.flatMap((item) =>
  item.children && item.children.length
    ? item.children.map((c) => ({ label: c.label, to: c.to, perm: item.perm, purpose: c.purpose }))
    : [{ label: item.label, to: item.to, perm: item.perm, purpose: item.purpose, icon: item.icon }],
);

export { IconEye };
