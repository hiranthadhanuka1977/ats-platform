export function formatShortDate(value: Date | string | null | undefined): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/** True if posted within the last `days` days. */
export function isRecentPost(postedAt: Date | string | null | undefined, days = 7): boolean {
  if (postedAt == null) return false;
  const d = typeof postedAt === "string" ? new Date(postedAt) : postedAt;
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff;
}
