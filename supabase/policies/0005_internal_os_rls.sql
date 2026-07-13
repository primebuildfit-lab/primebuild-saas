-- Eventra Internal OS — Row-Level Security (Phase 7, Bloque 19/26).
--
-- Platform-owned offer-engine data is visible ONLY to platform administrators.
-- A tenant user (business/consumer) can NEVER read or write it. The service-role
-- client (used by jobs) bypasses RLS. Reads require any platform admin; writes
-- require an elevated platform role — the app also enforces the permission matrix
-- (`@eventra/identity` platformCan) as a second, independent gate.

-- Is the current identity a platform admin (any platform role)?
create or replace function is_platform_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from platform_admins a where a.user_id = auth.uid());
$$;

-- Does the current identity hold one of the given platform roles?
create or replace function has_platform_role(roles text[])
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from platform_admins a
    where a.user_id = auth.uid() and a.role = any(roles)
  );
$$;

-- Elevated writers for offer curation.
-- (support/analyst/read_only are read-only here; operations+ may write.)
do $$
declare tbl text;
begin
  foreach tbl in array array[
    'platform_admins','offer_sources','offers','offer_versions','offer_scores',
    'offer_verifications','offer_cancellations','offer_plan_eligibility','offer_audiences',
    'commission_rules','platform_commissions','sync_jobs','change_detections','ai_reviews',
    'alerts','admin_notes','integration_connections','media_assets','company_metrics'
  ] loop
    execute format('alter table %I enable row level security;', tbl);
    -- read: any platform admin
    execute format($f$
      create policy %1$s_read on %1$s for select using (is_platform_admin());
    $f$, tbl);
    -- write: operations/platform_admin/platform_owner (deny-by-default otherwise)
    execute format($f$
      create policy %1$s_write on %1$s for all
        using (has_platform_role(array['operations','platform_admin','platform_owner']))
        with check (has_platform_role(array['operations','platform_admin','platform_owner']));
    $f$, tbl);
  end loop;
end $$;

-- Commissions management is tighter: only platform_admin/platform_owner (not operations).
drop policy if exists platform_commissions_write on platform_commissions;
create policy platform_commissions_write on platform_commissions for all
  using (has_platform_role(array['platform_admin','platform_owner']))
  with check (has_platform_role(array['platform_admin','platform_owner']));
drop policy if exists commission_rules_write on commission_rules;
create policy commission_rules_write on commission_rules for all
  using (has_platform_role(array['platform_admin','platform_owner']))
  with check (has_platform_role(array['platform_admin','platform_owner']));

-- platform_admins management: owner only (ownership/role changes).
drop policy if exists platform_admins_write on platform_admins;
create policy platform_admins_write on platform_admins for all
  using (has_platform_role(array['platform_owner']))
  with check (has_platform_role(array['platform_owner']));
