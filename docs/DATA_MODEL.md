# Eventra Data Model (`DATA_MODEL.md`)

> Phase 7. Two tenancy planes, both RLS-gated. Nothing here is provisioned; all is design + migrations.

## Plane 1 — Tenant data (Business, Nivel B) — `supabase/migrations/0001_schema.sql`

`organizations → workspaces → memberships`, `subscriptions`, `invitations`, and workspace-owned
`campaigns` (memory-versioned), `custom_events`, `templates`, `workspace_countries`,
`workspace_event_preferences`, `workspace_notes`, `workspace_preferences`. RLS keyed on org membership
(`0002_rls.sql`). Façade `storeId` ≡ `workspaceId`.

## Plane 2 — Platform data (Internal OS, Nivel A) — `supabase/migrations/0004_internal_os.sql`

Platform-owned (no `workspace_id`), visible only to platform admins (`0005_internal_os_rls.sql`):

| Entity | Table | Notes |
|--------|-------|-------|
| Source | `offer_sources` | authorized only; reliability/status/frequency |
| Offer | `offers` | status + certainty + content_hash; soft-delete |
| Version | `offer_versions` | never overwrite (like campaign memory) |
| Score | `offer_scores` | value/priority/factors; manual override |
| Verification | `offer_verifications` | human sign-off |
| Cancellation | `offer_cancellations` | impact + changed fields |
| Plan eligibility | `offer_plan_eligibility` | which `business.*` plans get it |
| Audience | `offer_audiences` | business/consumer |
| Commission rule/record | `commission_rules`, `platform_commissions` | rate **CHECK 0.010–0.020** |
| Job | `sync_jobs` | status/errors/next run |
| Change detection | `change_detections` | diff + impact |
| AI review | `ai_reviews` | output + confidence + human review |
| Alert | `alerts` | severity + resolution |
| Admin note | `admin_notes` | polymorphic subject |
| Integration | `integration_connections` | provider + scopes + status (incl. `planned`) |
| Media | `media_assets` | **object-store URL only — no bytes in Postgres** (Bloque 15/25) |
| Company metric | `company_metrics` | per-period rollups |
| Platform admin | `platform_admins` | user_id + platform role |

## Rules honored

- **Tenant isolation** on both planes (RLS + server gate; never trust client ids).
- **Indexes** on tenant/hot paths (status/country/date/source; offer_scores/versions/changes).
- **Versioning** (offers + campaigns) — source never overwritten.
- **Soft-delete + audit + timestamps** on mutable tables; `set_updated_at` triggers.
- **Recurrence over duplication** — occurrences computed, not stored per year (offer engine).
- **Large media off Postgres** — metadata only.
- **No duplication** — audited the existing model first; new tables are additive (no equivalents existed).

## Rollback

`supabase/rollback/0001_drop.sql` (tenant plane). An Internal-OS rollback follows the same pattern when the
migration is finalized for a live project.
