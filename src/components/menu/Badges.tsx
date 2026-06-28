import { BADGES } from "@/lib/data/menu-meta";
import { dishBadges } from "@/lib/types";
import type { Dish, Lang } from "@/lib/types";

const badgeBase: React.CSSProperties = {
  fontFamily: "var(--font-body-stack)",
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
  padding: "4px 9px",
  borderRadius: "999px",
  lineHeight: 1,
  whiteSpace: "nowrap",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

export function Badges({ dish, lang }: { dish: Dish; lang: Lang }) {
  const ids = dishBadges(dish);
  if (!ids.length) return null;
  return (
    <>
      {ids.map((b) => {
        const meta = BADGES[b];
        return (
          <span
            key={b}
            style={{ ...badgeBase, background: meta.bg, color: meta.color }}
          >
            {lang === "en" ? meta.en : meta.es}
          </span>
        );
      })}
    </>
  );
}

export function Stars({
  count,
  size = 11,
  spacing = 2.5,
}: {
  count: number;
  size?: number;
  spacing?: number;
}) {
  if (count <= 0) return null;
  return (
    <div
      style={{
        color: "var(--gold-primary)",
        fontSize: `${size}px`,
        letterSpacing: `${spacing}px`,
        lineHeight: 1,
      }}
    >
      {"★".repeat(count)}
    </div>
  );
}
