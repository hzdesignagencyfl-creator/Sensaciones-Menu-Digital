import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { AnalyticsEvent, AnalyticsEventType } from "@/lib/types";

const VALID_EVENTS: AnalyticsEventType[] = ["menu_open", "dish_tap", "cat_view", "lang_set"];
const VALID_LANGS = ["en", "es"];
// Generous caps — real values are short slugs/uuids. Anything longer is abuse.
const MAX_ID_LEN = 80;
const MAX_BODY_BYTES = 2048;

/** Returns the value if it's a string within limits, else null (drop, don't 500). */
function cleanString(v: unknown, maxLen: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s || s.length > maxLen) return null;
  return s;
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "too large" }, { status: 413 });
  }

  let body: Partial<AnalyticsEvent>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof body.event !== "string" ||
    !VALID_EVENTS.includes(body.event)
  ) {
    return NextResponse.json({ ok: false, error: "bad event" }, { status: 400 });
  }

  const lang = cleanString(body.lang, 5);

  // Prefer the service-role client: it keeps working after the migration that
  // revokes anonymous INSERTs on analytics_events (so this validated route is
  // the only way in). Falls back to the anon server client if the service key
  // isn't set in this deployment.
  const supabase = getSupabaseAdmin() ?? (await getSupabaseServer());
  // No DB yet → accept silently so the client never errors during setup.
  if (!supabase) return NextResponse.json({ ok: true, stored: false });

  const { error } = await supabase.from("analytics_events").insert({
    event: body.event,
    dish_id: cleanString(body.dish_id, MAX_ID_LEN),
    category: cleanString(body.category, MAX_ID_LEN),
    lang: lang && VALID_LANGS.includes(lang) ? lang : null,
    session_id: cleanString(body.session_id, MAX_ID_LEN),
  });

  if (error) {
    console.error("[analytics] insert failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored: true });
}
