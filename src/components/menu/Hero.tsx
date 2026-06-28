"use client";

import { useEffect, useState } from "react";
import { HERO_IMAGES, STR } from "@/lib/data/menu-meta";
import type { Lang } from "@/lib/types";

export function Hero({
  lang,
  onLang,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
}) {
  const [idx, setIdx] = useState(0);
  const t = STR[lang];

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
        padding: "30px 20px 26px",
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

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <svg
            width="34"
            height="34"
            viewBox="0 0 64 64"
            fill="none"
            stroke="#C4A35A"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <path d="M20 41 C12 41 8 35 10 29 C6 25 8 16 16 16 C17 9 25 6 31 11 C35 6 45 7 47 14 C56 13 60 21 54 28 C57 34 51 41 43 41 Z" />
            <path d="M20 41 H44 V49 C44 51 42 53 40 53 H24 C22 53 20 51 20 49 Z" />
            <path d="M27 41 V49 M32 41 V49 M37 41 V49" strokeWidth="1.4" />
          </svg>
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

        <div style={{ textAlign: "center", marginTop: "4px" }}>
          <div
            className="font-display"
            style={{
              fontSize: "28px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "var(--gold-primary)",
              lineHeight: 1,
              textIndent: "0.18em",
            }}
          >
            SENSACIONES
          </div>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 500,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "rgba(250,247,242,0.7)",
              marginTop: "8px",
            }}
          >
            {t.tagline}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              marginTop: "13px",
            }}
          >
            <span
              style={{
                height: "1px",
                width: "42px",
                background: "linear-gradient(90deg,rgba(196,163,90,0),#C4A35A)",
              }}
            />
            <svg width="11" height="15" viewBox="0 0 11 16" fill="none" stroke="#C4A35A" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 1.5v3.4M5.5 1.5v3.4M9 1.5v3.4M2 4.9c0 1.9 1.4 2.4 3.5 2.4s3.5-.5 3.5-2.4" />
              <path d="M5.5 7.3v7.2" />
            </svg>
            <span style={{ color: "#C4A35A", fontSize: "7px" }}>◆</span>
            <svg width="9" height="15" viewBox="0 0 9 16" fill="none" stroke="#C4A35A" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 1.5C7.6 3.2 7.6 6.6 6 8.6" />
              <path d="M6 1.5v13" />
            </svg>
            <span
              style={{
                height: "1px",
                width: "42px",
                background: "linear-gradient(90deg,#C4A35A,rgba(196,163,90,0))",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
