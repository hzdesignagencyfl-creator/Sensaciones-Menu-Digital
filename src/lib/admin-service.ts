"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { DEFAULT_SPECIAL, DISHES } from "@/lib/data/dishes";
import { DEFAULT_SETTINGS } from "@/lib/data/menu-meta";
import type { Dish, Settings, Special } from "@/lib/types";

export interface AdminBundle {
  dishes: Dish[];
  special: Special;
  settings: Settings;
  /** "supabase" when persisted, "local" when running in preview/demo mode. */
  source: "supabase" | "local";
}

/** Loads ALL dishes (including hidden) + special + settings for the admin. */
export async function loadAdminBundle(): Promise<AdminBundle> {
  const supabase = getSupabaseBrowser();
  if (!supabase) {
    return {
      dishes: clone(DISHES),
      special: { ...DEFAULT_SPECIAL },
      settings: { ...DEFAULT_SETTINGS },
      source: "local",
    };
  }

  const [dishesRes, specialRes, settingsRes] = await Promise.all([
    supabase.from("dishes").select("*").order("sort_order", { ascending: true }),
    supabase.from("special").select("*").eq("id", 1).maybeSingle(),
    supabase.from("settings").select("key, value"),
  ]);

  const dishes = (dishesRes.data as Dish[] | null) ?? [];
  const settings = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const row of (settingsRes.data ?? []) as { key: string; value: unknown }[]) {
    if (row.key in settings) settings[row.key] = row.value;
  }

  return {
    dishes: dishes.length ? dishes : clone(DISHES),
    special: (specialRes.data as Special | null) ?? { ...DEFAULT_SPECIAL },
    settings: settings as unknown as Settings,
    source: dishes.length ? "supabase" : "local",
  };
}

export async function saveDish(dish: Dish): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { error } = await supabase.from("dishes").upsert(dish);
  if (error) {
    // Databases created before the multi-photo migration lack photo_urls —
    // retry without it so dish edits keep working until the SQL is applied.
    if (/photo_urls/.test(error.message)) {
      const { photo_urls: _omit, ...legacy } = dish;
      void _omit;
      const retry = await supabase.from("dishes").upsert(legacy);
      if (retry.error) throw retry.error;
      return;
    }
    throw error;
  }
}

export async function deleteDish(id: string): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw error;
}

/** Persists new sort_order values after reordering dishes in the admin. */
export async function saveSortOrders(
  updates: { id: string; sort_order: number }[],
): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase || updates.length === 0) return;
  const results = await Promise.all(
    updates.map((u) =>
      supabase.from("dishes").update({ sort_order: u.sort_order }).eq("id", u.id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function setAvailability(id: string, available: boolean): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { error } = await supabase
    .from("dishes")
    .update({ available_today: available })
    .eq("id", id);
  if (error) throw error;
}

export async function saveSpecial(special: Special): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { error } = await supabase.from("special").upsert({ ...special, id: 1 });
  if (error) throw error;
}

export async function saveSettings(settings: Settings): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from("settings").upsert(rows);
  if (error) throw error;
}

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}
