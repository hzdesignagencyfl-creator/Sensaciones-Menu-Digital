"use client";

import { useMemo } from "react";
import { CATEGORIES, STR } from "@/lib/data/menu-meta";
import type { CategoryId, Dish, Lang } from "@/lib/types";
import { ScreenHeader } from "./ScreenHeader";

/** "Categories" screen: tile grid, each with a representative dish photo. */
export function CategoriesView({
  dishes,
  lang,
  onBack,
  onOpenCategory,
}: {
  dishes: Dish[];
  lang: Lang;
  onBack: () => void;
  onOpenCategory: (cat: CategoryId) => void;
}) {
  const t = STR[lang];

  // First dish with a photo per category (cover for the tile).
  const covers = useMemo(() => {
    const map = new Map<CategoryId, string>();
    for (const d of [...dishes].sort((a, b) => a.sort_order - b.sort_order)) {
      if (d.photo_url && !map.has(d.category)) map.set(d.category, d.photo_url);
    }
    return map;
  }, [dishes]);

  const counts = useMemo(() => {
    const map = new Map<CategoryId, number>();
    for (const d of dishes) map.set(d.category, (map.get(d.category) ?? 0) + 1);
    map.set("popular", dishes.filter((d) => d.badge_popular).length);
    return map;
  }, [dishes]);

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader title={t.categories} onBack={onBack} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", padding: "16px 16px 96px" }}>
        {CATEGORIES.map((c) => {
          const cover = c.id === "popular"
            ? dishes.find((d) => d.badge_popular && d.photo_url)?.photo_url
            : covers.get(c.id);
          const count = counts.get(c.id) ?? 0;
          return (
            <button
              key={c.id}
              onClick={() => onOpenCategory(c.id)}
              style={{
                position: "relative",
                height: "104px",
                border: "none",
                borderRadius: "14px",
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                background: "var(--teal-mid)",
                textAlign: "left",
              }}
            >
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(18,24,22,0.18) 0%, rgba(18,24,22,0.78) 100%)",
                }}
              />
              <div style={{ position: "absolute", left: "12px", right: "12px", bottom: "10px" }}>
                <div
                  className="font-display"
                  style={{
                    color: "var(--cream)",
                    fontSize: "15.5px",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                    lineHeight: 1.15,
                  }}
                >
                  {lang === "en" ? c.en : c.es}
                </div>
                <div style={{ color: "rgba(250,247,242,0.75)", fontSize: "10.5px", fontWeight: 600, marginTop: "2px" }}>
                  {count} {count === 1 ? t.item : t.items}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
