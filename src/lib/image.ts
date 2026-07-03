"use client";

// Browser-side photo compression before uploading to Supabase Storage.
// A phone photo is often 4–10 MB; the menu never renders wider than ~800px,
// so we cap the longest side and re-encode. Falls back to the original file
// whenever anything goes wrong — uploading big is better than not uploading.

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;
/** Files already smaller than this are uploaded as-is. */
const SKIP_BELOW_BYTES = 300 * 1024;

export async function compressImage(file: File): Promise<File> {
  // Skip non-images, small files, and formats where re-encoding loses
  // information we can't recover (animated GIFs, SVG).
  if (!file.type.startsWith("image/")) return file;
  if (file.size < SKIP_BELOW_BYTES) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    // from-image applies EXIF rotation so phone photos come out upright.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    // Prefer WebP; browsers without a WebP encoder silently return PNG,
    // in which case we retry as JPEG (always supported, still small).
    let blob = await toBlob(canvas, "image/webp");
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob(canvas, "image/jpeg");
    }
    if (!blob || blob.size >= file.size) return file;

    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    const base = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}.${ext}`, { type: blob.type });
  } catch {
    return file;
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}
