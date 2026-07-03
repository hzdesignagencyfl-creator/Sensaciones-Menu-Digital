"use client";

/** Inner-screen header: back arrow, centered condensed title, optional action slot. */
export function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "14px 12px",
        background: "rgba(250,247,242,0.96)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <button
        onClick={onBack}
        aria-label="Back"
        style={{
          width: "38px",
          height: "38px",
          border: "none",
          borderRadius: "999px",
          background: "transparent",
          color: "var(--charcoal)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flex: "0 0 auto",
        }}
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      </button>
      <h1
        className="font-display"
        style={{
          flex: 1,
          margin: 0,
          textAlign: "center",
          fontSize: "21px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: "var(--charcoal)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </h1>
      <div style={{ width: "38px", flex: "0 0 auto", display: "flex", justifyContent: "flex-end" }}>
        {action}
      </div>
    </div>
  );
}
