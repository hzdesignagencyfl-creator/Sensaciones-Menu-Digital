"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import {
  type AdminBundle,
  deleteDish,
  loadAdminBundle,
  saveDish,
  saveSettings,
  saveSpecial,
  setAvailability,
} from "@/lib/admin-service";
import type { Dish, Settings, Special } from "@/lib/types";
import { Login } from "./Login";
import { Sidebar, type AdminSection } from "./Sidebar";
import { MenuSection } from "./sections/MenuSection";
import { DishEditForm } from "./sections/DishEditForm";
import { SpecialSection } from "./sections/SpecialSection";
import { AvailabilitySection } from "./sections/AvailabilitySection";
import { SettingsSection } from "./sections/SettingsSection";
import { InsightsSection } from "./sections/InsightsSection";

export function AdminApp() {
  const [signedIn, setSignedIn] = useState(false);
  const [section, setSection] = useState<AdminSection>("menu");
  const [bundle, setBundle] = useState<AdminBundle | null>(null);
  const [editing, setEditing] = useState<Dish | null>(null);
  const [creating, setCreating] = useState(false);

  // Restore an existing Supabase session on load.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      // Preview mode only: `?demo=1` skips the login wall for quick exploring,
      // optional `&section=insights` opens a specific section.
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1") {
        setSignedIn(true);
        const s = params.get("section");
        if (s && ["menu", "special", "availability", "insights", "settings"].includes(s)) {
          setSection(s as AdminSection);
        }
      }
      return;
    }
    void supabase.auth.getSession().then((res: { data: { session: unknown } }) => {
      if (res.data.session) setSignedIn(true);
    });
  }, []);

  const refresh = useCallback(async () => {
    setBundle(await loadAdminBundle());
  }, []);

  useEffect(() => {
    if (signedIn) void refresh();
  }, [signedIn, refresh]);

  async function signOut() {
    const supabase = getSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    setSignedIn(false);
    setBundle(null);
  }

  // ── Mutations (optimistic local update + persist when Supabase present) ──
  function patchDishLocal(dish: Dish) {
    setBundle((b) =>
      b
        ? {
            ...b,
            dishes: b.dishes.some((d) => d.id === dish.id)
              ? b.dishes.map((d) => (d.id === dish.id ? dish : d))
              : [...b.dishes, dish],
          }
        : b,
    );
  }

  async function handleSaveDish(dish: Dish) {
    patchDishLocal(dish);
    setEditing(null);
    setCreating(false);
    try {
      await saveDish(dish);
    } catch (e) {
      console.error(e);
      alert("Could not save to the database. Check your Supabase connection.");
    }
  }

  async function handleDeleteDish(id: string) {
    setBundle((b) => (b ? { ...b, dishes: b.dishes.filter((d) => d.id !== id) } : b));
    setEditing(null);
    try {
      await deleteDish(id);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleAvailability(id: string, available: boolean) {
    setBundle((b) =>
      b
        ? { ...b, dishes: b.dishes.map((d) => (d.id === id ? { ...d, available_today: available } : d)) }
        : b,
    );
    try {
      await setAvailability(id, available);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveSpecial(special: Special) {
    setBundle((b) => (b ? { ...b, special } : b));
    try {
      await saveSpecial(special);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveSettings(settings: Settings) {
    setBundle((b) => (b ? { ...b, settings } : b));
    try {
      await saveSettings(settings);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-shell">
        {/* Browser chrome */}
        <div className="admin-chrome">
          <span className="dot" style={{ background: "#E6817A" }} />
          <span className="dot" style={{ background: "#E6C36A" }} />
          <span className="dot" style={{ background: "#8FC08A" }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <div className="admin-url">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B9490" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              sensaciones.menu/admin
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          {!signedIn ? (
            <Login onSignedIn={() => setSignedIn(true)} />
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex" }}>
              <Sidebar
                active={section}
                onSelect={(s) => {
                  setSection(s);
                  setEditing(null);
                  setCreating(false);
                }}
                onSignOut={signOut}
              />
              <main className="thin-scroll" style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "var(--cream-warm)" }}>
                {!bundle ? (
                  <div style={{ padding: "40px", color: "var(--muted-text)" }}>Loading…</div>
                ) : section === "menu" ? (
                  editing || creating ? (
                    <DishEditForm
                      dish={editing}
                      existingIds={bundle.dishes.map((d) => d.id)}
                      onCancel={() => {
                        setEditing(null);
                        setCreating(false);
                      }}
                      onSave={handleSaveDish}
                      onDelete={handleDeleteDish}
                    />
                  ) : (
                    <MenuSection
                      dishes={bundle.dishes}
                      source={bundle.source}
                      onEdit={(d) => setEditing(d)}
                      onAddNew={() => setCreating(true)}
                      onToggleAvailability={handleToggleAvailability}
                      onDelete={handleDeleteDish}
                    />
                  )
                ) : section === "special" ? (
                  <SpecialSection special={bundle.special} onSave={handleSaveSpecial} />
                ) : section === "availability" ? (
                  <AvailabilitySection dishes={bundle.dishes} onToggle={handleToggleAvailability} />
                ) : section === "settings" ? (
                  <SettingsSection settings={bundle.settings} onSave={handleSaveSettings} />
                ) : (
                  <InsightsSection dishes={bundle.dishes} />
                )}
              </main>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
