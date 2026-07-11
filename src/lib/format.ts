import type { Dish, Lang } from "@/lib/types";
import { STR } from "@/lib/data/menu-meta";

/** "$14.95" or the localized market-price label. */
export function formatPrice(
  item: { price: number | null; market_price?: boolean },
  lang: Lang,
): string {
  if (item.market_price || item.price == null) return STR[lang].marketPrice;
  return "$" + formatAmount(item.price);
}

/** "14" stays "$14", "14.5" renders as "14.50". */
export function formatAmount(price: number): string {
  return Number.isInteger(price) ? String(price) : price.toFixed(2);
}

// The admin only requires the EN name, so Spanish fields can be empty —
// fall back to English rather than rendering a blank name/description.
export function dishName(dish: Dish, lang: Lang): string {
  return lang === "en" ? dish.name_en : dish.name_es || dish.name_en;
}

export function dishDesc(dish: Dish, lang: Lang): string {
  return lang === "en" ? dish.description_en : dish.description_es || dish.description_en;
}

export function dishIngredients(dish: Dish, lang: Lang): string[] {
  if (lang === "en") return dish.ingredients_en;
  return dish.ingredients_es.length ? dish.ingredients_es : dish.ingredients_en;
}

/** Prose list for pairing suggestions: "A, B y C" / "A, B and C". */
export function joinNames(names: string[], lang: Lang): string {
  if (names.length <= 1) return names[0] ?? "";
  const last = names[names.length - 1];
  return names.slice(0, -1).join(", ") + (lang === "en" ? " and " : " y ") + last;
}

/**
 * Admin-stored URLs end up in href attributes — only ever emit http(s) so a
 * poisoned settings row can't smuggle a javascript: URL into the public menu.
 */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return u.href;
  } catch {
    // not a parseable absolute URL
  }
  return null;
}
