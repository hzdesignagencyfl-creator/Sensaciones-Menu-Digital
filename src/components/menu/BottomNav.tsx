"use client";

import { STR } from "@/lib/data/menu-meta";
import { safeExternalUrl } from "@/lib/format";
import type { Lang } from "@/lib/types";

export type NavTab = "home" | "categories" | "favorites";

/** Floating dark pill navigation: Home, Categories, My Picks, Google review. */
export function BottomNav({
  active,
  lang,
  favCount,
  reviewUrl,
  onSelect,
}: {
  active: NavTab;
  lang: Lang;
  favCount: number;
  reviewUrl: string;
  onSelect: (tab: NavTab) => void;
}) {
  const t = STR[lang];
  const safeReviewUrl = safeExternalUrl(reviewUrl);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "18px",
        display: "flex",
        justifyContent: "center",
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <nav
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(30,42,39,0.92)",
          borderRadius: "999px",
          padding: "7px",
          boxShadow: "0 12px 32px rgba(20,28,26,0.45)",
          backdropFilter: "blur(8px)",
        }}
      >
        <NavItem
          label={t.home}
          active={active === "home"}
          onClick={() => onSelect("home")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
              <path d="M9 22V12h6v10" />
            </svg>
          }
        />
        <NavItem
          label={t.categories}
          active={active === "categories"}
          onClick={() => onSelect("categories")}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          }
        />
        <NavItem
          label={t.favs}
          active={active === "favorites"}
          onClick={() => onSelect("favorites")}
          badge={favCount}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill={favCount > 0 ? "var(--gold-light)" : "none"} stroke={favCount > 0 ? "var(--gold-light)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
          }
        />
        {safeReviewUrl && (
          <a
            href={safeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.review}
            title={t.review}
            style={{ ...itemStyle(false), textDecoration: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold-light)" stroke="var(--gold-light)" strokeWidth="1" strokeLinejoin="round">
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
            </svg>
          </a>
        )}
      </nav>
    </div>
  );
}

function itemStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    border: "none",
    borderRadius: "999px",
    padding: "10px 15px",
    background: active ? "var(--cream)" : "transparent",
    color: active ? "var(--teal-dark)" : "rgba(250,247,242,0.82)",
    fontFamily: "var(--font-body-stack)",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease",
  };
}

function NavItem({
  label,
  icon,
  active,
  badge = 0,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{ ...itemStyle(active), position: "relative" }}>
      {icon}
      {/* Collapse inactive labels so the pill stays compact like the reference */}
      {active && <span>{label}</span>}
      {badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: "2px",
            right: active ? "2px" : "5px",
            minWidth: "16px",
            height: "16px",
            borderRadius: "999px",
            background: "var(--gold-primary)",
            color: "var(--teal-dark)",
            fontSize: "10px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
          }}
        >
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
