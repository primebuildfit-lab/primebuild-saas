# Eventra Internal OS — Dashboard (`EVENTRA_INTERNAL_OS_DASHBOARD.md`)

`Inicio` (`/`, `os/home.tsx`). Answers **"¿Cómo está Eventra hoy?"**. Structure
follows the specification exactly; data follows the honesty rules (see
`EVENTRA_INTERNAL_OS_DATA_SOURCES.md`).

## Header
- Left: `Bienvenido, {nombre} 👋` + `Resumen general de tu estrategia de marketing`.
- Right: `DateRangePicker` (calendar icon + range) + `FilterDropdown` (channel,
  default "Todos los canales").

## Row 1 — four metric cards (`grid 4×`)
| Card | Icon / tone | Source | Trend |
| --- | --- | --- | --- |
| Campañas activas | megáfono / violeta | count(devCampaigns active) | Sin comparación |
| Ofertas disponibles | etiqueta / verde lima | count(devOffers active+verified) | Sin comparación |
| Tareas pendientes | check / naranja | count(devTasks pending+in_progress+overdue) | Sin comparación |
| Rendimiento general | barras / azul | **no source → "No disponible"** | — |

Trends read **"Sin comparación"** (no historical series). "Rendimiento general" is
a measured index with no documented formula → explicit empty state, never faked.

## Row 2 — `grid 2fr | 1fr | 1fr`
- **A — Calendario de la semana** (2fr): 7 day columns (current day highlighted),
  all-day chips for this week's fixture items (campaign/task/content, colored),
  an hour grid (08–20) as visual structure, a legend, and an honest note that exact
  times are not tracked yet. Empty → "No hay actividades programadas esta semana".
- **B — Rendimiento por canal** (1fr, top): `Donut`. No channel-performance
  measurement exists → container + "Sin datos / Métrica aún no disponible".
- **B — Campañas destacadas** (1fr, below): top 3 fixture campaigns by
  date-derived progress, each with `StatusBadge` + `ProgressBar`. Empty state ready.
- **C — Actividad reciente** (1fr, top): `ActivityFeed` DERIVED from real fixture
  state (job failed, source down/degraded, offer cancelled, campaign overdue,
  company suspended). Empty → "No hay actividad reciente".
- **C — Ofertas más populares** (1fr, below): usage is a measured outcome with no
  source → "No hay ofertas utilizadas todavía".

## Row 3 — Próximas tareas
Wide `Card` + table: selección · tarea · campaña · asignado · vencimiento
(Hoy/Mañana/Atrasada/fecha) · prioridad (`PriorityBadge`) · estado (`StatusBadge`).
Empty → "No hay tareas próximas".

## Loading / error / empty
Every block owns an empty/error path; `LoadingSkeleton` + `ErrorState` primitives
exist for when real async sources are wired.
