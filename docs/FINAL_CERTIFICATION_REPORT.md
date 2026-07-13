# Eventra — Final Certification Report (`FINAL_CERTIFICATION_REPORT.md`)

> Run date: 2026-07-13 · Executed by: automated agent (local) · Branch: `local-install-phase`
>
> **Honest scope:** this report classifies every certification item against what has *actually* happened.
> No deploy, Supabase project, Shopify install, or physical device test has occurred — those require Brian's
> external actions and credentials. Items that depend on them are **BLOCKED**, not PASS. Nothing physical is
> claimed as validated.

Legend: **PASS** (verified locally) · **FAIL** (broken) · **BLOCKED** (needs Brian/credentials/deploy) ·
**N/A**.

## Links (do not exist yet)

| Link | Value |
|------|-------|
| Public URL | ⛔ not deployed — will be `https://<eventra-host>/` after Bloque 4 |
| PWA install URL | ⛔ same public URL, after deploy |
| Shopify install link | ⛔ generated after the Partner app + deploy exist |

No URL is invented here — per instruction, the real domain is published only once the deploy exists.

## Certification matrix

### Deploy / infrastructure
| Item | Status | Evidence |
|------|--------|----------|
| Build (all workspaces) | **PASS** | `npm run verify` → 4 builds ✓ |
| `/healthz`, `/readyz` routes exist | **PASS** | `apps/business/app/routes/healthz.tsx`, `readyz.tsx` |
| `railway.json` + DEPLOY doc | **PASS** | root `railway.json`, `docs/DEPLOY.md` |
| Public HTTPS URL live | **BLOCKED** | no deploy |
| Production no-mock (fail-loud) | **PASS (code)** | `env.server.ts` `persistenceMode`; no silent fallback |

### Supabase — ✅ LIVE + VALIDATED (2026-07-13)
| Item | Status |
|------|--------|
| Schema/RLS/rollback authored (0001–0006) | **PASS** |
| SQL readiness (static) | **PASS** (`check:sql`) |
| Real project connected | **PASS** — `eventra` (ref `kavsuxzzxzzwiunjfiyk`), separate from primebuild-core |
| Migrations applied to real project | **PASS** — 0001→0006; 34 tables, RLS on all; ref data (2/4/11) |
| Live RLS tenant isolation | **PASS** — User A sees only own data, 0 leakage from Org B |
| Live RLS `WITH CHECK` cross-tenant write | **PASS** — foreign-workspace write blocked |
| Live Internal-OS platform isolation | **PASS** — non-admin blocked; platform_owner allowed |
| Production has no fictional data | **PASS** — all test rows deleted; only reference data remains |
| Security advisors | **PASS (WARN-only)** — search_path fixed; definer-fn notices documented |

### Shopify
| Item | Status |
|------|--------|
| App config (`shopify.app.toml`), scopes, webhooks + compliance | **PASS (code)** |
| Preinstall gate | **PASS** (`READY FOR SHOPIFY AUTHORIZATION`) |
| Partner app created / `client_id` | **BLOCKED** |
| Real OAuth (state/HMAC/token/session) | **BLOCKED** — never claimed from local tests |
| App Bridge embedded in Admin | **BLOCKED** |
| Onboarding idempotency (live) | **BLOCKED** (idempotent by design; `tenant.server.ts`) |
| Reinstall behavior (live) | **BLOCKED** |
| Webhooks delivered + HMAC (live) | **BLOCKED** (handlers built + registered) |

### Internal OS (Nivel A)
| Item | Status |
|------|--------|
| Access gate (admin + platform role) | **PASS (code + tests)** |
| Platform vs tenant separation | **PASS** (`@eventra/identity`, tested) |
| Screens render (Home/Calendar/Offers/…) | **PASS** (admin tests + build) |
| Live admin auth provider | **BLOCKED** |

### Business App
| Item | Status |
|------|--------|
| 12 screens on mock/file | **PASS** |
| Persistence seam + enforcement | **PASS (tests)** |
| Live on real data | **BLOCKED** (Supabase) |

### PWA
| Item | Status |
|------|--------|
| Manifest + SW + offline + icons | **PASS** (`check:pwa`) |
| PNG icons 192/512 + apple-touch | **PASS** (generated this phase, valid PNG) |
| Installed on Android | **BLOCKED** (needs public URL + device) |
| Installed on iPhone | **BLOCKED** |
| Offline shell on device | **BLOCKED** |

### Quality
| Item | Status |
|------|--------|
| typecheck / lint / tests / boundaries | **PASS** (232 tests) |
| E2E (Playwright) critical flows | **BLOCKED/PENDING** — harness not built; live flows need Shopify |
| a11y / performance formal audit | **PENDING** |
| Security (roles/RLS/HMAC/secrets) design + unit | **PASS (code)**; live pen-test **BLOCKED** |

## Final classification

**EVENTRA NOT INSTALLED** — all local engineering is green and activation-ready, but the external resources
(Supabase project, Shopify Partner app, deploy, devices) have not been provisioned/authorized. No physical
or live validation has occurred. Proceed with `docs/INSTALLATION_REPORT.md` once Brian provisions them.
