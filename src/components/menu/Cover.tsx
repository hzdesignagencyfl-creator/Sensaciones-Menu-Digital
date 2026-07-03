"use client";

import { useEffect, useState } from "react";
import { HERO_IMAGES, STR } from "@/lib/data/menu-meta";
import type { Lang } from "@/lib/types";
import { LangToggle } from "./LangToggle";

/** Full-screen welcome cover (shown once per session), per reference design. */
export function Cover({
  lang,
  onLang,
  onEnter,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onEnter: () => void;
}) {
  const t = STR[lang];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % HERO_IMAGES.length), 4600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#0d0d0d",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Crossfading photo backdrop */}
      <div style={{ position: "absolute", inset: 0 }}>
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
              transition: "opacity 1.1s linear",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.35) 40%, rgba(10,10,10,0.88) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "22px 24px 42px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: "rgba(250,247,242,0.92)",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--gold-primary)">
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
            </svg>
            {t.tagline}
          </span>
          <LangToggle lang={lang} onLang={onLang} onDark />
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo-on-dark.png"
            alt="Sensaciones"
            style={{ width: "230px", maxWidth: "70%", height: "auto", display: "block" }}
          />
        </div>

        <button
          onClick={onEnter}
          className="font-body"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            width: "100%",
            maxWidth: "320px",
            margin: "0 auto",
            padding: "16px 20px",
            border: "none",
            borderRadius: "14px",
            background: "var(--gold-primary)",
            color: "var(--teal-dark)",
            fontSize: "15.5px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            cursor: "pointer",
            boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          }}
        >
          {t.viewMenu}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
