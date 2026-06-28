import { STR } from "@/lib/data/menu-meta";
import { formatPrice } from "@/lib/format";
import type { Lang, Special } from "@/lib/types";

export function SpecialBanner({ special, lang }: { special: Special; lang: Lang }) {
  if (!special.active) return null;
  const t = STR[lang];
  const name = lang === "en" ? special.name_en : special.name_es;
  const desc = lang === "en" ? special.description_en : special.description_es;

  return (
    <div
      style={{
        margin: "16px",
        borderRadius: "18px",
        overflow: "hidden",
        position: "relative",
        height: "162px",
        boxShadow: "0 12px 30px rgba(30,30,30,0.38)",
      }}
    >
      {special.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={special.photo_url}
          alt={name}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(18,18,18,0.42)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg,rgba(18,18,18,0.80) 0%,rgba(18,18,18,0.54) 55%,rgba(18,18,18,0.06) 100%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "18px 20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "72%",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--gold-light)",
          }}
        >
          {t.special}
        </div>
        <div
          className="font-display"
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "var(--cream)",
            lineHeight: 1.1,
            marginTop: "5px",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: "12px",
            lineHeight: 1.5,
            color: "rgba(250,247,242,0.86)",
            marginTop: "6px",
          }}
        >
          {desc}
        </div>
        <div
          style={{
            fontSize: "17px",
            fontWeight: 600,
            color: "var(--gold-light)",
            marginTop: "9px",
          }}
        >
          {formatPrice(special, lang)}
        </div>
      </div>
    </div>
  );
}
