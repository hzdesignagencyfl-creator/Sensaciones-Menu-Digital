"use client";

import { useEffect, useMemo, useState } from "react";
import { categoryLabel } from "@/lib/data/menu-meta";
import {
  loadInsights,
  loadMonthlySummary,
  RESTAURANT_TZ,
  type InsightsBundle,
  type MonthlySummary,
  type PeriodInsights,
} from "@/lib/insights-service";
import type { CategoryId, Dish } from "@/lib/types";
import { Segmented, ui } from "../ui";

type Period = "today" | "week" | "month";
const SCALE: Record<Period, number> = { today: 1, week: 6.4, month: 27 };

type ViewModel = {
  topDishes: { dish: Dish; taps: number }[];
  topCats: { cat: CategoryId; views: number }[];
  totalCatViews: number;
  sessions: number;
  enPct: number;
};

/** Stable per-dish pseudo-random offset so equally-badged dishes don't tie. */
function jitter(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 38) / 38; // 0..1
}

/** Deterministic sample data derived from the menu — used only when Supabase
 *  isn't configured (demo mode), since there's no real analytics table to read. */
function sampleData(dishes: Dish[], period: Period): ViewModel {
  const visible = dishes.filter((d) => d.status === "visible");
  const scored = visible
    .map((d) => ({
      d,
      score:
        10 +
        (d.badge_popular ? 60 : 0) +
        (d.badge_chef ? 30 : 0) +
        d.star_rating * 18 +
        (d.badge_new ? 15 : 0) +
        Math.round(jitter(d.id) * 34),
    }))
    .sort((a, b) => b.score - a.score);

  const k = SCALE[period];
  const topDishes = scored.slice(0, 5).map((s) => ({ dish: s.d, taps: Math.round(s.score * k) }));

  const catTaps = new Map<CategoryId, number>();
  for (const s of scored) catTaps.set(s.d.category, (catTaps.get(s.d.category) ?? 0) + s.score);
  const topCats = [...catTaps.entries()]
    .map(([cat, v]) => ({ cat, views: Math.round(v * k) }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const totalCatViews = topCats.reduce((a, b) => a + b.views, 0) || 1;

  return { topDishes, topCats, totalCatViews, sessions: Math.round(184 * k), enPct: 62 };
}

/** Real data for one period, joined against the current dish list for names/photos. */
function realData(period: PeriodInsights, dishes: Dish[]): ViewModel {
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const topDishes = [...period.dishTaps.entries()]
    .flatMap(([id, taps]) => {
      const dish = byId.get(id);
      return dish ? [{ dish, taps }] : [];
    })
    .sort((a, b) => b.taps - a.taps)
    .slice(0, 5);

  const topCats = [...period.catViews.entries()]
    .map(([cat, views]) => ({ cat: cat as CategoryId, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  const totalCatViews = topCats.reduce((a, b) => a + b.views, 0) || 1;

  const en = period.langSessions.get("en") ?? 0;
  const es = period.langSessions.get("es") ?? 0;
  const langTotal = en + es;
  const enPct = langTotal ? Math.round((en / langTotal) * 100) : 0;

  return { topDishes, topCats, totalCatViews, sessions: period.sessions, enPct };
}

/** Last 12 calendar months (in restaurant-local time), newest first. */
function monthOptions(): { value: string; label: string }[] {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: RESTAURANT_TZ,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const y = Number(parts.find((p) => p.type === "year")!.value);
  const m = Number(parts.find((p) => p.type === "month")!.value);

  const opts: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    let yy = y;
    let mm = m - i;
    while (mm < 1) {
      mm += 12;
      yy -= 1;
    }
    const value = `${yy}-${String(mm).padStart(2, "0")}`;
    const label = new Date(yy, mm - 1, 1).toLocaleDateString("es", { month: "long", year: "numeric" });
    opts.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return opts;
}

function csvField(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Full (not top-5) monthly report as CSV — three stacked tables. */
function buildMonthlyCsv(summary: MonthlySummary, dishes: Dish[]): string {
  const byId = new Map(dishes.map((d) => [d.id, d]));
  const monthLabel = new Date(summary.year, summary.month - 1, 1).toLocaleDateString("es", {
    month: "long",
    year: "numeric",
  });
  const en = summary.langSessions.get("en") ?? 0;
  const es = summary.langSessions.get("es") ?? 0;

  const lines: string[] = [];
  lines.push(csvField(`Sensaciones — Resumen de Insights — ${monthLabel}`));
  lines.push("");
  lines.push("Métrica,Valor");
  lines.push(`Sesiones totales,${summary.sessions}`);
  lines.push(`Sesiones en inglés,${en}`);
  lines.push(`Sesiones en español,${es}`);
  lines.push("");
  lines.push("Plato,Taps");
  for (const [id, taps] of [...summary.dishTaps.entries()].sort((a, b) => b[1] - a[1])) {
    const label = byId.get(id)?.name_es ?? (id.startsWith("special-") ? "Especial del día" : id);
    lines.push(`${csvField(label)},${taps}`);
  }
  lines.push("");
  lines.push("Categoría,Vistas");
  for (const [cat, views] of [...summary.catViews.entries()].sort((a, b) => b[1] - a[1])) {
    lines.push(`${csvField(categoryLabel(cat as CategoryId, "es"))},${views}`);
  }
  return lines.join("\n");
}

function downloadCsv(filename: string, content: string) {
  // Leading BOM so Excel opens accented characters as UTF-8, not Latin-1.
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function InsightsSection({ dishes }: { dishes: Dish[] }) {
  const [period, setPeriod] = useState<Period>("today");
  // undefined = still loading, null = Supabase not configured (demo mode).
  const [bundle, setBundle] = useState<InsightsBundle | null | undefined>(undefined);
  const [exportMonth, setExportMonth] = useState(() => monthOptions()[0].value);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadInsights().then((b) => {
      if (!cancelled) setBundle(b);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      const [y, m] = exportMonth.split("-").map(Number);
      const summary = await loadMonthlySummary(y, m);
      if (!summary) {
        setExportError("No se pudo generar el reporte.");
        return;
      }
      downloadCsv(`sensaciones-insights-${exportMonth}.csv`, buildMonthlyCsv(summary, dishes));
    } catch {
      setExportError("No se pudo generar el reporte.");
    } finally {
      setExporting(false);
    }
  }

  const data = useMemo<ViewModel | null>(() => {
    if (bundle === undefined) return null; // loading
    if (bundle === null) return sampleData(dishes, period);
    return realData(bundle[period], dishes);
  }, [bundle, dishes, period]);

  if (!data) {
    return (
      <div style={{ padding: "28px 32px 40px" }}>
        <div style={{ fontSize: "13px", color: "var(--muted-text)" }}>Cargando insights…</div>
      </div>
    );
  }

  const isSample = bundle === null;
  const top = data.topDishes[0];
  const maxTaps = data.topDishes[0]?.taps || 1;
  const topCat = data.topCats[0];

  return (
    <div style={{ padding: "28px 32px 40px", animation: "fadeUp 0.25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
        <h1 style={{ margin: 0, fontSize: "23px", fontWeight: 700, color: "var(--charcoal)" }}>Insights</h1>
        <Segmented
          value={period}
          onChange={setPeriod}
          options={[
            { value: "today", label: "Hoy" },
            { value: "week", label: "Esta semana" },
            { value: "month", label: "Este mes" },
          ]}
        />
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "16px" }}>
        <Kpi>
          <div style={{ fontSize: "40px", fontWeight: 700, color: "var(--charcoal)", lineHeight: 1 }}>{data.sessions}</div>
          <div style={kpiLabel}>sesiones abiertas</div>
          <div style={kpiTitle}>Vistas al menú</div>
        </Kpi>
        <Kpi>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--charcoal)" }}>{top?.dish.name_en ?? "—"}</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--gold-primary)", marginTop: "4px" }}>{top?.taps ?? 0}</div>
          <div style={kpiTitle}>Plato #1</div>
        </Kpi>
        <Kpi>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--charcoal)" }}>{topCat ? categoryLabel(topCat.cat, "es") : "—"}</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--teal-mid)", marginTop: "4px" }}>
            {topCat ? Math.round((topCat.views / data.totalCatViews) * 100) : 0}%
          </div>
          <div style={kpiTitle}>Categoría top</div>
        </Kpi>
        <Kpi>
          <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--charcoal)" }}>{data.enPct}%</div>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "var(--muted-text)" }}>{100 - data.enPct}%</div>
          </div>
          <div style={{ display: "flex", height: "5px", borderRadius: "999px", overflow: "hidden", marginTop: "8px" }}>
            <span style={{ width: `${data.enPct}%`, background: "var(--teal-mid)" }} />
            <span style={{ width: `${100 - data.enPct}%`, background: "var(--cream-bg)" }} />
          </div>
          <div style={{ ...kpiTitle, marginTop: "8px" }}>Idioma · EN / ES</div>
        </Kpi>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px" }}>
        {/* Top dishes */}
        <div style={{ ...ui.card, padding: "20px 22px" }}>
          <div style={cardTitle}>Platos más populares</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
            {data.topDishes.length === 0 && <EmptyNote />}
            {data.topDishes.map((t) => (
              <div key={t.dish.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <ThumbMini src={t.dish.photo_url} alt={t.dish.name_en} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--charcoal)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.dish.name_en}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--gold-primary)" }}>{t.taps}</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "999px", background: "var(--cream-bg)", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${(t.taps / maxTaps) * 100}%`, background: "linear-gradient(90deg,#6B9490,#496560)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top categories */}
        <div style={{ ...ui.card, padding: "20px 22px" }}>
          <div style={cardTitle}>Secciones del menú</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
            {data.topCats.length === 0 && <EmptyNote />}
            {data.topCats.map((c) => {
              const pct = Math.round((c.views / data.totalCatViews) * 100);
              return (
                <div key={c.cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--charcoal)" }}>{categoryLabel(c.cat, "es")}</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--teal-mid)" }}>{pct}%</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "999px", background: "var(--cream-bg)", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#E6CE96,#C4A35A)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!isSample && (
        <div style={{ ...ui.card, padding: "20px 22px", marginTop: "16px" }}>
          <div style={cardTitle}>Exportar reporte mensual</div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "14px", flexWrap: "wrap" }}>
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "13px",
                color: "var(--charcoal)",
                background: "#fff",
              }}
            >
              {monthOptions().map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              disabled={exporting}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: "none",
                background: "var(--teal-mid)",
                color: "var(--cream)",
                fontSize: "13px",
                fontWeight: 600,
                cursor: exporting ? "default" : "pointer",
                opacity: exporting ? 0.7 : 1,
              }}
            >
              {exporting ? "Generando…" : "Descargar CSV"}
            </button>
            {exportError && <span style={{ fontSize: "12.5px", color: "var(--error)" }}>{exportError}</span>}
          </div>
        </div>
      )}

      <div style={{ fontSize: "12px", color: "var(--muted-text)", marginTop: "18px", textAlign: "center" }}>
        {isSample ? "Datos de muestra · El tracking en vivo se conecta en producción" : "Datos en vivo del menú público"}
      </div>
    </div>
  );
}

const kpiLabel: React.CSSProperties = { fontSize: "11.5px", color: "var(--muted-text)", marginTop: "4px" };
const kpiTitle: React.CSSProperties = { fontSize: "12px", fontWeight: 600, color: "var(--body-text)", marginTop: "12px", letterSpacing: "0.02em" };
const cardTitle: React.CSSProperties = { fontSize: "15px", fontWeight: 700, color: "var(--charcoal)" };

function Kpi({ children }: { children: React.ReactNode }) {
  return <div style={{ ...ui.card, padding: "18px 20px", display: "flex", flexDirection: "column" }}>{children}</div>;
}

function EmptyNote() {
  return <div style={{ fontSize: "12.5px", color: "var(--muted-text)" }}>Aún no hay datos en este período.</div>;
}

function ThumbMini({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} style={{ width: 38, height: 38, borderRadius: "8px", objectFit: "cover", flex: "0 0 auto" }} loading="lazy" />;
  }
  return <div style={{ width: 38, height: 38, borderRadius: "8px", background: "linear-gradient(150deg,#efe9df,#e1d8c8)", flex: "0 0 auto" }} />;
}
