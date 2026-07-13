# Eventra — Final Certification Checklist (`FINAL_CERTIFICATION_CHECKLIST.md`)

> **Purpose:** the definitive list to run **after** Eventra is deployed and installed. Everything below is
> code-ready today; this checklist is the human/live verification that turns "prepared" into "certified."
> Check each box only when actually observed. Do **not** mark anything passed that did not happen.
>
> Legend: ☐ not verified · ✅ verified · ❌ failed (log it) · ⛔ blocked (needs Brian/credentials)

---

## 0. Pre-conditions (Brian supplies — external)

- ☐ Shopify Partner org + app created; `client_id` set via `shopify app config link`.
- ☐ `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_APP_URL` set in the deploy env.
- ☐ Development store created.
- ☐ Separate Eventra **Supabase** project created (never `primebuild-core`); `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` set.
- ☐ Migrations applied to that project (`supabase/migrations/0001`, `policies/0002`,
  `migrations/0003`, seed) — authorized.
- ☐ `EVENTRA_PERSISTENCE=true`, `NODE_ENV=production`.
- ☐ Deploy performed (Railway or Node host); `railway.json` health path `/healthz`.

---

## 1. Deploy / infrastructure

- ☐ `GET /healthz` → 200 with `{status:"ok", version, commit, env:"production", uptimeSeconds}`.
- ☐ `GET /readyz` → 200 `{status:"ready", mode:"supabase", checks:{secrets:"ok", database:"ok"}}`.
- ☐ HTTPS valid on `SHOPIFY_APP_URL`; no mixed-content warnings.
- ☐ Server boots without fatal errors; logs are structured JSON (no secrets/tokens in logs).
- ☐ Restart recovers cleanly; `/readyz` flips to 503 if the DB is pulled (fault behavior).
- ☐ Build reproduces from a clean checkout via the `railway.json` commands.

## 2. Shopify — install / OAuth

- ☐ Install link starts OAuth; consent screen shows scope **read_products** only.
- ☐ Callback completes; no `state`/HMAC errors.
- ☐ Session persisted (a `Session` row exists for the shop).
- ☐ Re-install does not duplicate org/workspace/membership (idempotent).
- ☐ Uninstall (`app/uninstalled`) removes the shop's sessions.
- ☐ `app/scopes_update` updates the stored scope.

## 3. Shopify — embedded app / App Bridge

- ☐ App opens **inside Shopify Admin** (embedded iframe) and lands on the Dashboard.
- ☐ App Bridge session token flows on navigation; no redirect loops / iframe breakouts.
- ☐ Session expiry triggers a clean re-auth (not a crash).
- ☐ Deep links / in-app navigation (Calendar, Campaigns, Settings…) work embedded.
- ☐ Error boundary renders inside the frame (no white screen) on a thrown route.

## 4. Shopify — compliance webhooks (HMAC-verified)

- ☐ `customers/data_request` → 200, acknowledged (no customer PII stored).
- ☐ `customers/redact` → 200, acknowledged.
- ☐ `shop/redact` → 200; sessions deleted; org row (and cascade) purged in supabase mode.
- ☐ Invalid HMAC is rejected (401) — send a tampered payload.
- ☐ Duplicate delivery is safe (idempotent handlers).

## 5. Supabase — data / RLS

- ☐ First embedded load provisions org + workspace + owner membership + free subscription + US country.
- ☐ Reads/writes go through the RLS-scoped user client (not service role).
- ☐ **Cross-tenant isolation:** run `supabase/tests/preinstall_rls_matrix.sql` against the live DB → a user
  from shop A cannot read/write shop B's rows (0 leakage).
- ☐ `WITH CHECK` blocks inserting a row into a foreign workspace.
- ☐ Platform catalog (countries/plans/global_events) readable by any authenticated identity; not writable by
  a tenant user.
- ☐ Soft-deleted records are excluded from reads but retained in the table.
- ☐ Indexes present (spot-check query plans on `campaigns` by workspace/status).

## 6. Onboarding

- ☐ Brand-new store → full chain runs automatically to the Dashboard.
- ☐ Existing store → no duplication.
- ☐ Reinstall → nothing breaks; data intact where expected (or cleanly re-provisioned).
- ☐ Owner role assigned; plan defaults to Free.

## 7. Session tokens → tenant context

- ☐ Tenant/workspace/user/role are derived from the **verified** session, never from client input.
- ☐ A forged workspace/org id in a request is rejected (RLS + server guard).
- ☐ Role is honored server-side (see §9).

## 8. Responsive

- ☐ **Desktop** (embedded + standalone): all 12 screens usable.
- ☐ **Tablet:** layout adapts; no horizontal overflow.
- ☐ **Mobile:** sidebar collapses to the drawer; touch targets adequate; calendar month/day usable;
  forms/modals fit the viewport; date selection works; keyboard doesn't obscure inputs.
- ☐ Safari iOS + Chrome Android render without broken layout.
- ☐ Works inside **Shopify Mobile** (embedded webview).

## 9. Security / permissions

- ☐ Secrets never appear in logs, HTML, or client bundles.
- ☐ CSRF/session handled by App Bridge session tokens; webhooks HMAC-verified.
- ☐ **Role enforcement (server):** as `viewer`, writes are rejected (403/forbidden); as `editor`, content
  writes succeed but `plan:manage`/`org:manage` are denied; as `owner`, all allowed. (Matrix:
  `@eventra/identity`; gate: `dispatchDataAction`.)
- ☐ Over-limit data on downgrade is read-only, never deleted.
- ☐ No write scopes requested; app never mutates the store.

## 10. PWA

- ☐ `/manifest.webmanifest` served; Lighthouse "Installable" passes (add PNG 192/512 icons first for the
  best prompt — see §Follow-ups).
- ☐ Service worker registers **only** in a top-level window (never inside the Shopify iframe).
- ☐ **Android:** install prompt appears; installs; launches standalone.
- ☐ **iPhone (Safari):** Share → Add to Home Screen; launches standalone; the manual tip appears once.
- ☐ Offline: navigating offline shows the `offline.html` shell + banner (no fake "saved").
- ☐ SW update: a new deploy activates on next load (SKIP_WAITING path).
- ☐ `/app/data`, `/auth`, `/webhooks` are never served from cache.

## 11. Functionality (on real data)

- ☐ Campaigns: create / edit / delete / status / duplicate (new version, source preserved).
- ☐ Calendar: year / month / day; drag-to-reschedule; create from event/date.
- ☐ Events: catalog + Event Creator; hide/restore (per-store, never global delete).
- ☐ Memory / library: reuse creates a new record; history never overwritten.
- ☐ Templates: create + template↔campaign.
- ☐ Countries: enable/disable within the plan limit.
- ☐ Search: tenant-scoped, no cross-tenant results.
- ☐ Analytics: reflects real campaign data (empty states where data is absent).
- ☐ Settings/appearance: persists across reload.
- ☐ Billing: shows plans; **no real charge** (test mode) until authorized.

## 12. Quality

- ☐ Performance: initial embedded load acceptable; no obvious jank on calendar/tables.
- ☐ Accessibility: keyboard nav, focus visible, modal focus-trap, labels/aria on forms.
- ☐ Errors: thrown routes show the in-app error boundary; `/readyz` reflects real state.
- ☐ Logs: structured, request-id correlated, no secrets.
- ☐ Documentation matches the shipped behavior (`README`, `BUILD_STATUS`, `DEPLOY`, `INSTALL`, `TESTING`).

---

## 13. Internal OS (Nivel A — Phase 7)

> The private platform console (`apps/admin`). Verified after deploy + admin auth is wired.

- ☐ **Login of Brian:** only an admin principal with a platform role reaches the Internal OS; a business
  user is denied (403).
- ☐ **Separation from Business:** no Nivel-B/C access path into A; separate routes/auth.
- ☐ **Companies / Users:** lists load real tenant registry (dev seed replaced), no cross-tenant exposure.
- ☐ **Offers:** list + filters + score + status + certainty; bulk actions gated by role + audited.
- ☐ **Global Calendar:** annual view; 4-year horizon projects as `estimated`, never confirmed.
- ☐ **Cancellations:** detection engine flags changes/cancellations; alerts reach affected companies.
- ☐ **Sources:** authorized sources only; health/reliability shown.
- ☐ **AI:** runs only through the port; low-confidence requires human review; no auto-publish; audited.
- ☐ **Automations/Jobs:** status/schedule/errors; safe cancel; no unauthorized external calls.
- ☐ **Commissions:** modeled 1–2% only; no real charge without authorization.
- ☐ **Integrations:** connect/disconnect/scopes/status (incl. PLANNED); no live keys until authorized.
- ☐ **Logs / Audit:** every admin write logged (actor/before/after); no secrets in logs.
- ☐ **RLS (internal-os):** `0005` applied; a non-platform user cannot read/write offer-engine tables; run a
  platform isolation check.
- ☐ **Roles:** operations can curate offers but not manage commissions; support can impersonate (audited);
  read_only/analyst cannot write.
- ☐ **Responsive:** sidebar drawer + safe table scroll on mobile; usable for quick checks.
- ☐ **Performance:** server-side pagination/filtering on large lists; annual calendar loads efficiently.
- ☐ **Security:** deny-by-default; reauth for sensitive actions; export logging; rate limits.

## Brian's exact actions (in order)

**Deploy**
1. Set env vars (Shopify + Supabase + `EVENTRA_PERSISTENCE=true` + `NODE_ENV=production`) in the host.
2. Apply Supabase migrations to the new project (authorize the remote migration).
3. Deploy via `railway.json` (root directory = repo root). Confirm `/healthz` = 200, `/readyz` = ready.

**Install on Shopify**
4. `shopify app config link` (writes `client_id`); set the app URL + callback to the deploy URL.
5. Install on the development store; confirm OAuth completes and the Dashboard opens embedded.
6. Trigger a test uninstall/reinstall; confirm idempotency + session cleanup.

**Install the PWA**
7. (Optional but recommended) add PNG 192/512 icons.
8. Android: accept the install prompt. iPhone: Share → Add to Home Screen. Confirm standalone launch + offline shell.

**Certify**
9. Run this checklist top to bottom; run the live RLS isolation matrix; log any ❌ for a follow-up fix pass.

---

## Known follow-ups (not blockers to install; fix during/after certification)

- PNG maskable icons (192/512) — SVG icons ship today; PNGs improve the install prompt.
- Root-context Dockerfile if Docker (not Nixpacks) is preferred (`apps/business/Dockerfile` is standalone-only; D75).
- Merchant-facing Business plan price/name/horizon flip to the locked model — **Brian decision** (D71).
- Playwright E2E harness; formal Lighthouse a11y/perf audit.
- Live Shopify Billing wiring (model canonical; charges stay off until authorized).
