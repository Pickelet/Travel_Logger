-- Travel Logger database bootstrap
-- Run this script in the Supabase SQL editor or via the CLI against your project.

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists "pgcrypto";

-- Base table for mileage entries
create table if not exists public.travel_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  trip text not null,
  miles numeric(10, 1) not null check (miles >= 0),
  purpose text not null,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.travel_entries is 'Per-user travel mileage logs for the Travel Logger app.';
comment on column public.travel_entries.entry_date is 'Calendar date of the trip (local date).';
comment on column public.travel_entries.trip is 'Short description of the trip.';
comment on column public.travel_entries.miles is 'Miles driven, recorded with one decimal place.';
comment on column public.travel_entries.purpose is 'Business purpose for the trip.';

-- Helpful composite index for monthly lookups
create index if not exists travel_entries_user_month_idx
  on public.travel_entries (user_id, entry_date);

-- Enforce RLS so each user sees only their data
alter table public.travel_entries enable row level security;

-- Cleanup any old policies if re-running
drop policy if exists "Users can read own entries" on public.travel_entries;
drop policy if exists "Users can insert their entries" on public.travel_entries;
drop policy if exists "Users can delete own entries" on public.travel_entries;

-- Allow authenticated users to read only their rows
create policy "Users can read own entries"
  on public.travel_entries
  for select
  using (auth.uid() = user_id);

-- Allow authenticated users to insert rows for themselves
create policy "Users can insert their entries"
  on public.travel_entries
  for insert
  with check (auth.uid() = user_id);

-- Allow authenticated users to delete their rows
create policy "Users can delete own entries"
  on public.travel_entries
  for delete
  using (auth.uid() = user_id);
