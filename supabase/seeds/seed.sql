-- ⚠️ DEV / DEMO ONLY — do NOT run against the pilot or any real merchant data.
-- Creates the fictional "Demo Store" (D26) as an ORG + WORKSPACE for local previews.
-- Real orgs are provisioned server-side on Shopify install (tenant.server.ts), never
-- from this file. No PrimeBuild identifiers. Reconciled to the org model (MM4).
--
-- Run only after 0001–0003. Requires the catalog reference data to exist.

-- Fixed demo ids (valid v4-shaped UUIDs) so the seed is idempotent + recognizable.
--   org  = de000000-0000-4000-8000-000000000001
--   ws   = de000000-0000-4000-8000-000000000002
--   user = de000000-0000-4000-8000-000000000003
insert into organizations (id, name, owner_user_id) values
  ('de000000-0000-4000-8000-000000000001', 'Demo Store',
   'de000000-0000-4000-8000-000000000003')
on conflict (id) do nothing;

insert into workspaces (id, organization_id, name, commerce_platform, commerce_external_ref) values
  ('de000000-0000-4000-8000-000000000002', 'de000000-0000-4000-8000-000000000001',
   'Demo Store', 'shopify', 'demo-store.example')
on conflict (id) do nothing;

insert into memberships (user_id, organization_id, role) values
  ('de000000-0000-4000-8000-000000000003', 'de000000-0000-4000-8000-000000000001', 'owner')
on conflict do nothing;

insert into subscriptions (organization_id, plan_id, status) values
  ('de000000-0000-4000-8000-000000000001', 'business.growth', 'active')
on conflict (organization_id) do nothing;

insert into workspace_countries (workspace_id, country_code, enabled) values
  ('de000000-0000-4000-8000-000000000002', 'US', true),
  ('de000000-0000-4000-8000-000000000002', 'CA', true)
on conflict do nothing;

insert into workspace_preferences (workspace_id) values
  ('de000000-0000-4000-8000-000000000002')
on conflict (workspace_id) do nothing;

insert into campaigns
  (workspace_id, name, country, objective, description, prep_start, start_date, end_date, offer, status)
values
  ('de000000-0000-4000-8000-000000000002', 'Summer Sale 2026', 'US',
   'Clear summer inventory and boost AOV.', 'Sitewide summer promotion with bundle offers.',
   '2026-06-15', '2026-07-01', '2026-07-07', '20% off + free shipping', 'active')
on conflict do nothing;
