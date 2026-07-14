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
 * │   icon       business | mobile | templates | ads | layout | link           │
 * │   accent     brand | info | magenta | success   (color de la tarjeta)      │
 * │   statusTone success | info | warning | neutral | brand                     │
 * └──────────────────────────────────────────────────────────────────────────┘
 * Sin JSX ni imports: es solo datos, para que instalar un diseño sea «ponerlo».
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
  status: string;
  statusTone: SurfaceTone;
  /** Enlace real. Absoluto (https://…) o relativo al admin (/studio). Se abre en ventana nueva. */
  url: string;
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
    status: "Host local",
    statusTone: "brand",
    url: "http://localhost:3000/app",
  },
  {
    id: "mobile",
    name: "Eventra",
    kind: "App mobile · Consumer (PWA instalable)",
    desc: "La app para compradores: calendario comercial y alertas de ofertas verificadas. PWA instalable en el teléfono; funciona offline.",
    icon: "mobile",
    accent: "info",
    status: "Host local",
    statusTone: "info",
    // Host local (npm run start:mobile). Para instalar en un teléfono real, cámbialo por
    // una URL pública HTTPS (túnel Cloudflare / deploy) — la efímera anterior fue
    // https://troops-supervisors-reply-saver.trycloudflare.com
    url: "http://localhost:5273",
  },
];
