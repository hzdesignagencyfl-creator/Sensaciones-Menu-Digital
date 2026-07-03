"use client";

import { STR } from "@/lib/data/menu-meta";
import { dishDesc, dishIngredients, dishName, formatPrice } from "@/lib/format";
import { dishPhotoList } from "@/lib/types";
import type { Dish, Lang } from "@/lib/types";
import { Badges, Stars } from "./Badges";
import { DishPhoto } from "./DishPhoto";
import { ScreenHeader } from "./ScreenHeader";

/** Full-screen dish detail per reference: photo, name + price, ingredients, description. */
export function DishDetail({
  dish,
  lang,
  onBack,
  onOpenMedia,
}: {
  dish: Dish;
  lang: Lang;
  onBack: () => void;
  onOpenMedia: (dish: Dish, index: number) => void;
}) {
  const t = STR[lang];
  const name = dishName(dish, lang);
  const desc = dishDesc(dish, lang);
  const ingredients = dishIngredients(dish, lang);
  const unavailable = !dish.available_today;
  const photoCount = dishPhotoList(dish).length;
  const hasMedia = photoCount > 0 || Boolean(dish.video_url);

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader title={t.details} onBack={onBack} />

      <div style={{ padding: "16px 16px 40px" }}>
        {/* Photo */}
        <div
          onClick={() => hasMedia && onOpenMedia(dish, 0)}
          style={{
            position: "relative",
            borderRadius: "18px",
            overflow: "hidden",
            cursor: hasMedia ? "pointer" : "default",
            boxShadow: "0 10px 28px rgba(30,30,30,0.14)",
          }}
        >
          <DishPhoto src={dish.photo_url} alt={name} height={252} grayscale={unavailable} />
          <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "70%" }}>
            <Badges dish={dish} lang={lang} />
          </div>
          {(photoCount > 1 || dish.video_url) && (
            <span
              style={{
                position: "absolute",
                right: "12px",
                bottom: unavailable ? "42px" : "12px",
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
              {dish.video_url ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7l1.5-3h5L16 7" />
                  <circle cx="12" cy="13" r="3.2" />
                </svg>
              )}
              {photoCount > 1 ? `1/${photoCount}` : null}
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

        {/* Name + price */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginTop: "20px" }}>
          <h2
            className="font-display"
            style={{ margin: 0, fontSize: "27px", fontWeight: 700, color: "var(--charcoal)", lineHeight: 1.1 }}
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
