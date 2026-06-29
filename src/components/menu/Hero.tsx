"use client";

import { useEffect, useState } from "react";
import { HERO_IMAGES } from "@/lib/data/menu-meta";
import type { Lang } from "@/lib/types";

export function Hero({
  lang,
  onLang,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIdx((i) => (i + 1) % HERO_IMAGES.length),
      4200,
    );
    return () => clearInterval(timer);
  }, []);

  const segBase: React.CSSProperties = {
    padding: "5px 11px",
    borderRadius: "999px",
    border: "none",
    background: "none",
    fontFamily: "var(--font-body-stack)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "rgba(250,247,242,0.6)",
    cursor: "pointer",
  };
  const segActive: React.CSSProperties = {
    ...segBase,
    background: "var(--gold-primary)",
    color: "var(--teal-dark)",
  };

  return (
    <header
      style={{
        position: "relative",
        background: "#111",
        padding: "20px 20px",
        minHeight: "190px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Crossfading slideshow */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "#111" }}>
        {HERO_IMAGES.map((src, i) => (
          <div
            key={src}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url("${src}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === idx ? 1 : 0,
              transition: "opacity 0.9s linear",
            }}
          />
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background:
            "linear-gradient(160deg,rgba(10,10,10,0.58),rgba(10,10,10,0.82))",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              display: "flex",
              background: "rgba(250,247,242,0.12)",
              borderRadius: "999px",
              padding: "3px",
              gap: "2px",
            }}
          >
            <button style={lang === "en" ? segActive : segBase} onClick={() => onLang("en")}>
              EN
            </button>
            <button style={lang === "es" ? segActive : segBase} onClick={() => onLang("es")}>
              ES
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo-on-dark.png"
            alt="Sensaciones"
            style={{ height: "88px", width: "auto", display: "block" }}
          />
        </div>
      </div>
    </header>
  );
}
