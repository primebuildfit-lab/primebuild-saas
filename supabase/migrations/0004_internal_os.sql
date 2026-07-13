-- Eventra Internal OS — Offer Engine + platform-admin schema (Phase 7, Bloque 19).
--
-- PLATFORM-OWNED data curated by Eventra staff (Nivel A) — NOT tenant data, so no
-- workspace_id. Access is restricted to platform administrators (see 0005 RLS).
-- Mirrors apps/admin/src/engine/types.ts. Large binaries (images/video) are NOT
-- stored here — only object-store metadata (Bloque 15/25). NOT executed remotely.
--
-- Audit + soft-delete + timestamps follow the same conventions as 0001.

create extension if not exists "pgcrypto";

-- ── platform staff (separates Internal-OS access from tenant membership) ──
create table if not exists platform_admins (
  user_id uuid primary key,                 -- verified identity; never client-supplied
  role text not null default 'read_only'
    check (role in ('platform_owner','platform_admin','operations','support','analyst','read_only')),
  created_at timestamptz not null default now()
);

-- ── offer sources ──
create table if not exists offer_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text,
  region text,
  method text not null check (method in ('manual','api','feed','public_calendar','collaborator','ai','import')),
  url text,
  status text not null default 'healthy' check (status in ('healthy','degraded','down','disabled')),
  frequency_hours integer not null default 24,
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  reliability numeric(4,3) not null default 0.500 check (reliability between 0 and 1),
  error_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ── offers (global opportunities) ──
create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  industry text,
  country text,
  region text,
  city text,
  audience text check (audience in ('business','consumer','both')),
  start_date date not null,
  end_date date,
  recurring boolean not null default true,
  source_id uuid not null references offer_sources(id) on delete restrict,
  status text not null default 'discovered'
    check (status in ('discovered','pending_review','verified','active','modified','cancelled','expired','archived','rejected','duplicate')),
  certainty text not null default 'estimated'
    check (certainty in ('confirmed','estimated','historical_projection','pending')),
  reliability numeric(4,3) not null default 0.500 check (reliability between 0 and 1),
  content_hash text,                         -- drives change detection
  last_verified_at timestamptz,
  next_verification_at timestamptz,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Version history (never overwrite — mirrors the campaign-memory rule).
create table if not exists offer_versions (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (offer_id, version)
);

-- Scores (auto or manual override; latest wins, history retained).
create table if not exists offer_scores (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  value integer not null check (value between 0 and 100),
  priority text not null check (priority in ('low','medium','high','critical')),
  factors jsonb not null,
  manual_override boolean not null default false,
  scored_at timestamptz not null default now()
);

create table if not exists offer_verifications (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  verified_by uuid,
  result text not null check (result in ('verified','rejected','needs_info')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists offer_cancellations (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references offers(id) on delete cascade,
  detected_at timestamptz not null default now(),
  impact text not null check (impact in ('none','minor','major','critical')),
  changed_fields text[] not null default '{}',
  source_id uuid references offer_sources(id)
);

create table if not exists offer_plan_eligibility (
  offer_id uuid not null references offers(id) on delete cascade,
  plan_id text not null,                     -- canonical business.* id
  primary key (offer_id, plan_id)
);

create table if not exists offer_audiences (
  offer_id uuid not null references offers(id) on delete cascade,
  audience text not null check (audience in ('business','consumer')),
  primary key (offer_id, audience)
);

-- ── commissions (modeled, 1–2% clamped in code; never charged without authorization) ──
create table if not exists commission_rules (
  id uuid primary key default gen_random_uuid(),
  operation text not null check (operation in ('automated_offer','recurring_campaign','premium_automation')),
  rate numeric(4,3) not null check (rate between 0.010 and 0.020),   -- hard 1%–2% band
  currency text not null default 'USD',
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists platform_commissions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid references commission_rules(id),
  organization_id uuid,                      -- tenant the commission is attributed to
  operation text not null,
  base_amount bigint not null,               -- minor units
  rate numeric(4,3) not null check (rate between 0.010 and 0.020),
  amount bigint not null,                    -- minor units
  currency text not null default 'USD',
  status text not null default 'modeled' check (status in ('modeled','pending','applied','reversed')),
  created_at timestamptz not null default now()
);

-- ── automations / observability ──
create table if not exists sync_jobs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'idle' check (status in ('idle','running','failed','succeeded')),
  last_run_at timestamptz,
  next_run_at timestamptz,
  error_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists change_detections (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references offers(id) on delete cascade,
  changed boolean not null,
  cancelled boolean not null default false,
  fields text[] not null default '{}',
  impact text not null check (impact in ('none','minor','major','critical')),
  detected_at timestamptz not null default now()
);

create table if not exists ai_reviews (
  id uuid primary key default gen_random_uuid(),
  task text not null,
  subject_id uuid,
  output jsonb not null,
  confidence numeric(4,3) not null,
  requires_human_review boolean not null,
  model text not null,
  prompt_version text not null,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  severity text not null check (severity in ('info','warning','critical')),
  message text not null,
  ref_id uuid,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  subject_type text not null,                -- 'company' | 'offer' | 'user' | ...
  subject_id uuid not null,
  body text not null,
  author_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null,                    -- shopify | google_calendar | meta | ...
  status text not null default 'planned' check (status in ('connected','error','disconnected','planned')),
  scopes text[] not null default '{}',
  last_sync_at timestamptz,
  next_sync_at timestamptz,
  owner_id uuid,
  error_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Media metadata only — the object bytes live in an object store, never in Postgres.
create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image','video','document','link')),
  storage_url text not null,                 -- object-store reference, not the bytes
  content_type text,
  bytes bigint,
  license text,
  offer_id uuid references offers(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists company_metrics (
  organization_id uuid not null,
  period date not null,
  spend_minor bigint not null default 0,
  revenue_minor bigint not null default 0,
  campaigns integer not null default 0,
  offers_selected integer not null default 0,
  risk_score numeric(4,3) not null default 0,
  primary key (organization_id, period)
);

-- ── indexes ──
create index if not exists offers_status_idx        on offers (status) where deleted_at is null;
create index if not exists offers_country_idx        on offers (country) where deleted_at is null;
create index if not exists offers_start_idx          on offers (start_date);
create index if not exists offers_source_idx         on offers (source_id);
create index if not exists offer_scores_offer_idx    on offer_scores (offer_id, scored_at desc);
create index if not exists offer_versions_offer_idx  on offer_versions (offer_id, version desc);
create index if not exists change_detections_idx     on change_detections (offer_id, detected_at desc);
create index if not exists alerts_open_idx           on alerts (severity) where resolved_at is null;
create index if not exists commissions_org_idx       on platform_commissions (organization_id);
create index if not exists offer_sources_status_idx  on offer_sources (status);

-- ── updated_at triggers (reuse set_updated_at from 0001) ──
do $$
declare t text;
begin
  foreach t in array array['offer_sources','offers'] loop
    execute format('drop trigger if exists %I_set_updated_at on %I;', t, t);
    execute format('create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end $$;
