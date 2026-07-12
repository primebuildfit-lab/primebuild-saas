-- ⚠️ DEV / DEMO ONLY — do NOT run against the pilot or any real merchant data.
-- Creates the fictional "Demo Store" (D26) for local development previews. Real
-- pilot stores are provisioned server-side on Shopify install (tenant.server.ts),
-- never from this file. No PrimeBuild identifiers.
--
-- Run only after 0001–0003. Requires the catalog reference data to exist.

-- Fixed demo ids so the seed is idempotent and recognizable as non-production.
insert into stores (id, shop_domain, name) values
  ('00000000-0000-0000-0000-0000000d3m0', 'demo-store.example', 'Demo Store')
on conflict (id) do nothing;

insert into memberships (user_id, store_id, role) values
  ('00000000-0000-0000-0000-0000000u53r0', '00000000-0000-0000-0000-0000000d3m0', 'owner')
on conflict do nothing;

insert into subscriptions (store_id, plan_id, status) values
  ('00000000-0000-0000-0000-0000000d3m0', 'growth', 'active')
on conflict (store_id) do nothing;

insert into store_countries (store_id, country_code, enabled) values
  ('00000000-0000-0000-0000-0000000d3m0', 'US', true),
  ('00000000-0000-0000-0000-0000000d3m0', 'CA', true)
on conflict do nothing;

insert into store_preferences (store_id) values
  ('00000000-0000-0000-0000-0000000d3m0')
on conflict (store_id) do nothing;

insert into campaigns
  (store_id, name, country, objective, description, prep_start, start_date, end_date, offer, status)
values
  ('00000000-0000-0000-0000-0000000d3m0', 'Summer Sale 2026', 'US',
   'Clear summer inventory and boost AOV.', 'Sitewide summer promotion with bundle offers.',
   '2026-06-15', '2026-07-01', '2026-07-07', '20% off + free shipping', 'active')
on conflict do nothing;
