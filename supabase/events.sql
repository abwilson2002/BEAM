-- Run once in the Supabase SQL editor to create the table the /api/events endpoints use.

create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  event_type  text not null check (
                event_type in ('hackathon', 'info_session', 'career_fair', 'workshop', 'networking', 'other')
              ),
  organizer   text not null,
  description text not null default '',
  starts_at   timestamptz not null,
  venue       text not null,
  zip         text not null,
  lat         double precision not null,
  lng         double precision not null,
  created_at  timestamptz not null default now()
);

create index if not exists events_starts_at_idx on public.events (starts_at);

-- The backend talks to Supabase with the publishable (anon) key, so RLS needs policies.
-- These are deliberately open for the hackathon: anyone can read and create events.
alter table public.events enable row level security;

create policy "events are readable by anyone"
  on public.events for select using (true);

create policy "events can be created by anyone"
  on public.events for insert with check (true);
