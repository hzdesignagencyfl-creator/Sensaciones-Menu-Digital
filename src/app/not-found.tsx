import Link from "next/link";

/** Branded 404 — anything that isn't / or /admin lands here. */
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--teal-dark)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "var(--cream)",
          borderRadius: "18px",
          padding: "34px 30px",
          textAlign: "center",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div
          className="font-display"
          style={{
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--teal-dark)",
          }}
        >
          Sensaciones
        </div>
        <div className="font-display" style={{ fontSize: "56px", fontWeight: 700, color: "var(--gold-primary)", margin: "10px 0 2px" }}>
          404
        </div>
        <p style={{ margin: "6px 0 24px", fontSize: "13.5px", lineHeight: 1.6, color: "var(--body-text)" }}>
          Esta página no existe. / This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          style={{
            display: "block",
            padding: "13px",
            borderRadius: "12px",
            background: "var(--gold-primary)",
            color: "var(--teal-dark)",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Ir al menú / Go to the menu
        </Link>
      </div>
    </main>
  );
}
