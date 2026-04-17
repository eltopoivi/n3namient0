-- Voice-intake tables.
-- Parallel to the existing `meals` / `workouts` tables: these two store
-- whatever the voice pipeline extracts from an audio note, with the raw
-- transcript preserved for debugging and the full breakdown in jsonb.

create extension if not exists pgcrypto;

-- NUTRITION LOG
create table if not exists public.nutrition_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  logged_at timestamptz not null default now(),
  meal_type text not null check (meal_type in
    ('breakfast','lunch','dinner','snack','pre_workout','post_workout','other')),
  raw_transcript text not null,
  items jsonb not null,
  total_kcal numeric(8,2) not null,
  total_protein_g numeric(7,2) not null,
  total_carbs_g numeric(7,2) not null,
  total_fat_g numeric(7,2) not null,
  total_fiber_g numeric(6,2),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists nutrition_log_user_logged_idx
  on public.nutrition_log (user_id, logged_at desc);

alter table public.nutrition_log enable row level security;

drop policy if exists "nutrition_log_owner_all" on public.nutrition_log;
create policy "nutrition_log_owner_all"
  on public.nutrition_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- TRAINING LOG
create table if not exists public.training_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_date date not null default current_date,
  discipline text not null check (discipline in
    ('trail','road','track','gym','mobility','cross','other')),
  raw_transcript text not null,
  duration_min integer,
  distance_km numeric(6,2),
  elevation_gain_m integer,
  avg_hr integer check (avg_hr between 30 and 230),
  max_hr integer check (max_hr between 30 and 230),
  perceived_effort smallint check (perceived_effort between 1 and 10),
  intervals jsonb,
  nutrition_during text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists training_log_user_session_idx
  on public.training_log (user_id, session_date desc);

alter table public.training_log enable row level security;

drop policy if exists "training_log_owner_all" on public.training_log;
create policy "training_log_owner_all"
  on public.training_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
