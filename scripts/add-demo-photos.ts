/**
 * One-off: adds the demo gallery photos (second image) to the dishes that
 * have one in /public/images/food, WITHOUT touching any other data.
 *
 * Run AFTER applying supabase/migration-photo-urls.sql:
 *   npx tsx scripts/add-demo-photos.ts
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const BUCKET = "dish-photos";

/** dish id → extra photo files in public/images/food */
const EXTRAS: Record<string, string[]> = {
  "brunch-burger": ["brunch-burger-sensaciones-2-fort-myers.webp"],
  "sourdough-toast": ["sourdough-toast-sensaciones-2-fort-myers.webp"],
};

async function main() {
  for (const [id, files] of Object.entries(EXTRAS)) {
    const urls: string[] = [];
    for (const f of files) {
      const buf = await readFile(path.join(process.cwd(), "public", "images", "food", f));
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(f, buf, { upsert: true, contentType: "image/webp" });
      if (error) throw error;
      urls.push(supabase.storage.from(BUCKET).getPublicUrl(f).data.publicUrl);
    }
    const { error, data } = await supabase
      .from("dishes")
      .update({ photo_urls: urls })
      .eq("id", id)
      .select("id");
    if (error) throw error;
    if (!data?.length) {
      console.warn(`! dish "${id}" not found in DB — skipped`);
    } else {
      console.log(`✓ ${id}: ${urls.length} extra photo(s) set`);
    }
  }
  console.log("\n✅ Demo gallery photos added.");
}

main().catch((e) => {
  console.error("\n✗ Failed:", e.message ?? e);
  if (/photo_urls/.test(String(e.message))) {
    console.error("→ Run supabase/migration-photo-urls.sql in the Supabase SQL Editor first.");
  }
  process.exit(1);
});
