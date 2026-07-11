"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Lang } from "@/lib/types";

export interface PeriodInsights {
  /** Distinct sessions that opened the menu in this period. */
  sessions: number;
  /** dish_id -> tap count (includes "special-<id>" for the daily special). */
  dishTaps: Map<string, number>;
  /** category -> view count. */
  catViews: Map<string, number>;
  /** lang -> distinct sessions that opened the menu with that language. */
  langSessions: Map<Lang, number>;
}

export interface InsightsBundle {
  today: PeriodInsights;
  week: PeriodInsights;
  month: PeriodInsights;
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const RESTAURANT_TZ = "America/New_York";

/** UTC instant matching local midnight of the given Y-M-D in `tz` (Fort Myers, FL). */
function zonedMidnightUtc(y: string | number, m: string | number, day: string | number, tz: string): Date {
  const yy = String(y).padStart(4, "0");
  const mm = String(m).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const guess = new Date(`${yy}-${mm}-${dd}T00:00:00Z`);
  // The zone's offset at that moment, derived by comparing how `guess`
  // reads back in `tz` vs UTC — then shift so local midnight lands on guess.
  const asTz = new Date(guess.toLocaleString("en-US", { timeZone: tz }));
  const asUtc = new Date(guess.toLocaleString("en-US", { timeZone: "UTC" }));
  const offset = asUtc.getTime() - asTz.getTime();
  return new Date(guess.getTime() + offset);
}

/** UTC instant matching local midnight of `d` in `tz`. */
function startOfDayInTz(d: Date, tz: string): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return zonedMidnightUtc(y, m, day, tz);
}

/** UTC instant matching local midnight of the 1st of `year`-`month` (1-12) in `tz`. */
function startOfMonthInTz(year: number, month: number, tz: string): Date {
  return zonedMidnightUtc(year, month, 1, tz);
}

function emptyPeriod(): PeriodInsights {
  return { sessions: 0, dishTaps: new Map(), catViews: new Map(), langSessions: new Map() };
}

/**
 * Reads raw analytics_events for the trailing 30 days and buckets them into
 * today / this week (rolling 7d) / this month (rolling 30d). Returns null
 * when Supabase isn't configured — callers fall back to sample data.
 */
export async function loadInsights(): Promise<InsightsBundle | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const now = new Date();
  const monthStart = new Date(now.getTime() - MONTH_MS);
  const weekStart = new Date(now.getTime() - WEEK_MS);
  const todayStart = startOfDayInTz(now, RESTAURANT_TZ);

  // Newest-first so the row cap drops the oldest events, not a random subset.
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event, dish_id, category, lang, session_id, created_at")
    .gte("created_at", monthStart.toISOString())
    .order("created_at", { ascending: false })
    .limit(20000);

  if (error || !data) return null;

  const today = emptyPeriod();
  const week = emptyPeriod();
  const month = emptyPeriod();
  const seenSessions = { today: new Set<string>(), week: new Set<string>(), month: new Set<string>() };

  for (const row of data as {
    event: string;
    dish_id: string | null;
    category: string | null;
    lang: string | null;
    session_id: string | null;
    created_at: string;
  }[]) {
    const created = new Date(row.created_at);
    const buckets: { p: PeriodInsights; seen: Set<string> }[] = [];
    if (created >= monthStart) buckets.push({ p: month, seen: seenSessions.month });
    if (created >= weekStart) buckets.push({ p: week, seen: seenSessions.week });
    if (created >= todayStart) buckets.push({ p: today, seen: seenSessions.today });

    for (const { p, seen } of buckets) {
      if (row.event === "menu_open" && row.session_id) {
        // menu_open fires at most once per session_id, so first-seen here
        // doubles as the dedup point for both the session count and lang split.
        if (!seen.has(row.session_id)) {
          seen.add(row.session_id);
          p.sessions += 1;
          if (row.lang === "en" || row.lang === "es") {
            p.langSessions.set(row.lang, (p.langSessions.get(row.lang) ?? 0) + 1);
          }
        }
      } else if (row.event === "dish_tap" && row.dish_id) {
        p.dishTaps.set(row.dish_id, (p.dishTaps.get(row.dish_id) ?? 0) + 1);
      } else if (row.event === "cat_view" && row.category) {
        p.catViews.set(row.category, (p.catViews.get(row.category) ?? 0) + 1);
      }
    }
  }

  return { today, week, month };
}

/** Full (not top-5-capped) aggregate for one calendar month, used for CSV export. */
export interface MonthlySummary {
  year: number;
  month: number; // 1-12
  sessions: number;
  langSessions: Map<Lang, number>;
  dishTaps: Map<string, number>;
  catViews: Map<string, number>;
}

/** Reads analytics_events for one calendar month (in restaurant-local time). */
export async function loadMonthlySummary(year: number, month: number): Promise<MonthlySummary | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;

  const rangeStart = startOfMonthInTz(year, month, RESTAURANT_TZ);
  const rangeEnd = startOfMonthInTz(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, RESTAURANT_TZ);

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event, dish_id, category, lang, session_id, created_at")
    .gte("created_at", rangeStart.toISOString())
    .lt("created_at", rangeEnd.toISOString())
    .order("created_at", { ascending: false })
    .limit(20000);

  if (error || !data) return null;

  const summary: MonthlySummary = {
    year,
    month,
    sessions: 0,
    langSessions: new Map(),
    dishTaps: new Map(),
    catViews: new Map(),
  };
  const seenSessions = new Set<string>();

  for (const row of data as {
    event: string;
    dish_id: string | null;
    category: string | null;
    lang: string | null;
    session_id: string | null;
    created_at: string;
  }[]) {
    if (row.event === "menu_open" && row.session_id) {
      if (!seenSessions.has(row.session_id)) {
        seenSessions.add(row.session_id);
        summary.sessions += 1;
        if (row.lang === "en" || row.lang === "es") {
          summary.langSessions.set(row.lang, (summary.langSessions.get(row.lang) ?? 0) + 1);
        }
      }
    } else if (row.event === "dish_tap" && row.dish_id) {
      summary.dishTaps.set(row.dish_id, (summary.dishTaps.get(row.dish_id) ?? 0) + 1);
    } else if (row.event === "cat_view" && row.category) {
      summary.catViews.set(row.category, (summary.catViews.get(row.category) ?? 0) + 1);
    }
  }

  return summary;
}
