-- Eventra Row-Level Security (Phase 5) — faithful to docs/SUPABASE_SCHEMA.md §3
-- and docs/SECURITY_PLAN.md. RLS is the real tenant gate; server loaders/actions
-- are a second, independent gate. A client-supplied storeId is never trusted.

-- Membership helper: is the current identity a member of the target store?
create or replace function is_store_member(target uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.store_id = target and m.user_id = auth.uid()
  );
$$;

-- Enable RLS on every table
alter table countries                 enable row level security;
alter table plans                     enable row level security;
alter table global_events             enable row level security;
alter table stores                    enable row level security;
alter table memberships               enable row level security;
alter table subscriptions             enable row level security;
alter table store_countries           enable row level security;
alter table store_event_preferences   enable row level security;
alter table custom_events             enable row level security;
alter table campaigns                 enable row level security;
alter table templates                 enable row level security;
alter table store_preferences         enable row level security;

-- Platform catalog: any authenticated identity may READ; no write policy => writes
-- denied by default (admin/service-role only).
create policy countries_read on countries
  for select using (auth.role() = 'authenticated');
create policy plans_read on plans
  for select using (auth.role() = 'authenticated');
create policy global_events_read on global_events
  for select using (auth.role() = 'authenticated');

-- Tenants: users see only what they belong to.
create policy stores_member_read on stores
  for select using (is_store_member(id));
create policy memberships_self on memberships
  for select using (user_id = auth.uid());

-- Merchant tables: full access limited to members of the row's store. The
-- WITH CHECK clause is what blocks inserting/updating a row into another store.
create policy subscriptions_rw on subscriptions
  using (is_store_member(store_id)) with check (is_store_member(store_id));
create policy store_countries_rw on store_countries
  using (is_store_member(store_id)) with check (is_store_member(store_id));
create policy store_event_preferences_rw on store_event_preferences
  using (is_store_member(store_id)) with check (is_store_member(store_id));
create policy custom_events_rw on custom_events
  using (is_store_member(store_id)) with check (is_store_member(store_id));
create policy campaigns_rw on campaigns
  using (is_store_member(store_id)) with check (is_store_member(store_id));
create policy templates_rw on templates
  using (is_store_member(store_id)) with check (is_store_member(store_id));
create policy store_preferences_rw on store_preferences
  using (is_store_member(store_id)) with check (is_store_member(store_id));
