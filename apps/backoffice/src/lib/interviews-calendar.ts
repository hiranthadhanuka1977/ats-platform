/** UTC calendar helpers for the interviews page (Monday-first weeks). */

export type InterviewCalendarItem = {
  id: string;
  applicationId: string;
  startsAt: string;
  endsAt: string;
  candidateName: string;
  jobTitle: string;
  notifyCandidateEmail: boolean;
};

export type CalendarCell = {
  date: Date;
  dayKey: string;
  inMonth: boolean;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function getWeekdayLabels(): readonly string[] {
  return WEEKDAY_LABELS;
}

export function utcDayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseUtcDayKey(dayKey: string): Date {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function startOfUtcMonth(year: number, monthIndex: number): Date {
  return new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
}

/** Monday 00:00 UTC on or before `date`. */
export function startOfUtcWeekMonday(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffFromMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffFromMonday);
  return d;
}

export function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getCalendarCells(year: number, monthIndex: number): CalendarCell[] {
  const firstOfMonth = startOfUtcMonth(year, monthIndex);
  const gridStart = startOfUtcWeekMonday(firstOfMonth);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i++) {
    const date = addUtcDays(gridStart, i);
    cells.push({
      date,
      dayKey: utcDayKey(date),
      inMonth: date.getUTCFullYear() === year && date.getUTCMonth() === monthIndex,
    });
  }

  return cells;
}

export function formatMonthYear(year: number, monthIndex: number): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(startOfUtcMonth(year, monthIndex));
}

export function groupInterviewsByDay(
  interviews: InterviewCalendarItem[],
): Map<string, InterviewCalendarItem[]> {
  const map = new Map<string, InterviewCalendarItem[]>();
  for (const interview of interviews) {
    const key = utcDayKey(new Date(interview.startsAt));
    const list = map.get(key) ?? [];
    list.push(interview);
    map.set(key, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }
  return map;
}

export function formatInterviewTimeRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const fmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${fmt.format(start)} – ${fmt.format(end)} UTC`;
}
