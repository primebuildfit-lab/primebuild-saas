# Eventra Internal OS — Data Sources & Honesty (`EVENTRA_INTERNAL_OS_DATA_SOURCES.md`)

The absolute rule: **the interface looks complete, but data is never invented.**
Three tiers, transparently labeled in the UI (`DATOS DEV` badge + `development`
environment badge).

## Tier 1 — DEV fixtures (entities)
Clearly-marked development-only records (`isDev: true`, generic names, guarded by
`isProdLike`). This is a development tool, never presented as production data.
- `data/seed.ts`: offers, sources, companies, users, jobs, commissions.
- `data/os-seed.ts`: campaigns, tasks, channels, integrations, templates, content,
  media, labels, audiences, operators.
Counts shown on metric cards are **real counts of these fixtures**.

## Tier 2 — Derived (from real fixture state, not authored)
- **Activity feed**: generated from actual fixture states — failed jobs, down /
  degraded sources, cancelled offers, overdue campaigns, suspended companies.
- **Campaign progress**: elapsed-time between real `startDate`/`endDate` (0–100).
- **Calendar / weekly agenda**: items whose fixture dates fall in the period.

## Tier 3 — Empty states (measured outcomes with NO real source)
Never fabricated — container + legend preserved, explicit empty message:
| Where | Message |
| --- | --- |
| Rendimiento general (dashboard) | `No disponible` — fórmula real no conectada |
| Metric trends | `Sin comparación` — no historical series |
| Rendimiento por canal (donut) | `Sin datos` / `Métrica aún no disponible` |
| Ofertas más populares / usage | `No hay ofertas utilizadas todavía` |
| Analítica → ingresos/conversiones | `Métrica no conectada` |
| Membresías → usuarios/ingresos | `Sin datos` (plans themselves = canonical config) |
| Facturación → MRR/suscripciones | `Sin datos` — requiere facturación real |
| Canales → conversiones | `Sin datos` |
| Audiencia → tamaño/comportamiento | `Métrica aún no disponible` |
| Medios → almacenamiento | `Sin datos` — bytes off Postgres |

`0` is only used when a real query confirms zero. No invented campaigns, users,
revenue, conversions, offers, tasks, activity, alerts, percentages, growth,
performance, costs, or AI usage.

## Canonical (not seed, not invented)
- **Plans** (Membresías): `BUSINESS_PLANS` / `BUSINESS_PLAN_ORDER` from
  `@eventra/config` — the single source of truth for names, prices, limits.
- **Commissions**: modeled 1–2% via the engine, labeled "no cobradas".

## To go live
Replace Tier-1 fixtures with real repositories and connect Tier-3 sources
(Shopify/pagos/analytics/audit log). Every empty state then fills from a real query;
no UI restructuring required.
