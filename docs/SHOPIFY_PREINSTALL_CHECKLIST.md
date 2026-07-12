# Eventra — Shopify Pre-Install Checklist (MM5, Part 9)

> Everything Brian must supply or approve before Eventra can be installed into a Shopify **development**
> store. No real credentials live in the repo — placeholders only. Nothing here provisions or installs.

## 1. App configuration (`apps/business/shopify.app.toml`) — audited
| Field | Current | Action |
|-------|---------|--------|
| `name` | `eventra` | ✅ keep |
| `client_id` | `""` (blank) | ⛔ **Brian**: populated automatically by `shopify app config link` when the app is created on the Partner org. Do not hand-edit. |
| `[access_scopes].scopes` | `read_products` | ✅ least-privilege (see §2) |
| `[webhooks].api_version` | `2025-10` | ✅ matches `shopify.server.ts` (`ApiVersion.October25`) |
| webhooks | `app/uninstalled`, `app/scopes_update` | ✅ handlers exist (`routes/webhooks.app.*`) |
| embedded | App Bridge via `AppProvider embedded` | ✅ |
| session storage | Prisma (SQLite dev) | ✅ default; revisit Postgres later |

## 2. Access-scope least-privilege review
| Scope | Verdict | Rationale |
|-------|---------|-----------|
| `read_products` | **required now** | Merchants attach products/collections to campaigns (read-only). |
| `write_products` | **excluded (dangerous)** | V1 actions are **visual-only** (D7); Eventra never writes to a store. |
| `read_orders` / analytics scopes | **required later** | Only when real analytics land (P-later); not requested now. |
| any `write_*` | **excluded** | Not needed pre-install; least privilege. |

**Result:** the single `read_products` scope is correct and minimal. No scope changes needed.

## 3. Values Brian must supply at install time (into `apps/business/.env`, gitignored)
| Var | Source | Notes |
|-----|--------|-------|
| `SHOPIFY_API_KEY` | Partner dashboard / `config link` | client id (public) |
| `SHOPIFY_API_SECRET` | Partner dashboard | **secret** — never commit |
| `SHOPIFY_APP_URL` | tunnel/host from `shopify app dev` | set automatically in dev |
| `SCOPES` | `read_products` | matches toml |
| `DATABASE_URL` | optional | only if moving Prisma sessions off SQLite |
| Supabase `SUPABASE_*` + `EVENTRA_PERSISTENCE=true` | **later** | only for `supabase` mode; NOT required to first see Eventra in Admin (mock/file mode works) |

## 4. Prerequisites Brian must have
- A **Shopify Partner account** + a **development store** (never PrimeBuild production).
- **Shopify CLI** installed (`shopify version`); Node ≥ 20.19.
- Authorization to create/link an app on the Partner org.

## 5. Hard stops (Eventra will NOT do these autonomously)
⛔ Shopify login · ⛔ Partner-org / dev-store selection · ⛔ entering secrets · ⛔ `shopify app config link`
running against a real org · ⛔ `shopify app dev` install · ⛔ Supabase provisioning · ⛔ deploy/publish.

## 6. What already works WITHOUT any of the above
- `mock` and `file` persistence modes (no secrets) — the full Business UI runs locally.
- Local `EVENTRA_PREVIEW=true` inspection of every screen (labeled, no Shopify session).
- All tests, typecheck, build, SQL readiness, boundary checks.

→ Next: `docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md` for the exact ordered install steps.
