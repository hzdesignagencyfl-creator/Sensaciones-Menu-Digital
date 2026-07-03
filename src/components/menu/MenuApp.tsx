"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  trackCatView,
  trackDishTap,
  trackLangSet,
  trackMenuOpen,
} from "@/lib/analytics";
import type { MenuData } from "@/lib/data-service";
import type { CategoryId, Dish, Lang, Special } from "@/lib/types";
import { BottomNav, type NavTab } from "./BottomNav";
import { CategoriesView } from "./CategoriesView";
import { CategoryView } from "./CategoryView";
import { Cover } from "./Cover";
import { DishDetail } from "./DishDetail";
import { Home } from "./Home";
import { MediaLightbox } from "./MediaLightbox";

const LANG_KEY = "sensaciones_lang";
const COVER_KEY = "sensaciones_cover_seen";

/** Client-side view machine; screens are synced with browser history so the
 *  phone's back gesture walks detail → category → home instead of leaving. */
type View =
  | { screen: "home" }
  | { screen: "categories" }
  | { screen: "category"; cat: CategoryId }
  | { screen: "detail"; dishId: string };

export function MenuApp({ initial }: { initial: MenuData }) {
  const [lang, setLang] = useState<Lang>(initial.settings.default_lang);
  const [view, setView] = useState<View>({ screen: "home" });
  // Cover renders as an overlay above Home (SSR keeps serving menu content).
  const [coverOpen, setCoverOpen] = useState(true);
  const [dishes, setDishes] = useState<Dish[]>(initial.dishes);
  const [special, setSpecial] = useState<Special>(initial.special);
  const [lightbox, setLightbox] = useState<{ source: Dish | Special; index: number } | null>(null);
  const didOpen = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // menu_open once per session
  useEffect(() => {
    if (didOpen.current) return;
    didOpen.current = true;
    trackMenuOpen();
  }, []);

  // Cover: once per session.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(COVER_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCoverOpen(false);
      }
    } catch {
      // storage blocked — keep showing the cover this load
    }
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

  // History integration: seed the initial entry, then mirror popstate → view.
  useEffect(() => {
    window.history.replaceState({ menuView: { screen: "home" } }, "");
    const onPop = (e: PopStateEvent) => {
      const v = (e.state?.menuView as View | undefined) ?? { screen: "home" };
      setView(v);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Each screen change starts at the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [view]);

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

  function navigate(v: View) {
    setView(v);
    window.history.pushState({ menuView: v }, "");
  }

  function goBack() {
    window.history.back();
  }

  function enterMenu() {
    setCoverOpen(false);
    try {
      window.sessionStorage.setItem(COVER_KEY, "1");
    } catch {
      // storage blocked — cover will show again next load
    }
  }

  function openCategory(cat: CategoryId) {
    navigate({ screen: "category", cat });
    trackCatView(cat);
  }

  function openDish(d: Dish) {
    navigate({ screen: "detail", dishId: d.id });
    trackDishTap(d.id, d.category);
  }

  function openMedia(d: Dish, index: number) {
    setLightbox({ source: d, index });
  }

  function openSpecialMedia(s: Special) {
    if (!s.photo_url) return;
    setLightbox({ source: s, index: 0 });
    trackDishTap(`special-${s.id}`, "special");
  }

  const visible = useMemo(
    () => dishes.filter((d) => d.status === "visible"),
    [dishes],
  );

  // Detail dish is derived from live state so realtime edits show instantly.
  const detailDish =
    view.screen === "detail" ? visible.find((d) => d.id === view.dishId) : undefined;

  const navTab: NavTab = view.screen === "categories" ? "categories" : "home";
  const showNav = view.screen !== "detail" || !detailDish;

  return (
    <div className="menu-shell">
      <div ref={scrollRef} className="hide-scroll menu-scroll" style={{ position: "relative" }}>
        {view.screen === "home" && (
          <Home
            dishes={visible}
            special={special}
            lang={lang}
            onLang={changeLang}
            onOpenCategory={openCategory}
            onOpenDish={openDish}
            onOpenSpecial={() => openSpecialMedia(special)}
          />
        )}
        {view.screen === "categories" && (
          <CategoriesView dishes={visible} lang={lang} onBack={goBack} onOpenCategory={openCategory} />
        )}
        {view.screen === "category" && (
          <CategoryView cat={view.cat} dishes={visible} lang={lang} onBack={goBack} onOpenDish={openDish} />
        )}
        {view.screen === "detail" &&
          (detailDish ? (
            <DishDetail dish={detailDish} lang={lang} onBack={goBack} onOpenMedia={openMedia} />
          ) : (
            // Dish was hidden/deleted while open — fall back to Home content.
            <Home
              dishes={visible}
              special={special}
              lang={lang}
              onLang={changeLang}
              onOpenCategory={openCategory}
              onOpenDish={openDish}
              onOpenSpecial={() => openSpecialMedia(special)}
            />
          ))}
      </div>

      {showNav && (
        <BottomNav
          active={navTab}
          lang={lang}
          reviewUrl={initial.settings.google_review_url}
          onSelect={(tab) => {
            if (tab === "home") {
              if (view.screen !== "home") navigate({ screen: "home" });
            } else if (view.screen !== "categories") {
              navigate({ screen: "categories" });
            }
          }}
        />
      )}

      {lightbox && (
        <MediaLightbox
          key={lightbox.source.id}
          source={lightbox.source}
          initialIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}

      {coverOpen && <Cover lang={lang} onLang={changeLang} onEnter={enterMenu} />}
    </div>
  );
}
