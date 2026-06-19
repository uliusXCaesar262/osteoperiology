const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/**
 * Convert a PubMed-style pubDate to ISO 8601 for schema.org Date fields and
 * the <time dateTime> attribute. Handles the shapes present in the corpus:
 *   "2026 May 11" -> "2026-05-11"
 *   "2026 May 8"  -> "2026-05-08"
 *   "2026 Jun"    -> "2026-06"
 *   "2026"        -> "2026"
 * Returns the input unchanged if it does not match the expected shape.
 */
export function toIsoDate(pubDate: string): string {
  const m = pubDate.trim().match(/^(\d{4})(?:\s+([A-Za-z]{3,}))?(?:\s+(\d{1,2}))?$/);
  if (!m) return pubDate;
  const [, year, mon, day] = m;
  if (!mon) return year;
  const mm = MONTHS[mon.slice(0, 3)];
  if (!mm) return year;
  if (!day) return `${year}-${mm}`;
  return `${year}-${mm}-${day.padStart(2, "0")}`;
}
