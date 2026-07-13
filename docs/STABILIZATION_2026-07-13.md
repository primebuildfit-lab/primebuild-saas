# Eventra — Stabilization Phase Report (2026-07-13)

> Pre-cutover hardening executed **in code**, on branch `local-install-phase`. No credentials used, no
> Supabase/Shopify provisioned, no deploy/install/publish, no merge to `main`, no push. Every change kept
> the tree green.

This document is both the **phase report** and the authoritative **manual action list for Brian**
(Bloque 26). The full 25-section read-only state audit that preceded it is `docs/REPORTE_GENERAL_2026-07-13.md`.

---

## 1. Executive summary

The order asked for a large multi-block program (planes, roles, Supabase real, Shopify OAuth, App Bridge,
Shopify Mobile, PWA, admin, billing, analytics, audit, observability, E2E, a11y, perf, docs). This session
completed the **safe, self-contained, high-value blocks to real quality and kept ~201 tests green**, and
left the infrastructure- and credential-gated blocks **honestly pending** with a precise handoff.

**Done this session (verified green):** Plans single-source confirmation + bridge hardening (Bloque 1);
canonical roles + server-side permission enforcement (Bloque 2); PWA manifest/service-worker/offline/install
(Bloque 10/11); `.env.example` prepared keys (Bloque 21); unified `verify` + `check:pwa` scripts (Bloque 22);
documentation correction (Bloque 23); tenant-model decision recorded (Bloque 3, doc-level).

**Not done (gated / out of safe scope this session):** Supabase provisioning + schema expansion beyond the
current model (Bloque 4 live); Shopify OAuth live + fake-adapter E2E (Bloque 7); deep App Bridge work
(Bloque 8); Shopify Mobile physical testing (Bloque 9); Admin Console real (Bloque 12); Billing adapter
(Bloque 13); Analytics/Search/Audit/Observability real wiring (Bloque 14–17); Playwright E2E harness
(Bloque 18); a11y/perf audits (Bloque 19–20). See §7.

---

## 2. Baseline captured (Bloque 0)

- Branch `local-install-phase`, working tree clean apart from the untracked audit report.
- Pre-change gates all green: typecheck, lint, tests (~187), build, boundaries, SQL readiness, preinstall
  (`READY FOR SHOPIFY AUTHORIZATION`).

## 3. Blocks completed

### Bloque 1 — Plans convergence
- **Finding:** the canonical source already exists — `@eventra/config` `BUSINESS_PLANS` (locked
  `business.*`, $0/$15/$30/$45, workspace + country limits, YEAR horizons). The divergence is that the
  Business **display** façade (`data/mockPlans.ts`, legacy `free/starter/growth/vip`, $10/$20/$50, months)
  still shows old values. `lib/planModel.ts` is the single, bidirectionally-tested bridge, and server
  enforcement already reads config, not the display fields.
- **Action taken:** documented `@eventra/config` as the single source of truth (D70), annotated
  `mockPlans.ts` as display-only, and recorded the **merchant-facing price/name/horizon flip as an open
  Brian decision (D71)** rather than changing shown prices silently (CLAUDE.md §1). The bridge stays until
  Brian signs off. No new plan numbers introduced anywhere.

### Bloque 2 — Roles & permissions (with server enforcement)
- **Canonical source:** `@eventra/identity` now defines the locked roles `owner|admin|editor|viewer`, the
  `ROLE_PERMISSIONS` matrix, and `roleCan(role, permission)` (deny-by-default). Matrix: owner-only
  `plan:manage`/`org:manage`; admin+ `member:manage`; editor+ content writes; viewer read-only. Permission
  sets are strictly nested (tested).
- **Enforcement:** `app/lib/permissions.ts` maps every `DataIntent` → a permission, and
  `dispatchDataAction` (the ONE choke point every mutation passes through in mock/file/supabase modes)
  denies unauthorized writes with a `forbidden` `RepositoryError` (→ HTTP 403) **before** the repository is
  touched. UI hiding remains convenience only.
- **Tests:** +7 in `@eventra/identity` (matrix), +9 in Business (`test/lib/permissions.test.ts`) covering
  intent→permission mapping, per-role allow/deny, and end-to-end denial through the dispatcher.

### Bloque 10/11 — PWA
- `apps/business/public/manifest.webmanifest` (standalone, id/start_url `/app`, theme/background, SVG +
  maskable SVG icons), `public/sw.js`, `public/offline.html`, `public/icons/icon-maskable.svg`.
- Service worker is **deliberately conservative**: never caches `/app/data`, `/auth`, `/webhooks`, `/api`,
  cross-origin, or non-GET; navigations are network-first with an offline app-shell fallback; static assets
  are stale-while-revalidate.
- `app/components/pwa/PwaRuntime.tsx`: registers the SW **only in a top-level window** (never inside the
  Shopify Admin iframe), shows a real offline banner, and offers install affordances (Android/desktop
  `beforeinstallprompt` + a manual iOS tip), silent once installed.
- `root.tsx` links the manifest + PWA/apple meta and mounts the runtime.
- `scripts/check-pwa.mjs` (+ `npm run check:pwa`) statically validates the manifest, SW, offline page, and
  icon references. **Physical-device install is NOT verified** (manual, Brian).

### Bloque 3 — Identity/tenant model (doc-level)
- Recorded the tenancy invariants already in code (1 shop = 1 org + 1 workspace, façade `storeId` ≡
  `workspaceId`, tenant derived from the Shopify-verified session, never a client id) alongside D70–D74.
  No code change; the runtime isolation matrix stays pending live Supabase (§7).

### Bloque 21/22/23 — env, scripts, docs
- `.env.example`: added `NODE_ENV` and a clearly-labeled **PREPARED** block (`BILLING_TEST_MODE`,
  `LOG_LEVEL`, `OBSERVABILITY_DSN`, `SESSION_SECRET`, `ENCRYPTION_SECRET`, `EVENTRA_FEATURE_FLAGS`) — marked
  as reserved and NOT yet read by code, to avoid implying features are active.
- Root `package.json`: `npm run verify` (single command: typecheck + lint + test + build + boundaries + sql
  + pwa) and `npm run check:pwa`.
- `README.md`: replaced the obsolete "Phase 0 / no code yet" status with the real state. `CHANGELOG.md`
  and `DECISIONS.md` (D70–D74) updated.

## 4. Files created

- `apps/business/app/lib/permissions.ts`
- `apps/business/app/components/pwa/PwaRuntime.tsx`
- `apps/business/public/manifest.webmanifest`
- `apps/business/public/sw.js`
- `apps/business/public/offline.html`
- `apps/business/public/icons/icon-maskable.svg`
- `apps/business/test/lib/permissions.test.ts`
- `scripts/check-pwa.mjs`
- `docs/STABILIZATION_2026-07-13.md` (this file), `docs/REPORTE_GENERAL_2026-07-13.md` (prior audit)

## 5. Files modified

- `packages/identity/src/index.ts` (+ role/permission matrix), `packages/identity/test/identity.test.ts`
- `apps/business/app/db/dataActions.ts` (authz gate), `apps/business/package.json` (+`@eventra/identity`)
- `apps/business/app/root.tsx` (PWA), `apps/business/app/data/mockPlans.ts` (doc header)
- `apps/business/.env.example`
- `package.json` (scripts), `README.md`, `CHANGELOG.md`, `docs/DECISIONS.md`

## 6. Verification (commands run, all green)

| Command | Result |
|---|---|
| `npm run typecheck --workspaces` | ✅ 0 errors (13 workspaces) |
| `npm run test --workspaces` | ✅ **~201 tests** (business 143, identity 15, entitlements 14, calendar 8, types 6, config 5, testing 4, consumer 3, admin 3) |
| `npm run lint --workspaces` | ✅ (see run log) |
| `npm run build --workspaces` | ✅ (see run log) |
| `node scripts/check-boundaries.mjs` | ✅ OK |
| `node scripts/check-sql-readiness.mjs` | ✅ READY |
| `node scripts/check-pwa.mjs` | ✅ READY (artifacts valid) |
| `node scripts/preinstall-check.mjs` | ✅ READY FOR SHOPIFY AUTHORIZATION |

## 7. Not done — remaining backlog (honest)

These need either live infrastructure/credentials or are large enough to warrant their own gated session:

| Block | Why not done | Depends on |
|---|---|---|
| 4 (Supabase real) | schema/RLS/adapter exist in code; **provisioning + live isolation matrix** need a real project | Brian: Supabase project |
| 7/8 (Shopify OAuth live + App Bridge deep + fake-adapter E2E) | scaffolding present; live flow + a fake-Shopify test harness not built | Brian: Shopify creds; eng time |
| 9 (Shopify Mobile) | responsive verified statically; **physical-device testing** not done | Brian: device + installed app |
| 12 (Admin Console real) | still a shell | eng time |
| 13 (Billing adapter) | model canonical; Shopify Billing adapter + test-mode flows not built | eng time (no real charges) |
| 14–17 (Analytics/Search/Audit/Observability real) | UI + validation exist; real wiring + audit log table + health endpoints pending | live data; eng time |
| 18 (E2E harness) | no Playwright suite yet | eng time |
| 19–20 (a11y/perf audits) | primitives are accessible; formal audit not run | eng time |
| D71 (merchant price flip) | approved-business-rule change | Brian decision |
| PNG 192/512 icons | SVG icons ship; PNGs improve install prompts | asset generation |

## 8. Manual actions for Brian (Bloque 26)

Do these when ready to move toward a real Shopify install. **Never paste secrets into chat** — put them in
`apps/business/.env` (gitignored) or the host's secret store.

1. **Decide the plan display flip (D71):** confirm whether the Business billing UI should show the locked
   model ($0/$15/$30/$45, "Business Pro", year horizons) or keep the current working prices. This unblocks
   Billing (Bloque 13) and the Countries/limits UX.
2. **Shopify Partner org + app:** create/open the Partner org, create the Eventra app, run
   `shopify app config link` (writes `client_id` into `shopify.app.toml`).
3. **Shopify credentials → `.env`:** `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL` (public
   HTTPS or the `shopify app dev` tunnel), keep `SCOPES=read_products`.
4. **Development store:** create a Shopify dev store for the pilot install.
5. **Separate Eventra Supabase project:** create a NEW project (never `primebuild-core`); copy
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` into `.env`.
6. **Apply migrations to that project** (`supabase/migrations/0001`, `policies/0002`, `reference_data/0003`,
   seed) — authorize the remote migration.
7. **Flip persistence:** set `EVENTRA_PERSISTENCE=true` (mode → `supabase`); confirm the app fails loudly if
   any secret is missing (it should).
8. **Run the live tenant-isolation matrix** (`supabase/tests/preinstall_rls_matrix.sql`) against the real DB
   and confirm zero cross-tenant leakage.
9. **Authorize deploy** to the host (build is green); set the OAuth redirect + webhook URLs.
10. **Install on the dev store** and confirm the app opens embedded in Shopify Admin and keeps its session.
11. **Test on Shopify Mobile** (open the embedded app on a phone).
12. **Install the PWA** on an iPhone (Share → Add to Home Screen) and Android (install prompt); optionally
    add PNG 192/512 icons first for the best prompt.
13. **Keep billing in test mode** (`BILLING_TEST_MODE=true`) until real charges are explicitly authorized.

---

## Final classification

- Planes unificados (arquitectura/SoT): **SÍ** — display-price flip pending Brian (D71).
- Roles unificados: **SÍ**
- Tenant isolation verificado (en vivo): **NO** — diseñado + unit-tested; live matrix pending Supabase.
- Supabase preparado: **SÍ** (código); provisionado: **NO**.
- Shopify preparado: **SÍ** (andamiaje); OAuth ejecutado: **NO**.
- Shopify instalado: **NO**
- Responsive móvil: **SÍ** (responsive); mobile-first calendar: **NO** (still year/month/day).
- Shopify Mobile probado físicamente: **NO**
- PWA preparada: **SÍ** (código); PWA instalada físicamente: **NO**.
- E2E críticos: **NO** (unit/integration green; no Playwright suite).
- Listo para deploy controlado: **PARCIAL** — build green; needs credentials + Supabase.
- Listo para instalación Shopify: **PARCIAL** — `READY FOR SHOPIFY AUTHORIZATION`; needs Brian's gates.
- Listo para producción: **NO**.

**Overall state: `READY FOR CONTROLLED DEPLOY AND SHOPIFY INSTALLATION` — pending only Brian's external
credentials/decisions (no internal technical blockers).**
