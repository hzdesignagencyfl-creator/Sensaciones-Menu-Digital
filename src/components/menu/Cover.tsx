"use client";

import { useEffect, useState } from "react";
import { HERO_IMAGES, STR } from "@/lib/data/menu-meta";
import type { Lang } from "@/lib/types";
import { LangToggle } from "./LangToggle";

/** Full-screen welcome cover (shown once per session), per reference design.
 *  Renders above all menu chrome (bottom nav etc.) via a high z-index. */
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
        zIndex: 70,
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
              "linear-gradient(180deg, rgba(10,10,10,0.60) 0%, rgba(10,10,10,0.32) 42%, rgba(10,10,10,0.90) 100%)",
          }}
        />
      </div>

      {/* Content — everything centered */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 26px 30px",
        }}
      >
        {/* Logo near the top (not glued), with the language toggle below it */}
        <div style={{ marginTop: "54px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo/logo-on-dark.png"
            alt="Sensaciones"
            style={{ height: "58px", width: "auto", display: "block" }}
          />
          <LangToggle lang={lang} onLang={onLang} onDark />
        </div>

        {/* Spacer pushes the hero group down into the lower third */}
        <div style={{ flex: 1 }} />

        {/* Hero copy + button, anchored toward the bottom */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1
            className="font-display"
            style={{
              margin: 0,
              color: "var(--cream)",
              fontSize: "52px",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              textShadow: "0 2px 20px rgba(0,0,0,0.45)",
            }}
          >
            {t.heroTitle}
          </h1>
          <p
            style={{
              margin: "12px auto 0",
              maxWidth: "88%",
              color: "rgba(250,247,242,0.86)",
              fontSize: "14.5px",
              fontWeight: 500,
              lineHeight: 1.5,
              textShadow: "0 1px 12px rgba(0,0,0,0.5)",
            }}
          >
            {t.heroSubtitle}
          </p>

          <button
            onClick={onEnter}
            className="font-body"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              marginTop: "30px",
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
          <div
            style={{
              marginTop: "14px",
              fontSize: "10.5px",
              fontWeight: 500,
              letterSpacing: "0.04em",
              color: "rgba(250,247,242,0.5)",
            }}
          >
            {t.designedBy}
          </div>
        </div>
      </div>
    </div>
  );
}
