-- ============================================================================
-- Migration: harden analytics_events against direct anon-key abuse (2026-07)
-- The anon key is public (it ships in the browser bundle) and RLS allows
-- anonymous INSERTs into analytics_events, so someone could bypass the app's
-- API and insert junk directly via PostgREST. These CHECK constraints reject
-- anything that doesn't look like a legitimate event, at the database level.
-- Run in the Supabase SQL Editor. Safe to re-run.
-- ============================================================================

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
