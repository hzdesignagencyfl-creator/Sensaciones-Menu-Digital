"use client";

import { useEffect, useRef } from "react";
import { CATEGORIES } from "@/lib/data/menu-meta";
import type { CategoryId, Lang } from "@/lib/types";

export function CategoryNav({
  active,
  lang,
  onSelect,
}: {
  active: CategoryId;
  lang: Lang;
  onSelect: (c: CategoryId) => void;
}) {
  const navRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Keep the active tab in view when it changes.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [active]);

  const tabBase: React.CSSProperties = {
    flex: "0 0 auto",
    padding: "15px 4px",
    margin: "0 12px",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    fontFamily: "var(--font-body-stack)",
    fontSize: "12px",
    fontWeight: 500,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--body-text)",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
  const tabActive: React.CSSProperties = {
    ...tabBase,
    color: "var(--charcoal)",
    fontWeight: 600,
    borderBottom: "2px solid var(--gold-primary)",
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(250,247,242,0.97)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        ref={navRef}
        className="hide-scroll"
        style={{ display: "flex", overflowX: "auto", padding: "0 14px" }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            ref={c.id === active ? activeRef : undefined}
            style={c.id === active ? tabActive : tabBase}
            onClick={() => onSelect(c.id)}
          >
            {lang === "en" ? c.en : c.es}
          </button>
        ))}
      </div>
    </div>
  );
}
