import { STR } from "@/lib/data/menu-meta";
import type { Lang, Special } from "@/lib/types";

export function SpecialBanner({
  special,
  lang,
  onOpen,
}: {
  special: Special;
  lang: Lang;
  onOpen: () => void;
}) {
  if (!special.active) return null;
  const t = STR[lang];
  const name = lang === "en" ? special.name_en : special.name_es;
  const clickable = Boolean(special.photo_url);

  return (
    <div
      onClick={clickable ? onOpen : undefined}
      style={{
        margin: "16px",
        borderRadius: "18px",
        overflow: "hidden",
        position: "relative",
        height: "162px",
        boxShadow: "0 12px 30px rgba(30,30,30,0.38)",
        cursor: clickable ? "pointer" : "default",
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
            fontWeight: 700,
            color: "var(--cream)",
            lineHeight: 1.12,
            marginTop: "7px",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}
