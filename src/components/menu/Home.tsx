"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, STR, categoryLabel } from "@/lib/data/menu-meta";
import type { CategoryId, Dish, Lang, Special } from "@/lib/types";
import { DishGrid } from "./GridCard";
import { LangToggle } from "./LangToggle";
import { SpecialBanner } from "./SpecialBanner";

const CATEGORY_CHIPS = CATEGORIES.filter((c) => c.id !== "popular");

/** Categories that get their own dish section on the Home. */
const HOME_SECTIONS: CategoryId[] = [
  "breakfast",
  "appetizers",
  "sandwiches",
  "entrees",
  "desserts",
  "drinks",
];
/** Dishes shown per Home section before "View all". */
const SECTION_LIMIT = 4;

/** Home screen: brand header, search, category chips, special, featured grids. */
export function Home({
  dishes,
  special,
  lang,
  onLang,
  onOpenCategory,
  onOpenDish,
  onOpenSpecial,
}: {
  dishes: Dish[];
  special: Special;
  lang: Lang;
  onLang: (l: Lang) => void;
  onOpenCategory: (cat: CategoryId) => void;
  onOpenDish: (dish: Dish) => void;
  onOpenSpecial: () => void;
}) {
  const t = STR[lang];
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return null;
    return dishes.filter((d) =>
      [
        d.name_en,
        d.name_es,
        ...d.ingredients_en,
        ...d.ingredients_es,
        categoryLabel(d.category, "en"),
        categoryLabel(d.category, "es"),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [dishes, q]);

  const popular = useMemo(
    () => dishes.filter((d) => d.badge_popular).slice(0, 4),
    [dishes],
  );
  const fresh = useMemo(
    () => dishes.filter((d) => d.badge_new).slice(0, 4),
    [dishes],
  );

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      {/* Brand header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 16px 2px" }}>
        <div>
          <div
            className="font-display"
            style={{
              fontSize: "23px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--teal-dark)",
              lineHeight: 1,
            }}
          >
            Sensaciones
          </div>
          <div
            style={{
              marginTop: "4px",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--gold-dark)",
            }}
          >
            {t.tagline}
          </div>
        </div>
        <LangToggle lang={lang} onLang={onLang} />
      </div>

      {/* Search */}
      <div style={{ position: "relative", margin: "16px 16px 4px" }}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--muted-text)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ position: "absolute", left: "15px", top: "50%", transform: "translateY(-50%)" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          style={{
            width: "100%",
            padding: "13px 40px 13px 42px",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            fontSize: "14px",
            color: "var(--charcoal)",
            background: "#fff",
            outline: "none",
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "24px",
              height: "24px",
              border: "none",
              borderRadius: "999px",
              background: "var(--cream-warm)",
              color: "var(--body-text)",
              cursor: "pointer",
              fontSize: "13px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>

      {q ? (
        /* Search results grid */
        <div style={{ padding: "16px 0 90px" }}>
          <DishGrid dishes={results ?? []} lang={lang} onOpen={onOpenDish} />
        </div>
      ) : (
        <>
          {/* Category chips */}
          <div
            className="hide-scroll"
            style={{ display: "flex", gap: "8px", overflowX: "auto", padding: "14px 16px 4px" }}
          >
            {CATEGORY_CHIPS.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpenCategory(c.id)}
                className="font-display"
                style={{
                  flex: "0 0 auto",
                  padding: "9px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: "999px",
                  background: "var(--cream-warm)",
                  color: "var(--teal-dark)",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {lang === "en" ? c.en : c.es}
              </button>
            ))}
          </div>

          <SpecialBanner special={special} lang={lang} onOpen={onOpenSpecial} />

          <Section
            title={t.popularSection}
            viewAllLabel={t.viewAll}
            onViewAll={() => onOpenCategory("popular")}
          >
            <DishGrid dishes={popular} lang={lang} onOpen={onOpenDish} />
          </Section>

          {fresh.length > 0 && (
            <Section title={t.newSection}>
              <DishGrid dishes={fresh} lang={lang} onOpen={onOpenDish} />
            </Section>
          )}

          {/* Per-category sections */}
          {HOME_SECTIONS.map((cat) => {
            const list = [...dishes.filter((d) => d.category === cat)]
              .sort((a, b) => a.sort_order - b.sort_order)
              .slice(0, SECTION_LIMIT);
            if (list.length === 0) return null;
            return (
              <Section
                key={cat}
                title={categoryLabel(cat, lang)}
                viewAllLabel={t.viewAll}
                onViewAll={() => onOpenCategory(cat)}
              >
                <DishGrid dishes={list} lang={lang} onOpen={onOpenDish} />
              </Section>
            );
          })}

          <div style={{ height: "92px" }} />
        </>
      )}
    </div>
  );
}

function Section({
  title,
  viewAllLabel,
  onViewAll,
  children,
}: {
  title: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "14px 16px 12px" }}>
        <h2
          className="font-display"
          style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--charcoal)", letterSpacing: "0.01em" }}
        >
          {title}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            style={{
              border: "none",
              background: "none",
              padding: 0,
              color: "var(--gold-dark)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {viewAllLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
