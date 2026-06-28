"use client";

import { useMemo, useState } from "react";
import { categoryLabel } from "@/lib/data/menu-meta";
import type { Dish } from "@/lib/types";
import { Thumb } from "../Thumb";
import { Toggle } from "../ui";

export function AvailabilitySection({
  dishes,
  onToggle,
}: {
  dishes: Dish[];
  onToggle: (id: string, available: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const q = search.trim().toLowerCase();

  const list = useMemo(
    () =>
      [...dishes]
        .filter((d) => d.status === "visible")
        .filter((d) => !q || `${d.name_en} ${d.name_es}`.toLowerCase().includes(q))
        .sort((a, b) => a.sort_order - b.sort_order),
    [dishes, q],
  );

  const available = list.filter((d) => d.available_today).length;
  const off = list.length - available;

  return (
    <div style={{ padding: "28px 32px 40px", animation: "fadeUp 0.25s ease" }}>
      <h1 style={{ margin: 0, fontSize: "23px", fontWeight: 700, color: "var(--charcoal)" }}>Availability</h1>
      <div style={{ fontSize: "13px", marginTop: "4px" }}>
        <span style={{ color: "var(--status-avail)", fontWeight: 600 }}>{available} available</span>
        <span style={{ color: "var(--muted-text)" }}> · </span>
        <span style={{ color: "var(--gold-dark)", fontWeight: 600 }}>{off} off today</span>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search dishes…"
        style={{ width: "100%", maxWidth: "380px", padding: "10px 14px", border: "1px solid var(--border)", borderRadius: "10px", fontSize: "14px", background: "var(--cream)", margin: "18px 0 22px" }}
      />

      <div style={{ background: "var(--cream)", border: "1px solid var(--border)", borderRadius: "14px", overflow: "hidden" }}>
        {list.map((d, i) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "11px 18px",
              borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
            }}
          >
            <Thumb src={d.photo_url} alt={d.name_en} w={48} h={38} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--charcoal)" }}>{d.name_en}</div>
              <div style={{ fontSize: "12px", color: "var(--body-text)" }}>{categoryLabel(d.category, "en")}</div>
            </div>
            <span style={{ fontSize: "12.5px", fontWeight: 600, color: d.available_today ? "var(--status-avail)" : "var(--gold-dark)", width: "100px", textAlign: "right", flex: "0 0 auto" }}>
              {d.available_today ? "Available" : "Off today"}
            </span>
            <Toggle on={d.available_today} onChange={(v) => onToggle(d.id, v)} ariaLabel="Available today" />
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ padding: "24px", textAlign: "center", color: "var(--muted-text)", fontSize: "14px" }}>No dishes found.</div>
        )}
      </div>
    </div>
  );
}
