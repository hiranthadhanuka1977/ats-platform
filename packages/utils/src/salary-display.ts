import { getSalaryPeriodDisplayLabel } from "@ats-platform/types";

function salaryValueToDigits(raw: string | null | undefined): string {
  if (raw == null) return "";
  const s = String(raw).trim();
  if (!s) return "";
  const withoutCommas = s.replace(/,/g, "");
  const n = Number.parseFloat(withoutCommas);
  if (!Number.isFinite(n) || n < 0) return "";
  return String(Math.floor(n));
}

function formatSalaryDigitsWithCommas(digits: string): string {
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** e.g. `50,000 – 70,000 GBP (Monthly)` */
export function formatSalaryRangeLine(
  min: string | null | undefined,
  max: string | null | undefined,
  currency: string | null | undefined,
  period?: unknown,
): string | null {
  const minDigits = salaryValueToDigits(min);
  const maxDigits = salaryValueToDigits(max);
  if (!minDigits && !maxDigits) return null;
  const minPart = minDigits ? formatSalaryDigitsWithCommas(minDigits) : "—";
  const maxPart = maxDigits ? formatSalaryDigitsWithCommas(maxDigits) : "—";
  const cur = currency?.trim();
  const periodLabel = getSalaryPeriodDisplayLabel(period);
  const range = `${minPart} – ${maxPart}`;
  if (cur) return `${range} ${cur} (${periodLabel})`;
  return `${range} (${periodLabel})`;
}
