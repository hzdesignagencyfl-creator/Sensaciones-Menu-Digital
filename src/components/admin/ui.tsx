"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export const ui = {
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "var(--teal-mid)",
    color: "var(--cream)",
    border: "none",
    borderRadius: "10px",
    padding: "11px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,
  btnGhost: {
    background: "var(--cream)",
    color: "var(--charcoal)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    padding: "11px 18px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  } as CSSProperties,
  card: {
    background: "var(--cream)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
  } as CSSProperties,
  input: {
    width: "100%",
    padding: "10px 13px",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    fontSize: "14px",
    color: "var(--charcoal)",
    background: "#fff",
  } as CSSProperties,
  label: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--teal-dark)",
    letterSpacing: "0.02em",
    marginBottom: "6px",
  } as CSSProperties,
};

/** Availability / on-off pill toggle (42×24, knob slides). */
export function Toggle({
  on,
  onChange,
  ariaLabel,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={() => onChange(!on)}
      style={{
        width: "42px",
        height: "24px",
        borderRadius: "999px",
        border: "none",
        background: on ? "var(--teal-mid)" : "#CBC6BE",
        position: "relative",
        cursor: "pointer",
        flex: "0 0 auto",
        padding: 0,
        transition: "background 0.2s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          width: "20px",
          height: "20px",
          borderRadius: "999px",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transform: on ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s ease",
        }}
      />
    </button>
  );
}

/** Segmented control (e.g. Visible/Hidden, EN/ES, period filter). */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        background: "var(--cream-bg)",
        borderRadius: "10px",
        padding: "3px",
        gap: "2px",
      }}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "7px 14px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              background: active ? "var(--cream)" : "transparent",
              color: active ? "var(--charcoal)" : "var(--body-text)",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionFade({ children }: { children: ReactNode }) {
  return <div style={{ animation: "fadeUp 0.25s ease" }}>{children}</div>;
}

/** Tag list editor: type + Enter to add a chip, × to remove. */
export function ChipInput({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }
  return (
    <div style={{ ...ui.input, padding: "8px", display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "42px", alignItems: "center" }}>
      {values.map((v) => (
        <span key={v} style={{ background: "var(--chip-bg)", color: "var(--chip-text)", borderRadius: "999px", padding: "4px 11px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {v}
          <button onClick={() => onChange(values.filter((x) => x !== v))} style={{ background: "none", border: "none", color: "var(--teal-mid)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}>×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Type + Enter"
        style={{ border: "none", outline: "none", flex: 1, minWidth: "90px", fontSize: "13px", background: "transparent" }}
      />
    </div>
  );
}
