"use client";

import type { Lang } from "@/lib/types";

/** EN/ES pill toggle, light (cream pages) or dark (cover) variant. */
export function LangToggle({
  lang,
  onLang,
  onDark = false,
}: {
  lang: Lang;
  onLang: (l: Lang) => void;
  onDark?: boolean;
}) {
  const base: React.CSSProperties = {
    padding: "5px 11px",
    borderRadius: "999px",
    border: "none",
    background: "none",
    fontFamily: "var(--font-body-stack)",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: onDark ? "rgba(250,247,242,0.6)" : "var(--body-text)",
    cursor: "pointer",
  };
  const active: React.CSSProperties = {
    ...base,
    background: "var(--gold-primary)",
    color: "var(--teal-dark)",
  };

  return (
    <div
      style={{
        display: "flex",
        background: onDark ? "rgba(250,247,242,0.14)" : "var(--cream-warm)",
        borderRadius: "999px",
        padding: "3px",
        gap: "2px",
        flex: "0 0 auto",
      }}
    >
      <button style={lang === "en" ? active : base} onClick={() => onLang("en")}>
        EN
      </button>
      <button style={lang === "es" ? active : base} onClick={() => onLang("es")}>
        ES
      </button>
    </div>
  );
}
