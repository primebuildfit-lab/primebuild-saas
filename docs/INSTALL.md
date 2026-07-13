# Eventra Business — Install Guide (`INSTALL.md`)

> How Eventra is installed on a Shopify store and what happens automatically. The detailed step list for
> Brian is `docs/SHOPIFY_DEV_INSTALL_RUNBOOK.md`; the post-install verification is
> `docs/FINAL_CERTIFICATION_CHECKLIST.md`. **No store has been installed yet.**

## The install / OAuth / onboarding flow (implemented)

```
Merchant clicks Install
        ↓
Shopify OAuth  (state + HMAC + token exchange)   ← handled by @shopify/shopify-app-react-router
        ↓
Session stored (Prisma: Session table)
        ↓
Embedded /app loads → authenticate.admin(request)
        ↓
resolveTenant(session)   ← tenant.server.ts, uses the VERIFIED shop domain (never a client id)
        ↓
Idempotent provisioning (deterministic ids, uuidv5):
  organization (owner_user_id) → workspace (commerce_platform=shopify, commerce_external_ref=shop)
  → membership (owner) → subscription (business.free) → workspace_preferences → workspace_countries(US)
        ↓
Dashboard (/app) renders inside Shopify Admin (App Bridge)
```

- **Idempotent:** all provisioning uses `upsert` on deterministic ids, so reinstalling or receiving the
  install twice never duplicates or breaks anything (D65/A3).
- **Auth handled by the library:** OAuth begin/callback, `state`, HMAC, token exchange, and session
  persistence are provided by `@shopify/shopify-app-react-router` + `authenticate.admin`. Eventra code adds
  tenant resolution + provisioning on top.
- **Scopes:** `read_products` only (no writes — V1 actions are visual-only).
- **Modes:** with no Supabase secrets the app runs on mock/file data (the embedded UI still works for
  inspection); with `EVENTRA_PERSISTENCE=true` + `SUPABASE_*` set, provisioning + reads/writes hit the real
  RLS-scoped database.

## Compliance webhooks (registered)

`shopify.app.toml` registers, and `app/routes/webhooks.*` handle:

- `app/uninstalled` — deletes the shop's Shopify sessions.
- `app/scopes_update` — updates the stored session scope.
- `customers/data_request`, `customers/redact` — acknowledged (Eventra stores no customer PII).
- `shop/redact` — deletes the shop's sessions and (supabase mode) the organization row (cascades all data).

## Prerequisites Brian must supply (external)

`client_id` (via `shopify app config link`), `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET`, a public
`SHOPIFY_APP_URL`, a development store, and (for real data) the separate Supabase project. Full list:
`docs/FINAL_CERTIFICATION_CHECKLIST.md` §Brian actions.
