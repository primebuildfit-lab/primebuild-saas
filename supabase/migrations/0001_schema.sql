-- Eventra platform schema — Business slice, org/workspace model (MM4 reconciliation).
-- Applies to a NEW, SEPARATE Eventra Supabase project. NEVER primebuild-core.
--
-- Reconciled from the earlier store-based Phase-5 draft (see git history + docs/
-- MM4_PERSISTENCE.md §2): `store` → `organization`+`workspace`; plans adopt the
-- LOCKED model (business.free/starter/growth/pro, workspace limits, YEAR horizons);
-- every merchant table gains audit + soft-delete; campaigns gain memory versioning.
-- Platform-owned catalog has no tenant key; merchant tables carry `workspace_id`
-- and are gated by RLS keyed on org membership (see 0002_rls.sql).

create extension if not exists "pgcrypto";

-- ============================================================
-- Platform-owned catalog (no tenant key)
-- ============================================================
create table if not exists countries (
  code text primary key,          -- ISO 3166-1 alpha-2
  name text not null,
  flag text not null
);

create table if not exists plans (
  id text primary key
    check (id in ('business.free','business.starter','business.growth','business.pro')),
  name text not null,
  price_monthly integer not null,
  workspace_limit integer,        -- null = unlimited (fair-use)
  country_limit integer,          -- 0 = manual only; null = unlimited
  planning_horizon_years integer not null,
  saved_campaign_limit integer,   -- null = unlimited
  features jsonb not null default '[]'
);

create table if not exists global_events (
  id text primary key,
  name text not null,
  country_codes text[] not null default '{}',
  start_rule jsonb not null,      -- { kind, month, day?, weekday?, nth?, offsetDays? }
  end_rule jsonb,
  category text not null check (category in ('major_sales','national_holiday','seasonal','cultural')),
  importance text not null check (importance in ('high','medium','low')),
  description text,
  recommended_lead_days integer,
  recurring boolean not null default true
);

-- ============================================================
-- Tenancy: organization → workspace(s) → membership
-- ============================================================
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null,    -- verified identity (see tenant.server.ts); never client-supplied
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A managed planning environment inside an org (NOT a commerce store). A commerce
-- store (Shopify/Woo/…) links to a workspace via commerce_platform/commerce_external_ref.
create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active','read_only','archived')),
  commerce_platform text not null default 'none'
    check (commerce_platform in ('shopify','woocommerce','wix','squarespace','custom','none')),
  commerce_external_ref text,     -- e.g. verified Shopify shop domain; unique per platform
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (commerce_platform, commerce_external_ref)
);

create table if not exists memberships (
  user_id uuid not null,          -- verified identity (see tenant.server.ts)
  organization_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('owner','admin','editor','viewer')),
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner','admin','editor','viewer')),
  token text not null unique,
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  invited_by uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  accepted_at timestamptz,
  unique (organization_id, email)
);

create table if not exists subscriptions (
  organization_id uuid primary key references organizations(id) on delete cascade,
  plan_id text not null references plans(id),
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  trial_ends_at timestamptz,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Merchant-owned (carry workspace_id) — audit + soft-delete
-- ============================================================
create table if not exists workspace_countries (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  country_code text not null references countries(code),
  enabled boolean not null default true,   -- per-workspace enablement (D25)
  primary key (workspace_id, country_code)
);

create table if not exists workspace_event_preferences (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  global_event_id text not null references global_events(id),
  hidden boolean not null default false,   -- hide/restore, never global delete (D13)
  primary key (workspace_id, global_event_id)
);

create table if not exists custom_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date,
  category text not null,
  color text,
  description text,
  recurring boolean not null default false,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz            -- soft delete (Part 7)
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  global_event_id text references global_events(id),
  country text references countries(code),
  objective text,
  description text,
  prep_start date,
  start_date date not null,
  end_date date not null,
  offer text,
  product_refs text[] not null default '{}',
  notes text,
  status text not null default 'draft'
    check (status in ('draft','scheduled','active','completed','archived')),
  actions jsonb not null default '[]',            -- visual-only in V1 (D7)
  created_from_id uuid references campaigns(id),  -- memory link; never overwrites source (D15)
  version integer not null default 1,             -- memory versioning (Part 7)
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint campaigns_dates_ordered check (end_date >= start_date)
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  category text not null,
  default_duration_days integer not null check (default_duration_days > 0),
  default_lead_days integer not null check (default_lead_days >= 0),
  offer text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Free-form planning notes attached to a workspace (prepared entity; minimal UI in V1).
create table if not exists workspace_notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  body text not null,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists workspace_preferences (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  week_starts_on smallint not null default 0,
  calendar_format text not null default 'month',
  reminder_defaults integer[] not null default '{30,14,7,1}',
  accent text not null default 'indigo',
  density text not null default 'comfortable',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes (tenant + hot paths; see docs/MM4_PERSISTENCE.md Part 8)
-- ============================================================
create index if not exists workspaces_org_idx            on workspaces (organization_id);
create index if not exists memberships_org_idx           on memberships (organization_id);
create index if not exists campaigns_ws_idx              on campaigns (workspace_id) where deleted_at is null;
create index if not exists campaigns_ws_status_idx       on campaigns (workspace_id, status) where deleted_at is null;
create index if not exists campaigns_ws_updated_idx      on campaigns (workspace_id, updated_at desc);
create index if not exists campaigns_from_idx            on campaigns (created_from_id);
create index if not exists custom_events_ws_idx          on custom_events (workspace_id) where deleted_at is null;
create index if not exists templates_ws_idx              on templates (workspace_id) where deleted_at is null;
create index if not exists workspace_notes_ws_idx        on workspace_notes (workspace_id) where deleted_at is null;
create index if not exists workspace_countries_ws_idx    on workspace_countries (workspace_id);
create index if not exists invitations_org_idx           on invitations (organization_id);

-- ============================================================
-- updated_at triggers (keep fresh even on direct SQL writes)
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'organizations','workspaces','subscriptions','custom_events','campaigns',
    'templates','workspace_notes','workspace_preferences'
  ] loop
    execute format('drop trigger if exists %I_set_updated_at on %I;', t, t);
    execute format(
      'create trigger %I_set_updated_at before update on %I
         for each row execute function set_updated_at();', t, t);
  end loop;
end $$;
