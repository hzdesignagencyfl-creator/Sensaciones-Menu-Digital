-- ============================================================================
-- Migration: banner video + ingredients for the Today's Special (2026-07)
-- Run in the Supabase SQL Editor. Safe to re-run.
-- The app tolerates these columns being missing (saves retry without them),
-- but the values won't persist until the migration is applied.
-- ============================================================================

alter table public.special add column if not exists video_url text;
alter table public.special add column if not exists ingredients_en text[] default '{}';
alter table public.special add column if not exists ingredients_es text[] default '{}';
