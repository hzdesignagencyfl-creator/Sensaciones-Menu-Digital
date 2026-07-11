"use client";

import type { CSSProperties, ReactNode } from "react";

export type AdminSection =
  | "menu"
  | "special"
  | "availability"
  | "insights"
  | "settings";

const NAV: { id: AdminSection; label: string; icon: ReactNode }[] = [
  {
    id: "menu",
    label: "Menu",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <circle cx="3.5" cy="6" r="1.2" />
        <circle cx="3.5" cy="12" r="1.2" />
        <circle cx="3.5" cy="18" r="1.2" />
      </svg>
    ),
  },
  {
    id: "special",
    label: "Today's Special",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
      </svg>
    ),
  },
  {
    id: "availability",
    label: "Availability",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    id: "insights",
    label: "Insights",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export function Sidebar({
  active,
  onSelect,
  onSignOut,
}: {
  active: AdminSection;
  onSelect: (s: AdminSection) => void;
  onSignOut: () => void;
}) {
  // Both states define the exact same style properties (no shorthand/longhand
  // mixing across rerenders) or React logs a conflicting-style warning when
  // the active item changes. The transparent border keeps the text aligned.
  const itemBase: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    width: "100%",
    textAlign: "left",
    background: "none",
    borderTop: "none",
    borderRight: "none",
    borderBottom: "none",
    borderLeft: "3px solid transparent",
    borderRadius: "9px",
    padding: "11px 13px 11px 10px",
    fontSize: "14px",
    fontWeight: 500,
    color: "rgba(250,247,242,0.72)",
    cursor: "pointer",
  };
  const itemActive: CSSProperties = {
    ...itemBase,
    color: "var(--gold-light)",
    fontWeight: 600,
    background: "rgba(196,163,90,0.16)",
    borderLeft: "3px solid var(--gold-primary)",
  };

  return (
    <aside
      style={{
        flex: "0 0 250px",
        background: "var(--teal-dark)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "24px 20px 18px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo/logo.webp" alt="Sensaciones" style={{ width: "160px", display: "block" }} />
      </div>

      <nav style={{ flex: 1, padding: "8px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => onSelect(n.id)}
            style={n.id === active ? itemActive : itemBase}
          >
            {n.icon}
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(250,247,242,0.1)",
          display: "flex",
          alignItems: "center",
          gap: "11px",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "999px",
            background: "var(--gold-primary)",
            color: "var(--teal-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "15px",
            flex: "0 0 auto",
          }}
        >
          O
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--cream)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Oscar Díaz
          </div>
          <div style={{ fontSize: "11px", color: "rgba(250,247,242,0.55)" }}>Owner</div>
        </div>
        <button
          onClick={onSignOut}
          title="Sign out"
          style={{ background: "none", border: "none", color: "rgba(250,247,242,0.6)", cursor: "pointer", display: "flex", padding: "6px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
