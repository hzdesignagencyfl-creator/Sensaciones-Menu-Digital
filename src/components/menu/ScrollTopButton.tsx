"use client";

/** Floating scroll-to-top button, shown once the page has been scrolled. */
export function ScrollTopButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Scroll to top"
      style={{
        position: "absolute",
        right: "14px",
        bottom: "86px",
        zIndex: 28,
        width: "42px",
        height: "42px",
        borderRadius: "999px",
        border: "none",
        background: "rgba(30,42,39,0.92)",
        color: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 8px 22px rgba(46,65,61,0.42)",
        backdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
