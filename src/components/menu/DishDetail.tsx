"use client";

import { useMemo, useRef, useState } from "react";
import { STR, categoryLabel } from "@/lib/data/menu-meta";
import { dishDesc, dishIngredients, dishName, formatPrice } from "@/lib/format";
import { dishPhotoList } from "@/lib/types";
import type { CategoryId, Dish, Lang } from "@/lib/types";
import { Badges, Stars } from "./Badges";
import { DishPhoto } from "./DishPhoto";
import { ScreenHeader } from "./ScreenHeader";

/** Categories offered under "Pair it with" (only for dishes outside them). */
const PAIRING_SOURCES: CategoryId[] = ["sides", "drinks"];
const SUGGESTION_LIMIT = 6;

/** Full-screen dish detail: swipeable photo carousel, info, and suggestions. */
export function DishDetail({
  dish,
  dishes,
  lang,
  fav,
  onToggleFav,
  onBack,
  onOpenMedia,
  onOpenDish,
}: {
  dish: Dish;
  /** All visible dishes — source for pairing suggestions. */
  dishes: Dish[];
  lang: Lang;
  fav: boolean;
  onToggleFav: (id: string) => void;
  onBack: () => void;
  onOpenMedia: (dish: Dish, index: number) => void;
  onOpenDish: (dish: Dish) => void;
}) {
  const t = STR[lang];
  const name = dishName(dish, lang);
  const desc = dishDesc(dish, lang);
  const ingredients = dishIngredients(dish, lang);
  const unavailable = !dish.available_today;
  const photos = dishPhotoList(dish);
  const [photoIdx, setPhotoIdx] = useState(0);
  const touchX = useRef(0);
  const hasMedia = photos.length > 0 || Boolean(dish.video_url);

  const pairings = useMemo(() => {
    if (PAIRING_SOURCES.includes(dish.category) || dish.category === "desserts") return [];
    const bySort = (a: Dish, b: Dish) => a.sort_order - b.sort_order;
    const sides = dishes.filter((d) => d.category === "sides" && d.available_today).sort(bySort);
    const drinks = dishes.filter((d) => d.category === "drinks" && d.available_today).sort(bySort);
    return [...sides.slice(0, 4), ...drinks.slice(0, 2)].slice(0, SUGGESTION_LIMIT);
  }, [dishes, dish.category]);

  function go(delta: number) {
    setPhotoIdx((i) => Math.max(0, Math.min(photos.length - 1, i + delta)));
  }
  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? 0;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (dx < -40) go(1);
    if (dx > 40) go(-1);
  }

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader
        title={t.details}
        onBack={onBack}
        action={
          <button
            onClick={() => onToggleFav(dish.id)}
            aria-label={fav ? t.favRemove : t.favAdd}
            title={fav ? t.favRemove : t.favAdd}
            style={{
              width: "38px",
              height: "38px",
              border: "none",
              borderRadius: "999px",
              background: fav ? "rgba(196,163,90,0.16)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={fav ? "var(--gold-primary)" : "none"}
              stroke={fav ? "var(--gold-primary)" : "var(--charcoal)"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          </button>
        }
      />

      <div style={{ padding: "16px 0 40px" }}>
        {/* Photo carousel */}
        <div style={{ padding: "0 16px" }}>
          <div
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onClick={() => hasMedia && onOpenMedia(dish, photoIdx)}
            style={{
              position: "relative",
              borderRadius: "18px",
              overflow: "hidden",
              cursor: hasMedia ? "pointer" : "default",
              boxShadow: "0 10px 28px rgba(30,30,30,0.14)",
              height: "252px",
            }}
          >
            {photos.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  width: `${photos.length * 100}%`,
                  height: "100%",
                  transform: `translateX(-${photoIdx * (100 / photos.length)}%)`,
                  transition: "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)",
                }}
              >
                {photos.map((src, i) => (
                  <div key={`${src}-${i}`} style={{ flex: `0 0 ${100 / photos.length}%`, height: "100%" }}>
                    <DishPhoto src={src} alt={name} height={252} grayscale={unavailable} />
                  </div>
                ))}
              </div>
            ) : (
              <DishPhoto src={null} alt={name} height={252} grayscale={unavailable} />
            )}

            <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "70%" }}>
              <Badges dish={dish} lang={lang} />
            </div>

            {/* Prev/next arrows (desktop-friendly; swipe works on touch) */}
            {photos.length > 1 && photoIdx > 0 && (
              <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo" style={{ ...carouselArrow, left: "10px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
            )}
            {photos.length > 1 && photoIdx < photos.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo" style={{ ...carouselArrow, right: "10px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            )}

            {/* Dots */}
            {photos.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: unavailable ? "40px" : "12px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "6px",
                  pointerEvents: "none",
                }}
              >
                {photos.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "999px",
                      background: i === photoIdx ? "var(--gold-primary)" : "rgba(255,255,255,0.55)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
                      transition: "background 0.2s ease",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Counter / video chip */}
            {(photos.length > 1 || dish.video_url) && (
              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(20,20,20,0.62)",
                  color: "var(--cream)",
                  borderRadius: "999px",
                  padding: "5px 11px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  backdropFilter: "blur(4px)",
                  pointerEvents: "none",
                }}
              >
                {dish.video_url && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
                {photos.length > 1 ? `${photoIdx + 1}/${photos.length}` : null}
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
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  textAlign: "center",
                  padding: "9px",
                }}
              >
                {t.notAvail}
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "0 16px" }}>
          {/* Name + price */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginTop: "20px" }}>
            <h2
              className="font-display"
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 700,
                color: "var(--charcoal)",
                lineHeight: 1.12,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              {name}
            </h2>
            <div
              className="font-display"
              style={{ flex: "0 0 auto", fontSize: "23px", fontWeight: 700, color: "var(--gold-dark)", whiteSpace: "nowrap" }}
            >
              {formatPrice(dish, lang)}
            </div>
          </div>
          {dish.star_rating > 0 && (
            <div style={{ marginTop: "7px" }}>
              <Stars count={dish.star_rating} size={13} spacing={3} />
            </div>
          )}

          {/* Ingredients */}
          {ingredients.length > 0 && (
            <>
              <SectionTitle>{t.ingredients}</SectionTitle>
              <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
                {ingredients.map((ing) => (
                  <li key={ing} style={{ display: "flex", alignItems: "baseline", gap: "10px", fontSize: "13.5px", lineHeight: 1.5, color: "var(--body-text)" }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "999px", background: "var(--gold-primary)", flex: "0 0 auto", transform: "translateY(-2px)" }} />
                    {ing}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Description */}
          {desc && (
            <>
              <SectionTitle>{t.description}</SectionTitle>
              <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.65, color: "var(--body-text)" }}>
                {desc}
              </p>
            </>
          )}
        </div>

        {/* Pair it with */}
        {pairings.length > 0 && (
          <SuggestionRow title={t.pairWith} dishes={pairings} lang={lang} onOpenDish={onOpenDish} />
        )}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-display"
      style={{ marginTop: "24px", fontSize: "17px", fontWeight: 700, color: "var(--charcoal)", letterSpacing: "0.02em" }}
    >
      {children}
    </div>
  );
}

/** Horizontal scroll of small dish cards linking to their own detail. */
function SuggestionRow({
  title,
  dishes,
  lang,
  onOpenDish,
}: {
  title: string;
  dishes: Dish[];
  lang: Lang;
  onOpenDish: (dish: Dish) => void;
}) {
  return (
    <div style={{ marginTop: "26px" }}>
      <div
        className="font-display"
        style={{ padding: "0 16px", fontSize: "17px", fontWeight: 700, color: "var(--charcoal)", letterSpacing: "0.02em" }}
      >
        {title}
      </div>
      <div className="hide-scroll" style={{ display: "flex", gap: "12px", overflowX: "auto", padding: "12px 16px 4px" }}>
        {dishes.map((d) => (
          <div key={d.id} onClick={() => onOpenDish(d)} style={{ flex: "0 0 128px", cursor: "pointer" }}>
            <div style={{ borderRadius: "12px", overflow: "hidden" }}>
              <DishPhoto src={d.photo_url} alt={dishName(d, lang)} height={88} grayscale={!d.available_today} />
            </div>
            <div
              className="font-display"
              style={{
                marginTop: "7px",
                fontSize: "12.5px",
                fontWeight: 700,
                color: "var(--charcoal)",
                lineHeight: 1.2,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {dishName(d, lang)}
            </div>
            <div style={{ marginTop: "2px", fontSize: "10.5px", color: "var(--body-text)" }}>
              {categoryLabel(d.category, lang)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const carouselArrow: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  width: "32px",
  height: "32px",
  border: "none",
  borderRadius: "999px",
  background: "rgba(20,20,20,0.5)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(4px)",
};
