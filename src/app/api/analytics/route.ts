import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { AnalyticsEvent, AnalyticsEventType } from "@/lib/types";

const VALID: AnalyticsEventType[] = ["menu_open", "dish_tap", "cat_view", "lang_set"];

export async function POST(request: Request) {
  let body: Partial<AnalyticsEvent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  if (!body.event || !VALID.includes(body.event)) {
    return NextResponse.json({ ok: false, error: "bad event" }, { status: 400 });
  }

  const supabase = await getSupabaseServer();
  // No DB yet → accept silently so the client never errors during setup.
  if (!supabase) return NextResponse.json({ ok: true, stored: false });

  const { error } = await supabase.from("analytics_events").insert({
    event: body.event,
    dish_id: body.dish_id ?? null,
    category: body.category ?? null,
    lang: body.lang ?? null,
    session_id: body.session_id ?? null,
  });

  if (error) {
    console.error("[analytics] insert failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
