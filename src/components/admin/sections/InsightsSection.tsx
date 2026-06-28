"use client";

import { useMemo, useState } from "react";
import { categoryLabel } from "@/lib/data/menu-meta";
import type { CategoryId, Dish } from "@/lib/types";
import { Segmented, ui } from "../ui";

type Period = "today" | "week" | "month";
const SCALE: Record<Period, number> = { today: 1, week: 6.4, month: 27 };

/** Stable per-dish pseudo-random offset so equally-badged dishes don't tie. */
function jitter(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return (h % 38) / 38; // 0..1
}

export function InsightsSection({ dishes }: { dishes: Dish[] }) {
  const [period, setPeriod] = useState<Period>("today");

  // Deterministic sample data derived from the menu (badges/stars weigh taps).
  const data = useMemo(() => {
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

    const sessions = Math.round(184 * k);
    const enPct = 62;

    return { topDishes, topCats, totalCatViews, sessions, enPct };
  }, [dishes, period]);

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

      <div style={{ fontSize: "12px", color: "var(--muted-text)", marginTop: "18px", textAlign: "center" }}>
        Datos de muestra · El tracking en vivo se conecta en producción
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

function ThumbMini({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} style={{ width: 38, height: 38, borderRadius: "8px", objectFit: "cover", flex: "0 0 auto" }} loading="lazy" />;
  }
  return <div style={{ width: 38, height: 38, borderRadius: "8px", background: "linear-gradient(150deg,#efe9df,#e1d8c8)", flex: "0 0 auto" }} />;
}
