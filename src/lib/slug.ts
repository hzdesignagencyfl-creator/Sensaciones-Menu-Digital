// Shared slug helpers for dish ids and storage file names.

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Storage keys reject spaces/accents — slugify the base name, keep the extension. */
export function safeStorageName(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  const slug = slugify(base) || "file";
  return ext ? `${slug}.${ext}` : slug;
}

/** "cuban-sandwich" → "cuban-sandwich-2" until it no longer collides. */
export function uniqueId(base: string, existing: string[]): string {
  const root = base || `dish-${Date.now()}`;
  let candidate = root;
  let n = 2;
  while (existing.includes(candidate)) candidate = `${root}-${n++}`;
  return candidate;
}
