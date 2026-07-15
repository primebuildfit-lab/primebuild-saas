# Eventra Internal OS — Auditoría de corrección estructural

> Auditoría obligatoria (sección 1) previa a la corrección. Registra el baseline y
> el plan de reorganización hacia un verdadero centro de control de plataforma.
> Sin deploy, sin push, sin merge.

- **Fecha:** 2026-07-15
- **Baseline:** rama `local-install-phase`, commit `952d18d` (local, no publicado).
- **Alcance:** solo `apps/admin`.

## 1. Ramas actuales (baseline — 31 ramas, 4 secciones)

`operacion`: Inicio, Calendario, Eventos y noticias, Oportunidades, Campañas, Ofertas, Anuncios, Estudio, Contenido, Tareas.
`datos`: Analítica, Audiencia, Plantillas, Medios, Fuentes, Países.
`mobile`: Resumen móvil, Publicaciones, Notificaciones, Usuarios móviles, Versiones, Analítica móvil, Config. móvil.
`config`: General, Membresías, Equipos, Integraciones, Automatizaciones, Canales, Etiquetas, Facturación.

**Diagnóstico:** demasiadas ramas OPERATIVAS de empresa cliente como ramas principales. El admin se parece a Eventra Business. El calendario es una lista, no un calendario. La tarjeta inferior de la sidebar ("Eventra Inc.") parece un tenant. Varias afordancias no ejecutan (quick-create sin modal, links de perfil, `help.eventra.app`).

## 2. Estructura nueva (5 grupos, 28 ramas)

- **GENERAL:** Inicio · Calendario global · Publicaciones · Empresas · Usuarios · Alertas
- **MÉTRICAS:** Resumen general · Métricas Mobile · Métricas Business · Comparaciones · Inversión y retorno
- **DATOS Y CONFIGURACIÓN:** Fuentes · Países · Parámetros · Planes y membresías · Plantillas oficiales · Audiencias · Canales
- **OPERACIONES DE PRODUCTO:** Eventra Business · Eventra Mobile · Integraciones · Automatizaciones · IA y modelos · Versiones y publicaciones
- **CONTROL:** Equipos y permisos · Auditoría · Salud del sistema · Configuración general

## 3. Conservar / fusionar / mover / eliminar

| Rama baseline | Acción | Destino |
| --- | --- | --- |
| Inicio | Conservar (reenfocar a métricas de plataforma) | GENERAL |
| Calendario | **Reescribir** como calendario real (mes/año/semana/agenda) | GENERAL |
| Eventos y noticias | **Mover** → pestaña | Publicaciones |
| Oportunidades | **Mover** → pestaña (motor → Parámetros) | Publicaciones |
| Campañas | **Mover** → pestaña (solo supervisión) | Eventra Business |
| Ofertas | **Mover** → pestaña (tipos globales) | Eventra Business |
| Anuncios | **Mover** → pestaña (supervisión) | Eventra Business |
| Estudio | **Mover** → pestaña (vista admin) | Eventra Business |
| Contenido | **Mover** → pestaña | Eventra Business / Mobile |
| Medios | **Mover** → pestaña | Eventra Business |
| Tareas | **Mover** → bloque | Inicio |
| Analítica | **Reemplazar** por sección Métricas (3 grupos) | MÉTRICAS |
| Resumen/Publicaciones/Notif/Usuarios/Versiones/Analítica/Config móvil | **Fusionar** en pestañas | Eventra Mobile |
| Membresías | **Renombrar** → Planes y membresías | DATOS Y CONFIG |
| Facturación | **Fusionar** en métricas/planes | — (deja de ser rama) |
| Etiquetas | **Fusionar** → taxonomía | Parámetros |
| Audiencia, Plantillas, Canales, Fuentes, Países, Integraciones, Automatizaciones, Equipos, General | Conservar (reubicadas por grupo) | según grupo |
| **Nuevas:** Publicaciones, Empresas, Usuarios, Alertas, Métricas (5), Parámetros, IA y modelos, Auditoría, Salud | **Crear** | según grupo |

## 4. Enlaces rotos / afordancias muertas (registro)

- Todas las rutas del nav baseline **resuelven** (no hay 404 de ruta), pero varias eran tablas genéricas.
- Afordancias sin acción: quick-create `?create=1` (no abre modal), items del menú de perfil, `help.eventra.app` (dominio inexistente), botones "···"/acciones (mock).
- **Regla de esta fase:** ninguna rama del menú definitivo termina en página vacía/404/placeholder. Lo no conectado abre una página completa (encabezado, explicación, fuente esperada, estado de conexión, empty state honesto, próxima acción).

## 5. Datos ficticios vs reales

- **Fixtures DEV (badgeados):** devOffers, devSources, devCompanies, devUsers, devJobs, devCampaigns, devEvents, devOpportunities, devAds, devCountries, devPublications, devPush, devReleases.
- **Datos reales consumidos:** ninguno todavía (no hay billing/analítica/telemetría conectada). Supabase existe pero el admin no lee datos de plataforma en vivo.
- **Consecuencia:** todas las MÉTRICAS medidas (dinero, usuarios, visitas, trials, conversiones, ROI, **PB**) se muestran como **estado vacío honesto** con fórmula documentada — nunca inventadas.

## 6. Métricas existentes

- No existe una sección de métricas separada; solo una "Analítica" genérica.
- Se crea la sección definitiva: **Métricas Mobile**, **Métricas Business**, **Resumen general**, **Comparaciones**, **Inversión y retorno**, con toggle **D/M/A** y fórmulas documentadas.

## 7. Fuentes disponibles

- `devSources` (5): US Public Holidays, Retail Calendar API (degraded), Canada Events, Manual Curation, Partner Submissions (down). Es el único dominio con estructura rica para poblar la rama Fuentes de forma honesta.

## 8. Estado del calendario

- **Actual:** lista vertical de eventos con estados (no es un calendario). ❌
- **Objetivo:** calendario real con vistas **Año / Mes / Semana / Agenda**, rejilla de 7 columnas, colores por aplicación/tipo, filtros y drawer de detalle. Se usará el motor real `@eventra/calendar` (`monthGridDays`, `yearMonths`, `weekdayLabels`, `toISODate`, `shiftISO`).

## 9. Convención de datos y planes

- **DMA:** D = Día · M = Mes · A = Año (toggle en cada métrica).
- **Planes reales** (`@eventra/config`): `business.free`, `business.starter`, `business.growth`, `business.pro`. La spec menciona "VIP"; el nombre real es **Pro** → se usa Pro (regla: usar nombres reales existentes).
- **PB:** siempre "No disponible · Integración PB futura". Nunca calcular.

## 10. Orden de trabajo

1. Nueva estructura (nav 5 grupos) + tarjeta de estado de plataforma.
2. Rutas reales para cada rama (sin links muertos).
3. Calendario real.
4. Métricas separadas con D/M/A + estados vacíos honestos.
5. Parámetros · Fuentes ampliada · Planes.
6. Business/Mobile Operations con pestañas (supervisión).
7. Control: Equipos, Auditoría, Salud, Configuración.
8. Tests + typecheck + build. Reporte final.
