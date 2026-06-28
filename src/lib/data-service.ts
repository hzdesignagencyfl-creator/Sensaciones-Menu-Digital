import { getSupabaseServer } from "@/lib/supabase/server";
import { DEFAULT_SPECIAL, DISHES } from "@/lib/data/dishes";
import { DEFAULT_SETTINGS } from "@/lib/data/menu-meta";
import type { Dish, Settings, Special } from "@/lib/types";

export interface MenuData {
  dishes: Dish[];
  special: Special;
  settings: Settings;
  /** "supabase" when served from the database, "local" when using seed data. */
  source: "supabase" | "local";
}

/**
 * Loads the full menu for the public site. Reads from Supabase when configured;
 * otherwise returns the bundled seed data so the menu renders during setup.
 */
export async function getMenuData(): Promise<MenuData> {
  const supabase = await getSupabaseServer();
  if (!supabase) {
    return {
      dishes: DISHES,
      special: DEFAULT_SPECIAL,
      settings: DEFAULT_SETTINGS,
      source: "local",
    };
  }

  try {
    const [dishesRes, specialRes, settingsRes] = await Promise.all([
      supabase
        .from("dishes")
        .select("*")
        .eq("status", "visible")
        .order("sort_order", { ascending: true }),
      supabase.from("special").select("*").eq("id", 1).maybeSingle(),
      supabase.from("settings").select("key, value"),
    ]);

    if (dishesRes.error) throw dishesRes.error;

    const dishes = (dishesRes.data as Dish[] | null) ?? [];
    const special = (specialRes.data as Special | null) ?? DEFAULT_SPECIAL;
    const settings = mergeSettings(settingsRes.data);

    return {
      dishes: dishes.length ? dishes : DISHES,
      special,
      settings,
      source: dishes.length ? "supabase" : "local",
    };
  } catch (err) {
    console.error("[data-service] Supabase read failed, using local data:", err);
    return {
      dishes: DISHES,
      special: DEFAULT_SPECIAL,
      settings: DEFAULT_SETTINGS,
      source: "local",
    };
  }
}

/** Folds the key/value settings rows into a typed Settings object. */
function mergeSettings(
  rows: { key: string; value: unknown }[] | null,
): Settings {
  const out = { ...DEFAULT_SETTINGS } as Record<string, unknown>;
  for (const row of rows ?? []) {
    if (row.key in out) {
      // value is jsonb; coerce to the field's primitive shape
      out[row.key] = row.value;
    }
  }
  return out as unknown as Settings;
}
