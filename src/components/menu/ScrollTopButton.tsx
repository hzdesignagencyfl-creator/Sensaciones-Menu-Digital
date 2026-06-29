export function ScrollTopButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Scroll to top"
      style={{
        position: "absolute",
        right: "16px",
        bottom: "82px",
        zIndex: 25,
        width: "44px",
        height: "44px",
        borderRadius: "999px",
        border: "none",
        background: "var(--teal-dark)",
        color: "var(--cream)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 8px 22px rgba(46,65,61,0.42)",
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
