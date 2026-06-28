"use client";

import { useRef, useState } from "react";
import { STR } from "@/lib/data/menu-meta";
import { dishDesc, dishIngredients, dishName, formatPrice } from "@/lib/format";
import type { Dish, Lang } from "@/lib/types";
import { Badges, Stars } from "./Badges";
import { DishPhoto } from "./DishPhoto";

export function DishCard({
  dish,
  lang,
  onOpen,
}: {
  dish: Dish;
  lang: Lang;
  onOpen: (dish: Dish) => void;
}) {
  const t = STR[lang];
  const [descOpen, setDescOpen] = useState(false);
  const [ingOpen, setIngOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const touchX = useRef(0);

  const name = dishName(dish, lang);
  const desc = dishDesc(dish, lang);
  const ingredients = dishIngredients(dish, lang);
  const hasVideo = Boolean(dish.video_url);
  const unavailable = !dish.available_today;
  const showDescBtn = desc.length > 62;

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? 0;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (dx > 50 && !videoOpen && hasVideo) setVideoOpen(true);
    if (dx < -50 && videoOpen) setVideoOpen(false);
  }

  return (
    <div
      style={{
        background: "var(--cream-warm)",
        border: "1px solid var(--border)",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(30,30,30,0.04)",
      }}
    >
      {/* ── Photo / video swipe area ── */}
      <div
        style={{ position: "relative", overflow: "hidden", height: "186px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex",
            width: "200%",
            transform: videoOpen ? "translateX(-50%)" : "translateX(0)",
            transition: "transform 0.34s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          {/* Photo panel */}
          <div
            style={{
              flex: "0 0 50%",
              height: "186px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <DishPhoto src={dish.photo_url} alt={name} height={186} grayscale={unavailable} />

            <div
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                maxWidth: "68%",
              }}
            >
              <Badges dish={dish} lang={lang} />
            </div>

            <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "7px" }}>
              {hasVideo && (
                <button
                  onClick={() => setVideoOpen(true)}
                  aria-label="Play video"
                  style={{
                    width: "34px",
                    height: "34px",
                    border: "none",
                    borderRadius: "999px",
                    background: "rgba(196,163,90,0.9)",
                    color: "var(--teal-dark)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => onOpen(dish)}
                aria-label="Expand"
                style={{
                  width: "34px",
                  height: "34px",
                  border: "none",
                  borderRadius: "999px",
                  background: "rgba(30,30,30,0.4)",
                  color: "var(--cream)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backdropFilter: "blur(4px)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>
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
                  padding: "8px",
                }}
              >
                {t.notAvail}
              </div>
            )}
          </div>

          {/* Video panel */}
          <div
            style={{
              flex: "0 0 50%",
              height: "186px",
              background: "#0a0a0a",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {dish.video_url ? (
              <video
                src={dish.video_url}
                autoPlay
                loop
                muted
                playsInline
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "rgba(255,255,255,0.45)",
                  fontSize: "12px",
                  padding: "20px",
                }}
              >
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <div style={{ marginTop: "8px" }}>
                  {lang === "en" ? "No video yet" : "Sin video aún"}
                </div>
              </div>
            )}
            <button
              onClick={() => setVideoOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                background: "rgba(20,20,20,0.72)",
                color: "var(--cream)",
                border: "none",
                borderRadius: "999px",
                padding: "7px 13px 7px 10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                backdropFilter: "blur(4px)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              {lang === "en" ? "Photo" : "Foto"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ minWidth: 0 }}>
            {dish.star_rating > 0 && (
              <div style={{ marginBottom: "4px" }}>
                <Stars count={dish.star_rating} />
              </div>
            )}
            <h3
              onClick={() => onOpen(dish)}
              className="font-display"
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: "19px",
                color: "var(--charcoal)",
                lineHeight: 1.12,
                cursor: "pointer",
              }}
            >
              {name}
            </h3>
          </div>
          <div
            style={{
              flex: "0 0 auto",
              fontWeight: 600,
              fontSize: "15px",
              color: "var(--gold-primary)",
              whiteSpace: "nowrap",
            }}
          >
            {formatPrice(dish, lang)}
          </div>
        </div>

        <p
          style={{
            margin: "8px 0 0",
            fontSize: "13.5px",
            lineHeight: 1.55,
            color: "var(--body-text)",
            ...(descOpen
              ? {}
              : {
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }),
          }}
        >
          {desc}
        </p>
        {showDescBtn && (
          <button
            onClick={() => setDescOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              marginTop: "5px",
              color: "var(--gold-dark)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {descOpen ? t.showLess : t.seeMore}
          </button>
        )}

        <button
          onClick={() => setIngOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            padding: 0,
            marginTop: "13px",
            color: "var(--body-text)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <span>{t.ingredients}</span>
          <span
            style={{
              display: "inline-flex",
              transition: "transform 0.2s ease",
              transform: ingOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        {ingOpen && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "11px" }}>
            {ingredients.map((ing) => (
              <span
                key={ing}
                style={{
                  background: "var(--chip-bg)",
                  color: "var(--chip-text)",
                  fontSize: "11px",
                  padding: "4px 10px",
                  borderRadius: "999px",
                }}
              >
                {ing}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
