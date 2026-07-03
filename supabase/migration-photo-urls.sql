-- ============================================================================
-- Migration: multi-photo galleries per dish (2026-07)
-- Run in the Supabase SQL Editor (Dashboard → SQL → New query). Safe to re-run.
-- Existing projects created before this date need this; fresh installs get the
-- column from schema.sql directly.
-- ============================================================================

alter table public.dishes
  add column if not exists photo_urls text[] not null default '{}';
