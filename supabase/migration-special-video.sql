-- ============================================================================
-- Migration: banner video for the Today's Special (2026-07-06)
-- Run in the Supabase SQL Editor. Safe to re-run.
-- The app tolerates this column being missing (saves retry without it),
-- but the video won't persist until the migration is applied.
-- ============================================================================

alter table public.special add column if not exists video_url text;
