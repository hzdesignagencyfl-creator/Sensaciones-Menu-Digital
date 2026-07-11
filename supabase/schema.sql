-- ============================================================================
-- Sensaciones Menu Digital — Supabase schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where possible.
-- ============================================================================

-- ── Tables ──────────────────────────────────────────────────────────────────

create table if not exists public.dishes (
  id              text primary key,
  category        text not null,
  name_en         text not null,
  name_es         text not null,
  description_en  text,
  description_es  text,
  price           numeric,
  market_price    boolean default false,
  ingredients_en  text[] default '{}',
  ingredients_es  text[] default '{}',
  photo_url       text,
  photo_urls      text[] not null default '{}',
  video_url       text,
  status          text default 'visible',
  available_today boolean default true,
  badge_chef      boolean default false,
  badge_popular   boolean default false,
  badge_new       boolean default false,
  badge_veg       boolean default false,
  badge_gf        boolean default false,
  star_rating     integer default 0,
  sort_order      integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table if not exists public.special (
  id              serial primary key,
  active          boolean default true,
  name_en         text,
  name_es         text,
  description_en  text,
  description_es  text,
  price           numeric,
  photo_url       text,
  video_url       text,
  ingredients_en  text[] default '{}',
  ingredients_es  text[] default '{}',
  updated_at      timestamptz default now()
);

create table if not exists public.settings (
  key   text primary key,
  value jsonb
);

create table if not exists public.analytics_events (
  id         bigserial primary key,
  event      text not null,
  dish_id    text,
  category   text,
  lang       text,
  session_id text,
  created_at timestamptz default now()
);

create index if not exists analytics_events_event_created_idx
  on public.analytics_events (event, created_at desc);

-- ── updated_at trigger ──────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dishes_touch on public.dishes;
create trigger dishes_touch before update on public.dishes
  for each row execute function public.touch_updated_at();

drop trigger if exists special_touch on public.special;
create trigger special_touch before update on public.special
  for each row execute function public.touch_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- Public menu (anon) may READ menu data and INSERT analytics events.
-- Authenticated admin (Oscar) may do everything.

alter table public.dishes            enable row level security;
alter table public.special           enable row level security;
alter table public.settings          enable row level security;
alter table public.analytics_events  enable row level security;

-- dishes: public read, authenticated write
drop policy if exists dishes_read on public.dishes;
create policy dishes_read on public.dishes
  for select using (true);

drop policy if exists dishes_write on public.dishes;
create policy dishes_write on public.dishes
  for all to authenticated using (true) with check (true);

-- special: public read, authenticated write
drop policy if exists special_read on public.special;
create policy special_read on public.special
  for select using (true);

drop policy if exists special_write on public.special;
create policy special_write on public.special
  for all to authenticated using (true) with check (true);

-- settings: public read, authenticated write
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings
  for select using (true);

drop policy if exists settings_write on public.settings;
create policy settings_write on public.settings
  for all to authenticated using (true) with check (true);

-- analytics: anon insert only, authenticated read (for Insights)
drop policy if exists analytics_insert on public.analytics_events;
create policy analytics_insert on public.analytics_events
  for insert with check (true);

drop policy if exists analytics_read on public.analytics_events;
create policy analytics_read on public.analytics_events
  for select to authenticated using (true);

-- ── Realtime ────────────────────────────────────────────────────────────────
-- Let the public menu react to availability / special changes instantly.
alter publication supabase_realtime add table public.dishes;
alter publication supabase_realtime add table public.special;

-- ── Default settings ────────────────────────────────────────────────────────
insert into public.settings (key, value) values
  ('default_lang',      '"en"'::jsonb),
  ('restaurant_name',   '"Sensaciones"'::jsonb),
  ('whatsapp',          '""'::jsonb),
  ('phone',             '""'::jsonb),
  ('google_review_url', '"https://g.page/r/CQgqyekLOSgtEBM/review"'::jsonb)
on conflict (key) do nothing;
