"use client";

import { STR } from "@/lib/data/menu-meta";
import { formatPrice } from "@/lib/format";
import type { Lang, Special } from "@/lib/types";
import { ScreenHeader } from "./ScreenHeader";

/** Full-screen detail for the Today's Special: photo, name, price, description. */
export function SpecialDetail({
  special,
  lang,
  onBack,
  onOpenMedia,
}: {
  special: Special;
  lang: Lang;
  onBack: () => void;
  onOpenMedia: () => void;
}) {
  const t = STR[lang];
  const name = lang === "en" ? special.name_en : special.name_es;
  const desc = lang === "en" ? special.description_en : special.description_es;
  const hasPhoto = Boolean(special.photo_url);

  return (
    <div style={{ animation: "fadeIn 0.25s ease" }}>
      <ScreenHeader title={t.special} onBack={onBack} />

      <div style={{ padding: "16px 16px 40px" }}>
        {/* Photo */}
        <div
          onClick={() => hasPhoto && onOpenMedia()}
          style={{
            position: "relative",
            borderRadius: "18px",
            overflow: "hidden",
            cursor: hasPhoto ? "pointer" : "default",
            boxShadow: "0 10px 28px rgba(30,30,30,0.14)",
            background: "linear-gradient(150deg, #efe9df 0%, #e6ddcd 60%, #ddd2bd 100%)",
            height: "252px",
          }}
        >
          {hasPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={special.photo_url!}
              alt={name}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          <span
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "var(--gold-primary)",
              color: "var(--teal-dark)",
              borderRadius: "999px",
              padding: "5px 12px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            {t.special}
          </span>
        </div>

        {/* Name + price */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px", marginTop: "20px" }}>
          <h2
            className="font-display"
            style={{ margin: 0, fontSize: "27px", fontWeight: 700, color: "var(--charcoal)", lineHeight: 1.1 }}
          >
            {name}
          </h2>
          {special.price != null && (
            <div
              className="font-display"
              style={{ flex: "0 0 auto", fontSize: "23px", fontWeight: 700, color: "var(--gold-dark)", whiteSpace: "nowrap" }}
            >
              {formatPrice(special, lang)}
            </div>
          )}
        </div>

        {/* Description */}
        {desc && (
          <>
            <div
              className="font-display"
              style={{ marginTop: "24px", fontSize: "17px", fontWeight: 700, color: "var(--charcoal)", letterSpacing: "0.02em" }}
            >
              {t.description}
            </div>
            <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.65, color: "var(--body-text)" }}>
              {desc}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
