export type SalaryPeriodValue = "annual" | "monthly";

export const SALARY_PERIOD_OPTIONS: { value: SalaryPeriodValue; label: string }[] = [
  { value: "annual", label: "Annual" },
  { value: "monthly", label: "Monthly" },
];

export function normalizeSalaryPeriod(value: unknown): SalaryPeriodValue {
  if (value == null || value === "") return "annual";
  const s = String(value).toLowerCase().trim();
  return s === "monthly" ? "monthly" : "annual";
}

export function parseSalaryPeriod(value: unknown): SalaryPeriodValue {
  return normalizeSalaryPeriod(value);
}

/** Matches Compensation dropdown labels: "Annual" | "Monthly". */
export function getSalaryPeriodDisplayLabel(period: unknown): string {
  const key = normalizeSalaryPeriod(period);
  return SALARY_PERIOD_OPTIONS.find((o) => o.value === key)?.label ?? "Annual";
}

/** @deprecated Prefer getSalaryPeriodDisplayLabel */
export function getSalaryPeriodLabel(period: unknown): string {
  return normalizeSalaryPeriod(period) === "monthly" ? "per month" : "per year";
}
