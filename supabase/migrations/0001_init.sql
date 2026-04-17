-- N300 schema. Run once in the Supabase SQL editor.
-- Idempotent where possible so re-running is safe.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles -----------------------------------------------------------------
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  birthdate date,
  height_cm numeric,
  weight_kg numeric,
  fc_max integer,
  fc_rest integer,
  vo2max numeric,
  fc_zones jsonb,
  hrv_range_min numeric,
  hrv_range_max numeric,
  motivation_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "profiles own" on public.profiles;
create policy "profiles own" on public.profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- workouts -----------------------------------------------------------------
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  sport text not null,
  sport_subtype text,
  title text,
  notes text,
  duration_s integer not null,
  distance_m numeric,
  avg_hr integer,
  avg_power_w integer,
  elev_gain_m numeric,
  elev_loss_m numeric,
  pace_s_per_km numeric,
  vam_m_per_h numeric,
  calories integer,
  source text not null default 'manual',
  external_id text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists workouts_user_started_idx on public.workouts(user_id, started_at desc);
create index if not exists workouts_user_sport_started_idx on public.workouts(user_id, sport, started_at desc);
alter table public.workouts enable row level security;
drop policy if exists "workouts own" on public.workouts;
create policy "workouts own" on public.workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists workouts_set_updated_at on public.workouts;
create trigger workouts_set_updated_at before update on public.workouts
  for each row execute function public.set_updated_at();

-- sleeps -------------------------------------------------------------------
create table if not exists public.sleeps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  duration_min integer not null,
  deep_pct numeric,
  rem_pct numeric,
  light_pct numeric,
  quality_score integer,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists sleeps_user_date_idx on public.sleeps(user_id, date desc);
alter table public.sleeps enable row level security;
drop policy if exists "sleeps own" on public.sleeps;
create policy "sleeps own" on public.sleeps
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- rhr ----------------------------------------------------------------------
create table if not exists public.rhr_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  bpm integer not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists rhr_user_date_idx on public.rhr_readings(user_id, date desc);
alter table public.rhr_readings enable row level security;
drop policy if exists "rhr own" on public.rhr_readings;
create policy "rhr own" on public.rhr_readings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- hrv ----------------------------------------------------------------------
create table if not exists public.hrv_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  value_ms numeric not null,
  range_min numeric,
  range_max numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists hrv_user_date_idx on public.hrv_readings(user_id, date desc);
alter table public.hrv_readings enable row level security;
drop policy if exists "hrv own" on public.hrv_readings;
create policy "hrv own" on public.hrv_readings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- weights ------------------------------------------------------------------
create table if not exists public.weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  kg numeric not null,
  body_fat_pct numeric,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);
create index if not exists weights_user_date_idx on public.weights(user_id, date desc);
alter table public.weights enable row level security;
drop policy if exists "weights own" on public.weights;
create policy "weights own" on public.weights
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- meals --------------------------------------------------------------------
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  slot text not null,
  description text,
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  micros jsonb,
  created_at timestamptz not null default now()
);
create index if not exists meals_user_date_idx on public.meals(user_id, date desc);
alter table public.meals enable row level security;
drop policy if exists "meals own" on public.meals;
create policy "meals own" on public.meals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- hydration ----------------------------------------------------------------
create table if not exists public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  ml integer not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists hydration_user_date_idx on public.hydration_logs(user_id, date desc);
alter table public.hydration_logs enable row level security;
drop policy if exists "hydration own" on public.hydration_logs;
create policy "hydration own" on public.hydration_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- prs ----------------------------------------------------------------------
create table if not exists public.prs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sport text,
  metric text not null,
  value numeric not null,
  unit text not null,
  achieved_at date not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists prs_user_achieved_idx on public.prs(user_id, achieved_at desc);
alter table public.prs enable row level security;
drop policy if exists "prs own" on public.prs;
create policy "prs own" on public.prs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- events -------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  kind text,
  sport text,
  event_date date not null,
  location text,
  target_notes text,
  result_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists events_user_date_idx on public.events(user_id, event_date desc);
alter table public.events enable row level security;
drop policy if exists "events own" on public.events;
create policy "events own" on public.events
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
