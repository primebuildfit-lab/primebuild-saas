-- Eventra Row-Level Security — Business slice, org model (MM4 reconciliation).
-- Reconciled from the store-based draft: `is_store_member(store_id)` →
-- `is_org_member(org_id)`, extended to workspace-scoped merchant tables via the
-- owning workspace's organization. RLS is the real tenant gate; server
-- loaders/actions are a second, independent gate. A client-supplied id is never
-- trusted. See docs/RLS_SECURITY_MODEL.md + docs/MM4_PERSISTENCE.md §6.

-- ── membership helpers ─────────────────────────────────────────────
create or replace function is_org_member(target uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.organization_id = target and m.user_id = auth.uid()
  );
$$;

-- Workspace access = membership in the workspace's organization.
create or replace function is_workspace_member(target uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from workspaces w
    join memberships m on m.organization_id = w.organization_id
    where w.id = target and m.user_id = auth.uid()
  );
$$;

-- ── enable RLS on every table ──────────────────────────────────────
alter table countries                    enable row level security;
alter table plans                        enable row level security;
alter table global_events                enable row level security;
alter table organizations                enable row level security;
alter table workspaces                   enable row level security;
alter table memberships                  enable row level security;
alter table invitations                  enable row level security;
alter table subscriptions                enable row level security;
alter table workspace_countries          enable row level security;
alter table workspace_event_preferences  enable row level security;
alter table custom_events                enable row level security;
alter table campaigns                    enable row level security;
alter table templates                    enable row level security;
alter table workspace_notes              enable row level security;
alter table workspace_preferences        enable row level security;

-- ── platform catalog: read for any authenticated identity; writes admin/service only ──
create policy countries_read on countries
  for select using (auth.role() = 'authenticated');
create policy plans_read on plans
  for select using (auth.role() = 'authenticated');
create policy global_events_read on global_events
  for select using (auth.role() = 'authenticated');

-- ── org-scoped: members see only their org(s) ──────────────────────
create policy organizations_member_read on organizations
  for select using (is_org_member(id));
create policy memberships_self on memberships
  for select using (user_id = auth.uid());
create policy invitations_org_rw on invitations
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy subscriptions_rw on subscriptions
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));
create policy workspaces_rw on workspaces
  using (is_org_member(organization_id)) with check (is_org_member(organization_id));

-- ── workspace-scoped merchant tables: access limited to members of the
--    workspace's org. WITH CHECK blocks writing a row into a foreign workspace. ──
create policy workspace_countries_rw on workspace_countries
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy workspace_event_preferences_rw on workspace_event_preferences
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy custom_events_rw on custom_events
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy campaigns_rw on campaigns
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy templates_rw on templates
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy workspace_notes_rw on workspace_notes
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
create policy workspace_preferences_rw on workspace_preferences
  using (is_workspace_member(workspace_id)) with check (is_workspace_member(workspace_id));
