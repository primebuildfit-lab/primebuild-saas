# Eventra — Supabase Schema & RLS Architecture (Design)

> **Status: DESIGN ONLY.** Nothing here is applied to a database. No Supabase project is
> provisioned, no tables created, no data written. **Not connected to PrimeBuild** and no
> production data. This is the Phase-1 design deliverable; it is applied in **Phase 5** in a
> **new, separate** Eventra Supabase project (never `primebuild-core`).

## 1. Principles

- **Tenant key everywhere:** every merchant-owned row carries `store_id`.
- **Never trust a client `store_id`.** Authorization derives from the authenticated user
  (`auth.uid()`), validated against a `memberships` row, and enforced by **RLS** — not from any
  value the browser sends (D23, ARCHITECTURE_REVIEW §8).
- **Platform-owned catalog** (`countries`, `global_events`, `plans`) has no `store_id`;
  readable by any authenticated user, writable only by platform admins / service role.
- **Defense in depth:** server loaders/actions resolve the store + membership per request;
  RLS is a second independent gate at the database.

## 2. Tables (DDL)

```sql
create extension if not exists "pgcrypto";

-- ---------- Platform-owned catalog (no store_id) ----------
create table countries (
  code text primary key,          -- ISO 3166-1 alpha-2
  name text not null,
  flag text not null
);

create table plans (
  id text primary key check (id in ('free','starter','growth','vip')),
  name text not null,
  price_monthly integer not null,
  country_limit integer,          -- null = unlimited
  planning_horizon_months integer not null,
  saved_campaign_limit integer,   -- null = unlimited
  features jsonb not null default '[]'
);

create table global_events (
  id text primary key,
  name text not null,
  country_codes text[] not null default '{}',
  start_rule jsonb not null,      -- { kind, month, day?, weekday?, nth? }
  end_rule jsonb,
  category text not null check (category in ('major_sales','national_holiday','seasonal','cultural')),
  importance text not null check (importance in ('high','medium','low')),
  description text,
  recommended_lead_days integer,
  recurring boolean not null default true
);

-- ---------- Tenants ----------
create table stores (
  id uuid primary key default gen_random_uuid(),
  shop_domain text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  store_id uuid not null references stores(id) on delete cascade,
  role text not null check (role in ('owner','admin','staff')),
  primary key (user_id, store_id)
);

-- ---------- Merchant-owned (carry store_id) ----------
create table store_countries (
  store_id uuid not null references stores(id) on delete cascade,
  country_code text not null references countries(code),
  enabled boolean not null default true,   -- per-store enablement (D25)
  primary key (store_id, country_code)
);

create table store_event_preferences (
  store_id uuid not null references stores(id) on delete cascade,
  global_event_id text not null references global_events(id),
  hidden boolean not null default false,   -- hide/restore, never global delete (D13)
  primary key (store_id, global_event_id)
);

create table custom_events (
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

create table campaigns (
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
  actions jsonb not null default '[]',      -- visual-only in V1
  created_from_id uuid references campaigns(id),  -- memory link; never overwrites source (D15)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table templates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  name text not null,
  category text not null,
  default_duration_days integer not null,
  default_lead_days integer not null,
  offer text,
  notes text
);

create table store_preferences (
  store_id uuid primary key references stores(id) on delete cascade,
  week_starts_on smallint not null default 0,
  calendar_format text not null default 'month',
  reminder_defaults integer[] not null default '{30,14,7,1}'
);

create index on campaigns (store_id);
create index on custom_events (store_id);
create index on templates (store_id);
create index on store_countries (store_id);
```

## 3. Row-Level Security

```sql
-- Membership helper: is the current user a member of the target store?
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
alter table stores                    enable row level security;
alter table memberships               enable row level security;
alter table store_countries           enable row level security;
alter table store_event_preferences   enable row level security;
alter table custom_events             enable row level security;
alter table campaigns                 enable row level security;
alter table templates                 enable row level security;
alter table store_preferences         enable row level security;
alter table countries                 enable row level security;
alter table global_events             enable row level security;
alter table plans                     enable row level security;

-- Tenants: users see only what they belong to
create policy stores_member_read on stores
  for select using (is_store_member(id));
create policy memberships_self on memberships
  for select using (user_id = auth.uid());

-- Merchant tables: full access limited to members of the row's store.
-- (Same shape for store_countries, store_event_preferences, custom_events,
--  campaigns, templates, store_preferences — one representative shown.)
create policy campaigns_rw on campaigns
  using (is_store_member(store_id))
  with check (is_store_member(store_id));

-- Platform catalog: any authenticated user may READ; writes are admin/service-role only
-- (no insert/update/delete policy for authenticated → denied by default).
create policy countries_read on countries
  for select using (auth.role() = 'authenticated');
create policy global_events_read on global_events
  for select using (auth.role() = 'authenticated');
create policy plans_read on plans
  for select using (auth.role() = 'authenticated');
```

## 4. Bridging Shopify sessions → Supabase identity (Phase 5 decision)

Embedded Shopify apps authenticate merchants via **App Bridge session tokens**, not Supabase Auth
directly. Two supported approaches; **Option A is recommended**:

- **Option A — Server-enforced tenancy + RLS as defense-in-depth (recommended).**
  RR loaders/actions authenticate the Shopify session server-side, resolve the `store` and validate
  a `membership`, then query Supabase with a **short-lived signed JWT** whose claims carry the
  verified `user_id`/`store_id`. `auth.uid()` in RLS reads that claim. The client never supplies the
  store; both the server check and RLS must agree.
- **Option B — Supabase Auth as the source of truth.** Mint/refresh Supabase sessions from the
  Shopify session. Simpler client, but couples auth lifecycles; kept as a fallback.

Plan limits (country count, planning horizon, saved-campaign caps) are enforced in **server
actions**, backed by these tables — never only in the UI (D16).

## 5. Seed (local/dev only)

A dev seed inserts the **fictional demo store** (`Demo Store`, `demo-store.example`), one demo
membership, US + CA countries, the four plans, the mock global-event catalog, and a couple of demo
campaigns — mirroring `app/data/*`. **No PrimeBuild identifiers; never run against production.**

## 6. Migration ordering (Phase 5)

1. `countries`, `plans`, `global_events` (catalog)
2. `stores`, `memberships`
3. merchant tables (`store_countries`, `store_event_preferences`, `custom_events`, `campaigns`, `templates`, `store_preferences`)
4. `is_store_member()` + enable RLS + policies
5. dev seed (non-production only)
