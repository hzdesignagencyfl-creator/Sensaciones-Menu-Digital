"use client";

import { useEffect } from "react";
import { STR } from "@/lib/data/menu-meta";
import { dishDesc, dishIngredients, dishName, formatPrice } from "@/lib/format";
import type { Dish, Lang } from "@/lib/types";
import { Badges, Stars } from "./Badges";
import { DishPhoto } from "./DishPhoto";

export function DishModal({
  dish,
  lang,
  suspended = false,
  onClose,
  onOpenMedia,
}: {
  dish: Dish | null;
  lang: Lang;
  /** True while another overlay (lightbox) sits on top — Escape should close that one, not this. */
  suspended?: boolean;
  onClose: () => void;
  onOpenMedia: (dish: Dish, index: number) => void;
}) {
  // Close on Escape.
  useEffect(() => {
    if (!dish || suspended) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dish, suspended, onClose]);

  if (!dish) return null;
  const t = STR[lang];
  const name = dishName(dish, lang);
  const desc = dishDesc(dish, lang);
  const ingredients = dishIngredients(dish, lang);
  const unavailable = !dish.available_today;

  return (
    <div
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        background: "rgba(30,30,30,0.55)",
        display: "flex",
        alignItems: "flex-end",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="hide-scroll"
        style={{
          width: "100%",
          maxHeight: "90%",
          overflowY: "auto",
          overscrollBehavior: "contain",
          background: "var(--cream)",
          borderRadius: "26px 26px 0 0",
          animation: "sheetUp 0.32s cubic-bezier(0.2,0.9,0.2,1)",
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ cursor: "pointer" }} onClick={() => onOpenMedia(dish, 0)}>
            <DishPhoto src={dish.photo_url} alt={name} height={238} grayscale={unavailable} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "36px",
              height: "36px",
              border: "none",
              borderRadius: "999px",
              background: "rgba(30,30,30,0.5)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
          <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", gap: "6px", flexWrap: "wrap", maxWidth: "70%" }}>
            <Badges dish={dish} lang={lang} />
          </div>
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

        <div style={{ padding: "20px 22px 32px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ minWidth: 0 }}>
              {dish.star_rating > 0 && (
                <div style={{ marginBottom: "5px" }}>
                  <Stars count={dish.star_rating} size={13} spacing={3} />
                </div>
              )}
              <h2
                className="font-display"
                style={{ margin: 0, fontWeight: 600, fontSize: "28px", color: "var(--charcoal)", lineHeight: 1.05 }}
              >
                {name}
              </h2>
            </div>
            <div style={{ fontWeight: 600, fontSize: "18px", color: "var(--gold-primary)", whiteSpace: "nowrap" }}>
              {formatPrice(dish, lang)}
            </div>
          </div>

          <p style={{ margin: "14px 0 0", fontSize: "14px", lineHeight: 1.6, color: "var(--body-text)" }}>
            {desc}
          </p>

          {ingredients.length > 0 && (
            <>
              <div
                style={{
                  marginTop: "22px",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--teal-mid)",
                }}
              >
                {t.ingredients}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "11px" }}>
                {ingredients.map((ing) => (
                  <span
                    key={ing}
                    style={{
                      background: "var(--chip-bg)",
                      color: "var(--chip-text)",
                      fontSize: "12px",
                      padding: "6px 12px",
                      borderRadius: "999px",
                    }}
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
