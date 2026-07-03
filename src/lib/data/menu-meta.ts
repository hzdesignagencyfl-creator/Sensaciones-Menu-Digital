import type { BadgeId, CategoryId, Lang, Settings } from "@/lib/types";

/** Category tabs in display order: [id, label_en, label_es]. */
export const CATEGORIES: { id: CategoryId; en: string; es: string }[] = [
  { id: "popular", en: "Most Popular", es: "Lo Más Pedido" },
  { id: "breakfast", en: "Breakfast & Brunch", es: "Desayuno y Brunch" },
  { id: "appetizers", en: "Appetizers", es: "Aperitivos" },
  { id: "soups", en: "Soups & Salads", es: "Sopas y Ensaladas" },
  { id: "sandwiches", en: "Sandwiches", es: "Sándwiches" },
  { id: "pastas", en: "Pastas", es: "Pastas" },
  { id: "entrees", en: "Entrees", es: "Platos Principales" },
  { id: "lunch", en: "Lunch Special", es: "Especial Almuerzo" },
  { id: "kids", en: "Kids", es: "Niños" },
  { id: "sides", en: "Sides", es: "Acompañantes" },
  { id: "desserts", en: "Desserts", es: "Postres" },
  { id: "drinks", en: "Drinks", es: "Bebidas" },
];

export function categoryLabel(id: CategoryId, lang: Lang): string {
  const c = CATEGORIES.find((x) => x.id === id);
  if (!c) return id;
  return lang === "en" ? c.en : c.es;
}

/** Badge metadata — label per language + colors (matches design tokens). */
export const BADGES: Record<BadgeId, { en: string; es: string; bg: string; color: string }> = {
  chef: { en: "Chef's pick ★", es: "Selección del chef ★", bg: "#C4A35A", color: "#2E413D" },
  popular: { en: "Most popular", es: "Más pedido", bg: "#496560", color: "#FAF7F2" },
  new: { en: "New", es: "Nuevo", bg: "#6B9490", color: "#FAF7F2" },
  veg: { en: "Vegetarian", es: "Vegetariano", bg: "#E2EBE8", color: "#2E413D" },
  gf: { en: "Gluten-free", es: "Sin gluten", bg: "#E2EBE8", color: "#2E413D" },
};

/** UI strings, bilingual. */
export const STR = {
  en: {
    tagline: "Cuban Cuisine · Fort Myers",
    ingredients: "Ingredients",
    description: "Description",
    seeMore: "See more",
    showLess: "Show less",
    notAvail: "Not available today",
    marketPrice: "Market Price",
    special: "Today's Special",
    photoHint: "Add photo",
    review: "Review",
    viewMenu: "View Menu",
    viewAll: "View all",
    search: "Search dishes…",
    home: "Home",
    categories: "Categories",
    details: "Details",
    popularSection: "Most Popular",
    newSection: "New Arrivals",
    noResults: "No dishes found.",
    item: "item",
    items: "items",
  },
  es: {
    tagline: "Cocina Cubana · Fort Myers",
    ingredients: "Ingredientes",
    description: "Descripción",
    seeMore: "Ver más",
    showLess: "Ver menos",
    notAvail: "No disponible hoy",
    marketPrice: "Precio de mercado",
    special: "Especial del día",
    photoHint: "Agregar foto",
    review: "Reseña",
    viewMenu: "Ver Menú",
    viewAll: "Ver todo",
    search: "Buscar platos…",
    home: "Inicio",
    categories: "Categorías",
    details: "Detalle",
    popularSection: "Lo Más Pedido",
    newSection: "Nuevos",
    noResults: "No se encontraron platos.",
    item: "plato",
    items: "platos",
  },
} as const;

/** Hero slideshow images (public menu header). */
export const HERO_IMAGES: string[] = [
  "/images/food/churrasco-a-caballo-sensaciones-fort-myers.webp",
  "/images/food/fresh-grouper-havana-style-sensaciones-fort-myers.webp",
  "/images/food/pargo-frito-entero-sensaciones-fort-myers.webp",
  "/images/food/croquetas-artesanales.webp",
  "/images/food/french-toast-sensaciones-fort-myers.webp",
  "/images/food/cafe-bombon-sensaciones-fort-myers.webp",
];

export const DEFAULT_SETTINGS: Settings = {
  default_lang: "en",
  whatsapp: "",
  phone: "",
  restaurant_name: "Sensaciones",
  google_review_url: "https://g.page/r/CQgqyekLOSgtEBM/review",
};
