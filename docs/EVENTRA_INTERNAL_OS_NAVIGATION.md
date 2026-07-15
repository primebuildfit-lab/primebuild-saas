# Eventra Internal OS — Navigation (`EVENTRA_INTERNAL_OS_NAVIGATION.md`)

**Definitive information architecture (Phase 11).** 31 branches in **four** sidebar
sections (`os/nav.ts`), aligned to the ecosystem master spec: the 21 platform
branches + a **Mobile Operations** centre that lives inside `apps/admin` (never a
4th app). Labels are Spanish (console language); icons come from the local inline
set (`os/icons.tsx`), zero deps. The dark command-center design is unchanged.

Section headers and order are declared in `NAV_SECTIONS`; the sidebar renders them
generically. Active state uses the **longest matching route prefix** so
`/mobile/publications` highlights *Publicaciones*, not the `/mobile` summary.

## Operación

| Branch | Route | Purpose |
| --- | --- | --- |
| Inicio | `/` | ¿Cómo está Eventra hoy? (dashboard) |
| Calendario | `/calendar` | Calendario operacional global (no el Business del cliente) |
| Eventos y noticias | `/events` | Bandeja global de eventos/noticias por revisar → alimentan oportunidades |
| Oportunidades | `/opportunities` | Motor de oportunidades: score, país, importancia, urgencia |
| Campañas | `/campaigns` | Campañas internas · de empresas · automáticas |
| Ofertas | `/offers` | Biblioteca global de tipos de oferta |
| Anuncios | `/ads` | Tipos de anuncio y su ciclo de vida (borrador → activo → archivado) |
| Estudio | `/studio` | Composición de anuncios + personalización (JavaScript + Liquid) |
| Contenido | `/content` | Base de contenido global |
| Tareas | `/tasks` | Trabajo interno del equipo |

## Datos y análisis

| Branch | Route | Purpose |
| --- | --- | --- |
| Analítica | `/analytics` | Analítica global y comparaciones |
| Audiencia | `/audiences` | Audiencias empresariales y personales |
| Plantillas | `/templates` | Sistemas reutilizables + simuladores de superficie |
| Medios | `/media` | Imágenes, videos, documentos, licencias |
| Fuentes | `/sources` | APIs, RSS y fuentes que alimentan los eventos |
| Países | `/countries` | Países, regiones, idiomas y cobertura |

## Mobile Operations

> Administración de Eventra Mobile (`apps/consumer`) desde la PC. **No es una 4ª app.**

| Branch | Route | Purpose |
| --- | --- | --- |
| Resumen móvil | `/mobile` | Estado de la app móvil |
| Publicaciones | `/mobile/publications` | Qué se publica a los usuarios móviles |
| Notificaciones | `/mobile/notifications` | Notificaciones push |
| Usuarios móviles | `/mobile/users` | Usuarios (agregado, con privacidad) — estados vacíos honestos |
| Versiones | `/mobile/releases` | Versiones y despliegues Android / iOS / PWA |
| Analítica móvil | `/mobile/analytics` | Retención, pantallas, uso — estados vacíos honestos |
| Configuración móvil | `/mobile/settings` | Parámetros y comportamiento de la app móvil |

## Configuraciones

| Branch | Route | Purpose |
| --- | --- | --- |
| General | `/general` | Configuración general del Internal OS |
| Membresías | `/memberships` | Planes comerciales (fuente de verdad: `@eventra/config`) |
| Equipos | `/teams` | Operadores, empleados, permisos |
| Integraciones | `/integrations` | Integraciones reales y futuras |
| Automatizaciones | `/automations` | Jobs, sincronizaciones, alertas, IA |
| Canales | `/channels` | Canales de marketing y publicación |
| Etiquetas | `/labels` | Taxonomía global |
| Facturación | `/billing` | Facturación global (administrativa, no mueve dinero) |

## Quick-create (topbar `+`) & command palette (⌘K)

`QUICK_CREATE` exposes 9 create actions (campaña, anuncio, oferta, oportunidad,
evento, tarea, contenido, notificación push, automatización). `OS_COMMANDS` is
generated from `OS_NAV` (a "Ir a …" for every branch) + the quick-create actions.

## Data discipline

Every branch renders its real IA from clearly-badged DEV fixtures
(`data/seed.ts`, `os-seed.ts`, `global-seed.ts`, `mobile-seed.ts`). **Measured
outcomes** with no live source (revenue, conversions, impressions, CTR, active
users, retention, delivery/open rate) render as **honest empty states** — never
fabricated. Write actions are gated by the platform permission matrix
(`@eventra/identity`) and are mock (no live mutation).
