"use client";

import { useMemo } from "react";
import { STR } from "@/lib/data/menu-meta";
import { dishName, formatPrice, joinNames } from "@/lib/format";
import type { Dish, Lang, Special } from "@/lib/types";
import { ScreenHeader } from "./ScreenHeader";
import { SuggestionRow } from "./DishDetail";

const SUGGESTION_LIMIT = 6;

/** Full-screen detail for the Today's Special — mirrors the dish detail:
 *  media hero, name/price, ingredients, description and pairing suggestions. */
export function SpecialDetail({
  special,
  dishes,
  lang,
  onBack,
  onOpenMedia,
  onOpenDish,
}: {
  special: Special;
  /** All visible dishes — source for pairing suggestions. */
  dishes: Dish[];
  lang: Lang;
  onBack: () => void;
  onOpenMedia: () => void;
  onOpenDish: (dish: Dish) => void;
}) {
  const t = STR[lang];
  const name = lang === "en" ? special.name_en : special.name_es || special.name_en;
  const desc = lang === "en" ? special.description_en : special.description_es || special.description_en;
  const ingredientsEn = special.ingredients_en ?? [];
  const ingredientsEs = special.ingredients_es ?? [];
  const ingredients = lang === "en" ? ingredientsEn : ingredientsEs.length ? ingredientsEs : ingredientsEn;
  const hasPhoto = Boolean(special.photo_url);
  const hasVideo = Boolean(special.video_url);
  const hasMedia = hasPhoto || hasVideo;

  // Same pairing sources as the dish detail: available sides + drinks.
  const pairings = useMemo(() => {
    const bySort = (a: Dish, b: Dish) => a.sort_order - b.sort_order;
    const sides = dishes.filter((d) => d.category === "sides" && d.available_today).sort(bySort);
    const drinks = dishes.filter((d) => d.category === "drinks" && d.available_today).sort(bySort);
    return [...sides.slice(0, 4), ...drinks.slice(0, 2)].slice(0, SUGGESTION_LIMIT);
  }, [dishes]);

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader title={t.special} onBack={onBack} />

      <div style={{ padding: pairings.length ? "16px 16px 0" : "16px 16px 40px" }}>
        {/* Media hero: looping video when present, else the photo */}
        <div
          onClick={() => hasMedia && onOpenMedia()}
          style={{
            position: "relative",
            borderRadius: "18px",
            overflow: "hidden",
            cursor: hasMedia ? "pointer" : "default",
            boxShadow: "0 10px 28px rgba(30,30,30,0.14)",
            background: "linear-gradient(150deg, #efe9df 0%, #e6ddcd 60%, #ddd2bd 100%)",
            height: "252px",
          }}
        >
          {hasVideo ? (
            <video
              src={special.video_url!}
              poster={special.photo_url ?? undefined}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
              aria-label={name}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={special.photo_url!}
              alt={name}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "var(--gold-primary)",
              color: "var(--teal-dark)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            {t.special}
          </span>
        </div>

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
          {special.price != null && (
            <div
              className="font-display"
              style={{ flex: "0 0 auto", fontSize: "23px", fontWeight: 700, color: "var(--gold-dark)", whiteSpace: "nowrap" }}
            >
              {formatPrice(special, lang)}
            </div>
          )}
        </div>

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

      {/* Pair it with: prose suggestion + tappable dish cards */}
      {pairings.length > 0 && (
        <div style={{ paddingBottom: "40px" }}>
          <SuggestionRow
            title={t.pairWith}
            intro={joinNames(pairings.map((d) => dishName(d, lang)), lang)}
            dishes={pairings}
            lang={lang}
            onOpenDish={onOpenDish}
          />
        </div>
      )}
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
