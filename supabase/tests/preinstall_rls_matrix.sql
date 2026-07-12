-- Eventra — RLS / tenant-isolation matrix (MM5, Part 8).
-- READY TO EXECUTE once the real, separate Eventra Supabase project exists and
-- 0001_schema + 0002_rls + 0003_reference_data have been applied. DO NOT run this
-- against any shared/production database. It provisions two throwaway tenants,
-- exercises the org/workspace RLS boundary as two different authenticated users,
-- and RAISES on any violation. Wrapped in a transaction and rolled back.
--
-- Simulating a principal: `set local role authenticated;` +
-- `set local request.jwt.claims = json_build_object('sub', <user_uuid>)::text;`
-- so `auth.uid()` (which reads request.jwt.claims->>'sub') resolves to that user.

begin;

-- ── fixtures (service role / owner of this session bypasses RLS for setup) ──
-- Two orgs, two owners, one workspace each, one campaign each.
insert into organizations (id, name, owner_user_id) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Org A', 'aaaaaaaa-0000-4000-8000-0000000000a1'),
  ('bbbbbbbb-0000-4000-8000-000000000001', 'Org B', 'bbbbbbbb-0000-4000-8000-0000000000b1');
insert into workspaces (id, organization_id, name) values
  ('aaaaaaaa-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001', 'WS A'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'bbbbbbbb-0000-4000-8000-000000000001', 'WS B');
insert into memberships (user_id, organization_id, role) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'aaaaaaaa-0000-4000-8000-000000000001', 'owner'),
  ('bbbbbbbb-0000-4000-8000-0000000000b1', 'bbbbbbbb-0000-4000-8000-000000000001', 'owner');
insert into campaigns (id, workspace_id, name, start_date, end_date, status) values
  ('aaaaaaaa-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000002', 'A Camp', '2026-07-01', '2026-07-07', 'draft'),
  ('bbbbbbbb-0000-4000-8000-000000000003', 'bbbbbbbb-0000-4000-8000-000000000002', 'B Camp', '2026-07-01', '2026-07-07', 'draft');

-- ── helper: assert a boolean, raise on failure ──
create or replace function _assert(cond boolean, msg text) returns void language plpgsql as $$
begin if not cond then raise exception 'RLS MATRIX FAIL: %', msg; end if; end; $$;

-- ─────────────── User A context ───────────────
set local role authenticated;
set local request.jwt.claims = '{"sub":"aaaaaaaa-0000-4000-8000-0000000000a1"}';

-- 1. read own workspace campaigns → visible
select _assert((select count(*) from campaigns where workspace_id = 'aaaaaaaa-0000-4000-8000-000000000002') = 1,
  'A must read own campaigns');
-- 2. cross-workspace read → invisible
select _assert((select count(*) from campaigns where workspace_id = 'bbbbbbbb-0000-4000-8000-000000000002') = 0,
  'A must NOT read B campaigns');
-- 3. write own workspace → allowed
insert into campaigns (workspace_id, name, start_date, end_date, status)
  values ('aaaaaaaa-0000-4000-8000-000000000002', 'A New', '2026-08-01', '2026-08-02', 'draft');
select _assert((select count(*) from campaigns where workspace_id = 'aaaaaaaa-0000-4000-8000-000000000002') = 2,
  'A write own must persist');
-- 4. cross-workspace write → blocked by WITH CHECK
do $$ begin
  begin
    insert into campaigns (workspace_id, name, start_date, end_date, status)
      values ('bbbbbbbb-0000-4000-8000-000000000002', 'A into B', '2026-08-01', '2026-08-02', 'draft');
    raise exception 'RLS MATRIX FAIL: A cross-workspace insert must be blocked';
  exception when insufficient_privilege or check_violation then null; end;
end $$;
-- 5. catalog readable
select _assert((select count(*) from plans) >= 1, 'catalog plans readable by authenticated');

-- ─────────────── User B context ───────────────
set local request.jwt.claims = '{"sub":"bbbbbbbb-0000-4000-8000-0000000000b1"}';
-- 6. B cannot see A's campaigns (incl. A New)
select _assert((select count(*) from campaigns where workspace_id = 'aaaaaaaa-0000-4000-8000-000000000002') = 0,
  'B must NOT read A campaigns');
-- 7. B cannot update A's campaign (0 rows affected under RLS)
with upd as (
  update campaigns set name = 'hijacked' where id = 'aaaaaaaa-0000-4000-8000-000000000003' returning 1
)
select _assert((select count(*) from upd) = 0, 'B update of A row must affect 0 rows');

-- ─────────────── anon context ───────────────
reset role;
set local role anon;
set local request.jwt.claims = '{}';
select _assert((select count(*) from campaigns) = 0, 'anon must read no campaigns');

reset role;
drop function _assert(boolean, text);
rollback;  -- leave the database untouched
