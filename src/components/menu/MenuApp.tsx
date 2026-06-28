"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  trackCatView,
  trackDishTap,
  trackLangSet,
  trackMenuOpen,
} from "@/lib/analytics";
import { CATEGORIES, STR, categoryLabel } from "@/lib/data/menu-meta";
import type { MenuData } from "@/lib/data-service";
import type { CategoryId, Dish, Lang, Special } from "@/lib/types";
import { Hero } from "./Hero";
import { CategoryNav } from "./CategoryNav";
import { SpecialBanner } from "./SpecialBanner";
import { DishCard } from "./DishCard";
import { DishModal } from "./DishModal";
import { ReviewCTA } from "./ReviewCTA";

export function MenuApp({ initial }: { initial: MenuData }) {
  const [lang, setLang] = useState<Lang>(initial.settings.default_lang);
  const [cat, setCat] = useState<CategoryId>("popular");
  const [dishes, setDishes] = useState<Dish[]>(initial.dishes);
  const [special, setSpecial] = useState<Special>(initial.special);
  const [modalDish, setModalDish] = useState<Dish | null>(null);
  const didOpen = useRef(false);

  const t = STR[lang];

  // menu_open once per session
  useEffect(() => {
    if (didOpen.current) return;
    didOpen.current = true;
    trackMenuOpen();
  }, []);

  // Realtime: reflect admin availability / special edits instantly.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel("menu-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "dishes" },
        (payload: { new: Dish }) => {
          const row = payload.new as Dish;
          if (!row?.id) return;
          setDishes((prev) => {
            const idx = prev.findIndex((d) => d.id === row.id);
            if (idx === -1) return [...prev, row];
            const next = [...prev];
            next[idx] = row;
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "special" },
        (payload: { new: Special }) => setSpecial(payload.new as Special),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  function changeLang(l: Lang) {
    if (l === lang) return;
    setLang(l);
    trackLangSet(l);
  }

  function changeCat(c: CategoryId) {
    setCat(c);
    trackCatView(c);
  }

  function openDish(d: Dish) {
    setModalDish(d);
    trackDishTap(d.id, d.category);
  }

  const visible = useMemo(
    () => dishes.filter((d) => d.status === "visible"),
    [dishes],
  );

  const list = useMemo(() => {
    const filtered =
      cat === "popular"
        ? visible.filter((d) => d.badge_popular)
        : visible.filter((d) => d.category === cat);
    return [...filtered].sort((a, b) => a.sort_order - b.sort_order);
  }, [visible, cat]);

  const activeLabel = categoryLabel(cat, lang);
  const countLabel = `${list.length} ${list.length === 1 ? t.item : t.items}`;

  return (
    <div className="menu-shell">
      <div
        className="hide-scroll menu-scroll"
        style={{ position: "relative" }}
      >
        <Hero lang={lang} onLang={changeLang} />
        <CategoryNav active={cat} lang={lang} onSelect={changeCat} />

        <SpecialBanner special={special} lang={lang} />

        {/* Section heading */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "10px 20px 2px" }}>
          <h2
            className="font-display"
            style={{ fontWeight: 600, fontSize: "22px", color: "var(--charcoal)", margin: 0, whiteSpace: "nowrap" }}
          >
            {activeLabel}
          </h2>
          <span style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ fontSize: "11px", color: "var(--body-text)", letterSpacing: "0.06em" }}>
            {countLabel}
          </span>
        </div>

        <div style={{ padding: "10px 16px 16px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {list.map((dish) => (
            <DishCard key={dish.id} dish={dish} lang={lang} onOpen={openDish} />
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--muted-text)", padding: "40px 0", fontSize: "14px" }}>
              {lang === "en" ? "No dishes in this section yet." : "Aún no hay platos en esta sección."}
            </div>
          )}
        </div>

        <div style={{ height: "44px" }} />
      </div>

      <ReviewCTA lang={lang} href={initial.settings.google_review_url} />
      <DishModal dish={modalDish} lang={lang} onClose={() => setModalDish(null)} />
    </div>
  );
}
