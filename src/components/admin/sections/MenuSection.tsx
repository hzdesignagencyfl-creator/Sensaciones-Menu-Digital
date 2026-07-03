"use client";

import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/data/menu-meta";
import { formatAmount } from "@/lib/format";
import type { CategoryId, Dish } from "@/lib/types";
import { Thumb } from "../Thumb";
import { Toggle, ui } from "../ui";

const GROUPS = CATEGORIES.filter((c) => c.id !== "popular");

export function MenuSection({
  dishes,
  source,
  onEdit,
  onAddNew,
  onToggleAvailability,
  onDelete,
  onReorder,
  onDuplicate,
}: {
  dishes: Dish[];
  source: "supabase" | "local";
  onEdit: (d: Dish) => void;
  onAddNew: () => void;
  onToggleAvailability: (id: string, available: boolean) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, insertAt: number) => void;
  onDuplicate: (d: Dish) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({ breakfast: true });
  // Drag & drop reordering state (constrained to one category at a time).
  const [drag, setDrag] = useState<{ id: string; cat: CategoryId } | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);

  const q = search.trim().toLowerCase();
  const byCat = useMemo(() => {
    const map = new Map<CategoryId, Dish[]>();
    for (const g of GROUPS) map.set(g.id, []);
    for (const d of [...dishes].sort((a, b) => a.sort_order - b.sort_order)) {
      if (q && !`${d.name_en} ${d.name_es}`.toLowerCase().includes(q)) continue;
      map.get(d.category)?.push(d);
    }
    return map;
  }, [dishes, q]);

  const visibleCount = dishes.filter((d) => d.status === "visible").length;

  return (
    <div style={{ padding: "28px 32px 40px", animation: "fadeUp 0.25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", marginBottom: "6px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "23px", fontWeight: 700, color: "var(--charcoal)" }}>Menu</h1>
          <div style={{ fontSize: "13px", color: "var(--body-text)", marginTop: "3px" }}>
            {dishes.length} dishes · {visibleCount} visible
            {source === "local" && (
              <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}> · preview mode (not saved)</span>
            )}
          </div>
        </div>
        <button onClick={onAddNew} style={ui.btnPrimary}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add new dish
        </button>
      </div>

      <div style={{ position: "relative", margin: "18px 0 22px", maxWidth: "380px" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="2" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes…"
          style={{ ...ui.input, padding: "10px 14px 10px 38px", background: "var(--cream)" }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {GROUPS.map((g) => {
          const list = byCat.get(g.id) ?? [];
          if (q && list.length === 0) return null;
          const isOpen = q ? true : Boolean(open[g.id]);
          return (
            <div key={g.id} style={{ ...ui.card, overflow: "hidden" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", cursor: "pointer" }}
                onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))}
              >
                <span style={{ display: "inline-flex", transition: "transform 0.2s ease", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--charcoal)" }}>{g.en}</span>
                <span style={{ background: "var(--cream-warm)", borderRadius: "999px", padding: "2px 9px", fontSize: "12px", color: "var(--body-text)" }}>
                  {list.length}
                </span>
                <span style={{ flex: 1 }} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNew();
                  }}
                  style={{ background: "none", border: "none", color: "var(--gold-dark)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                >
                  + Add
                </button>
              </div>

              {isOpen && (
                <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  {list.map((d, i) => (
                    <DishRow
                      key={d.id}
                      dish={d}
                      // While searching the list is filtered, so drop
                      // positions are misleading — disable reordering.
                      draggable={!q}
                      dragging={drag?.id === d.id}
                      dropBefore={drag?.cat === g.id && dropAt === i}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", d.id);
                        setDrag({ id: d.id, cat: g.id });
                      }}
                      onDragOver={(e) => {
                        if (drag?.cat !== g.id) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        const rect = e.currentTarget.getBoundingClientRect();
                        const after = e.clientY > rect.top + rect.height / 2;
                        setDropAt(i + (after ? 1 : 0));
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (drag?.cat === g.id && dropAt !== null) onReorder(drag.id, dropAt);
                        setDrag(null);
                        setDropAt(null);
                      }}
                      onDragEnd={() => {
                        setDrag(null);
                        setDropAt(null);
                      }}
                      onDuplicate={() => onDuplicate(d)}
                      onEdit={() => onEdit(d)}
                      onToggle={(v) => onToggleAvailability(d.id, v)}
                      onDelete={() => {
                        if (confirm(`Delete "${d.name_en}"?`)) onDelete(d.id);
                      }}
                    />
                  ))}
                  {/* Drop line after the last row */}
                  {drag?.cat === g.id && dropAt === list.length && (
                    <div style={{ height: "2px", background: "var(--gold-primary)", margin: "0 18px" }} />
                  )}
                  {list.length === 0 && (
                    <div style={{ padding: "16px 18px", fontSize: "13px", color: "var(--muted-text)" }}>No dishes yet.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DishRow({
  dish,
  draggable,
  dragging,
  dropBefore,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDuplicate,
  onEdit,
  onToggle,
  onDelete,
}: {
  dish: Dish;
  draggable: boolean;
  dragging: boolean;
  dropBefore: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDuplicate: () => void;
  onEdit: () => void;
  onToggle: (v: boolean) => void;
  onDelete: () => void;
}) {
  const active = dish.status === "visible";
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "12px 18px",
        borderTop: dropBefore ? "2px solid var(--gold-primary)" : "1px solid var(--border-subtle)",
        opacity: dragging ? 0.35 : 1,
        cursor: draggable ? "grab" : "default",
        background: dragging ? "var(--cream-warm)" : undefined,
      }}
    >
      <span title="Drag to reorder" style={{ flex: "0 0 auto", display: "flex", color: "#B8B2A9" }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="5" r="1.6" />
          <circle cx="15" cy="5" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="19" r="1.6" />
          <circle cx="15" cy="19" r="1.6" />
        </svg>
      </span>
      <Thumb src={dish.photo_url} alt={dish.name_en} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: "14.5px", fontWeight: 600, color: "var(--charcoal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {dish.name_en}
        </div>
        <div style={{ fontSize: "12px", color: "var(--body-text)" }}>{dish.name_es}</div>
      </div>
      <div style={{ width: "96px", fontSize: "14px", fontWeight: 600, color: "var(--gold-primary)", flex: "0 0 auto" }}>
        {dish.market_price || dish.price == null ? "MKP" : "$" + formatAmount(dish.price)}
      </div>
      <span
        style={{
          flex: "0 0 auto",
          fontSize: "11px",
          fontWeight: 600,
          padding: "3px 10px",
          borderRadius: "999px",
          background: active ? "var(--status-avail-bg)" : "#E8E6E2",
          color: active ? "var(--status-avail)" : "var(--body-text)",
        }}
      >
        {active ? "Active" : "Hidden"}
      </span>
      <Toggle on={dish.available_today} onChange={onToggle} ariaLabel="Available today" />
      <button onClick={onEdit} title="Edit" style={iconBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
      </button>
      <button onClick={onDuplicate} title="Duplicate" style={iconBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B6560" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
      <button onClick={onDelete} title="Delete" style={{ ...iconBtn, background: "var(--error-bg)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C0524A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  flex: "0 0 auto",
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  border: "1px solid var(--border)",
  background: "var(--cream)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};
