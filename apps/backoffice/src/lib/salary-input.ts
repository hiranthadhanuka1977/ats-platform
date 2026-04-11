/** Digits-only string for salary min/max state (no decimals). */

export function salaryInputToDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Normalize API, draft, or pasted values to integer digits (drops fractional part). */
export function salaryValueToDigits(raw: string | null | undefined): string {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const withoutCommas = s.replace(/,/g, "");
  const n = Number.parseFloat(withoutCommas);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.floor(n));
}

/** Comma-separated thousands, no decimals. */
export function formatSalaryDigitsWithCommas(digits: string): string {
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
