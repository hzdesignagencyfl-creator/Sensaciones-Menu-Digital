"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  trackCatView,
  trackDishTap,
  trackLangSet,
  trackMenuOpen,
} from "@/lib/analytics";
import { STR, categoryLabel } from "@/lib/data/menu-meta";
import type { MenuData } from "@/lib/data-service";
import type { CategoryId, Dish, Lang, Special } from "@/lib/types";
import { Hero } from "./Hero";
import { CategoryNav } from "./CategoryNav";
import { SpecialBanner } from "./SpecialBanner";
import { DishCard } from "./DishCard";
import { DishModal } from "./DishModal";
import { MediaLightbox } from "./MediaLightbox";
import { ReviewCTA } from "./ReviewCTA";
import { ScrollTopButton } from "./ScrollTopButton";

const LANG_KEY = "sensaciones_lang";

export function MenuApp({ initial }: { initial: MenuData }) {
  const [lang, setLang] = useState<Lang>(initial.settings.default_lang);
  const [cat, setCat] = useState<CategoryId>("popular");
  const [dishes, setDishes] = useState<Dish[]>(initial.dishes);
  const [special, setSpecial] = useState<Special>(initial.special);
  const [modalDish, setModalDish] = useState<Dish | null>(null);
  const [lightbox, setLightbox] = useState<{ source: Dish | Special; index: number } | null>(null);
  const didOpen = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const t = STR[lang];

  // menu_open once per session
  useEffect(() => {
    if (didOpen.current) return;
    didOpen.current = true;
    trackMenuOpen();
  }, []);

  // Restore the visitor's last language choice. Can't happen in the useState
  // initializer: the server renders with the default and localStorage differing
  // from it would break hydration.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (stored === "en" || stored === "es") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLang(stored);
      }
    } catch {
      // storage blocked (private mode) — keep the default language
    }
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
        (payload: { eventType: string; new: Partial<Dish>; old: Partial<Dish> }) => {
          if (payload.eventType === "DELETE") {
            const oldId = payload.old?.id;
            if (oldId) setDishes((prev) => prev.filter((d) => d.id !== oldId));
            return;
          }
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
        (payload: { new: Partial<Special> }) => {
          const row = payload.new as Special;
          if (row?.id) setSpecial(row);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  function changeLang(l: Lang) {
    if (l === lang) return;
    setLang(l);
    try {
      window.localStorage.setItem(LANG_KEY, l);
    } catch {
      // storage blocked — the choice just won't survive a reload
    }
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

  function openMedia(d: Dish, index: number) {
    setLightbox({ source: d, index });
    trackDishTap(d.id, d.category);
  }

  function openSpecialMedia(s: Special) {
    setLightbox({ source: s, index: 0 });
    trackDishTap(`special-${s.id}`, "special");
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
        ref={scrollRef}
        className="hide-scroll menu-scroll"
        style={{ position: "relative" }}
      >
        <Hero lang={lang} onLang={changeLang} />
        <CategoryNav active={cat} lang={lang} onSelect={changeCat} />

        <SpecialBanner special={special} lang={lang} onOpen={() => openSpecialMedia(special)} />

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
            <DishCard key={dish.id} dish={dish} lang={lang} onOpen={openDish} onOpenMedia={openMedia} />
          ))}
          {list.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--muted-text)", padding: "40px 0", fontSize: "14px" }}>
              {lang === "en" ? "No dishes in this section yet." : "Aún no hay platos en esta sección."}
            </div>
          )}
        </div>

        <div style={{ height: "44px" }} />
      </div>

      <ScrollTopButton onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })} />
      <ReviewCTA lang={lang} href={initial.settings.google_review_url} />
      <DishModal
        dish={modalDish}
        lang={lang}
        suspended={Boolean(lightbox)}
        onClose={() => setModalDish(null)}
        onOpenMedia={openMedia}
      />
      {lightbox && (
        <MediaLightbox
          key={lightbox.source.id}
          source={lightbox.source}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  );
}
