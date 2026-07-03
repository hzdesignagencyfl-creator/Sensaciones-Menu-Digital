"use client";

import { STR, categoryLabel } from "@/lib/data/menu-meta";
import { dishName } from "@/lib/format";
import type { Dish, Lang } from "@/lib/types";
import { Stars } from "./Badges";
import { DishPhoto } from "./DishPhoto";

/** Two-column grid card: rounded photo, name, category subtitle, stars. */
export function GridCard({
  dish,
  lang,
  onOpen,
}: {
  dish: Dish;
  lang: Lang;
  onOpen: (dish: Dish) => void;
}) {
  const t = STR[lang];
  const unavailable = !dish.available_today;

  return (
    <div onClick={() => onOpen(dish)} style={{ cursor: "pointer" }}>
      <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}>
        <DishPhoto src={dish.photo_url} alt={dishName(dish, lang)} height={150} grayscale={unavailable} />
        {dish.video_url && (
          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              width: "26px",
              height: "26px",
              borderRadius: "999px",
              background: "rgba(30,30,30,0.55)",
              color: "var(--cream)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(3px)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </span>
        )}
        {unavailable && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(46,65,61,0.86)",
              color: "var(--cream)",
              fontSize: "9.5px",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textAlign: "center",
              padding: "5px 4px",
            }}
          >
            {t.notAvail}
          </div>
        )}
      </div>
      <div
        className="font-display"
        style={{
          marginTop: "9px",
          fontSize: "17px",
          fontWeight: 700,
          color: "var(--charcoal)",
          lineHeight: 1.15,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {dishName(dish, lang)}
      </div>
      <div style={{ marginTop: "3px", fontSize: "11.5px", color: "var(--body-text)" }}>
        {categoryLabel(dish.category, lang)}
      </div>
      {dish.star_rating > 0 && (
        <div style={{ marginTop: "5px" }}>
          <Stars count={dish.star_rating} size={11} spacing={2.5} />
        </div>
      )}
    </div>
  );
}

/** Shared 2-column grid wrapper. */
export function DishGrid({
  dishes,
  lang,
  onOpen,
  emptyLabel,
}: {
  dishes: Dish[];
  lang: Lang;
  onOpen: (dish: Dish) => void;
  emptyLabel?: string;
}) {
  if (dishes.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--muted-text)", padding: "36px 0", fontSize: "14px" }}>
        {emptyLabel ?? STR[lang].noResults}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 14px", padding: "0 16px" }}>
      {dishes.map((d) => (
        <GridCard key={d.id} dish={d} lang={lang} onOpen={onOpen} />
      ))}
    </div>
  );
}
