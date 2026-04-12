/**
 * Build `/?` query URLs for the job listing, preserving filters.
 */
export type ListingSearchRecord = Record<string, string | undefined>;

export function listingUrl(base: ListingSearchRecord, patch: Record<string, string | undefined | null>): string {
  const next: ListingSearchRecord = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === null || v === undefined || v === "") delete next[k];
    else next[k] = v;
  }
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v) u.set(k, v);
  }
  const s = u.toString();
  return s ? `/?${s}` : "/";
}
