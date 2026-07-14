# Eventra Internal OS — Navigation (`EVENTRA_INTERNAL_OS_NAVIGATION.md`)

18 branches in two sidebar sections (`os/nav.ts`). Labels are Spanish (console
language). Icons come from the local inline set (`os/icons.tsx`), zero deps.

## Operational (main)

| # | Branch | Route | Purpose |
| --- | --- | --- | --- |
| 1 | Inicio | `/` | ¿Cómo está Eventra hoy? (dashboard) |
| 2 | Calendario | `/calendar` | Calendario operacional global (no el Business del cliente) |
| 3 | Campañas | `/campaigns` | Campañas internas · de empresas · automáticas |
| 4 | Ofertas | `/offers` | Ofertas comerciales (descuento/bundle/envío/regalo/precio) |
| 5 | Contenido | `/content` | Base de contenido global (Eventra/clientes/IA/histórico) |
| 6 | Tareas | `/tasks` | Trabajo interno del equipo |
| 7 | Analítica | `/analytics` | Analítica global + constructor de consultas |
| 8 | Audiencia | `/audiences` | Audiencias empresariales vs personales (separadas) |
| 9 | Plantillas | `/templates` | Sistemas reutilizables |
| 10 | Medios | `/media` | Imágenes, video, documentos, licencias |
| 11 | Integraciones | `/integrations` | Integraciones reales y futuras (sin claves en vivo) |

## — CONFIGURACIONES — (divider + label)

| # | Branch | Route | Purpose |
| --- | --- | --- | --- |
| 12 | General | `/general` | Configuración general del Internal OS |
| 13 | Membresías | `/memberships` | Planes comerciales (fuente canónica `@eventra/config`) |
| 14 | Equipos | `/teams` | Operadores, empleados, permisos |
| 15 | Canales | `/channels` | Canales de marketing y publicación |
| 16 | Etiquetas | `/labels` | Taxonomía global |
| 17 | Automatizaciones | `/automations` | Jobs, sincronizaciones, alertas, IA |
| 18 | Facturación | `/billing` | Facturación global (administrativa; no mueve dinero) |

## Topbar

Hamburguesa · búsqueda `Buscar en Eventra…` (⌘K) · `+` creación rápida ·
notificaciones (sin conteo falso) · ayuda · perfil (avatar + nombre + rol) ·
badge de entorno.

## Quick-create (`+`) — `QUICK_CREATE`

Nueva campaña · nueva oferta · nueva tarea · nuevo contenido · nuevo evento ·
nueva plantilla · nueva automatización.

## Command palette (⌘K) — `OS_COMMANDS`

Every branch as a navigation + the 7 quick-create actions, filtered by label/hint.
