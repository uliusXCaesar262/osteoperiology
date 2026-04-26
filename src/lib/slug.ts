export function createSlug(title: string, pmid: string): string {
  const base = title
    .toLowerCase()
    .replace(/<[^>]+>/g, "") // Strip HTML tags
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "");

  return `${base}-${pmid}`;
}
