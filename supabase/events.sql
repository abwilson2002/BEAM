-- Run in the Supabase SQL editor. Safe to run more than once, and works whether the
-- `events` table is brand new or already exists with the older columns
-- (giver_id, location_name, ...).

-- 1. Create the table if it does not exist yet.
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null default '',
  starts_at   timestamptz not null,
  zip         text not null,
  lat         double precision not null,
  lng         double precision not null
);

-- 2. Add the columns the frontend sends (no-ops if they already exist).
alter table public.events
  add column if not exists event_type text not null default 'other',
  add column if not exists organizer  text not null default '',
  add column if not exists venue      text not null default '',
  add column if not exists created_at timestamptz not null default now();

alter table public.events drop constraint if exists events_event_type_check;
alter table public.events add constraint events_event_type_check check (
  event_type in ('hackathon', 'info_session', 'career_fair', 'workshop', 'networking', 'other')
);

-- 3. The frontend has no login, so it cannot send older columns like giver_id or
--    location_name. Let every column it does not know about stay empty.
do $$
declare
  legacy_column text;
begin
  for legacy_column in
    select column_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and is_nullable = 'NO'
      and column_name not in (
        'id', 'title', 'description', 'starts_at', 'zip', 'lat', 'lng',
        'event_type', 'organizer', 'venue', 'created_at'
      )
  loop
    execute format('alter table public.events alter column %I drop not null', legacy_column);
  end loop;
end $$;

create index if not exists events_starts_at_idx on public.events (starts_at);

-- 4. The backend uses the publishable (anon) key, so row level security needs policies.
--    Deliberately open for the hackathon: anyone can read and create events.
alter table public.events enable row level security;

drop policy if exists "events are readable by anyone" on public.events;
create policy "events are readable by anyone"
  on public.events for select using (true);

drop policy if exists "events can be created by anyone" on public.events;
create policy "events can be created by anyone"
  on public.events for insert with check (true);

-- 5. Make the API pick up the new columns right away (fixes "not found in the schema cache").
notify pgrst, 'reload schema';
