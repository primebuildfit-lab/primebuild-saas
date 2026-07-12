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

## File index & classification
| File | Classification | Notes |
|------|----------------|-------|
| `migrations/0001_schema.sql` | **requires organization/workspace rename** + **platform expansion** | Business-slice tables; `store_*` → `org/workspace`; add consumer/deals/ads/billing/notifications/admin tables (`docs/PLATFORM_SCHEMA.md`). |
| `migrations/0003_reference_data.sql` | **reusable** | Countries/plans/global events; matches `apps/business/app/data/*` incl. corrected Black Friday/Cyber Monday rules. |
| `policies/0002_rls.sql` | **requires platform expansion** | `is_store_member` → add `is_org_member`/`is_self`/advertiser/admin/service policies (`docs/RLS_SECURITY_MODEL.md`). |
| `seeds/seed.sql` | **reusable (dev-only)** | Demo tenant; rename `store`→`org/workspace` when the schema does. |
| `tests/` | **pending** | Add the 16-row isolation matrix from `docs/RLS_SECURITY_MODEL.md §7`. |

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
