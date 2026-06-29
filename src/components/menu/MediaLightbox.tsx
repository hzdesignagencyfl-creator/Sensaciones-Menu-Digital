"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = { type: "photo" | "video"; src: string };
/** Any menu entity with media — a Dish or the Today's Special. */
export type LightboxSource = { photo_url: string | null; video_url?: string | null };

export function MediaLightbox({
  source,
  initialIndex = 0,
  onClose,
}: {
  source: LightboxSource | null;
  initialIndex?: number;
  onClose: () => void;
}) {
  const items: MediaItem[] = [];
  if (source?.photo_url) items.push({ type: "photo", src: source.photo_url });
  if (source?.video_url) items.push({ type: "video", src: source.video_url });

  const [index, setIndex] = useState(Math.min(initialIndex, Math.max(items.length - 1, 0)));
  const touchX = useRef(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!source || items.length === 0) return null;
  const clamped = Math.min(index, items.length - 1);

  function go(delta: number) {
    setIndex((i) => Math.max(0, Math.min(items.length - 1, i + delta)));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0]?.clientX ?? 0;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
    if (dx < -40) go(1);
    if (dx > 40) go(-1);
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 60,
        background: "#000",
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 2,
          width: "38px",
          height: "38px",
          border: "none",
          borderRadius: "999px",
          background: "rgba(20,20,20,0.6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          backdropFilter: "blur(4px)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {items.length > 1 && (
        <div
          style={{
            position: "absolute",
            top: "16px",
            left: 0,
            right: 0,
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {items.map((_, i) => (
            <span
              key={i}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "999px",
                background: i === clamped ? "#C4A35A" : "rgba(255,255,255,0.35)",
                transition: "background 0.2s ease",
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{ flex: 1, position: "relative", overflow: "hidden" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          style={{
            display: "flex",
            width: `${items.length * 100}%`,
            height: "100%",
            transform: `translateX(-${clamped * (100 / items.length)}%)`,
            transition: "transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                flex: `0 0 ${100 / items.length}%`,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.src}
                  alt=""
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              ) : (
                <video
                  src={item.src}
                  controls
                  autoPlay
                  loop
                  playsInline
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {items.length > 1 && clamped > 0 && (
        <button onClick={() => go(-1)} aria-label="Previous" style={{ ...arrowBtn, left: "10px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
      {items.length > 1 && clamped < items.length - 1 && (
        <button onClick={() => go(1)} aria-label="Next" style={{ ...arrowBtn, right: "10px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

const arrowBtn: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 2,
  width: "38px",
  height: "38px",
  border: "none",
  borderRadius: "999px",
  background: "rgba(20,20,20,0.55)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(4px)",
};
