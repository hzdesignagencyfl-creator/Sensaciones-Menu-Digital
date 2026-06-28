"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = getSupabaseBrowser();
  const demoMode = !supabase;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (demoMode) {
        // No Supabase yet → preview mode. Accept any non-empty credentials.
        if (!email || !password) {
          setError("Enter any email and password to preview.");
        } else {
          onSignedIn();
        }
        return;
      }
      const { error } = await supabase!.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        onSignedIn();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--teal-dark)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 1, width: "380px", maxWidth: "90%", textAlign: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo/logo.webp"
          alt="Sensaciones"
          style={{ width: "236px", maxWidth: "80%", margin: "0 auto 30px", display: "block" }}
        />
        <form
          onSubmit={submit}
          style={{
            background: "var(--cream)",
            borderRadius: "16px",
            padding: "30px 28px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "4px" }}>
            Sign in
          </div>
          <div style={{ fontSize: "13px", color: "var(--body-text)", marginBottom: "22px" }}>
            Manage your menu, specials and availability.
          </div>

          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--teal-dark)", marginBottom: "6px" }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            style={{
              width: "100%",
              padding: "11px 13px",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontSize: "14px",
              color: "var(--charcoal)",
              background: "#fff",
              marginBottom: "16px",
            }}
          />

          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--teal-dark)", marginBottom: "6px" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            style={{
              width: "100%",
              padding: "11px 13px",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              fontSize: "14px",
              color: "var(--charcoal)",
              background: "#fff",
              marginBottom: error ? "10px" : "22px",
            }}
          />

          {error && (
            <div style={{ color: "var(--error)", fontSize: "12.5px", marginBottom: "16px" }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "13px",
              background: "var(--teal-mid)",
              color: "var(--cream)",
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: busy ? "default" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          {demoMode && (
            <div style={{ fontSize: "11.5px", color: "var(--muted-text)", marginTop: "14px", textAlign: "center" }}>
              Preview mode · connect Supabase to enable real accounts
            </div>
          )}
        </form>
        <div style={{ fontSize: "11px", color: "rgba(250,247,242,0.5)", marginTop: "20px", letterSpacing: "0.04em" }}>
          Sensaciones Admin · powered by Local Brand Boosters
        </div>
      </div>
    </div>
  );
}
