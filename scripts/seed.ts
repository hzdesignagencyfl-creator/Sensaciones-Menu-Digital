/**
 * Seeds the Supabase project with the full Sensaciones menu:
 *   1. Uploads dish + special photos to Storage (bucket: dish-photos)
 *   2. Upserts all dishes (rewriting photo_url to the Storage public URL)
 *   3. Upserts the Today's Special row
 *   4. Ensures default settings exist
 *
 * Run AFTER applying supabase/schema.sql:
 *   npm run seed
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { config } from "dotenv";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { DISHES, DEFAULT_SPECIAL } from "../src/lib/data/dishes";
import { DEFAULT_SETTINGS } from "../src/lib/data/menu-meta";
import type { Dish } from "../src/lib/types";

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
const PUBLIC_DIR = path.join(process.cwd(), "public");
const uploadCache = new Map<string, string>();

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BUCKET);
  if (!data) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !/already exists/i.test(error.message)) throw error;
    console.log(`• created public bucket "${BUCKET}"`);
  }
}

/** Uploads a /images/... public asset to Storage and returns its public URL. */
async function uploadAsset(localPath: string): Promise<string | null> {
  if (uploadCache.has(localPath)) return uploadCache.get(localPath)!;
  const rel = localPath.replace(/^\//, "");
  const abs = path.join(PUBLIC_DIR, rel);
  if (!existsSync(abs)) {
    console.warn(`  ! missing asset ${rel} — skipping`);
    return null;
  }
  const buf = await readFile(abs);
  const key = path.basename(rel);
  const ext = path.extname(key).toLowerCase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, buf, { upsert: true, contentType: MIME[ext] ?? "application/octet-stream" });
  if (error) throw error;
  const url = supabase.storage.from(BUCKET).getPublicUrl(key).data.publicUrl;
  uploadCache.set(localPath, url);
  return url;
}

async function seedDishes() {
  console.log(`Seeding ${DISHES.length} dishes…`);
  const rows: Dish[] = [];
  for (const d of DISHES) {
    let photo = d.photo_url;
    if (photo && photo.startsWith("/images/")) {
      photo = await uploadAsset(photo);
    }
    rows.push({ ...d, photo_url: photo });
  }
  const { error } = await supabase.from("dishes").upsert(rows);
  if (error) throw error;
  const withPhotos = rows.filter((r) => r.photo_url).length;
  console.log(`✓ dishes upserted (${withPhotos} with photos)`);
}

async function seedSpecial() {
  let photo = DEFAULT_SPECIAL.photo_url;
  if (photo && photo.startsWith("/images/")) photo = await uploadAsset(photo);
  const { error } = await supabase.from("special").upsert({ ...DEFAULT_SPECIAL, photo_url: photo, id: 1 });
  if (error) throw error;
  console.log("✓ today's special upserted");
}

async function seedSettings() {
  const rows = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from("settings").upsert(rows);
  if (error) throw error;
  console.log("✓ settings upserted");
}

async function main() {
  console.log(`→ Supabase: ${URL}`);
  await ensureBucket();
  await seedDishes();
  await seedSpecial();
  await seedSettings();
  console.log("\n✅ Seed complete. Reload the menu to see your data from Supabase.");
}

main().catch((e) => {
  console.error("\n✗ Seed failed:", e.message ?? e);
  process.exit(1);
});
