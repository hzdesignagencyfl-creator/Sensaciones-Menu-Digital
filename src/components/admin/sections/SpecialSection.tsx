"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { SpecialBanner } from "@/components/menu/SpecialBanner";
import { compressImage } from "@/lib/image";
import { safeStorageName } from "@/lib/slug";
import type { Special } from "@/lib/types";
import { ChipInput, Segmented, Toggle, ui } from "../ui";

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

  async function upload(rawFile: File, kind: "image" | "video") {
    // Every menu visitor downloads these — refuse unreasonable sizes up front.
    const maxMb = kind === "image" ? 15 : 60;
    if (rawFile.size > maxMb * 1024 * 1024) {
      alert(`File is too large (max ${maxMb} MB for ${kind === "image" ? "photos" : "videos"}).`);
      return;
    }
    const field = kind === "image" ? "photo_url" : "video_url";
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      set(field, URL.createObjectURL(rawFile));
      return;
    }
    setUploading(true);
    try {
      // Photos get resized/re-encoded client-side; videos upload as-is.
      const file = kind === "image" ? await compressImage(rawFile) : rawFile;
      const bucket = kind === "image" ? "dish-photos" : "dish-videos";
      const path = `special-${Date.now()}-${safeStorageName(file.name)}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      set(field, supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl);
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Ingredients (EN)">
              <ChipInput values={form.ingredients_en ?? []} onChange={(v) => set("ingredients_en", v)} />
            </Field>
            <Field label="Ingredients (ES)">
              <ChipInput values={form.ingredients_es ?? []} onChange={(v) => set("ingredients_es", v)} />
            </Field>
          </div>
          <Field label="Price">
            <div style={{ position: "relative", width: "160px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--body-text)" }}>$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price ?? ""}
                onChange={(e) => {
                  const n = e.target.value === "" ? null : Number(e.target.value);
                  set("price", n == null || Number.isNaN(n) ? null : Math.max(0, n));
                }}
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
              <SpecialBanner special={{ ...form, active: true }} lang={lang} onOpen={() => {}} />
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
              <UploadBox
                label={uploading ? "Uploading…" : "Upload banner photo"}
                accept="image/*"
                onPick={(f) => upload(f, "image")}
              />
            )}
          </div>

          <div style={{ ...ui.card, padding: "16px 18px" }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "12px" }}>Banner video (optional, looping)</div>
            {form.video_url ? (
              <div>
                <video src={form.video_url} muted loop autoPlay playsInline style={{ width: "100%", height: "118px", objectFit: "cover", borderRadius: "10px", background: "#000" }} />
                <button onClick={() => set("video_url", null)} style={{ background: "none", border: "none", color: "var(--error)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", marginTop: "8px", padding: 0 }}>
                  Remove
                </button>
              </div>
            ) : (
              <UploadBox
                label={uploading ? "Uploading…" : "Upload banner video"}
                accept="video/*"
                onPick={(f) => upload(f, "video")}
              />
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

function UploadBox({
  label,
  accept,
  onPick,
}: {
  label: string;
  accept: string;
  onPick: (f: File) => void;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", height: "90px", border: "2px dashed #CFC9C1", borderRadius: "10px", cursor: "pointer", color: "var(--body-text)", fontSize: "12.5px" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9C968E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {label}
      <input
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
