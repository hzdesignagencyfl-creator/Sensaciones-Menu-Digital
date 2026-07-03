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
import { SpecialDetail } from "./SpecialDetail";

const LANG_KEY = "sensaciones_lang";
const COVER_KEY = "sensaciones_cover_seen";

/** Client-side view machine. The view is encoded in the URL hash (#cat=…,
 *  #dish=…) rather than in history state: Next's App Router owns and rewrites
 *  history state objects, but it leaves the hash alone — so the phone's back
 *  gesture walks detail → category → home reliably, and dish links are
 *  shareable. */
type View =
  | { screen: "home" }
  | { screen: "categories" }
  | { screen: "category"; cat: CategoryId }
  | { screen: "detail"; dishId: string }
  | { screen: "special" };

const CATEGORY_IDS: CategoryId[] = [
  "popular", "breakfast", "appetizers", "soups", "sandwiches", "pastas",
  "entrees", "lunch", "kids", "sides", "desserts", "drinks",
];

function viewToHash(v: View): string {
  switch (v.screen) {
    case "categories": return "#categories";
    case "category": return `#cat=${v.cat}`;
    case "detail": return `#dish=${encodeURIComponent(v.dishId)}`;
    case "special": return "#special";
    default: return "#home";
  }
}

function hashToView(hash: string): View {
  const h = hash.replace(/^#/, "");
  if (h === "categories") return { screen: "categories" };
  if (h === "special") return { screen: "special" };
  if (h.startsWith("cat=")) {
    const cat = h.slice(4) as CategoryId;
    if (CATEGORY_IDS.includes(cat)) return { screen: "category", cat };
  }
  if (h.startsWith("dish=")) {
    return { screen: "detail", dishId: decodeURIComponent(h.slice(5)) };
  }
  return { screen: "home" };
}

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
  // How many in-app navigations we have pushed; guards goBack on deep links.
  const depthRef = useRef(0);

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

  // URL-hash routing: the hash is the single source of truth for the view.
  // Covers our own navigations, back/forward gestures, and shared #dish links.
  useEffect(() => {
    const sync = () => {
      setView(hashToView(window.location.hash));
    };
    sync(); // honor a deep link on first load
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
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
    const hash = viewToHash(v);
    if (window.location.hash === hash) return;
    depthRef.current += 1;
    // Assigning the hash pushes a history entry; the hashchange listener
    // updates the view, keeping URL and UI in lockstep.
    window.location.hash = hash;
  }

  function goBack() {
    if (depthRef.current > 0) {
      depthRef.current -= 1;
      window.history.back();
    } else {
      // Landed directly on a deep link — back should go home, not leave the site.
      navigate({ screen: "home" });
    }
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

  function openSpecial(s: Special) {
    navigate({ screen: "special" });
    trackDishTap(`special-${s.id}`, "special");
  }

  const visible = useMemo(
    () => dishes.filter((d) => d.status === "visible"),
    [dishes],
  );

  // Detail dish is derived from live state so realtime edits show instantly.
  const detailDish =
    view.screen === "detail" ? visible.find((d) => d.id === view.dishId) : undefined;
  // If the admin deactivates the special while someone is viewing it, fall back home.
  const specialOpen = view.screen === "special" && special.active;

  const navTab: NavTab = view.screen === "categories" ? "categories" : "home";
  // Hidden on detail screens and while the welcome cover is up.
  const showNav =
    !coverOpen && !specialOpen && (view.screen !== "detail" || !detailDish);

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
            onOpenSpecial={() => openSpecial(special)}
          />
        )}
        {view.screen === "categories" && (
          <CategoriesView dishes={visible} lang={lang} onBack={goBack} onOpenCategory={openCategory} />
        )}
        {view.screen === "category" && (
          <CategoryView cat={view.cat} dishes={visible} lang={lang} onBack={goBack} onOpenDish={openDish} />
        )}
        {view.screen === "special" && specialOpen && (
          <SpecialDetail
            special={special}
            lang={lang}
            onBack={goBack}
            onOpenMedia={() => setLightbox({ source: special, index: 0 })}
          />
        )}
        {view.screen === "special" && !specialOpen && (
          <Home
            dishes={visible}
            special={special}
            lang={lang}
            onLang={changeLang}
            onOpenCategory={openCategory}
            onOpenDish={openDish}
            onOpenSpecial={() => openSpecial(special)}
          />
        )}
        {view.screen === "detail" &&
          (detailDish ? (
            <DishDetail
              key={detailDish.id}
              dish={detailDish}
              dishes={visible}
              lang={lang}
              onBack={goBack}
              onOpenMedia={openMedia}
              onOpenDish={openDish}
            />
          ) : (
            // Dish was hidden/deleted while open — fall back to Home content.
            <Home
              dishes={visible}
              special={special}
              lang={lang}
              onLang={changeLang}
              onOpenCategory={openCategory}
              onOpenDish={openDish}
              onOpenSpecial={() => openSpecial(special)}
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
