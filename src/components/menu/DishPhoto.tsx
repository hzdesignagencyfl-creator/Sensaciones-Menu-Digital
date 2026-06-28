import type { CSSProperties } from "react";

/**
 * Renders a dish photo, or a branded placeholder when no photo exists yet.
 * The placeholder uses the warm cream palette + a chef-hat glyph so dishes
 * without imagery still look intentional.
 */
export function DishPhoto({
  src,
  alt,
  height,
  grayscale = false,
}: {
  src: string | null;
  alt: string;
  height: number;
  grayscale?: boolean;
}) {
  const common: CSSProperties = {
    display: "block",
    width: "100%",
    height: `${height}px`,
    objectFit: "cover",
    filter: grayscale ? "grayscale(1)" : undefined,
    opacity: grayscale ? 0.8 : 1,
  };

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} style={common} loading="lazy" />;
  }

  return (
    <div
      aria-label={alt}
      style={{
        width: "100%",
        height: `${height}px`,
        background:
          "linear-gradient(150deg, #efe9df 0%, #e6ddcd 60%, #ddd2bd 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        filter: grayscale ? "grayscale(1)" : undefined,
        opacity: grayscale ? 0.85 : 1,
      }}
    >
      <svg
        width="46"
        height="46"
        viewBox="0 0 64 64"
        fill="none"
        stroke="#C4A35A"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity="0.5"
      >
        <path d="M20 41 C12 41 8 35 10 29 C6 25 8 16 16 16 C17 9 25 6 31 11 C35 6 45 7 47 14 C56 13 60 21 54 28 C57 34 51 41 43 41 Z" />
        <path d="M20 41 H44 V49 C44 51 42 53 40 53 H24 C22 53 20 51 20 49 Z" />
      </svg>
    </div>
  );
}
