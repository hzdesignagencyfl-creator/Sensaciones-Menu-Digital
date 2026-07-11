"use client";

import { v4 as uuidv4 } from "uuid";
import type { AnalyticsEvent, AnalyticsEventType, Lang } from "@/lib/types";

const SESSION_KEY = "sensaciones_session_id";
const OPENED_KEY = "sensaciones_menu_opened";

/** Stable per-visit session id stored in sessionStorage. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Fire-and-forget analytics event to the route handler. */
function track(event: AnalyticsEventType, extra: Partial<AnalyticsEvent> = {}) {
  if (typeof window === "undefined") return;
  const payload: AnalyticsEvent = {
    event,
    session_id: getSessionId(),
    ...extra,
  };
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", body);
    } else {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    // analytics must never break the UI
  }
}

/** One menu_open per browser session, tagged with the resolved display language. */
export function trackMenuOpen(lang: Lang) {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(OPENED_KEY)) return;
  sessionStorage.setItem(OPENED_KEY, "1");
  track("menu_open", { lang });
}

export function trackDishTap(dishId: string, category: string) {
  track("dish_tap", { dish_id: dishId, category });
}

export function trackCatView(category: string) {
  track("cat_view", { category });
}

export function trackLangSet(lang: Lang) {
  track("lang_set", { lang });
}
