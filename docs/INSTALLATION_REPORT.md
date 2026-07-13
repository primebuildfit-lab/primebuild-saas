# Eventra — Installation Report (`INSTALLATION_REPORT.md`)

> Live-status log for deploy + Shopify install. **Current state: NOT STARTED (external).** Fill the
> bracketed values as each step actually completes — do not pre-fill URLs or mark steps done before they
> happen.

## Current status: 🟡 SUPABASE LIVE — deploy + Shopify install still pending (external)

**Supabase is provisioned, migrated, and RLS-validated** (2026-07-13). Railway deploy and the Shopify
Partner app/install remain blocked on interactive login only Brian can perform.

## Environment / links (to be filled after each step)

| Field | Value |
|-------|-------|
| Public URL | `[ pending deploy ]` |
| Supabase project ref | `[ pending ]` |
| Shopify app `client_id` | `[ pending ]` |
| Shopify App URL | `[ = public URL ]` |
| Callback URL | `[ = <public URL>/auth ]` |
| Dev store | `[ pending ]` |
| Deploy commit | `[ hash ]` |

## Step log

### 1. Supabase project — ✅ DONE + VALIDATED (2026-07-13)
- [x] Created a **separate** Eventra Supabase project `eventra` (ref `kavsuxzzxzzwiunjfiyk`, region us-east-1),
      in the PrimeBuild org but a distinct project — **primebuild-core untouched**.
- [x] Applied migrations in order: `0001_schema` → `0002_rls` → `0003_reference_data` → `0004_internal_os`
      → `0005_internal_os_rls` → `0006_harden_function_search_path`. **No dev/fictional seed in the project.**
- [x] Verified: **34 tables**, RLS enabled on all; reference data loaded (2 countries, 4 plans, 11 events).
- [x] **Live RLS validated with two real tenants:** User A sees only their own campaign (0 leakage from Org B);
      cross-tenant write blocked by `WITH CHECK`; Internal-OS tables invisible to non-admins and readable only
      by a `platform_admin`. All test data deleted afterward → clean production state.
- [x] Security advisor `set_updated_at` search_path fixed (0006). SECURITY DEFINER helper functions kept
      EXECUTE-able by `authenticated` on purpose (needed by RLS; self-referential booleans, no leakage).
- [ ] **Brian:** copy `Project URL`, `anon (publishable) key`, `service_role key`, and `JWT secret` from
      Supabase → Settings → API into the Railway secret store (never into git or chat).

### 2. Hosting (Railway) — ⛔ BLOCKED (Brian)
- [ ] Service root directory = repo root; build/start per `railway.json`; health `/healthz`.
- [ ] Set all env vars (see `docs/DEPLOY.md`), incl. `NODE_ENV=production`, `EVENTRA_PERSISTENCE=true`,
      `SESSION_SECRET`, `ENCRYPTION_SECRET`, `BILLING_TEST_MODE=true`.

### 3. Deploy — ⛔ BLOCKED (Brian authorization)
- [ ] Deploy; confirm build OK, `/healthz`=200, `/readyz`=ready (supabase), no mock in prod, restart survives.
- [ ] Record public URL + deploy commit above.

### 4. Shopify Partner app — ⛔ BLOCKED (Brian)
- [ ] Create/select the Eventra app; set App URL + callback to the deploy URL; embedded; scopes
      `read_products`; webhooks + compliance topics point to the deploy domain; no stale URLs.

### 5. Install on a development store — ⛔ BLOCKED (Brian)
- [ ] Install; validate consent → state → HMAC → callback → token → session → org/workspace/owner →
      onboarding → embedded dashboard.
- [ ] Verify idempotent reinstall (no duplicate org/workspace/owner; RLS intact).
- [ ] Trigger + verify webhooks (`app/uninstalled`, `customers/data_request`, `customers/redact`,
      `shop/redact`) on a throwaway store — HMAC valid, idempotent, audited.

### 6. Validate embedded + Internal OS + functional flows — ⛔ BLOCKED
- [ ] App Bridge, session token, navigation, reauth, tenant derived from session, no data leakage.
- [ ] Internal OS access (Brian only), Business flows on real data.

## Result
To be updated. Until every external step above is real, the classification remains **EVENTRA NOT INSTALLED**.
