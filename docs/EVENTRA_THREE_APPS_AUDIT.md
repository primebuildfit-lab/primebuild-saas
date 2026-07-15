# EVENTRA — Auditoría de las tres aplicaciones

> Auditoría obligatoria (sección 13 del Contexto Maestro) previa a cualquier
> modificación. Reconstruye el estado **real** del repositorio y lo compara con la
> visión del ecosistema. No inventa carpetas, métricas ni conexiones: todo lo aquí
> descrito está verificado contra el código en la rama actual.

- **Fecha:** 2026-07-15
- **Rama:** `local-install-phase`
- **Fuente de verdad seguida:** código real → modelos → base de datos → docs → esta especificación.
- **Regla aplicada:** donde la doc/visión contradice al código, se documenta la diferencia (no se cambia el código en esta auditoría).

---

## 1. Estructura real del monorepo

Workspaces declarados en `package.json`: `apps/*`, `packages/*`, `services/*`.

```
apps/
  admin/      Eventra Principal / Internal OS   (Vite SPA, React Router, dark command center)
  business/   Eventra Business                  (React Router + Shopify App Bridge, tenant)
  consumer/   Eventra Mobile                    (Vite PWA)
packages/
  types/        Contratos de dominio compartidos
  identity/     Principals, roles de plataforma, permisos
  entitlements/ Reglas por plan
  config/       Fuente de verdad de PLANES (Free/Starter/Growth/VIP)  ← equivale a "plans"
  calendar/     Motor de calendario (fechas, recurrencia, agenda)
  promotions/   Catálogo de plantillas promo + preview Liquid seguro   ← equivale parcial a "templates"
  ui/           Primitivas compartidas
  testing/      Factories/fixtures de test
services/
  api/          Contratos (contracts.ts) — esqueleto
  workers/      Contratos (contracts.ts) — esqueleto
```

## 2. Estado de `apps/admin` (Eventra Principal / Internal OS)

- **Identidad visual:** command center **oscuro** (canvas azul-negro, acento violeta), sidebar + topbar, ⌘K, densidad alta. **Cumple** la identidad de escritorio del Internal OS. **(Se conserva — es "la plantilla negra".)**
- **Navegación actual (19 ramas)** en `src/os/nav.ts`:
  - Operacional: Inicio, Calendario, Campañas, Ofertas, Contenido, **Estudio**, Tareas, Analítica, Audiencia, Plantillas, Medios, Integraciones.
  - Configuraciones: General, Membresías, Equipos, **Canales**, **Etiquetas**, Automatizaciones, Facturación.
- **Datos:** fixtures DEV claramente badgeados (`data/seed.ts`, `data/os-seed.ts`, `data/studio-seed.ts`). Resultados medidos (ingresos/conversiones/uso) muestran **estados vacíos honestos** (no se inventan).
- **Motores (pure):** `engine/scoring.ts`, `occurrences.ts`, `changeDetection.ts`, `commissions.ts`, `liquidPreview.ts`, `ai/`.
- **Conexiones a otras apps:** tarjetas de superficie (`surfaces.tsx` + `surfaces.config.ts`) con **estado de conexión en vivo** (En línea / Apagado) y override por env — recién robustecidas.

## 3. Estado de `apps/business` (Eventra Business)

- **Rutas/nav (24 entradas)** en `app/lib/nav.ts`: Dashboard, Vista en vivo, Calendar, Events & news, Opportunities, Advertisements, Campaigns, Crear anuncio, Promotion Builder, Offers, Templates, Content, Media, Marketing Memory, Analytics, Countries, Sources, Audiences, Team, Integrations, Plan & billing, Settings, Admin.
- **Shopify:** App Bridge + OAuth + webhooks presentes (`root.tsx`, `routes/webhooks.*`, `shopify.app.toml` → Railway).
- **Tenant:** el producto respeta plan/tenant; datos por comercio.
- **Estado:** producto **CONGELADO** (pre-certificación). Es el más completo de los tres.
- **Nota de idioma:** el nav está mayormente en **inglés** (mezclado con algo de español). La visión no fija idioma para Business, pero conviene decidirlo.

## 4. Estado de `apps/consumer` (Eventra Mobile)

- **Contenido real:** `App.tsx`, `Calendar.tsx` (calendario mensual mobile-first sobre `@eventra/calendar`), `PwaRuntime.tsx` (service worker, offline, install prompt), `theme.css`, `public/` (manifest, sw.js, iconos, offline.html).
- **Cobertura vs visión:** solo existe **Calendario** + runtime PWA. **Faltan** como vistas: Home, Discover, Favoritos, Notificaciones, Perfil.
- **Es el más incompleto** de los tres respecto a la visión.

## 5. Paquetes compartidos — mapeo conceptual

| Visión                | Real                         | Estado |
|-----------------------|------------------------------|--------|
| `types`               | `packages/types`             | ✅ existe |
| `identity`            | `packages/identity`          | ✅ existe |
| `entitlements`        | `packages/entitlements`      | ✅ existe |
| `calendar`            | `packages/calendar`          | ✅ existe |
| `templates`           | `packages/promotions` (parcial) | ⚠️ parcial (catálogo promo, no motor de plantillas completo) |
| planes (fuente única) | `packages/config`            | ✅ existe (nombre distinto a la visión) |
| `ui`                  | `packages/ui`                | ✅ existe |
| `opportunities`       | lógica en `apps/admin/src/engine` | ❌ no es paquete compartido |
| `campaigns`           | disperso en apps            | ❌ no es paquete compartido |
| `analytics`          | —                            | ❌ no existe |
| `persistence`         | file/Supabase en apps        | ❌ no es paquete compartido |
| `shopify`             | dentro de `apps/business`    | ⚠️ no aislado en paquete |

## 6. Dependencias entre aplicaciones

- `apps/admin` depende de: `@eventra/config`, `identity`, `promotions`, `types`, `ui`.
- `apps/business` depende de: paquetes compartidos + Shopify (directo).
- `apps/consumer` depende de: `@eventra/calendar` (+ ui/types).
- **Aislamiento Shopify:** solo Business lo usa directamente — **cumple** la regla (Admin/Mobile no acoplados a Shopify).

## 7–13. Propiedad de datos, métricas, parámetros, planes, permisos

- **Datos globales** (países, fuentes, eventos, oportunidades, tipos de oferta, plantillas oficiales, planes, score, integraciones, automatizaciones, métricas): conceptualmente del Admin. Hoy viven como **fixtures DEV** en `apps/admin`, no como datos globales persistidos.
- **Datos de tenant** (campañas, anuncios, ofertas privadas, contenido, miembros): en `apps/business` (persistencia file/Supabase).
- **Datos personales** (favoritos, país, idioma, notificaciones): en `apps/consumer` — mínimos aún.
- **Planes:** fuente única real = `packages/config`. Business/Mobile deben **consumirla** (verificar que Business no tenga precios hardcodeados aparte — pendiente de confirmar en `app.billing.tsx`).
- **Permisos:** `packages/identity` define roles de plataforma + `platformCan(...)`; el Admin usa un principal mock `platform_owner` con **deny-by-default**. **Cumple** el modelo, aún mockeado.

## 14. Shopify

`apps/business` únicamente. OAuth, App Bridge, webhooks, billing, `shopify.app.toml` (application_url = Railway). Admin/Consumer no dependen de Shopify. ✅

## 15. Mobile

`apps/consumer` es la app. Su **administración** (Mobile Operations) **no existe** en `apps/admin`. La visión exige que viva **dentro de** `apps/admin`, no como cuarta app. ❌ pendiente.

## 16. Integraciones

Admin tiene rama **Integraciones** con estados honestos (Supabase conectado, Shopify no configurado). ✅ base presente.

## 17. Diferencias contra la visión (GAP principal)

### 17.1 Ramas del Admin vs las 21 exigidas

| # visión | Rama exigida            | Estado actual |
|---------:|-------------------------|---------------|
| 1 | Inicio                        | ✅ Inicio |
| 2 | Calendario global             | ✅ Calendario |
| 3 | **Eventos y noticias globales** | ❌ **falta** |
| 4 | **Oportunidades globales**    | ❌ **falta** (distinta de Ofertas) |
| 5 | Campañas                      | ✅ Campañas |
| 6 | Ofertas                       | ✅ Ofertas |
| 7 | **Anuncios**                  | ⚠️ parcial (lo cubre "Estudio") |
| 8 | Contenido                     | ✅ Contenido |
| 9 | Tareas                        | ✅ Tareas |
| 10 | Analítica global             | ✅ Analítica |
| 11 | Audiencias                   | ✅ Audiencia |
| 12 | Plantillas globales          | ✅ Plantillas |
| 13 | Medios                       | ✅ Medios |
| 14 | **Fuentes**                  | ❌ **falta** (crítico) |
| 15 | **Países**                   | ❌ **falta** |
| 16 | Integraciones                | ✅ Integraciones |
| 17 | Automatizaciones             | ✅ Automatizaciones |
| 18 | Membresías y planes          | ✅ Membresías |
| 19 | Equipos y permisos           | ✅ Equipos |
| 20 | Facturación global           | ✅ Facturación |
| 21 | Configuración global         | ✅ General |
| + | **Mobile Operations** (sección) | ❌ **falta completa** |

**Ramas extra (existen, no están en la lista numerada):** `Estudio`, `Canales`, `Etiquetas`.
- `Estudio` ≈ composición de Anuncios + código (JS/Liquid). Se puede mapear a **Anuncios** o conservar como herramienta.
- `Canales` y `Etiquetas` son configuración razonable; no las exige la visión pero no la contradicen.

### 17.2 Otras diferencias
- **Consumer** carece de Home/Discover/Favoritos/Notificaciones/Perfil.
- **Design systems:** Admin (oscuro) y Consumer están diferenciados; el simulador `business-preview.tsx` del Admin representa Business en **oscuro**, mientras el Business real usa tema **claro (VIP)** → posible incoherencia de simulación.
- **Dominio compartido** (opportunities/campaigns/analytics/persistence) vive dentro de apps, no como paquetes — divergencia estructural (no bloqueante).

## 18. Riesgos

1. Reestructurar el nav del Admin toca `nav.ts`, `App.tsx`, `pages.tsx` y `test/shell.test.tsx` (tests que afirman "19 ramas" y labels concretos).
2. Business está **congelado** — no tocar sin necesidad explícita.
3. No inventar datos: las nuevas ramas deben nacer con fixtures DEV badgeados + estados vacíos honestos, nunca métricas falsas.
4. Planes: confirmar que Business consume `@eventra/config` y no hardcodea precios.

## 19. Duplicaciones

- Conceptos presentes **a la vez** en Business (tenant) y ausentes en Admin (global): Eventos/Noticias, Oportunidades, Fuentes, Países, Audiencias. El riesgo es duplicar lógica en lugar de que el Admin sea la fuente global y Business consuma.

## 20. Próximo trabajo recomendado (para "ajustar" manteniendo la plantilla negra)

**Fase A — Alinear la IA del Admin a la visión (sin cambiar el diseño oscuro):**
1. Añadir ramas faltantes: **Eventos y noticias**, **Oportunidades**, **Fuentes**, **Países**, y **Anuncios** (o promover Estudio→Anuncios).
2. Añadir la sección **Mobile Operations** dentro del Admin (Dashboard móvil, Publicaciones, Calendario público, Contenido, Notificaciones push, Usuarios móviles, Versiones, Android, iOS, Analítica, Integraciones, Configuración).
3. Cada rama nueva: página real con fixtures DEV badgeados + estados vacíos honestos; rutas registradas; ⌘K/quick-create actualizados; tests actualizados.

**Fase B — Consumer:** construir Home/Discover/Favoritos/Notificaciones/Perfil.

**Fase C — Dominio compartido:** extraer opportunities/campaigns/analytics a paquetes si se decide.

> Esta auditoría no modifica código de producto. El siguiente paso (Fase A) es el
> ajuste del Internal OS solicitado, conservando la identidad oscura existente.
