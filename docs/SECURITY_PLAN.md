# Eventra — Tenant Security Plan & Phase‑5 Security Test Plan

> ⚠️ **Honest status:** Eventra has **no real tenant security yet.** Phases 2–4 run entirely on
> client-side mock data for a single fictional demo store; `app/lib/tenant.ts#assertMembership` is a
> no-op placeholder. This document is the *design + test plan* to implement and verify before any real
> merchant data exists (Phase 5). Do not describe the app as multi-tenant-secure until this is built and
> the tests below pass. Related: `docs/ARCHITECTURE_REVIEW.md §8`, `docs/SUPABASE_SCHEMA.md`.

## 1. Threat model (multi-tenant SaaS)
Primary threat: **cross-tenant access** — one merchant reading or mutating another store's countries,
events, campaigns, templates, or preferences. Secondary: privilege escalation to platform-admin
(editing the global catalog), and tampering with plan entitlements to bypass limits/billing.

## 2. Core rule — never trust a client `storeId` (D17/D23)
A `storeId` from the browser is a **hint, not authorization**. Every merchant-owned row carries
`store_id`, but access is authorized from the **authenticated identity**, resolved server-side, and
enforced by the database — not from any value the client sends.

Two independent gates (defense in depth):
1. **Server (application):** each React Router `loader`/`action` resolves the Shopify session →
   `store` → validates a `membership(user, store)` before reading/writing. Reject (404/403) on miss.
2. **Database (Supabase RLS):** every merchant table's policy allows a row only when
   `is_store_member(store_id)` is true for `auth.uid()`. RLS is the real gate even if app code is wrong.

## 3. Data classification
| Class | Tables | Access |
|-------|--------|--------|
| **Platform-owned** (no `store_id`) | `countries`, `global_events`, `plans` | any authenticated user may **read**; writes are admin/service-role only (no authenticated write policy → denied by default) |
| **Tenant-owned** (`store_id`) | `stores`, `memberships`, `store_countries`, `store_event_preferences`, `custom_events`, `campaigns`, `templates`, `store_preferences`, `subscriptions` | read/write only by members of that store, via RLS |

Admin vs. merchant: merchants can **hide** global events per-store (`store_event_preferences`) but can
**never** edit the global catalog. Admin catalog writes go through a separate admin/service-role path,
never the merchant session.

## 4. Server validation interface (Phase 5 contract)
Replace the `tenant.ts` stub with real guards, called at the top of every merchant loader/action:

```
resolveTenant(request): { userId, store, membership }   // throws 401 if no session
requireMember(request, storeId): membership             // throws 403 if not a member
requirePlan(store): { plan, subscription }              // for limit enforcement (see PLAN_ENFORCEMENT.md)
```

- The Shopify session (App Bridge token, verified server-side) establishes identity.
- Bridge to Supabase via **Option A** (recommended, `SUPABASE_SCHEMA.md §4`): a short-lived signed JWT
  carrying the verified `user_id`/`store_id`; `auth.uid()` in RLS reads that claim. The client never
  supplies the store; the server check and RLS must **both** agree.

## 5. RLS policies (designed — see `SUPABASE_SCHEMA.md §3`)
- `is_store_member(target)` SECURITY DEFINER helper.
- RLS enabled on **every** table.
- Merchant tables: `USING (is_store_member(store_id)) WITH CHECK (is_store_member(store_id))` — the
  `WITH CHECK` clause is what blocks a spoofed `store_id` on INSERT/UPDATE.
- Catalog tables: `SELECT` for `authenticated`; no insert/update/delete policy (denied by default).
- `memberships`: a user sees only their own rows.

## 6. Anti-spoofing checklist
- [ ] Client `storeId` is never used to authorize — only to hint UI; server re-resolves from session.
- [ ] `WITH CHECK` on every merchant table prevents inserting/updating rows into another store.
- [ ] Foreign keys + RLS prevent attaching child rows (campaign → store) across tenants.
- [ ] Platform catalog is read-only to `authenticated`; admin writes use a separate role.
- [ ] Plan/entitlement checks read the store's subscription **server-side** (no client plan trust).
- [ ] Session tokens verified server-side on every request; short JWT TTL; no long-lived secrets in the
      client bundle. `.env` secrets are gitignored and never shipped to the client.

## 7. Phase‑5 security test plan (must pass before real data)
Automated (integration, against a test Supabase project with seeded stores A and B):
1. **Read isolation** — user of store A cannot `SELECT` store B's campaigns/events/templates/prefs (RLS
   returns zero rows).
2. **Write isolation / spoofing** — user A INSERT/UPDATE with `store_id = B` is rejected by `WITH CHECK`.
3. **Membership required** — a user with no membership for a store gets 403 from loaders and empty from
   RLS.
4. **Catalog immutability** — a merchant cannot INSERT/UPDATE/DELETE `countries`/`global_events`/`plans`.
5. **Hide is per-store** — A hiding a global event does not change B's visibility; the global row is
   untouched (already unit-tested at the mock layer in `planning.test.ts`).
6. **Plan enforcement server-side** — exceeding country/campaign/horizon limits is rejected in actions
   even when the client bypasses UI checks (see `PLAN_ENFORCEMENT.md §5`).
7. **Downgrade retention** — excess rows remain readable but not updatable; upgrade restores write.
8. **Session integrity** — requests without a valid Shopify session token are rejected; forged/expired
   tokens fail verification.
9. **Admin path separation** — catalog writes succeed only via the admin/service-role path, never a
   merchant session.

Manual/pentest: attempt IDOR by editing `store_id`/record ids in requests; confirm 403/empty. Run
Supabase advisors (`get_advisors`) for RLS/security lints before launch.

## 8. Current mock-layer safeguards (what IS true today)
- All merchant records are `store_id`-keyed from day one; new records are stamped with the demo store id
  server-agnostically (`DataContext`), so shapes are Phase-5-ready.
- Seed/mock data uses only the fictional `Demo Store` / `demo-store.example` — **no** PrimeBuild names,
  domains, or ids (verified in `test/context/DataContext.test.tsx`).
- No secrets in the client; `.env*` gitignored.
- These are **not** a security boundary — they only ensure the data model is ready for real enforcement.
