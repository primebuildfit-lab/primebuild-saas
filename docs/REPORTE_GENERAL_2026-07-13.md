# Eventra — Reporte General Completo del Estado Real del Proyecto

> **Fecha:** 2026-07-13 · **Modo:** solo lectura (no se modificó código, no se instaló nada, no se ejecutaron migraciones ni despliegues, no se cambió configuración de Shopify).
> **Fuente de verdad:** el código real del repositorio. Donde el código contradice la documentación antigua, se registra la contradicción y **gana el código**.
> **Ubicación auditada:** `D:\Eventra\eventra` · **Rama actual:** `local-install-phase` · **Remoto:** `github.com/primebuildfit-lab/primebuild-saas`.

---

## 1. Resumen ejecutivo

Eventra es un **monorepo npm-workspaces** (`eventra-platform` v0.1.0) que hoy contiene **un producto real y funcional** — **Eventra Business** (`apps/business`) — más **dos cáscaras (shells) de fundación** — Consumer y Admin — y un conjunto de **paquetes compartidos `@eventra/*`**. La identidad "Eventra = sistema de planificación de marketing y memoria de campañas, primero como app de Shopify, con arquitectura para SaaS multi-tenant" **se respeta** en código y documentación; no hay contaminación de PrimeBuild en el código de la app.

El estado real **está muy por delante** de lo que dice la memoria de contexto ("Phase 1 done/awaiting approval"). En realidad el proyecto pasó por: Fases 1–4 (producto Business completo con datos mock) → Mega Módulo 3 (monorepo/plataforma) → MM4 (capa de persistencia org/workspace en código) → MM5 (listo-para-instalar) → Fase de instalación local (lanzadores + integración Windows). **Todo verificado en verde localmente** (typecheck, lint, 187 tests, build, boundaries, SQL readiness, gate de pre-instalación).

**Lo que existe de verdad:** toda la interfaz de Business (12 pantallas) sobre una capa de estado mutable, tipada, sembrada con datos mock; el andamiaje oficial de Shopify (React Router + App Bridge + sesiones Prisma + rutas de auth/webhooks); un esquema Supabase org/workspace con RLS **diseñado y con adaptador escrito**; y enforcement de límites de plan en servidor (en código).

**Lo que NO existe todavía (todos son "gates" externos que dependen de Brian):** no hay app de Shopify enlazada (`client_id` en blanco), no hay proyecto Supabase provisionado, no hay OAuth/instalación real ejecutada, no hay datos reales, no hay IA, no hay integraciones de marketing (Google/Meta/etc.), no hay PWA, no hay despliegue.

**Bloqueador principal para "verlo en Shopify":** tres acciones interactivas de Brian — (1) crear la app en un Partner org de Shopify y obtener credenciales, (2) provisionar el proyecto Supabase separado, (3) suministrar el `.env`. Con eso, el camino de "cutover" a datos reales ya está preparado en código.

---

## 2. Identidad y contexto del proyecto — ¿se respeta?

**Sí, se respeta.** Evidencia:

| Regla de identidad | Estado en código | Evidencia |
|---|---|---|
| Nombre de marca **Eventra** | ✅ | `shopify.app.toml` `name = "eventra"`; `package.json` `eventra-platform`; `<title>Eventra Business</title>` |
| SaaS de **planificación de marketing / memoria de campañas** (no clon de Google Calendar, no recordatorios) | ✅ | Dashboard con "upcoming opportunities" + "preparation needed"; memoria de campañas versionada (`lib/campaigns.ts`, `createdFromId`/`version`) |
| **Shopify primero**, arquitectura para **SaaS independiente + multi-tenant** | ✅ (en diseño/estructura) | App montada sobre plantilla oficial Shopify; capa DB org/workspace independiente de Shopify; façade `storeId` ≡ `workspaceId` |
| **Independiente de PrimeBuild** | ✅ | Semillas usan `Demo Store`/`demo-store.example`; búsqueda de branding/dominios/IDs de PrimeBuild en `apps/` y `packages/` = 0 coincidencias |
| **No renombrar** repo/recursos internos todavía | ✅ respetado | Repo sigue `primebuild-saas`; sesión de Prisma, tablas, etc. sin renombrar |

**Nota:** el nombre del repositorio remoto sigue siendo `primebuild-saas` (esperado; CLAUDE.md §0 dice "renombrar después, no ahora").

---

## 3. Estado general

- **Fase actual:** *Installation phase* (instalación local + integración de escritorio Windows), sobre la base de MM5 "listo para autorización de Shopify".
- **Última fase completada:** Fase de instalación local (2026-07-12), certificada `READY FOR SHOPIFY AUTHORIZATION`.
- **Último módulo terminado:** integración Windows (accesos directos, ícono, lanzadores endurecidos).
- **Módulos parcialmente terminados / "en código pero no vivos":** capa de persistencia Supabase (MM4) — escrita y unit-testeada, **no conectada a una base real**; enforcement server-side de límites (MM5) — escrito, sin DB viva; wiring de persistencia (`/app/data`) — activo solo en modos `mock`/`file`.
- **Módulos pendientes (Fase 5):** OAuth/instalación real, tablas + RLS en vivo, validación de membership contra DB real, reemplazo de mock por datos reales, Shopify Billing, tests de aislamiento de tenant contra DB viva.
- **Qué no existe todavía:** IA, integraciones externas de marketing, PWA, notificaciones push/email, despliegue.
- **Documentado pero no implementado:** el modelo de plataforma "3 productos" con planes Consumer/Business Pro; Consumer/Admin como productos reales (hoy son cáscaras); años de horizonte de planificación (el schema usa años; la UI Business todavía usa meses).
- **Implementado pero poco documentado en el índice:** el modo `preview` local y el seam `usePersistence`→`/app/data` (sí está en CHANGELOG/MM5, pero es fácil de pasar por alto).
- **Bloqueadores actuales:** todos externos (credenciales Shopify, proyecto Supabase, `.env`). No hay bloqueadores técnicos internos que impidan compilar/probar.
- **Dependencias entre módulos:** UI Business → contextos (`DataContext`) → seam de persistencia → repositorio (mock/file/supabase) → (en supabase) tenant.server → Shopify auth. La rama supabase está inerte hasta que existan secretos.

---

## 4. Arquitectura actual

### 4.1 Framework y estructura

- **Monorepo:** npm workspaces — `apps/*`, `packages/*`, `services/*`. Node `>=20.19 <22 || >=22.12`. TypeScript 5.9, Prettier 3.
- **Apps:**
  - `apps/business` — **el producto real**. Plantilla oficial **Shopify React Router** (`@shopify/shopify-app-react-router` ^1.1.0) + **App Bridge React** ^4. React 18 + TypeScript + Tailwind v4 + Framer Motion + date-fns + dnd-kit + lucide-react. Rutas file-based (`@react-router/fs-routes`).
  - `apps/consumer` — **cáscara Vite SPA** (React Router) con `PlaceholderPage`s; demuestra el motor de entitlements compartido. **No es un producto funcional aún.**
  - `apps/admin` — **cáscara Vite SPA** equivalente. **No funcional aún.**
- **Packages compartidos (`@eventra/*`):** `types`, `config`, `entitlements`, `identity`, `calendar` (lógica de fechas/recurrencia, fuente única consumida por Business), `ui` (shell + primitivas para Consumer/Admin), `testing` (factories).
- **Services:** `services/api` y `services/workers` — **solo contratos TypeScript** (`contracts.ts`); no hay servidor ni implementación.

### 4.2 Frontend

- Business: React Router v7, rutas `app.*`, cada pantalla compone componentes pequeños bajo `app/features/<dominio>/*`. Estado global vía **3 contextos** (`PlanContext`, `CatalogContext`, `CampaignsContext`) compuestos en `DataProvider` (`app/context/DataContext.tsx`), con selectores enfocados para evitar re-renders (el shell no re-renderiza al cambiar campañas).
- Shell responsive: `AppShell` (sidebar `lg:pl-64`, `Topbar`, `MobileNav` como drawer animado con focus-trap `useDialog`).
- Design system: Tailwind v4 con tokens de marca + acentos por CSS variables (`lib/accents.ts`); primitivas en `app/components/ui/*` (Button, Card, Modal, Drawer, StatTile, States/Skeleton, etc.).

### 4.3 Backend

- **Seam de persistencia (MM4/MM5):** `routes/app.data.tsx` (resource route, sin UI): `GET` → `{catalog, bundle}`; `POST` → `DataIntent` despachado por `db/dataActions.ts`.
- **Selector de modo** `db/env.server.ts` → `persistenceMode(): mock | file | supabase`:
  - `mock` (por defecto, sin secretos) — repositorio in-memory singleton, scope demo fijo.
  - `file` — snapshot en disco (`.eventra/dev-store.json`), sobrevive reinicios.
  - `supabase` — solo si **todos** los secretos Supabase están presentes **y** `EVENTRA_PERSISTENCE=true`.
- **Repositorios** (`db/`): `repository.ts` (contrato `BusinessRepository` + `RepositoryError`), `fileRepository.server.ts`, `memoryRepository.ts`, `supabaseRepository.server.ts`, con `mappers.ts` (row↔domain), `validation.ts`, `enforcement.ts`, `ids.server.ts`, `tenant.server.ts`, `scope.server.ts`.
- **Tenant:** `resolveScopeAndRepo(request)` — en `supabase` resuelve/provision el tenant desde la **sesión verificada de Shopify** (nunca del cliente); en `mock`/`file` usa `DEMO_TENANT_SCOPE`.

### 4.4 Configuración y build

- **Env:** `.env.example` documenta `SHOPIFY_*`, `SUPABASE_*`, `EVENTRA_PERSISTENCE*`, `EVENTRA_PREVIEW`, `DATABASE_URL`. `env.server.ts` valida presencia.
- **Build:** `react-router build` (Business), Vite (Consumer/Admin/packages). Tipos: `react-router typegen && tsc --noEmit`.
- **Tests:** Vitest + React Testing Library + jsdom.
- **Guardrails de repo:** `scripts/check-boundaries.mjs` (sin imports app→app ni package→app, sin ciclos), `check-sql-readiness.mjs`, `verify-file-persistence.mjs`, `preinstall-check.mjs`.

### 4.5 ¿Está preparada para la evolución buscada?

| Objetivo | Preparación | Comentario |
|---|---|---|
| Shopify primero | ✅ Alta | Plantilla oficial, App Bridge, sesiones Prisma |
| SaaS independiente después | 🟡 Media-alta | Capa DB es org/workspace, independiente de Shopify; pero **auth** hoy depende de la sesión de Shopify (fuera de Shopify habría que añadir un proveedor de identidad — el esquema ya prevé `memberships`/`invitations`) |
| Multi-tenant / múltiples tiendas | 🟡 Diseñado, no vivo | Modelo org→workspace + RLS diseñado y unit-testeado; **sin verificación contra DB real** |
| Aislamiento de datos | 🟡 Diseñado | RLS con `is_org_member`/`is_workspace_member` + `WITH CHECK`; falta matriz de aislamiento en vivo |
| Crecimiento modular | ✅ | Monorepo con boundaries validados |
| Móvil/PWA futura | 🟡 Base responsive | Sin manifest/service worker (ver §6–7) |

**Acoplamientos que conviene vigilar:**
1. **Doble modelo de planes** (façade Business `free/starter/growth/vip` en meses vs. schema `business.*` en años) — reconciliado por un *bridge* (`lib/planModel.ts`) pero es deuda de convergencia (ver §21).
2. **La UI Business sigue anclada al `demoStore`** dentro de los contextos (ej. `storeId: demoStore.id` en `DataContext`), incluso cuando hidrata desde loader; la convergencia total sobre `@eventra/config`/`@eventra/ui` está diferida.
3. **Auth acoplada a Shopify** para el resolver de tenant en modo supabase.

---

## 5. Estado de la aplicación Shopify

| Aspecto | Estado | Evidencia |
|---|---|---|
| Plantilla oficial | ✅ Shopify React Router template | `package.json` deps + `app/shopify.server.ts` con `shopifyApp({…})` |
| React Router | ✅ v7 | `@react-router/*` ^7.12 |
| `@shopify/shopify-app-react-router` | ✅ ^1.1.0 | dependencia + `authenticate.admin` en loaders |
| App Bridge | ✅ ^4.2.4 | `AppProvider embedded apiKey` en `routes/app.tsx` |
| `shopify.app.toml` | ✅ presente, **`client_id = ""`** | scopes `read_products`; webhooks `app/uninstalled`, `app/scopes_update`; API `2025-10` |
| Autenticación / OAuth | 🟡 Andamiaje presente, **no ejecutado** | `auth.$.tsx`, `authPathPrefix:"/auth"`, `AppDistribution.AppStore`; sin `client_id`/secretos ⇒ no hay OAuth real |
| Sesiones | ✅ Almacenamiento listo | `PrismaSessionStorage` + `prisma/schema.prisma` modelo `Session` (SQLite `dev.sqlite`) |
| Webhooks | 🟡 Handlers escritos | `webhooks.app.uninstalled.tsx` (borra sesión), `webhooks.app.scopes_update.tsx`; no registrados en un store real |
| App Proxy | ❌ No existe | No hay bloque de proxy en el toml |
| Scopes / permisos | ✅ Mínimos | `read_products` únicamente (sin write — acciones visual-only, D7) |
| Navegación embebida | ✅ | App Bridge monta el shell embebido |
| Extensiones | ⬜ Vacío | `apps/business/extensions/` (solo `.gitkeep`) |
| Despliegue / instalación | ⬜ No realizado | `client_id` en blanco; `npm run deploy` nunca ejecutado |

**¿Qué puede hacer hoy la app?**

- **Arrancar localmente:** ✅ Sí — `shopify.server.ts` usa credenciales *placeholder* en no-producción para poder bootear; `npm run start:local` sirve `localhost:3000/app`. En producción, sin secretos, **falla ruidosamente** (correcto).
- **Modo preview local (sin sesión Shopify):** ✅ `EVENTRA_PREVIEW=true` salta la puerta de auth y renderiza las 12 pantallas con banner de "Preview mode" (verificado en vivo según CHANGELOG/BUILD_STATUS). **No** impersona OAuth ni App Bridge.
- **Conectarse a un dev store / completar OAuth / abrirse embebida / mantener sesión / leer datos de la tienda / instalarse por enlace / generar versión desplegable:** ❌ **No** hoy — requiere `client_id` + secretos + `shopify app config link` + instalación (todo gated en Brian).

**Certificación en repo:** `preinstall-check.mjs` → `READY FOR SHOPIFY AUTHORIZATION` (typecheck/lint/tests/build ✅; `client_id` en blanco y `.env` ausente marcados como esperados).

---

## 6. Estado del frontend (pantallas)

Todas las pantallas viven en `apps/business/app/routes/` y consumen `DataContext` (mock por defecto). **Todas usan datos mock, están conectadas al mismo estado cliente, y responden en escritorio.** Ninguna usa datos reales de Shopify/Supabase todavía. Responsive: sí (grids Tailwind + drawer móvil); no probado en dispositivos físicos en esta auditoría.

| Pantalla | Ruta | Propósito | Estado | Datos |
|---|---|---|---|---|
| Dashboard / Inicio | `/app` (`app._index.tsx`) | Bienvenida, stats, oportunidades próximas, "preparación necesaria", campañas activas/recientes, quick actions, crear campaña (modal) | ✅ Funcional | Mock |
| Calendario | `/app/calendar` | Vista **año/mes**, filtros por tipo/país, detalle de día (drawer), crear campaña desde evento/fecha; navegación por URL params | ✅ Funcional | Mock |
| Eventos | `/app/events` | Catálogo de eventos globales + Event Creator + hide/restore; acciones visuales | ✅ Funcional | Mock |
| Campañas | `/app/campaigns` | CRUD + estados + filtros + product picker | ✅ Funcional | Mock |
| Biblioteca de campañas | `/app/campaign-library` | Memoria/reutilización (crea versión nueva, nunca sobrescribe) | ✅ Funcional | Mock |
| Plantillas | `/app/templates` | Plantillas ↔ campañas (duplicación) | ✅ Funcional | Mock |
| Países | `/app/countries` | Enablement por store (`StoreCountry`), límite por plan | ✅ Funcional | Mock (catálogo US + CA) |
| Analítica | `/app/analytics` | Vista ligera: campañas por estado/país, cobertura de preparación | ✅ Funcional | Mock (derivado) |
| Configuración | `/app/settings` | Preferencias, apariencia (acento/densidad), recordatorios | ✅ Funcional | Mock |
| Planes y facturación | `/app/billing` | Comparar planes, cambiar plan (actualiza límites al instante; sin cobro real) | ✅ Funcional | Mock |
| Admin | `/app/admin` | Gestión del catálogo compartido de países/eventos | ✅ Funcional | Mock |
| Búsqueda | `/app/search` | Búsqueda determinista con skeleton debounced | ✅ Funcional | Mock |
| Persistencia (recurso) | `/app/data` | GET/POST sin UI (seam de persistencia) | ✅ En modos mock/file | — |
| Login landing | `/` (`_index`) | Aterrizaje de login | ✅ (plantilla Shopify) | — |
| Auth / webhooks | `auth.$`, `webhooks.*` | OAuth + webhooks | 🟡 Andamiaje | — |

**Pantallas del pedido que NO existen como tales (se mapean a lo anterior):**
- **"Estrategias"** → no existe una pantalla dedicada; el concepto se cubre parcialmente por Campañas + Plantillas + Dashboard.
- **"Historial"** / **"Memoria de marketing"** → cubierto por **Biblioteca de campañas** + versionado (`createdFromId`/`version`), no como pantalla "Historial" separada.
- **"Integraciones"** → **no existe** (no hay integraciones; ver §14).
- **"Métricas"** → cubierto de forma ligera por **Analítica** (no hay métricas reales de rendimiento).

**Consumer/Admin:** solo `PlaceholderPage`s (rutas: Calendar/Deals/Companies/Saved/Notifications/Subscription/Settings en Consumer; equivalentes en Admin). No funcionales.

---

## 7. Experiencia móvil

**Clasificación actual: (2) Responsive.** No es mobile-first, no es PWA, no está empaquetada como app.

Evidencia:
- **Responsive real:** `AppShell` colapsa el sidebar (`lg:pl-64` + `lg:hidden`), `MobileNav` es un drawer animado con overlay y focus-trap (`useDialog`: focus trap, retorno de foco, Escape, scroll-lock, aria). Las pantallas usan grids responsivos (`grid-cols-2 lg:grid-cols-4`, etc.).
- **Formularios/modales:** primitivas accesibles (`Modal`, `Drawer`, `FormControls`, `ConfirmDialog`) con a11y trabajada en el sprint de hardening (P3).
- **Calendario en pantalla pequeña:** vista mes/año con densidad configurable (`compact`); funciona pero no fue optimizado específicamente para táctil.
- **PWA:** ❌ **No hay** `manifest.json`/`webmanifest` ni service worker (`apps/business/public/` solo tiene `favicon.ico`/`.svg`). No instalable desde "Añadir a pantalla de inicio".
- **Safari iOS / Chrome Android / Shopify Mobile / navegador externo:** no verificado con dispositivos en esta auditoría; técnicamente debería renderizar (es web responsive estándar), pero **sin pruebas físicas registradas**.

**No se convirtió a PWA ni a app móvil** (respetado el pedido de solo documentar).

---

## 8. Posibilidad de instalación en teléfono

### Opción A — Shopify Mobile
La app es **embebida vía App Bridge**, así que en cuanto exista instalación real en un store, **debería** abrirse dentro de la app Shopify Mobile como cualquier app embebida. Limitaciones: depende 100% de completar Fase 5 (OAuth/instalación); el layout tendría que probarse dentro del contenedor móvil de Shopify (ancho reducido, navegación nativa de Shopify sustituye parte del shell).

### Opción B — PWA
Falta **todo** lo esencial: `manifest.webmanifest`, íconos (maskable), service worker (cache/offline), pantalla de inicio, y una sesión segura fuera de Shopify (la sesión hoy es Shopify-embebida). Es la ruta de **menor esfuerzo** para "tenerlo en el teléfono fuera de Shopify", pero requiere resolver auth standalone.

### Opción C — Nativa/híbrida (React Native / Expo / Capacitor)
Arquitectura **no** preparada hoy: la UI es React DOM + Tailwind, no componentes RN. Capacitor podría envolver la web responsive con relativamente poco trabajo (reusa el frontend), pero requiere la sesión standalone (mismo problema que PWA). React Native/Expo implicaría **reescribir la UI**.

**Recomendación de primer camino (menor riesgo):** **Shopify Mobile primero** (no requiere código nuevo, solo completar Fase 5), y **PWA como segundo paso** para uso fuera de Shopify. Nativa/híbrida solo si aparece una razón técnica fuerte (hoy no la hay).

---

## 9. Backend y APIs

| Elemento | Estado | Entrada/Salida | Auth | Tenant | Notas |
|---|---|---|---|---|---|
| `routes/app.data.tsx` (loader `GET`) | ✅ (mock/file) | → `{catalog, bundle}` | Shopify (o preview) | scope resuelto | Real solo en supabase mode |
| `routes/app.data.tsx` (action `POST`) | ✅ (mock/file) | `DataIntent` JSON → resultado | ídem | ídem | `RepositoryError` → 404/403/422 |
| `dispatchDataAction` (`db/dataActions.ts`) | ✅ | intent → repo | — | scope | Despachador puro |
| Loaders de rutas `app.*` | ✅ | Lecturas mock sincrónicas | `authenticate.admin` (salvo preview) | — | UI hidrata de `initialData` |
| `webhooks.app.uninstalled` | 🟡 | topic → borra sesión | `authenticate.webhook` | shop | No registrado en store real |
| `webhooks.app.scopes_update` | 🟡 | topic | ídem | shop | ídem |
| `db/enforcement.ts` | 🟡 (código) | límites de país / downgrade read-only | — | scope | Sin DB viva |
| `db/validation.ts` | ✅ (unit) | required/date/enum/duplicados/refs | — | — | |
| Repos (`memory`/`file`/`supabase`) | mock/file ✅, supabase 🟡 | contrato `BusinessRepository` | — | scope | supabase inerte sin secretos |
| `services/api`, `services/workers` | ⬜ placeholder | solo `contracts.ts` | — | — | Sin servidor |
| Jobs / cron | ❌ No existen | — | — | — | |

No hay guards/middleware propios más allá de `authenticate.*` de Shopify y RLS (diseñado).

---

## 10. Base de datos

Hay **dos bases distintas** en el repo, con propósitos separados:

1. **SQLite (`prisma/`, `apps/business/prisma/`)** — **solo almacenamiento de sesiones de Shopify** (`dev.sqlite`), modelo `Session`. Es de la plantilla oficial; no guarda datos de negocio.
2. **Supabase/Postgres (`supabase/migrations/`, `policies/`, `seeds/`)** — el **modelo de negocio real**, **diseñado, no provisionado**.

### Esquema Postgres (`supabase/migrations/0001_schema.sql`) — modelo org/workspace

- **Catálogo plataforma (sin tenant):** `countries`, `plans` (`business.free/starter/growth/pro`, `workspace_limit`, `country_limit`, **`planning_horizon_years`**, `saved_campaign_limit`), `global_events` (con `start_rule`/`end_rule` jsonb, `importance`, `category`).
- **Tenancy:** `organizations` (owner_user_id verificado), `workspaces` (ligada a commerce vía `commerce_platform`/`commerce_external_ref`, único), `memberships` (roles owner/admin/editor/viewer), `invitations`, `subscriptions` (con `trial_ends_at`).
- **Merchant-owned (con `workspace_id`, audit + soft-delete):** `workspace_countries`, `workspace_event_preferences`, `custom_events`, `campaigns` (con `created_from_id` + `version` de memoria; `actions` jsonb visual-only; check `end_date >= start_date`), `templates`, `workspace_notes`, `workspace_preferences`.
- **Índices** por tenant + hot paths; triggers `set_updated_at`.
- **RLS** en `0002_rls.sql` (`is_org_member`/`is_workspace_member`, `WITH CHECK` bloquea escrituras cross-tenant); **datos de referencia** en `0003_reference_data.sql`; **seed** dev-only `Demo Store`.

### Tipos de dominio (façade Business, `app/types/domain.ts`)
`Store`, `Membership`, `StoreCountry`, `StoreEventPreference`, `CustomEvent`, `EventAction` (visual-only), `Campaign` (con `createdFromId`/`version`), `Template`, `StorePreference`, `Subscription`, `Country`, `GlobalEvent`, `Plan` (con **`planningHorizonMonths`**), `WorkspaceNote`, `TenantScope`.

### Modelos que tendrán que cambiar/converger
- **Planes:** el façade usa `free/starter/growth/vip` en **meses** ($0/$10/$20/$50); el schema usa `business.*` en **años** con `workspace_limit`; `MONETIZATION.md` fija Starter $15 / Growth $30 / Business Pro $45. Hoy conviven vía *bridge*; deben converger antes de facturación real.
- **`Store` → `Organization`+`Workspace`:** el rename dentro de Business sigue diferido (façade `storeId` ≡ `workspaceId`).

*(No se ejecutó ninguna migración.)*

---

## 11. Multi-tenant — ¿está preparada de verdad?

**Diseñado sólidamente, no verificado en vivo.**

- **Identificación de tenant:** en modo supabase, `tenant.server.ts#resolveTenant` deriva ids **deterministas** desde el **dominio de tienda verificado por Shopify** (`ownerUserId`/`orgIdForShop`/`workspaceIdForShop`), provisiona org+workspace+membership+subscription+preferences idempotentemente con el cliente service-role, y devuelve un `TenantScope`. **Nunca** confía en un `storeId` del cliente (D23).
- **Aislamiento:** lecturas/escrituras por request usan un cliente **RLS-scoped** (`clientForTenant`), de modo que RLS es una segunda barrera. Policies con `WITH CHECK` previenen escrituras cruzadas.
- **Riesgo de exposición cruzada:** en modos `mock`/`file` **el scope es un demo fijo global** (`DEMO_TENANT_SCOPE`) — correcto para demo de un solo tenant, pero significa que **el aislamiento real solo existe en modo supabase**, que hoy está inerte.
- **Config/usuarios/roles/planes/límites por empresa:** modelados en el schema (`memberships` roles, `subscriptions`, límites en `plans`), con enforcement en `db/enforcement.ts` (código, sin DB viva).

**Lo que usa datos globales y debe aislarse al ir a real:** toda la app en modos mock/file comparte el store demo; la matriz de aislamiento de tenant contra DB real (`supabase/tests/preinstall_rls_matrix.sql`) está escrita pero **no ejecutada contra un Postgres vivo**.

---

## 12. Sistema de calendario y campañas

| Función | Estado |
|---|---|
| Calendario vista **año** | ✅ Implementado (`YearView`) |
| Calendario vista **mes** | ✅ Implementado (`MonthView`, densidad compacta) |
| Vista **diaria** | ✅ Detalle de día (`DayDetail` drawer) — no es una "agenda día" con horas, es detalle de fecha |
| Vista **semanal** | ❌ No existe (solo año/mes/día-detalle) |
| Crear / editar / eliminar eventos | ✅ (Event Creator, custom events CRUD) |
| Repetición (recurrencia) | ✅ Reglas de fecha (`DateRule`, `lib/events.ts`, `@eventra/calendar`); "repeat next year" por defecto ON (D14) |
| Campañas + estados | ✅ CRUD + `draft/scheduled/active/completed/archived` |
| Drag-to-reschedule | ✅ dnd-kit (`moveCampaign`) |
| Canales / presupuestos / responsables / dependencias | ❌ No modelados (Campaign no tiene budget/owner/channel/dependencies) |
| Objetivos | 🟡 Campo `objective` de texto libre |
| Tareas / recordatorios | 🟡 `EventAction` (visual-only) + `reminderDefaults` en preferencias; sin ejecución |
| Historial / memoria | ✅ Versionado no destructivo (`createdFromId`/`version`) |

**Implementado de verdad vs. solo UI:** todo lo anterior opera sobre estado real (mutable, tipado, con lógica de fechas testeada). Lo "solo UI/placeholder" son las **acciones de evento** (D7, no ejecutan nada) y campos de negocio no modelados (presupuesto, canal, responsable).

---

## 13 y 15. Memoria de marketing e IA

**Memoria de marketing:** ✅ **Es un concepto real implementado**, no solo un calendario. Evidencia: `duplicateCampaign`/`duplicateForNextYear` **crean un registro nuevo** con `createdFromId` apuntando a la fuente y **nunca sobrescriben** (D15); campo `version` de memoria; Biblioteca de campañas; plantillas ↔ campañas; `workspace_notes` como entidad preparada. Lo que **falta** para una "memoria operativa" plena: resultados/métricas pasadas reales, comparaciones, y recomendaciones (hoy no hay métricas reales ni motor de recomendación).

**IA:** ❌ **No hay IA de ningún tipo.** Búsqueda de `openai|anthropic|gpt|claude|llm|@ai-sdk|generateText` en `apps/`+`packages/` = **0 coincidencias en código**. Todo el contenido es estático/derivado de datos mock. No hay proveedores, modelos, prompts, generación, ni memoria de IA.

---

## 14. Integraciones

| Integración | Estado |
|---|---|
| **Shopify** | 🟡 Auth/sesiones/webhooks **andamiados**, no ejecutados; scope `read_products` |
| **Supabase** | 🟡 Adaptador + schema **en código**, no provisionado |
| Google Calendar / Drive / Ads / Analytics | ❌ No existen |
| Meta / Instagram / Facebook / Pinterest / TikTok | ❌ No existen |
| Email marketing / Slack / webhooks externos / IA | ❌ No existen |

Búsqueda de SDKs (`googleapis`, `facebook`, `tiktok`, `slack`, `nodemailer`, `sendgrid`, `resend`, etc.) en código = 0. **Ninguna integración externa debe construirse todavía** (V1 = planificación; acciones visual-only, D7).

---

## 16. Autenticación, usuarios y permisos

- **Auth Shopify:** vía `authenticate.admin` (sesión embebida) — andamiaje presente, sin ejecución real.
- **Auth externa (standalone):** ❌ no existe. Fuera de Shopify, el resolver de tenant no tiene proveedor de identidad. El schema **sí** prevé `memberships`/`invitations`/roles, así que la base de datos está lista, pero **faltaría un proveedor de auth** (p. ej. Supabase Auth) para SaaS independiente.
- **Roles:** façade `owner/admin/staff`; schema/locked model `owner/admin/editor/viewer` (otra divergencia menor a reconciliar).
- **Protección de rutas:** loaders `authenticate.admin` (salvo `preview`); `ErrorBoundary` por ruta; catch-all 404.

**¿Puede funcionar fuera de Shopify sin rehacer la auth?** **No del todo:** requeriría añadir un proveedor de identidad standalone y desacoplar `resolveTenant` de la sesión Shopify. La estructura de datos ayuda, pero la capa de auth **sí** necesita trabajo adicional (no una reescritura total).

---

## 17. Seguridad

- **Secretos:** `env.server.ts` valida presencia; en no-producción usa *placeholders* que **no autentican nada**; en producción falla ruidosamente si faltan. `.gitignore` ignora `.env`/`.eventra/`. (No se revelan secretos aquí.)
- **Validación de webhooks:** `authenticate.webhook` de Shopify.
- **Aislamiento de tenant:** RLS + `WITH CHECK` (diseñado); ids server-side, nunca cliente (D23).
- **Validación de entrada:** `db/validation.ts` (required/date/enum/duplicados/refs).
- **CSRF/XSS:** React escapa por defecto; sin `dangerouslySetInnerHTML` observado; App Bridge maneja tokens de sesión.
- **Logs sensibles:** webhooks hacen `console.log` de shop/topic (no secretos).
- **Seguridad móvil/PWA:** N/A (no hay PWA).
- **Dependencias vulnerables:** no se corrió `npm audit` (no solicitado); no evaluado.

**Riesgo real vs. reclamado:** el modelo de seguridad está **diseñado y unit-testeado**, pero **no probado contra infraestructura viva**; los docs (`SECURITY_PLAN.md`) son honestos en no reclamar seguridad "real" aún.

---

## 18. Pruebas y calidad (comandos seguros ejecutados)

**Comandos ejecutados (solo lectura/seguros) y resultados exactos:**

| Comando | Resultado |
|---|---|
| `npm run test --workspaces` | ✅ **exit 0** |
| `@eventra/business test` | ✅ **134 tests / 17 files** |
| `@eventra/consumer test` | ✅ **3 tests / 1 file** |
| `@eventra/admin test` | ✅ **3 tests / 1 file** |
| `@eventra/calendar` | ✅ 5 · `@eventra/config` (incl.) · `@eventra/entitlements` ✅ 14 · `@eventra/identity` ✅ 8 · `@eventra/testing` ✅ 4 · `@eventra/types` ✅ 6 | 
| **Total** | **≈187 tests, 0 fallos** |
| `npm run typecheck --workspaces` | ✅ **exit 0**, 13 workspaces, 0 errores |
| `node scripts/check-boundaries.mjs` | ✅ "workspace boundaries OK: no app→app imports, no package→app imports, no cycles" |
| `node scripts/check-sql-readiness.mjs` | ✅ "SQL READINESS: READY — schema/RLS/reference data reconciled to the locked org model" |
| `node scripts/preinstall-check.mjs` | ✅ typecheck/lint/tests/**build** ✓ → **READY FOR SHOPIFY AUTHORIZATION** (`client_id` en blanco y `.env` ausente = esperado) |

- **Lint:** ✅ 0 errores (verificado vía el gate de pre-instalación, que corre lint internamente; BUILD_STATUS documenta que se corrigieron los errores previos de `app.search`/`app.calendar`).
- **Build:** ✅ verde (ejecutado dentro de `preinstall-check`).
- **E2E:** ❌ no hay suite end-to-end (Playwright/Cypress). Cobertura formal no medida.
- **Compatibilidad Shopify/móvil:** no hay tests automatizados; verificación fue manual/preview según docs.

---

## 19. Despliegue

| Aspecto | Estado |
|---|---|
| Entorno local | ✅ `npm run start:local` → `localhost:3000/app`; lanzadores Windows (`Eventra-Local.cmd`, accesos directos, ícono) |
| Variables de entorno | 🟡 `.env.example` documentado; `.env` real ausente (gated) |
| Base de datos remota | ⬜ Supabase no provisionado |
| Hosting / URL pública / HTTPS | ⬜ No desplegado (hay `Dockerfile` en Business) |
| OAuth redirect / webhooks en vivo | ⬜ Dependen de `client_id` + URL pública |
| Shopify CLI | 🟡 Disponible (`shopify app dev/deploy` en scripts); no ejecutado contra Partner org |
| CI/CD | ❌ No hay workflows (`.github/workflows` no presente) |
| GitHub | 🟡 Remoto configurado (`primebuild-saas`); rama actual `local-install-phase` (no `main`) |
| Dominio | ⬜ `eventra.com` reservado en docs, no configurado |
| Logs / monitoreo | ❌ No hay |

**Falta para desplegar e instalar en un store:** (1) `client_id` + secretos Shopify, (2) URL pública HTTPS (tunnel o host), (3) proyecto Supabase + migraciones aplicadas, (4) `shopify app deploy` + instalación en dev store. Todo gated en Brian.

---

## 20. Documentación

Hay **~55 documentos** en `docs/` + `CLAUDE.md` + `README.md` + `CHANGELOG.md`. Vigencia y consistencia:

| Documento | Vigencia | Coincide con código | Inconsistencia notable |
|---|---|---|---|
| `CLAUDE.md` | Actual (banner 2026-07-11) | ✅ mayormente | §9 planes (`Free/Starter/Growth/VIP` $10/$20/$50) **superado** por `MONETIZATION.md`; el propio archivo lo advierte |
| `CHANGELOG.md` | ✅ Actual (2026-07-12) | ✅ | Refleja MM3–MM5 + install phase |
| `BUILD_STATUS.md` | 🟡 Encabezado dice "Last updated 2026-07-11" pero incluye secciones del 07-12 | ✅ mayormente | Fecha de encabezado desactualizada; "Commit/push record" menciona rama `main` aunque la rama activa es `local-install-phase` |
| `README.md` | 🟡 Parcialmente obsoleto | ❌ en "Status" | Dice "**Phase 0 — No application code yet**" y "Phase 1 code-complete (52 app files)" — **contradice el código real** (proyecto está en install phase, muy por delante) |
| `MONETIZATION.md` / `BUSINESS_PLANS.md` | Actual | 🟡 | Define Starter $15/Growth $30/Business Pro $45; el **código façade** aún usa $10/$20/$50 + VIP |
| `MM4_PERSISTENCE.md`, `MM5_PREINSTALL_AUDIT.md`, `EVENTRA_PREINSTALL_CERTIFICATION.md` | Actual | ✅ | Consistentes con el código de persistencia/preinstall |
| `SUPABASE_SCHEMA.md` vs `PLATFORM_SCHEMA.md` | Actual | ✅ | El SQL real sigue el modelo org/workspace |
| `PROJECT_AUDIT.md` | Histórico | — | Backlog del sprint de hardening (ya resuelto) |
| Docs de plataforma (`PLATFORM_*`, `CONSUMER_*`, `ADMIN_*`, `ADVERTISING`, `VERIFIED_DEALS`) | Diseño | ❌ vs código | Describen productos/planes **no implementados** (Consumer/Admin son cáscaras) |

**Contradicción principal a registrar (código = verdad):** el `README.md` describe el proyecto como "Phase 0, sin código" — **falso**; el código está en fase de instalación con Business completo. También, el **modelo de planes** difiere entre código (`free/starter/growth/vip`, meses) y docs de monetización (`business.*`, años, precios nuevos).

---

## 21. Deuda técnica

| # | Ítem | Módulo | Prioridad | Impacto | Riesgo |
|---|---|---|---|---|---|
| D1 | **Doble modelo de planes** (façade meses `free/starter/growth/vip` vs schema años `business.*`; precios $10/$20/$50 vs $15/$30/$45) reconciliado por bridge | planes/billing | **Alta** | Alto (facturación/entitlements) | Cobros/limites incorrectos si no converge antes de Fase 5 |
| D2 | **Divergencia de roles** (`owner/admin/staff` façade vs `owner/admin/editor/viewer` schema) | identity | Media | Medio | Confusión de permisos |
| D3 | **Persistencia Supabase inerte** (código + tests, sin DB viva; aislamiento no verificado) | db | **Alta** | Alto | Multi-tenant sin probar en real |
| D4 | **UI anclada a `demoStore`** dentro de contextos aun hidratando de loader | business/context | Media | Medio | Fricción para cutover a datos reales |
| D5 | **Consumer/Admin son cáscaras** (PlaceholderPages) | apps | Baja (por diseño) | Bajo | Docs sobre-prometen |
| D6 | **`services/api` y `services/workers` solo contratos** | services | Baja | Bajo | Nada ejecuta |
| D7 | **Sin PWA** (no manifest/SW) | frontend | Media | Medio | No instalable en teléfono fuera de Shopify |
| D8 | **Sin E2E ni cobertura medida** | testing | Media | Medio | Regresiones no detectadas en flujos |
| D9 | **Auth acoplada a Shopify** para tenant resolver | auth | Media | Alto (para SaaS standalone) | Rehacer parte de auth para independencia |
| D10 | **README obsoleto** ("Phase 0") + fecha de BUILD_STATUS | docs | Baja | Bajo | Contexto engañoso |
| D11 | **Sin CI/CD** | infra | Media | Medio | Verificación manual |
| D12 | **Rama `local-install-phase` sin merge a `main`** | git | Baja | Bajo | Divergencia de rama |
| D13 | **Catálogo de países limitado a US + CA** (por decisión D22) | data | Baja | Bajo | Alcance intencional |
| D14 | **Campos de campaña ausentes** (budget/channel/owner/dependencies) | dominio | Baja-Media | Medio | Limita "planificación" avanzada |

**TODO/FIXME reales en código:** mínimos; la mayoría de coincidencias de "placeholder/coming soon" son `PlaceholderPage` (Consumer/Admin) y `placeholder=` de inputs — no deuda real. Sin `@ts-ignore` problemáticos (typecheck limpio).

---

## 22. Comparación con el objetivo inmediato

| Objetivo | Estado real | Diferencia |
|---|---|---|
| Se pueda desplegar | 🟡 Build verde + Dockerfile | Falta host + secretos + Supabase |
| Instalar en dev store Shopify | ⬜ | Falta `client_id`, `shopify app config link`, install |
| Abrirse en Shopify Admin (embebida) | 🟡 Andamiaje App Bridge | Requiere instalación real |
| Mantener autenticación | 🟡 Sesiones Prisma listas | Requiere OAuth real |
| Usar **datos reales** | ⬜ Solo mock/file | Requiere cutover a Supabase |
| Gestionar campañas y eventos | ✅ (mock) | Funciona; falta persistencia real |
| Escritorio | ✅ | OK |
| Teléfono | 🟡 Responsive | Falta prueba física / PWA |
| Shopify Mobile | ⬜ | Tras instalación |
| PWA instalable | ❌ | No implementada |
| Arquitectura para SaaS independiente | 🟡 | Auth standalone pendiente |
| Multi-tenant | 🟡 Diseñado | Sin verificación viva |
| Base estable para integraciones | ✅ | Contratos + boundaries listos |

**Diferencia exacta:** el producto está **funcionalmente completo en mock y listo en código para el cutover**; lo que separa del objetivo son **3 acciones externas de Brian** (Shopify creds, Supabase, `.env`) + wiring/verificación de datos reales + (opcional) PWA.

---

## 23. Ruta recomendada hasta Shopify (sin implementar)

| Orden | Fase | Objetivo | Dependencias | Criterio de salida |
|---|---|---|---|---|
| 1 | Estabilización | Congelar façade; reconciliar **planes y roles** (D1/D2) en una sola fuente | — | Un solo modelo de planes/roles; tests verdes |
| 2 | Credenciales Shopify | `shopify app config link` → `client_id`; secretos en `.env` | Brian/Partner org | App enlazada; `npm run dev` levanta tunnel |
| 3 | Persistencia real | Provisionar Supabase separado; aplicar `0001/0002/0003` + seed | Brian/Supabase | Migraciones aplicadas; RLS activa |
| 4 | Tenant y tienda | Verificar `resolveTenant` provisiona org/workspace desde sesión Shopify | 2,3 | Instalar 2 stores → 2 tenants aislados |
| 5 | Datos reales | Flip a `supabase` mode; wire `DataContext`→`/app/data` en vivo | 3,4 | CRUD persiste y sobrevive reload en DB real |
| 6 | Funciones mínimas | Confirmar campañas/eventos/países/plantillas sobre datos reales | 5 | Flujos núcleo E2E manuales OK |
| 7 | Responsive | Verificar en dispositivos + dentro de Shopify Admin | 5 | Sin roturas móviles críticas |
| 8 | Pruebas | Matriz de aislamiento RLS viva (`preinstall_rls_matrix.sql`) + límites server-side | 4,5 | 0 fugas cross-tenant; límites forzados |
| 9 | Despliegue | Host + HTTPS + `shopify app deploy` | 2,5 | URL pública + webhooks activos |
| 10 | Instalación en Shopify | Instalar en dev store; abrir embebida | 9 | App abre en Admin, sesión persiste |
| 11 | Validación Shopify Mobile | Abrir desde app Shopify Mobile | 10 | UI usable en móvil embebido |

**Qué NO hacer todavía:** Shopify Billing real, integraciones externas, IA, PWA, publicar en App Store, tocar PrimeBuild.

---

## 24. Ruta recomendada hasta teléfono

Prioridad: menor complejidad/costo, reusar frontend, seguridad, evolutivo.

1. **Shopify Mobile (primero)** — 0 código nuevo; solo completar Fase 5. Menor riesgo.
2. **Web responsive (ya disponible)** — usable desde navegador móvil hoy (falta prueba física).
3. **PWA (segundo paso)** — añadir manifest + íconos + service worker + resolver sesión standalone. Reusa 100% del frontend; instalable "Añadir a pantalla de inicio".
4. **Híbrida (Capacitor)** — solo si se necesita empaquetar/stores; reusa la web, pero requiere auth standalone.
5. **Nativa (RN/Expo)** — **no recomendado** como primera opción (reescritura de UI, sin razón técnica que lo justifique hoy).

**Recomendación:** Shopify Mobile → PWA. Nativa/híbrida solo con justificación fuerte posterior.

---

## 25. Próximo módulo recomendado

**Recomendado: "Reconciliación del modelo de planes + roles a una única fuente de verdad" (estabilización pre-Fase-5).**

- **Por qué primero:** es el **acoplamiento de mayor riesgo** (D1/D2). Hoy conviven dos modelos de planes (façade en meses `vip` vs schema en años `business.pro`, precios distintos) unidos por un bridge. Facturación, entitlements y límites server-side dependen de esto; entrar a Fase 5 con la divergencia **arrastra el bug a producción/cobros**.
- **Qué problemas resuelve:** cobros/limites incorrectos, confusión de nombres de plan, y divergencia de roles owner/admin/staff vs editor/viewer.
- **Qué desbloquea:** habilita con seguridad el cutover a Supabase (Fase 5), el enforcement server-side real, y Shopify Billing.
- **Qué riesgos evita:** inconsistencia de datos entre UI y DB; retrabajo después de tener datos reales.
- **Criterios de terminado:** un único `plan-config` (nombres, precios, límites, horizonte) consumido por façade y schema; roles unificados; `MONETIZATION.md`/`BUSINESS_PLANS.md` y código coincidiendo; tests verdes; docs actualizados (incluido corregir el `README.md` "Phase 0").

*(Alternativa si el negocio prioriza "verlo en el teléfono/Shopify ya": saltar a la Ruta §23 pasos 2–5; pero técnicamente conviene estabilizar planes primero — es barato y de bajo riesgo.)*

---

## Tabla A — Funcionalidades

| Funcionalidad | Estado | Datos reales o mock | Shopify | Móvil | Prioridad |
|---|---|---|---|---|---|
| Dashboard | ✅ Funcional | Mock | Embebible | Responsive | — |
| Calendario (año/mes/día) | ✅ Funcional | Mock | Embebible | Responsive | — |
| Eventos + Event Creator | ✅ Funcional | Mock | Embebible | Responsive | — |
| Campañas CRUD + estados | ✅ Funcional | Mock | Embebible | Responsive | — |
| Biblioteca / memoria (versionado) | ✅ Funcional | Mock | Embebible | Responsive | — |
| Plantillas | ✅ Funcional | Mock | Embebible | Responsive | — |
| Países (StoreCountry) | ✅ Funcional | Mock (US/CA) | Embebible | Responsive | — |
| Analítica (ligera) | ✅ Funcional | Mock derivado | Embebible | Responsive | — |
| Configuración / Apariencia | ✅ Funcional | Mock | Embebible | Responsive | — |
| Planes y facturación (UI) | ✅ Funcional | Mock | Embebible | Responsive | Alta (reconciliar) |
| Admin (catálogo) | ✅ Funcional | Mock | Embebible | Responsive | — |
| Búsqueda | ✅ Funcional | Mock | Embebible | Responsive | — |
| Persistencia Supabase | 🟡 En código | — | — | — | Alta |
| Enforcement server-side | 🟡 En código | — | — | — | Alta |
| Auth/OAuth Shopify real | ⬜ Andamiaje | — | Pendiente | — | Alta |
| Shopify Billing | ⬜ No iniciado | — | Pendiente | — | Media |
| Consumer / Admin (productos) | ⬜ Cáscaras | Mock/placeholder | — | Responsive shell | Baja |
| IA / Integraciones externas | ❌ No existen | — | — | — | No ahora |
| PWA | ❌ No existe | — | — | — | Media |

## Tabla B — Preparación Shopify

| Requisito | Estado | Bloqueador | Acción necesaria |
|---|---|---|---|
| Plantilla oficial React Router + App Bridge | ✅ | — | — |
| `shopify.app.toml` | ✅ (`client_id` vacío) | Falta app en Partner org | `shopify app config link` |
| Scopes | ✅ `read_products` | — | — |
| OAuth / instalación | ⬜ | Credenciales | Secretos + install en dev store |
| Sesiones (Prisma) | ✅ | — | — |
| Webhooks | 🟡 Handlers | No registrados | Registrar al instalar |
| URL pública HTTPS | ⬜ | Hosting/tunnel | Desplegar o `shopify app dev` |
| Extensiones | ⬜ vacío | — | Solo si se necesitan |
| Deploy | ⬜ | Todo lo anterior | `shopify app deploy` |

## Tabla C — Preparación móvil

| Requisito | Estado | Shopify Mobile | Responsive | PWA | Acción necesaria |
|---|---|---|---|---|---|
| Layout responsive | ✅ | ✅ (tras install) | ✅ | Base | Probar en dispositivos |
| Navegación táctil / drawer | ✅ | ✅ | ✅ | Base | — |
| Manifest | ❌ | N/A | N/A | Falta | Crear `manifest.webmanifest` |
| Service worker | ❌ | N/A | N/A | Falta | Añadir SW + cache |
| Íconos / splash | 🟡 favicon | N/A | N/A | Falta | Íconos maskable |
| Sesión segura standalone | ⬜ | N/A (usa Shopify) | Web | Falta | Proveedor auth standalone |
| Empaquetado nativo/híbrido | ⬜ | — | — | — | No ahora |

## Tabla D — Riesgos

| Riesgo | Impacto | Probabilidad | Prioridad | Mitigación |
|---|---|---|---|---|
| Doble modelo de planes/precios entra a Fase 5 | Alto | Alta | **P1** | Reconciliar a fuente única antes del cutover |
| Multi-tenant nunca probado en DB viva | Alto | Media | **P1** | Ejecutar matriz RLS al provisionar Supabase |
| Auth acoplada a Shopify frena SaaS standalone | Alto | Media | P2 | Diseñar proveedor de identidad standalone |
| README/docs desalineados con código | Bajo | Alta | P3 | Actualizar README + fechas |
| Sin CI/CD ni E2E | Medio | Alta | P2 | Añadir workflow + smoke E2E |
| Sin PWA para uso en teléfono fuera de Shopify | Medio | Media | P2 | Añadir PWA tras Fase 5 |
| Rama sin merge a main | Bajo | Media | P3 | Estrategia de ramas/merge |

## Tabla E — Fases recomendadas

| Orden | Fase | Objetivo | Dependencias | Criterio de salida |
|---|---|---|---|---|
| 1 | Estabilización (planes/roles) | Fuente única de planes/roles | — | Un modelo; tests verdes; docs alineados |
| 2 | Credenciales Shopify | App enlazada + secretos | Brian | `client_id` + `npm run dev` OK |
| 3 | Persistencia real | Supabase provisionado + migraciones | Brian | RLS activa; seed aplicado |
| 4 | Tenant/tienda | Provisión desde sesión Shopify | 2,3 | 2 stores → 2 tenants aislados |
| 5 | Datos reales | `supabase` mode + wiring vivo | 3,4 | CRUD persiste + sobrevive reload |
| 6 | Responsive/móvil | Verificar dispositivos + Admin | 5 | Sin roturas críticas |
| 7 | Pruebas | Aislamiento RLS + límites server | 4,5 | 0 fugas; límites forzados |
| 8 | Despliegue | Host + HTTPS + deploy | 2,5 | URL pública + webhooks |
| 9 | Instalación Shopify | Install + embebida | 8 | Abre en Admin; sesión persiste |
| 10 | Shopify Mobile | Validar en móvil embebido | 9 | Usable en teléfono |
| 11 | (Opcional) PWA | Instalable fuera de Shopify | 5 | "Añadir a inicio" funciona |

---

## Entrega final

1. **Resumen ejecutivo** — §1. Business es un producto completo en mock, listo en código para el cutover; Consumer/Admin son cáscaras; sin IA ni integraciones; bloqueado solo por 3 gates externos.
2. **Estado real** — Fase de instalación local sobre MM5 "READY FOR SHOPIFY AUTHORIZATION"; todo verde localmente (typecheck, ~187 tests, lint, build, boundaries, SQL readiness, preinstall).
3. **Diferencias con la documentación** — `README.md` dice "Phase 0 / sin código" (falso); modelo de planes difiere entre código y `MONETIZATION.md`; fecha de encabezado de `BUILD_STATUS.md` desactualizada; docs de plataforma describen productos aún no implementados. **El código es la verdad.**
4. **Bloqueadores** — todos externos: (a) credenciales/enlace Shopify, (b) proyecto Supabase separado, (c) `.env`. Ninguno técnico interno.
5. **Preparación Shopify** — andamiaje completo; falta ejecutar auth/instalación/deploy (Tabla B).
6. **Preparación teléfono** — Responsive sí; PWA no; camino recomendado Shopify Mobile → PWA (Tabla C).
7. **Próximo módulo recomendado** — Reconciliación de planes + roles a fuente única (estabilización pre-Fase-5).
8. **Archivos Markdown creados/actualizados** — creado: **`docs/REPORTE_GENERAL_2026-07-13.md`** (este archivo). No se modificó ningún otro archivo.
9. **Comandos seguros ejecutados** — `npm run test --workspaces` (exit 0), tests por workspace (business 134 / consumer 3 / admin 3 / calendar 5 / entitlements 14 / identity 8 / testing 4 / types 6), `npm run typecheck --workspaces` (exit 0, 13 ws), `check-boundaries.mjs` (OK), `check-sql-readiness.mjs` (READY), `preinstall-check.mjs` (READY FOR SHOPIFY AUTHORIZATION, build ✓). Ver §18.
10. **No verificado en esta auditoría** — comportamiento en dispositivos móviles físicos y en Shopify Mobile; OAuth/instalación real; aislamiento de tenant contra Postgres vivo; `npm audit`/vulnerabilidades de dependencias; cobertura de tests medida; ejecución real de `npm run dev` con tunnel Shopify.

---

*Fin del reporte. No se continúa con desarrollo. A la espera de una nueva orden.*
