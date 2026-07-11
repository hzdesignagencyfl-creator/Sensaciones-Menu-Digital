// Shared domain types for the Sensaciones digital menu.

export type Lang = "en" | "es";

export type CategoryId =
  | "popular"
  | "breakfast"
  | "appetizers"
  | "soups"
  | "sandwiches"
  | "pastas"
  | "entrees"
  | "lunch"
  | "kids"
  | "sides"
  | "desserts"
  | "drinks";

export type BadgeId = "chef" | "popular" | "new" | "veg" | "gf";

export interface Dish {
  id: string;
  category: CategoryId;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  /** null = market price */
  price: number | null;
  market_price: boolean;
  ingredients_en: string[];
  ingredients_es: string[];
  photo_url: string | null;
  /** Extra gallery photos beyond the cover (may be undefined before the DB migration runs). */
  photo_urls?: string[] | null;
  video_url: string | null;
  status: "visible" | "hidden";
  available_today: boolean;
  badge_chef: boolean;
  badge_popular: boolean;
  badge_new: boolean;
  badge_veg: boolean;
  badge_gf: boolean;
  star_rating: number;
  sort_order: number;
}

export interface Special {
  id: number;
  active: boolean;
  name_en: string;
  name_es: string;
  description_en: string;
  description_es: string;
  price: number | null;
  photo_url: string | null;
  /** Looping banner video (may be undefined before the DB migration runs). */
  video_url?: string | null;
  /** Ingredient lists (may be undefined before the DB migration runs). */
  ingredients_en?: string[] | null;
  ingredients_es?: string[] | null;
}

export interface Settings {
  default_lang: Lang;
  whatsapp: string;
  phone: string;
  restaurant_name: string;
  google_review_url: string;
}

export type AnalyticsEventType =
  | "menu_open"
  | "dish_tap"
  | "cat_view"
  | "lang_set";

export interface AnalyticsEvent {
  event: AnalyticsEventType;
  dish_id?: string | null;
  category?: string | null;
  lang?: Lang | null;
  session_id: string;
}

/** All photos of a dish in display order: cover first, then extras. */
export function dishPhotoList(d: {
  photo_url: string | null;
  photo_urls?: string[] | null;
}): string[] {
  const out: string[] = [];
  if (d.photo_url) out.push(d.photo_url);
  for (const p of d.photo_urls ?? []) if (p) out.push(p);
  return out;
}

/** Helper: ordered list of badge ids that are active on a dish. */
export function dishBadges(d: Dish): BadgeId[] {
  const out: BadgeId[] = [];
  if (d.badge_chef) out.push("chef");
  if (d.badge_popular) out.push("popular");
  if (d.badge_new) out.push("new");
  if (d.badge_veg) out.push("veg");
  if (d.badge_gf) out.push("gf");
  return out;
}
