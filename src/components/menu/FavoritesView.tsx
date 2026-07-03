"use client";

import { STR, categoryLabel } from "@/lib/data/menu-meta";
import { dishName, formatPrice } from "@/lib/format";
import type { Dish, Lang } from "@/lib/types";
import { DishPhoto } from "./DishPhoto";
import { ScreenHeader } from "./ScreenHeader";

/** "My Picks": the diner's saved dishes, ready to show the server. */
export function FavoritesView({
  dishes,
  lang,
  onBack,
  onToggleFav,
  onOpenDish,
}: {
  /** Saved dishes only, already filtered to visible ones. */
  dishes: Dish[];
  lang: Lang;
  onBack: () => void;
  onToggleFav: (id: string) => void;
  onOpenDish: (dish: Dish) => void;
}) {
  const t = STR[lang];

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader title={t.favs} onBack={onBack} />

      {dishes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 40px", color: "var(--muted-text)" }}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--gold-primary)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ opacity: 0.6 }}
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <p style={{ marginTop: "16px", fontSize: "14px", lineHeight: 1.6 }}>{t.favsEmpty}</p>
        </div>
      ) : (
        <>
          <div
            style={{
              margin: "14px 16px 4px",
              padding: "11px 14px",
              borderRadius: "12px",
              background: "var(--chip-bg)",
              color: "var(--chip-text)",
              fontSize: "12.5px",
              fontWeight: 600,
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            {t.favsHint}
          </div>
          <div style={{ padding: "12px 16px 96px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {dishes.map((d) => (
              <div
                key={d.id}
                onClick={() => onOpenDish(d)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "13px",
                  background: "var(--cream-warm)",
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "10px",
                  cursor: "pointer",
                }}
              >
                <div style={{ width: "74px", flex: "0 0 auto", borderRadius: "10px", overflow: "hidden" }}>
                  <DishPhoto src={d.photo_url} alt={dishName(d, lang)} height={58} grayscale={!d.available_today} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="font-display"
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--charcoal)",
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {dishName(d, lang)}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--body-text)", marginTop: "2px" }}>
                    {categoryLabel(d.category, lang)}
                    {!d.available_today && (
                      <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}> · {t.notAvail}</span>
                    )}
                  </div>
                </div>
                <div
                  className="font-display"
                  style={{ flex: "0 0 auto", fontSize: "15px", fontWeight: 700, color: "var(--gold-dark)", whiteSpace: "nowrap" }}
                >
                  {formatPrice(d, lang)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFav(d.id);
                  }}
                  aria-label={t.favRemove}
                  title={t.favRemove}
                  style={{
                    flex: "0 0 auto",
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "999px",
                    background: "rgba(196,163,90,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="var(--gold-primary)" stroke="var(--gold-primary)" strokeWidth="2" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
