"use client"; // Error boundaries must be Client Components

import { useEffect, useState } from "react";

/** Branded error screen shown when a page crashes at runtime. */
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const [lang, setLang] = useState<"en" | "es">("en");

  useEffect(() => {
    console.error(error);
  }, [error]);

  // Honor the visitor's saved menu language.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("sensaciones_lang");
      if (stored === "es") {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time storage read
        setLang("es");
      }
    } catch {
      // storage blocked — keep English
    }
  }, []);

  const t =
    lang === "es"
      ? {
          title: "Algo salió mal",
          body: "Ocurrió un error inesperado. Inténtalo de nuevo — el menú sigue disponible.",
          retry: "Reintentar",
          home: "Ir al menú",
        }
      : {
          title: "Something went wrong",
          body: "An unexpected error occurred. Please try again — the menu is still available.",
          retry: "Try again",
          home: "Go to the menu",
        };

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--teal-dark, #2e413d)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "var(--cream, #faf7f2)",
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
            color: "var(--teal-dark, #2e413d)",
          }}
        >
          Sensaciones
        </div>
        <div style={{ fontSize: "34px", margin: "18px 0 6px" }}>🍽️</div>
        <h1
          className="font-display"
          style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "var(--charcoal, #1e1e1e)", textTransform: "uppercase", letterSpacing: "0.02em" }}
        >
          {t.title}
        </h1>
        <p style={{ margin: "10px 0 24px", fontSize: "13.5px", lineHeight: 1.6, color: "var(--body-text, #6b6560)" }}>
          {t.body}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={() => unstable_retry()}
            style={{
              padding: "13px",
              border: "none",
              borderRadius: "12px",
              background: "var(--gold-primary, #c4a35a)",
              color: "var(--teal-dark, #2e413d)",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {t.retry}
          </button>
          <button
            // Full reload on purpose: clears whatever client state crashed.
            onClick={() => window.location.assign("/")}
            style={{
              padding: "13px",
              borderRadius: "12px",
              border: "1px solid var(--border, #ddd9d3)",
              background: "transparent",
              color: "var(--charcoal, #1e1e1e)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.home}
          </button>
        </div>
        {error.digest && (
          <div style={{ marginTop: "18px", fontSize: "10.5px", color: "var(--muted-text, #9c968e)" }}>
            Ref: {error.digest}
          </div>
        )}
      </div>
    </main>
  );
}
