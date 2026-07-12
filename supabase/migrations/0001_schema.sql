-- Eventra schema (Phase 5) — faithful to docs/SUPABASE_SCHEMA.md.
-- Applies to a NEW, SEPARATE Eventra Supabase project. NEVER primebuild-core.
-- Platform-owned catalog has no store_id; merchant-owned tables carry store_id
-- and are gated by RLS (see 0002_rls.sql).

create extension if not exists "pgcrypto";

-- ---------- Platform-owned catalog (no store_id) ----------
create table if not exists countries (
  code text primary key,          -- ISO 3166-1 alpha-2
  name text not null,
  flag text not null
);

create table if not exists plans (
  id text primary key check (id in ('free','starter','growth','vip')),
  name text not null,
  price_monthly integer not null,
  country_limit integer,          -- null = unlimited
  planning_horizon_months integer not null,
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

-- ---------- Tenants ----------
create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  shop_domain text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  user_id uuid not null,          -- Shopify-derived identity (see tenant.server.ts)
  store_id uuid not null references stores(id) on delete cascade,
  role text not null check (role in ('owner','admin','staff')),
  primary key (user_id, store_id)
);

create table if not exists subscriptions (
  store_id uuid primary key references stores(id) on delete cascade,
  plan_id text not null references plans(id),
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  updated_at timestamptz not null default now()
);

-- ---------- Merchant-owned (carry store_id) ----------
create table if not exists store_countries (
  store_id uuid not null references stores(id) on delete cascade,
  country_code text not null references countries(code),
  enabled boolean not null default true,   -- per-store enablement (D25)
  primary key (store_id, country_code)
);

create table if not exists store_event_preferences (
  store_id uuid not null references stores(id) on delete cascade,
  global_event_id text not null references global_events(id),
  hidden boolean not null default false,   -- hide/restore, never global delete (D13)
  primary key (store_id, global_event_id)
);

create table if not exists custom_events (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date,
  category text not null,
  color text,
  description text,
  recurring boolean not null default false
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  category text not null,
  default_duration_days integer not null,
  default_lead_days integer not null,
  offer text,
  notes text
);

create table if not exists store_preferences (
  store_id uuid primary key references stores(id) on delete cascade,
  week_starts_on smallint not null default 0,
  calendar_format text not null default 'month',
  reminder_defaults integer[] not null default '{30,14,7,1}',
  accent text not null default 'indigo',
  density text not null default 'comfortable'
);

create index if not exists campaigns_store_idx on campaigns (store_id);
create index if not exists custom_events_store_idx on custom_events (store_id);
create index if not exists templates_store_idx on templates (store_id);
create index if not exists store_countries_store_idx on store_countries (store_id);

-- Keep campaigns.updated_at fresh even for direct SQL writes.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists campaigns_set_updated_at on campaigns;
create trigger campaigns_set_updated_at
  before update on campaigns
  for each row execute function set_updated_at();
