-- Eventra — schema rollback (DOWN) for the Business slice, org/workspace model.
--
-- ⚠️ DESTRUCTIVE. Drops every Eventra table, policy, and helper function created by
--    migrations 0001–0003 and the seed. Intended for LOCAL / throwaway dev projects
--    only. NEVER run against a project that holds real merchant data.
--
-- Order: policies + RLS are dropped implicitly with the tables; helper functions and
-- tables are dropped last, children before parents (or via CASCADE).

-- Merchant + tenancy tables (CASCADE clears FKs, policies, triggers, indexes).
drop table if exists workspace_preferences        cascade;
drop table if exists workspace_notes              cascade;
drop table if exists templates                    cascade;
drop table if exists campaigns                     cascade;
drop table if exists custom_events                 cascade;
drop table if exists workspace_event_preferences   cascade;
drop table if exists workspace_countries           cascade;
drop table if exists subscriptions                 cascade;
drop table if exists invitations                   cascade;
drop table if exists memberships                   cascade;
drop table if exists workspaces                    cascade;
drop table if exists organizations                 cascade;

-- Platform-owned catalog.
drop table if exists global_events                 cascade;
drop table if exists plans                          cascade;
drop table if exists countries                       cascade;

-- Helper functions + trigger function.
drop function if exists is_workspace_member(uuid);
drop function if exists is_org_member(uuid);
drop function if exists set_updated_at();

-- Note: the `pgcrypto` extension is intentionally left in place (other tooling may
-- depend on it). Drop it manually if this is a truly disposable project.
