-- ============================================================================
-- Migration: security hardening (2026-07-06). Run in the Supabase SQL Editor.
-- Safe to re-run. Supersedes migration-analytics-hardening.sql (includes it).
--
-- 1) CHECK constraints on analytics_events — reject malformed rows at the
--    database level (the anon key is public, so shape must be enforced here).
-- 2) Revoke anonymous INSERT on analytics_events — all legitimate events go
--    through /api/analytics, which now inserts with the service-role key and
--    validates every field. Direct PostgREST inserts with the anon key stop
--    working, which is the point.
--
-- REQUIRES: SUPABASE_SERVICE_ROLE_KEY set in the app's environment (it already
-- is in .env.local — remember to add it to the production deployment too),
-- otherwise analytics inserts will fail after step 2.
--
-- ALSO DO THIS (Dashboard, not SQL): Authentication → Sign In / Providers →
-- disable "Allow new users to sign up". Today anyone can self-register and
-- RLS grants every authenticated user full write access to the menu.
-- ============================================================================

-- ── 1. Shape constraints ────────────────────────────────────────────────────

alter table public.analytics_events
  drop constraint if exists analytics_events_event_check;
alter table public.analytics_events
  add constraint analytics_events_event_check
  check (event in ('menu_open', 'dish_tap', 'cat_view', 'lang_set'));

alter table public.analytics_events
  drop constraint if exists analytics_events_lang_check;
alter table public.analytics_events
  add constraint analytics_events_lang_check
  check (lang is null or lang in ('en', 'es'));

alter table public.analytics_events
  drop constraint if exists analytics_events_dish_id_len;
alter table public.analytics_events
  add constraint analytics_events_dish_id_len
  check (dish_id is null or char_length(dish_id) <= 80);

alter table public.analytics_events
  drop constraint if exists analytics_events_category_len;
alter table public.analytics_events
  add constraint analytics_events_category_len
  check (category is null or char_length(category) <= 80);

alter table public.analytics_events
  drop constraint if exists analytics_events_session_len;
alter table public.analytics_events
  add constraint analytics_events_session_len
  check (session_id is null or char_length(session_id) <= 80);

-- ── 2. Route-only inserts ───────────────────────────────────────────────────
-- Drop the permissive anon INSERT policy. The service-role key bypasses RLS,
-- so /api/analytics keeps working; direct anon-key inserts get rejected.

drop policy if exists analytics_insert on public.analytics_events;
