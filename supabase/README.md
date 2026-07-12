# Eventra — Supabase (structure only; NOT provisioned)

> ⚠️ **No Supabase project is provisioned and no SQL has been run.** This directory holds the
> repository structure + prior Business-slice schema/RLS work, classified for the platform expansion.
> Execution happens in a later Mega Module after approval. Never run remote SQL from here without the
> explicit provisioning gate (`docs/PHASE5_PILOT_RUNBOOK.md`).

## Layout
```
supabase/
  migrations/   schema + reference data (ordered)
  policies/     RLS policies
  seeds/        DEV-ONLY seed data (never production)
  tests/        RLS / tenant-isolation tests (pgTAP or SQL) — pending
```

## File index & classification (MM4 — reconciled to the org model)
| File | Classification | Notes |
|------|----------------|-------|
| `migrations/0001_schema.sql` | **reconciled (org/workspace + locked plans)** | Business-slice tables now `organization`+`workspace`-keyed; plans use the LOCKED model (`business.*`, workspace limits, YEAR horizons); audit + soft-delete + campaign versioning added. Store-based original is in git history. |
| `migrations/0003_reference_data.sql` | **reconciled** | Countries/global events unchanged; plans updated to `business.*` / prices 0/15/30/45 / year horizons to match `@eventra/config`. |
| `policies/0002_rls.sql` | **reconciled** | `is_store_member` → `is_org_member` + `is_workspace_member`; principal-ready (`is_self` reserved for consumer tables in a later module). |
| `seeds/seed.sql` | **reconciled (dev-only)** | Demo org + workspace; valid UUIDs; `business.growth`. |
| `tests/` | **pending (SQL)** | The org-isolation matrix (`docs/RLS_SECURITY_MODEL.md §7`). App-level isolation is covered by `apps/business/test/db/*` in MM4. |

## Future execution order (when provisioning is approved)
1. `migrations/0001_schema.sql` (after org/workspace + platform expansion)
2. `policies/0002_rls.sql`
3. `migrations/0003_reference_data.sql`
4. `seeds/seed.sql` (dev/staging only)
5. `tests/*` (isolation matrix) — must pass before any real data.

## Guardrails
- No production data; no remote SQL from this repo without the provisioning gate.
- Seeds are dev-only and clearly separated from real merchant/consumer data.
- RLS is the tenant gate; server checks are defense-in-depth (`docs/RLS_SECURITY_MODEL.md`).
