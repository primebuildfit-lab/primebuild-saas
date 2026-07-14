# Eventra — Project Context (AUTHORITATIVE)

> **Read this first.** This is the single source of truth for project state. Chat history is no longer
> authoritative. When this file conflicts with older docs, this file + `DECISIONS.md` win. Keep it
> updated when state changes. Last updated: 2026-07-13 · branch `local-install-phase` · **Phase 8 complete
> in code** — Business (Nivel B) UI reorganized around **opportunities**, not the calendar (ordered by the
> user, superseding the Phase-6 Business freeze; presentation + read-model only, LIVE Supabase untouched).
> Phase 7 (Internal OS Nivel A + offer engine) remains in code. Three strictly separated levels: A Internal
> OS (`apps/admin`), B Business, C Personal. See `docs/BUSINESS_INFORMATION_ARCHITECTURE.md`,
> `docs/INTERNAL_OS_INFORMATION_ARCHITECTURE.md`, `docs/OFFER_ENGINE.md`,
> `docs/FINAL_CERTIFICATION_CHECKLIST.md`.

---

## PROJECT OVERVIEW

- **Purpose:** A marketing **planning + campaign-memory** platform (codename "Calendar Engine"). Helps
  businesses spot commercial opportunities, prepare campaigns early, and **reuse what worked**; helps
  shoppers know when real sales happen. Core promise: *never miss an opportunity, never rebuild a winning
  campaign from zero.*
- **Independence:** Completely separate from **PrimeBuild**. PrimeBuild is only a future test store and a
  possible advertiser — never a special case in code, never its branding/DB/logic/colors.
- **Maturity:** Pre-production. Business product is a complete, tested **mock-driven** app; Consumer/Admin
  are foundation shells; no backend/billing/ads are connected anywhere.
- **Current phase:** **Phase 6 Pre-Certification (in code).** Plans + roles have a single canonical source
  (`@eventra/config` / `@eventra/identity`) with server-side role enforcement; PWA + compliance webhooks +
  health/readiness + deploy config are in place. Functionally frozen — next step is deploy/install/certify,
  not development. On top of local Windows install + MM5. Business is **installation-ready** (certified READY
  FOR SHOPIFY AUTHORIZATION), the UI is
  wired to the persistence layer, and it now launches like a normal Windows app (Desktop + Start Menu
  shortcuts, `npm run start:local`) in local preview + file mode — verified live. Awaiting only Brian's
  Shopify auth + dev-store + install for the cloud path. See `docs/WINDOWS_INSTALL.md`.
- **Status:** All tests green (**Business 134**, **185** total across 9 workspaces); typecheck / lint
  (0 errors) / build / boundary / SQL-readiness / preinstall gate all pass. Nothing live (no cloud infra,
  no install).
- **Health:** Good. Clean, typed, consistent, tested. The former schema/plan inconsistency (old Blocker 3)
  is **resolved** (reconciled to the locked org model). Remaining debt is the mock→live cutover (external
  gates) + the deferred Business-UI convergence onto `@eventra/config`/`@eventra/ui`.

**Executive summary:** Eventra began as a single Shopify app (Business). It was redesigned into **one
platform with three products** — Business, Consumer, Admin — sharing one backend. The repo is now an
**npm-workspaces monorepo**: the Business app works fully on mock data (still store-based), shared logic
lives in typed packages (`config`/`entitlements`/`calendar`/`identity`/`ui`/`types`/`testing`), and
Consumer/Admin exist as shells wired to those packages. All architecture (schema, RLS, billing,
entitlements, trials, deals, ads, notifications) is **fully specified in docs but not implemented**. The
next real work is landing Business persistence on the platform schema (org-based, RLS, principal-aware).

---

## ARCHITECTURE

**High-level:** One backend, three surfaces. Four authenticated **principal types** (consumer /
org-member / admin / service), each via its own auth adapter → a short-lived **RLS-JWT**. Server resolves
the tenant from verified identity; **RLS is a second independent gate**. Client ids are only hints, never
trusted.

**Major systems (all designed; only the entitlement/calendar engines are coded):**
- **Entitlement engine** (`@eventra/entitlements`) — pure resolver; server enforces, client displays.
- **Config** (`@eventra/config`) — single source of prices/plans/limits/trials/feature keys. No secrets.
- **Calendar/date engine** (`@eventra/calendar`) — fixed + nth-weekday(+`offsetDays`) recurrence, grids.
- **Identity** (`@eventra/identity`) — principal guards, access checks, RLS-JWT claim contracts.
- **Billing orchestration** (designed only) — provider-independent; maps external purchases → entitlements;
  never stores card data.
- **Verified-deals pipeline, advertising, notifications, company monitoring** — designed only.

**Repository structure (as-built):**
```
apps/
  business/   Full product. React Router SSR (Shopify-embedded + web). Mock data. STORE-based.
  consumer/   Shell only. Vite SPA. Wired to shared packages.
  admin/      Shell only. Vite SPA, desktop-first. Wired to shared packages.
packages/
  types/         platform domain types (type-only, leaf)
  config/        SINGLE source: prices/plans/add-ons/limits/trials/keys (leaf, no secrets)
  entitlements/  pure two-axis consumer + business resolver
  identity/      principal guards, access checks, RLS-JWT claims
  calendar/      pure date engine (rules incl. offsetDays)
  ui/            product-neutral primitives + AppShell (router-agnostic)
  testing/       shared factories/fixtures
services/
  api/ workers/  CONTRACTS ONLY (no server, no queues)
supabase/
  migrations/ policies/ seeds/ tests/   SQL written, NOT provisioned
scripts/check-boundaries.mjs            dependency-boundary + circular-import validator
docs/                                   architecture + this file
```
**Dependency rule:** `apps/* → packages/* → {config, types}`. No app imports another app; packages never
import apps. Enforced by `scripts/check-boundaries.mjs` (`npm run check:workspaces`).

**Important dependencies:** React + TypeScript + Tailwind (v4) + Framer Motion + date-fns + dnd-kit;
`@shopify/shopify-app-react-router` + App Bridge + Prisma (Shopify session storage, SQLite dev) in
Business; Vite for Consumer/Admin; Vitest + Testing Library for tests; `@supabase/supabase-js` in the
paused Business `app/db`. Node engines declared `>=20.19 <22 || >=22.12` (dev machine runs v24; works).

---

## BUSINESS RULES

**Locked (do not change without Brian; D47–D59 in `DECISIONS.md`):**
- **Consumer = two INDEPENDENT axes.** Intelligence: Core ($0) → Deal Intelligence ($30). Ad-Free = an
  **independent $15 add-on** that is the ONLY thing that removes ads. Four (only) states: $0 / $15 / $30 /
  $45. **Paying $30 for Deal Intelligence still shows ads** unless Ad-Free is also active. Trial = 30 days
  Deal Intelligence (never silently grants Ad-Free).
- **Business plans:** Free $0 / Starter $15 / Growth $30 / Business Pro $45. "Limit" = **workspaces**
  (1 / 2 / 3 / ∞ fair-use). Countries: 0(manual) / 1 / ∞ / ∞. Planning horizon in **YEARS**: 0 / 1 / 4 / 10.
  Trial = 45 days full Pro → on expiry defaults to Free with **excess read-only, never deleted**.
- **Downgrade never deletes** — excess workspaces/countries/horizon-data/premium features become read-only;
  restored on upgrade.
- **Campaign memory:** reuse/duplicate **creates a new version; never overwrites history.**
- **Events:** global events are platform-owned; a merchant hiding one is **per-store hide/restore, never a
  global delete**. Repeat-next-year defaults ON. Importance colors (🟢high/🟡med/🔴low) are **separate**
  from the category indicator.
- **Actions are visual-only in V1** — never change a store without explicit merchant approval.
- **Verified deals:** business submits → admin verifies against a source → publish → alert Deal-Intelligence
  consumers. 5 classification labels (Confirmed Official / Publicly Published / Strongly Supported Likely /
  Historical Pattern / Unverified Possibility); uncertainty is visually distinct and **never marketed as
  guaranteed**. Human verification for push in V1.
- **Ads:** first-party/house only at launch; Consumer Free only; never in Business/Admin; always labeled;
  never affect deal ranking/confidence. Monitoring uses **legal/approved sources only** (no auth bypass).
- **Security:** never trust client ids; RLS per principal; consumers see only *published* business data.

**Configurable (Admin-editable at runtime, one config source):** prices, plan feature flags, workspace/
country/horizon limits, fair-use follow limit, DI country count, trial lengths, ad placements/caps,
confidence thresholds + push policy, notification defaults, feature flags/kill-switches.

**Temporary assumptions (not yet locked — see Open Decisions):** exact saved-campaign/history caps;
consumer follow limit (config default 100) and DI country count (default 3); whether Starter can submit
verified deals; card-on-start for business trial; store-vs-web billing on mobile; PSP choice; team-member
counts (teams are post-MVP).

---

## TECHNICAL DECISIONS

**Architectural:**
- **Monorepo = npm workspaces** (D60) — one lockfile, no Nx/Turborepo/pnpm.
- **Single entitlement engine + single config source** (D53/D62) — access rules never hardcoded per UI.
- **`Store → Organization/Workspace`** (D54). Platform types already model Org/Workspace; the **rename
  inside the Business app is deliberately deferred to MM4** to protect the 87 business tests.
- **Provider-independent billing orchestration** (D52) — normalizes Play/Apple/Stripe/Shopify into internal
  entitlements; **no card data stored, ever**.
- **Consumer add-on independence** (D47) is a hard invariant, not a UI detail.
- **RLS-JWT bridge (Option A):** server authenticates → resolves tenant/membership → queries with a
  short-lived JWT whose claims RLS reads. Client never supplies tenant id.

**Implementation:**
- Business is built on the **official Shopify React Router template** (cloned, not `npm init`, to avoid
  interactive Partner login) — D28. Prisma/SQLite for Shopify sessions in dev (D29).
- Phases 2–4 use **one mutable `DataContext`** seeded from typed mock data (D32); swappable for loaders/
  actions in P2 without component rewrites.
- Black Friday/Cyber Monday use `DateRule.offsetDays` (4th Thu +1 / +4) — correct every year.
- Business SSR bundles workspace TS via `ssr.noExternal: [/@eventra\//]`.

**Rejected / avoided:** a throwaway Vite SPA to migrate later (build inside the final architecture from the
start); a flat `Store→Countries→Events` model (use explicit multi-tenant entities); bundling Ad-Free into
Deal Intelligence; third-party ad-network SDK at launch; auto-publishing deals without human review;
padding the country catalog to inflate numbers (US+CA only, quality over quantity).

**Conventions:** mock data in dedicated `data/` files (never inline in components); pages compose small
components (no giant single-file pages); every visible button does something real or is clearly disabled;
tenant key on every merchant record from day one; keep every migration step green (typecheck+test+build);
no secrets in git (`.env.example` only; client apps read only `VITE_` non-secrets).

---

## IMPLEMENTATION STATUS

**Completed:**
- **Business app** (`apps/business`) — full mock product: dashboard, calendar (year / month-with-dnd / day),
  countries, events catalog + creator + hide/restore, campaigns CRUD + status + memory/reuse, templates,
  library, search, billing/pricing UI, settings/appearance, light analytics, in-app admin. 87 tests.
- **Shared packages** — `types`, `config`, `entitlements`, `calendar`, `identity`, `ui`, `testing`, all
  tested. Business consumes `@eventra/calendar` as the single date engine.
- **Consumer + Admin shells** — Vite SPAs, nav + placeholder routes, wired to shared entitlement/identity
  packages to demonstrate boundaries. 3 tests each.
- **Structure** — `services/{api,workers}` contracts, `supabase/*` SQL + RLS + seed, env templates,
  boundary validator, full docs.
- **MM4 Business Persistence (in code):** org-based persistence layer — `BusinessRepository` contract +
  in-memory/file/Supabase adapters, reconciled schema/RLS/seed, validation/integrity, soft-delete/audit/
  versioning, server-action resource route, mode selection. Behind an env gate; mock default. +34 tests.
- **Phases:** Phase 1 Foundation → Phases 2–4 (mock product) → hardening sprint → Phase-5 groundwork
  (paused) → MM1 (platform docs) → MM2 (architecture lock) → MM3 (monorepo foundation) → **MM4 Business
  Persistence (in code)**. All done.

**Current module (next up):** **Shopify dev-store install** (Brian-gated) — authorize Shopify, select the
approved dev store, run `docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md`. Then the later live-Supabase cutover.

**Remaining:** P1 foundation (store→org rename, platform schema, 3-principal RLS, auth adapters) → P2
Business persistence (wire loaders/actions on the platform schema; Shopify pilot; isolation tests) → P3
Consumer MVP / P4 Admin MVP (parallel) → P5 notifications + verified deals → P6 billing + trials → P7
multi-platform adapters (Woo/Wix/Squarespace) → P8 mobile (Play/App Store) + ads → P9 AI. ~3–4× scope.

**Blockers:**
1. **Approval gate** — architecture lock + open decisions (Brian). MM4 proceeded on Brian's direction.
2. **External credentials (remaining stop gates)** — Shopify Partner app link (`client_id` + API secret)
   and a **new, separate** Eventra Supabase project (cost/authorization). Required to flip to `supabase`
   mode and run the live isolation matrix + in-browser reload verification.
3. ~~Schema inconsistency~~ — **RESOLVED in MM4.** `supabase/*` is reconciled to the locked org model
   (`business.*` plans, workspace/year limits, `workspace_id`, audit/soft-delete/versioning); the façade
   is bridged by `app/lib/planModel.ts`. See `docs/MM4_PERSISTENCE.md §2`.

**Known technical debt (from `PROJECT_AUDIT.md`, dispositioned):** Business still uses its own
`app/components/ui/*` instead of `@eventra/ui` (converge MM4); Business `app/db` not yet generalized to
`@eventra/identity`; records use `?c=<id>` query-param modals instead of nested record routes (decide
before P2); no route loaders/actions yet (folds into P2); framer-motion is heavy for its use; a few
`as` casts on `<select>`; residual `text-gray-400` contrast spots; docs bodies still describe the old
Shopify-only product (reconciled via banners + `DOC_IMPACT.md`, full rewrites deferred).

---

## CURRENT KNOWLEDGE

**Implementation summary:** A working, cohesive Business product exists entirely on client-side mock state;
the whole platform's backend, security, billing, and the other two products are **specified in docs but
unbuilt**. Shared business logic (entitlements, calendar) is real, pure, and tested.

**Known limitations:** state is ephemeral (reload resets; new records/deep links don't survive); no
persistence/auth/billing/RLS live; plan-limit enforcement is UI-only (server enforcement is P2); actions
are visual-only; country catalog is US+CA; notifications are light (reminder settings only, no push/email).

**Known bugs:** none open in the built (Business) code — 138 tests green. The **schema/plan mismatch**
above is a latent defect that would break P2 if applied as-is.

**Strengths:** clean layering + typed domain; single-source config/entitlements; corrected recurrence;
strong doc coverage; boundary-enforced monorepo; non-destructive memory/downgrade semantics; honest
mock→real seam that swaps without component rewrites.

**Risks:** cross-product data-boundary leaks (consumer↔business↔admin) = top risk — RLS + isolation tests
are the gate; four-source identity multiplexing into one RLS model; Play/App-Store billing economics for
consumer mobile; verified-deal trust/moderation credibility; scope dilution of the strong Business core
(mitigation: land P1–P2 before opening P3/P4).

---

## AUTHORITATIVE DOCUMENTS

Read **this file first**, then `DECISIONS.md`, then only what the task needs.

| Doc | Why it exists | Read when |
|-----|---------------|-----------|
| **`PROJECT_CONTEXT.md`** (this) | Single entry point / state of truth | Always, first |
| `DECISIONS.md` | Approved + open decisions (D1–D62); supersessions | Always, second |
| `CLAUDE.md` (root) | Permanent rules for any AI/dev (independence, design system, gates) | Before any work |
| `PLATFORM_ARCHITECTURE.md` | Shared vs isolated, security, domains, migration, phases | Backend / cross-product work |
| `PLATFORM_SCHEMA.md` | Full platform data model (all principals/domains) | Any schema/DB work |
| `RLS_SECURITY_MODEL.md` | Principals, RLS predicates, isolation-test matrix | Any auth/RLS/security work |
| `ENTITLEMENTS.md` | The entitlement engine spec (matches `@eventra/entitlements`) | Plan/limit/gating work |
| `CONSUMER_PLANS.md` / `BUSINESS_PLANS.md` | Locked plan/entitlement models | Pricing/plan/feature-gating work |
| `TRIALS_AND_DOWNGRADES.md` | Trial + read-only state machines | Trial/downgrade/billing work |
| `BILLING_ARCHITECTURE.md` | Provider-independent billing orchestration | Billing work (P6) |
| `MIGRATION_PLAN.md` | current repo → platform monorepo, step status | Structural/rename/persistence work |
| `REPOSITORY_ARCHITECTURE.md` | Target package layout + boundary rules | Adding packages/apps |
| `PLATFORM_ROADMAP.md` | Phased plan P0–P9 + dependencies | Planning "what next" |
| `SUPABASE_SCHEMA.md` | Business-slice SQL design (note: old plan ids — see Blockers) | P2 persistence |
| `PHASE5_PILOT_RUNBOOK.md` | Exact steps for the Business pilot (rescoped/paused) | Starting P2 |
| `VERIFIED_DEALS.md` / `COMPANY_MONITORING.md` | Deal pipeline + monitoring/classification | P5 |
| `ADVERTISING.md` / `AD_PRIVACY.md` | Ad system + privacy/consent framework | P8 |
| `NOTIFICATIONS.md` | Shared notification service | P5 |
| `CONSUMER_PRODUCT.md` / `BUSINESS_PRODUCT.md` / `ADMIN_CONSOLE.md` | Per-surface page/route maps | Building that surface |
| `RECURRENCE.md` / `STATE_ARCHITECTURE.md` / `ROUTING.md` / `PLAN_ENFORCEMENT.md` / `SECURITY_PLAN.md` | Business-slice deep dives | Touching that Business subsystem |
| `PROJECT_AUDIT.md` | Full pre-V1 audit + finding dispositions | Assessing debt/quality |
| `DOC_IMPACT.md` | Which older docs are superseded/rescoped | When an old doc seems to conflict |
| `TECHNICAL_HANDOFF.md` / `ENVIRONMENTS.md` | As-built run/verify commands + env strategy | Running/verifying locally |
| `ADMIN_CONFIGURATION.md` / `MONETIZATION.md` | Admin-editable settings; revenue lines | Admin/config/pricing work |
| `BUSINESS_RULES.md` / `PRODUCT_ROADMAP.md` / `SOP.md` / `ARCHITECTURE_REVIEW.md` | Original Business source material (historical; banners note supersessions) | Deep Business history only |

**Recommended reading order for a new contributor:** `PROJECT_CONTEXT.md` → `DECISIONS.md` → `CLAUDE.md`
→ `PLATFORM_ARCHITECTURE.md` → the two or three docs for your specific task.

---

## CURRENT AI CONTEXT (minimum to be productive)

A new AI session needs only: **this file + `DECISIONS.md` + `CLAUDE.md`**, plus the task-specific docs
above. Do **not** read the whole `docs/` tree. Key facts to hold:

- Repo: `D:\Eventra\eventra`, npm-workspaces monorepo, branch `main`. Remote `primebuildfit-lab/
  primebuild-saas` (don't rename). Windows dev machine.
- Run: `npm install` then `npm run test|typecheck|build|lint --workspaces`, `npm run check:workspaces`.
  Per app: `npm run dev -w @eventra/business|consumer|admin`. **This machine blocks npm install scripts —
  run `npm approve-scripts` (or the pre-approved `allowScripts` in root `package.json` covers prisma/
  esbuild); if esbuild's postinstall was blocked, run `node node_modules/esbuild/install.js` once.**
- State: Business app is full but **mock + store-based**; Consumer/Admin are shells; nothing is connected
  to Supabase/Shopify/billing/ads. 138 tests green.
- Invariants you must not break: consumer two-axis independence ($30 keeps ads); business workspace/year
  limits; never overwrite campaign history; per-store event hide (never global delete); never trust client
  ids; visual-only actions; PrimeBuild is never special-cased; keep every step green.
- **Do not** connect real infrastructure, provision Supabase, implement billing, publish apps, or change
  PrimeBuild without explicit approval. Gate work behind Brian's sign-off.

---

## NEXT WORK

**Build next: P1 Platform Foundation → P2 Business Persistence** (the rescoped old Phase 5).

- **What:** (1) Reconcile the Supabase Business slice to the **locked** model and rename `store→org/
  workspace` (`MIGRATION_PLAN.md` M3–M6). (2) Stand up the platform schema with 3 principal types + RLS
  (`is_org_member`, `is_self`) per `PLATFORM_SCHEMA.md` / `RLS_SECURITY_MODEL.md`. (3) Wire Business
  loaders/actions (countries, events, hide/restore, custom events, campaigns + memory, templates, prefs,
  plan) onto the schema, replacing `DataContext` mock reads/writes. (4) Shopify pilot on a dev store +
  live tenant-isolation tests.
- **Why:** Protect the built value first — the Business core is done and tested; giving it real,
  secure persistence is the highest-leverage step and the foundation the other surfaces attach to.
- **Prerequisites (gates):** Brian approves the architecture lock + open decisions; a **new, separate**
  Eventra Supabase project is provisioned; the Shopify app is linked (`client_id` + secrets in `.env`).
  **First fix the schema/plan mismatch** (Blocker 3) before applying any migration.
- **Expected outcome:** Business runs on real Postgres with RLS; a merchant's data persists and is
  tenant-isolated; plan limits are enforced **server-side**; mock mode still available behind the env gate.
- **Acceptance criteria:** all 138 tests still green + new isolation tests pass (`RLS_SECURITY_MODEL.md §7`
  matrix); a Shopify dev-store install provisions an org/workspace and persists a campaign across reload;
  no client-supplied id is trusted; downgrade marks excess read-only (never deletes); typecheck/build/
  boundary checks green.

**Smaller parallel-safe cleanups (optional, MM4):** converge Business onto `@eventra/ui` + `@eventra/
config/entitlements`; generalize `app/db` → `@eventra/identity`; decide nested record routes vs query-param
modals.

---

## CHANGE HISTORY (milestones only)

- **Phase 1** — Foundation on the official Shopify React Router template (App Bridge shell, domain types,
  mock layer, Supabase schema *designed*).
- **Phases 2–4** — Full mock-driven Business product (dashboard, calendar, countries, events, campaigns +
  memory, templates, library, search, billing, settings, analytics, admin).
- **Hardening sprint** — Added Vitest (77→87 tests); fixed BF/CM recurrence (`offsetDays`); split
  `DataContext`; dialog a11y (focus trap); routing 404s; plan-limit/downgrade retention (mock); security
  plan. Audit: health 78/100, prod-readiness 35/100.
- **Phase-5 groundwork (PAUSED)** — Env-gated Business persistence (`app/db/*`) + Supabase Business-slice
  SQL. Never connected. (Now needs reconciliation to the locked model — see Blockers.)
- **MM1** — Redesign to **one platform, three products** (Consumer/Business/Admin); full product +
  architecture docs.
- **MM2 — Architecture Lock (D47–D59)** — Locked consumer two-axis model, business plans (workspaces/year
  horizons), entitlement engine, platform schema, RLS, billing orchestration, trials, deals, ads,
  notifications.
- **MM3 — Platform Foundation (implemented)** — npm-workspaces monorepo; Business moved to `apps/business`
  (history preserved); 7 shared packages; Consumer/Admin shells; services/supabase structure; boundary
  validator. 138 tests across 9 workspaces. **← current HEAD `589509e`.**

Checkpoint tags: `pre-monorepo-foundation`, `pre-platform-expansion`.
