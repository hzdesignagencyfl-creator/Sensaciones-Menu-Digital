"use client";

import { useState } from "react";
import type { Lang, Settings } from "@/lib/types";
import { Segmented, ui } from "../ui";

export function SettingsSection({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
}) {
  const [form, setForm] = useState<Settings>({ ...settings });
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  return (
    <div style={{ padding: "28px 32px 40px", animation: "fadeUp 0.25s ease", maxWidth: "640px" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: "23px", fontWeight: 700, color: "var(--charcoal)" }}>Settings</h1>

      <div style={{ ...ui.card, padding: "22px" }}>
        <Field label="Restaurant name">
          <input value={form.restaurant_name} onChange={(e) => set("restaurant_name", e.target.value)} style={ui.input} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <Field label="WhatsApp">
            <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+1 239 …" style={ui.input} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 239 …" style={ui.input} />
          </Field>
        </div>
        <Field label="Google review URL">
          <input value={form.google_review_url} onChange={(e) => set("google_review_url", e.target.value)} style={ui.input} />
        </Field>
        <Field label="Default menu language">
          <Segmented
            value={form.default_lang}
            onChange={(v) => set("default_lang", v as Lang)}
            options={[{ value: "en", label: "English" }, { value: "es", label: "Español" }]}
          />
        </Field>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
          <button onClick={() => { onSave(form); setSaved(true); }} style={ui.btnPrimary}>Save settings</button>
          {saved && <span style={{ color: "var(--status-avail)", fontSize: "13px", fontWeight: 600 }}>Saved ✓</span>}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={ui.label}>{label}</label>
      {children}
    </div>
  );
}
