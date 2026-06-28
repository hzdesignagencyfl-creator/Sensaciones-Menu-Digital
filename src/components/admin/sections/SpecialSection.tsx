"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SpecialBanner } from "@/components/menu/SpecialBanner";
import type { Special } from "@/lib/types";
import { Segmented, Toggle, ui } from "../ui";

export function SpecialSection({
  special,
  onSave,
}: {
  special: Special;
  onSave: (s: Special) => void;
}) {
  const [form, setForm] = useState<Special>({ ...special });
  const [lang, setLang] = useState<"en" | "es">("en");
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Special>(key: K, value: Special[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function upload(file: File) {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      set("photo_url", URL.createObjectURL(file));
      return;
    }
    setUploading(true);
    try {
      const path = `special-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("dish-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      set("photo_url", supabase.storage.from("dish-photos").getPublicUrl(path).data.publicUrl);
    } catch (e) {
      console.error(e);
      alert("Upload failed. Make sure the storage bucket exists (see SETUP.md).");
    } finally {
      setUploading(false);
    }
  }

  function save() {
    onSave(form);
    setSaved(true);
  }

  return (
    <div style={{ padding: "28px 32px 40px", animation: "fadeUp 0.25s ease" }}>
      <h1 style={{ margin: "0 0 20px", fontSize: "23px", fontWeight: 700, color: "var(--charcoal)" }}>Today&apos;s Special</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Form */}
        <div style={{ ...ui.card, padding: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--charcoal)" }}>Show banner on menu</div>
              <div style={{ fontSize: "12.5px", color: "var(--body-text)" }}>Appears at the top of the public menu</div>
            </div>
            <Toggle on={form.active} onChange={(v) => set("active", v)} ariaLabel="Show banner" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <Field label="Name (EN)">
              <input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} style={ui.input} />
            </Field>
            <Field label="Name (ES)">
              <input value={form.name_es} onChange={(e) => set("name_es", e.target.value)} style={ui.input} />
            </Field>
          </div>
          <Field label="Description (EN)">
            <textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)} rows={2} style={ui.input} />
          </Field>
          <Field label="Description (ES)">
            <textarea value={form.description_es} onChange={(e) => set("description_es", e.target.value)} rows={2} style={ui.input} />
          </Field>
          <Field label="Price">
            <div style={{ position: "relative", width: "160px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--body-text)" }}>$</span>
              <input
                type="number"
                step="0.01"
                value={form.price ?? ""}
                onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
                style={{ ...ui.input, paddingLeft: "24px" }}
              />
            </div>
          </Field>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <button onClick={save} style={ui.btnPrimary} disabled={uploading}>Save special</button>
            {saved && <span style={{ color: "var(--status-avail)", fontSize: "13px", fontWeight: 600 }}>Saved ✓</span>}
          </div>
        </div>

        {/* Preview + photo upload */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ ...ui.card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--charcoal)" }}>Live preview</div>
              <Segmented value={lang} onChange={setLang} options={[{ value: "en", label: "EN" }, { value: "es", label: "ES" }]} />
            </div>
            <div style={{ width: "100%", maxWidth: "358px", margin: "0 auto" }}>
              <SpecialBanner special={{ ...form, active: true }} lang={lang} />
            </div>
          </div>

          <div style={{ ...ui.card, padding: "16px 18px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "12px" }}>Banner photo</div>
            {form.photo_url ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.photo_url} alt="banner" style={{ width: "100%", height: "118px", objectFit: "cover", borderRadius: "10px" }} />
                <button onClick={() => set("photo_url", null)} style={{ background: "none", border: "none", color: "var(--error)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", marginTop: "8px", padding: 0 }}>
                  Remove
                </button>
              </div>
            ) : (
              <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", height: "90px", border: "2px dashed #CFC9C1", borderRadius: "10px", cursor: "pointer", color: "var(--body-text)", fontSize: "12.5px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9C968E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {uploading ? "Uploading…" : "Upload banner photo"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
              </label>
            )}
          </div>
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
