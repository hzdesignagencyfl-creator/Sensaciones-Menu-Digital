"use client";

/** Small dish thumbnail with a branded fallback when no photo exists. */
export function Thumb({
  src,
  alt,
  w = 60,
  h = 46,
}: {
  src: string | null;
  alt: string;
  w?: number;
  h?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        style={{ width: w, height: h, objectFit: "cover", borderRadius: "8px", flex: "0 0 auto" }}
        loading="lazy"
      />
    );
  }
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: "8px",
        flex: "0 0 auto",
        background: "linear-gradient(150deg,#efe9df,#e1d8c8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={Math.round(h * 0.5)} height={Math.round(h * 0.5)} viewBox="0 0 64 64" fill="none" stroke="#C4A35A" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.5">
        <path d="M20 41 C12 41 8 35 10 29 C6 25 8 16 16 16 C17 9 25 6 31 11 C35 6 45 7 47 14 C56 13 60 21 54 28 C57 34 51 41 43 41 Z" />
        <path d="M20 41 H44 V49 C44 51 42 53 40 53 H24 C22 53 20 51 20 49 Z" />
      </svg>
    </div>
  );
}
