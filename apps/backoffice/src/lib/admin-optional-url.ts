/** Trim optional URL fields; empty string → null. */
export function parseOptionalUrl(value: unknown, maxLen = 500): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t) return null;
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}
