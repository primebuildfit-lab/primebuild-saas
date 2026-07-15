/**
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  PLANTILLA · Aplicaciones y superficies (diseños personalizados)           │
 * ├──────────────────────────────────────────────────────────────────────────┤
 * │  Esta es la plantilla fácil de encontrar para registrar diseños.           │
 * │  Para AÑADIR un diseño nuevo: copia una entrada de SURFACES y cámbiala.     │
 * │  Nada más — se muestra automáticamente como tarjeta en Integraciones y,     │
 * │  al hacer clic, ABRE su `url` en una VENTANA NUEVA (fuera de la página).    │
 * │                                                                            │
 * │  Campos:                                                                    │
 * │   url        enlace real (absoluto https://… o relativo /ruta del admin)    │
 * │   launch     cómo arrancar ese host en local (comando/atajo) — se muestra   │
 * │              cuando la superficie está APAGADA, para reconectarla al toque  │
 * │   icon       business | mobile | templates | ads | layout | link           │
 * │   accent     brand | info | magenta | success   (color de la tarjeta)      │
 * └──────────────────────────────────────────────────────────────────────────┘
 * Sin JSX ni imports: es solo datos, para que instalar un diseño sea «ponerlo».
 *
 * ── UNA SOLA FUENTE DE VERDAD PARA LAS URLS ──────────────────────────────────
 * Las URLs NO se escriben sueltas: se resuelven con `appUrl()`, que primero mira
 * una variable de entorno (para el día que despliegues, sin tocar código) y si no
 * existe usa el host LOCAL correcto de cada launcher. Así el enlace deja de
 * "desconectarse": local por defecto, producción con solo poner la env.
 *
 *   VITE_BUSINESS_URL   →  Eventra Business   (por defecto http://localhost:3000/app)
 *   VITE_MOBILE_URL     →  Eventra Mobile     (por defecto http://localhost:5273)
 *
 * Ej. para apuntar Business al deploy real de Railway, crea apps/admin/.env.local:
 *   VITE_BUSINESS_URL=https://eventrabusiness-production.up.railway.app/app
 */

export type SurfaceIcon = "business" | "mobile" | "templates" | "ads" | "layout" | "link";
export type SurfaceAccent = "brand" | "info" | "magenta" | "success";
export type SurfaceTone = "success" | "info" | "warning" | "neutral" | "brand";

export interface SurfaceEntry {
  id: string;
  name: string;
  kind: string;
  desc: string;
  icon: SurfaceIcon;
  accent: SurfaceAccent;
  /** Cómo arrancar este host en local, mostrado cuando está apagado. */
  launch: string;
  /** Enlace real. Resuelto por `appUrl()` (env override → default local). */
  url: string;
}

/**
 * Resuelve una URL de app: usa la variable de entorno de Vite si está definida y
 * no vacía; si no, el default local. Acceso defensivo a import.meta.env para que
 * el módulo también cargue fuera de Vite (p. ej. en tests/SSR).
 */
export function appUrl(envKey: string, fallback: string): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    const v = env?.[envKey];
    if (typeof v === "string" && v.trim()) return v.trim();
  } catch {
    /* noop */
  }
  return fallback;
}

// Las DOS apps que hospeda esta consola, como recuadros grandes. Templates, Ads,
// contenido, etc. vivirán DENTRO de cada app más adelante — por ahora solo estas dos.
export const SURFACES: SurfaceEntry[] = [
  {
    id: "business",
    name: "Eventra Business",
    kind: "App para clientes · Business (web / Shopify)",
    desc: "El producto que usan los comercios: planificación de marketing, oportunidades, campañas y anuncios. Sus plantillas, contenido y ofertas vivirán aquí dentro.",
    icon: "business",
    accent: "brand",
    launch: "Eventra-Local.cmd  ·  npm run start:local",
    url: appUrl("VITE_BUSINESS_URL", "http://localhost:3000/app"),
  },
  {
    id: "mobile",
    name: "Eventra",
    kind: "App mobile · Consumer (PWA instalable)",
    desc: "La app para compradores: calendario comercial y alertas de ofertas verificadas. PWA instalable en el teléfono; funciona offline.",
    icon: "mobile",
    accent: "info",
    launch: "Eventra-Mobile.cmd  ·  npm run start:mobile",
    url: appUrl("VITE_MOBILE_URL", "http://localhost:5273"),
  },
];
