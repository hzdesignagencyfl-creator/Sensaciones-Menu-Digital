"use client";

import { useMemo, useState } from "react";
import { STR, categoryLabel } from "@/lib/data/menu-meta";
import type { CategoryId, Dish, Lang } from "@/lib/types";
import { DishGrid } from "./GridCard";
import { ScreenHeader } from "./ScreenHeader";

/** One category: back header, optional inline search, 2-column dish grid. */
export function CategoryView({
  cat,
  dishes,
  lang,
  favIds,
  onToggleFav,
  onBack,
  onOpenDish,
}: {
  cat: CategoryId;
  dishes: Dish[];
  lang: Lang;
  favIds: Set<string>;
  onToggleFav: (id: string) => void;
  onBack: () => void;
  onOpenDish: (dish: Dish) => void;
}) {
  const t = STR[lang];
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const list = useMemo(() => {
    const inCat =
      cat === "popular"
        ? dishes.filter((d) => d.badge_popular)
        : dishes.filter((d) => d.category === cat);
    const sorted = [...inCat].sort((a, b) => a.sort_order - b.sort_order);
    if (!q) return sorted;
    return sorted.filter((d) =>
      `${d.name_en} ${d.name_es} ${d.ingredients_en.join(" ")} ${d.ingredients_es.join(" ")}`
        .toLowerCase()
        .includes(q),
    );
  }, [dishes, cat, q]);

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader
        title={categoryLabel(cat, lang)}
        onBack={onBack}
        action={
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setQuery("");
            }}
            aria-label={t.search}
            style={{
              width: "38px",
              height: "38px",
              border: "none",
              borderRadius: "999px",
              background: searchOpen ? "var(--cream-warm)" : "transparent",
              color: "var(--charcoal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        }
      />

      {searchOpen && (
        <div style={{ padding: "12px 16px 0" }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              fontSize: "14px",
              color: "var(--charcoal)",
              background: "#fff",
              outline: "none",
            }}
          />
        </div>
      )}

      <div style={{ padding: "16px 0 96px" }}>
        <DishGrid dishes={list} lang={lang} favIds={favIds} onToggleFav={onToggleFav} onOpen={onOpenDish} />
      </div>
    </div>
  );
}
