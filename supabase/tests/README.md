# Supabase RLS / isolation tests (pending)

Implement the **16-row tenant-isolation matrix** from `docs/RLS_SECURITY_MODEL.md §7` here (pgTAP or
SQL assertions) once the platform schema + RLS are applied. These MUST pass before any real data.

Covers: consumer↔consumer, consumer↔business, org↔org, advertiser↔advertiser, principal↔admin,
role limits, entitlement limits, forged-id rejection, service-worker scope, and read-only downgrade.
