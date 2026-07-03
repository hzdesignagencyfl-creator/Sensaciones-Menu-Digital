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

export function dishName(dish: Dish, lang: Lang): string {
  return lang === "en" ? dish.name_en : dish.name_es;
}

export function dishDesc(dish: Dish, lang: Lang): string {
  return lang === "en" ? dish.description_en : dish.description_es;
}

export function dishIngredients(dish: Dish, lang: Lang): string[] {
  return lang === "en" ? dish.ingredients_en : dish.ingredients_es;
}
