"use client"; // Error boundaries must be Client Components

/**
 * Last-resort error UI: replaces the root layout when it crashes, so it must
 * render its own <html>/<body> and cannot rely on globals.css being loaded.
 */
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2e413d",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "380px",
            background: "#faf7f2",
            borderRadius: "18px",
            padding: "34px 30px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: 700, letterSpacing: "0.08em", color: "#2e413d" }}>
            SENSACIONES
          </div>
          <h1 style={{ margin: "16px 0 8px", fontSize: "22px", color: "#1e1e1e" }}>
            Something went wrong
          </h1>
          <p style={{ margin: "0 0 22px", fontSize: "14px", lineHeight: 1.6, color: "#6b6560" }}>
            Ocurrió un error inesperado. / An unexpected error occurred.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              width: "100%",
              padding: "13px",
              border: "none",
              borderRadius: "12px",
              background: "#c4a35a",
              color: "#2e413d",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Reintentar / Try again
          </button>
          {error.digest && (
            <div style={{ marginTop: "16px", fontSize: "10.5px", color: "#9c968e" }}>
              Ref: {error.digest}
            </div>
          )}
        </div>
      </body>
    </html>
  );
}
