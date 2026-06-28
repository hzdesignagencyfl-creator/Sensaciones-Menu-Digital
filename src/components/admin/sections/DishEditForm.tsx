"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/data/menu-meta";
import type { BadgeId, CategoryId, Dish } from "@/lib/types";
import { Segmented, Toggle, ui } from "../ui";

const CATS = CATEGORIES.filter((c) => c.id !== "popular");
const BADGE_FIELDS: { key: keyof Dish; id: BadgeId; label: string }[] = [
  { key: "badge_chef", id: "chef", label: "Chef's pick" },
  { key: "badge_popular", id: "popular", label: "Most popular" },
  { key: "badge_new", id: "new", label: "New" },
  { key: "badge_veg", id: "veg", label: "Vegetarian" },
  { key: "badge_gf", id: "gf", label: "Gluten-free" },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function blankDish(): Dish {
  return {
    id: "",
    category: "entrees",
    name_en: "",
    name_es: "",
    description_en: "",
    description_es: "",
    price: null,
    market_price: false,
    ingredients_en: [],
    ingredients_es: [],
    photo_url: null,
    video_url: null,
    status: "visible",
    available_today: true,
    badge_chef: false,
    badge_popular: false,
    badge_new: false,
    badge_veg: false,
    badge_gf: false,
    star_rating: 0,
    sort_order: 999,
  };
}

export function DishEditForm({
  dish,
  existingIds,
  onCancel,
  onSave,
  onDelete,
}: {
  dish: Dish | null;
  existingIds: string[];
  onCancel: () => void;
  onSave: (d: Dish) => void;
  onDelete: (id: string) => void;
}) {
  const isNew = !dish;
  const [form, setForm] = useState<Dish>(dish ? { ...dish } : blankDish());
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof Dish>(key: K, value: Dish[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit() {
    if (!form.name_en.trim()) {
      alert("Name (EN) is required.");
      return;
    }
    let id = form.id;
    if (isNew) {
      id = slugify(form.name_en) || `dish-${Date.now()}`;
      let unique = id;
      let n = 2;
      while (existingIds.includes(unique)) unique = `${id}-${n++}`;
      id = unique;
    }
    onSave({ ...form, id });
  }

  async function uploadFile(file: File, field: "photo_url" | "video_url") {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      // Preview mode — show a local object URL (won't persist).
      set(field, URL.createObjectURL(file));
      return;
    }
    setUploading(true);
    try {
      const bucket = field === "photo_url" ? "dish-photos" : "dish-videos";
      const path = `${slugify(form.name_en) || "dish"}-${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      set(field, data.publicUrl);
    } catch (e) {
      console.error(e);
      alert("Upload failed. Make sure the storage bucket exists (see SETUP.md).");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ padding: "28px 32px 96px", animation: "fadeUp 0.25s ease", position: "relative" }}>
      <button onClick={onCancel} style={{ background: "none", border: "none", color: "var(--body-text)", fontSize: "13px", cursor: "pointer", marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "6px", padding: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to menu
      </button>
      <h1 style={{ margin: "0 0 20px", fontSize: "23px", fontWeight: 700, color: "var(--charcoal)" }}>
        {isNew ? "Add new dish" : form.name_en}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Details card */}
        <div style={{ ...ui.card, padding: "22px" }}>
          <Field label="Category">
            <select value={form.category} onChange={(e) => set("category", e.target.value as CategoryId)} style={ui.input}>
              {CATS.map((c) => (
                <option key={c.id} value={c.id}>{c.en}</option>
              ))}
            </select>
          </Field>
          <Row>
            <Field label="Name (EN)">
              <input value={form.name_en} onChange={(e) => set("name_en", e.target.value)} style={ui.input} />
            </Field>
            <Field label="Name (ES)">
              <input value={form.name_es} onChange={(e) => set("name_es", e.target.value)} style={ui.input} />
            </Field>
          </Row>
          <Field label="Price">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ position: "relative", width: "160px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--body-text)" }}>$</span>
                <input
                  type="number"
                  step="0.01"
                  disabled={form.market_price}
                  value={form.price ?? ""}
                  onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
                  style={{ ...ui.input, paddingLeft: "24px", opacity: form.market_price ? 0.5 : 1 }}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "13px", color: "var(--body-text)", cursor: "pointer" }}>
                <input type="checkbox" checked={form.market_price} onChange={(e) => set("market_price", e.target.checked)} />
                Market price
              </label>
            </div>
          </Field>
          <Field label="Description (EN)">
            <textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)} rows={2} style={ui.input} />
          </Field>
          <Field label="Description (ES)">
            <textarea value={form.description_es} onChange={(e) => set("description_es", e.target.value)} rows={2} style={ui.input} />
          </Field>
          <Row>
            <Field label="Ingredients (EN)">
              <ChipInput values={form.ingredients_en} onChange={(v) => set("ingredients_en", v)} />
            </Field>
            <Field label="Ingredients (ES)">
              <ChipInput values={form.ingredients_es} onChange={(v) => set("ingredients_es", v)} />
            </Field>
          </Row>
          <Field label="Star rating (0–3)">
            <Segmented
              value={String(form.star_rating)}
              onChange={(v) => set("star_rating", Number(v))}
              options={[
                { value: "0", label: "0" },
                { value: "1", label: "★" },
                { value: "2", label: "★★" },
                { value: "3", label: "★★★" },
              ]}
            />
          </Field>
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SideCard title="Photo">
            <MediaUpload
              kind="image"
              url={form.photo_url}
              uploading={uploading}
              onPick={(file) => uploadFile(file, "photo_url")}
              onClear={() => set("photo_url", null)}
            />
          </SideCard>

          <SideCard title="Video (optional, looping)">
            <MediaUpload
              kind="video"
              url={form.video_url}
              uploading={uploading}
              onPick={(file) => uploadFile(file, "video_url")}
              onClear={() => set("video_url", null)}
            />
          </SideCard>

          <SideCard title="Badges">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {BADGE_FIELDS.map((b) => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "13.5px", color: "var(--charcoal)" }}>{b.label}</span>
                  <Toggle on={Boolean(form[b.key])} onChange={(v) => set(b.key, v as Dish[typeof b.key])} ariaLabel={b.label} />
                </div>
              ))}
            </div>
          </SideCard>

          <SideCard title="Status">
            <Segmented
              value={form.status}
              onChange={(v) => set("status", v as Dish["status"])}
              options={[
                { value: "visible", label: "Visible" },
                { value: "hidden", label: "Hidden" },
              ]}
            />
          </SideCard>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--cream)",
          borderTop: "1px solid var(--border)",
          padding: "14px 32px",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div>
          {!isNew && (
            <button
              onClick={() => {
                if (confirm(`Delete "${form.name_en}"?`)) onDelete(form.id);
              }}
              style={{ ...ui.btnGhost, color: "var(--error)", borderColor: "var(--error-bg)", background: "var(--error-bg)" }}
            >
              Delete dish
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={onCancel} style={ui.btnGhost}>Cancel</button>
          <button onClick={submit} style={ui.btnPrimary} disabled={uploading}>
            {uploading ? "Uploading…" : "Save changes"}
          </button>
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

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>{children}</div>;
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...ui.card, padding: "16px 18px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--charcoal)", marginBottom: "12px" }}>{title}</div>
      {children}
    </div>
  );
}

function ChipInput({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  }
  return (
    <div style={{ ...ui.input, padding: "8px", display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "42px", alignItems: "center" }}>
      {values.map((v) => (
        <span key={v} style={{ background: "var(--chip-bg)", color: "var(--chip-text)", borderRadius: "999px", padding: "4px 11px", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          {v}
          <button onClick={() => onChange(values.filter((x) => x !== v))} style={{ background: "none", border: "none", color: "var(--teal-mid)", cursor: "pointer", padding: 0, lineHeight: 1, fontSize: "14px" }}>×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Type + Enter"
        style={{ border: "none", outline: "none", flex: 1, minWidth: "90px", fontSize: "13px", background: "transparent" }}
      />
    </div>
  );
}

function MediaUpload({
  kind,
  url,
  uploading,
  onPick,
  onClear,
}: {
  kind: "image" | "video";
  url: string | null;
  uploading: boolean;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  if (url) {
    return (
      <div>
        {kind === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="preview" style={{ width: "100%", height: "118px", objectFit: "cover", borderRadius: "10px" }} />
        ) : (
          <video src={url} muted loop autoPlay playsInline style={{ width: "100%", height: "118px", objectFit: "cover", borderRadius: "10px", background: "#000" }} />
        )}
        <button onClick={onClear} style={{ background: "none", border: "none", color: "var(--error)", fontSize: "12.5px", fontWeight: 600, cursor: "pointer", marginTop: "8px", padding: 0 }}>
          Remove
        </button>
      </div>
    );
  }
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        height: "90px",
        border: "2px dashed #CFC9C1",
        borderRadius: "10px",
        cursor: "pointer",
        color: "var(--body-text)",
        fontSize: "12.5px",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9C968E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      {uploading ? "Uploading…" : `Upload ${kind === "image" ? "photo" : "video"}`}
      <input
        type="file"
        accept={kind === "image" ? "image/*" : "video/*"}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
    </label>
  );
}
