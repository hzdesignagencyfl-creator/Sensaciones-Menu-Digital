import { STR } from "@/lib/data/menu-meta";
import type { Lang } from "@/lib/types";

export function ReviewCTA({ lang, href }: { lang: Lang; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "absolute",
        right: "16px",
        bottom: "24px",
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        gap: "9px",
        padding: "13px 20px",
        borderRadius: "999px",
        background: "var(--teal-mid)",
        color: "var(--cream)",
        textDecoration: "none",
        boxShadow: "0 8px 22px rgba(46,65,61,0.42)",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#E6CE96" stroke="#E6CE96" strokeWidth="1" strokeLinejoin="round">
        <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9" />
      </svg>
      <span>{STR[lang].review}</span>
    </a>
  );
}
