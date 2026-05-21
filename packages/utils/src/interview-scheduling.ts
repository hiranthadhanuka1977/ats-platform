/** Interview scheduling — durations, time zones, and wall-clock ↔ UTC conversion. */

export const INTERVIEW_DURATION_MINUTES = [15, 30, 45, 60, 90, 120] as const;

export type InterviewDurationMinutes = (typeof INTERVIEW_DURATION_MINUTES)[number];

/** Common IANA zones — fallback when Intl.supportedValuesOf is unavailable. */
export const SCHEDULING_TIMEZONE_IDS = [
  "UTC",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Kolkata",
  "Asia/Colombo",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

const FALLBACK_TIME_ZONE = "UTC";

/** All IANA time zones for scheduling dropdowns (browser/Node Intl when available). */
export function listSchedulingTimeZoneIds(...ensureIncluded: string[]): string[] {
  const ids = new Set<string>([FALLBACK_TIME_ZONE, ...ensureIncluded.filter(Boolean)]);

  if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
    try {
      for (const tz of Intl.supportedValuesOf("timeZone")) {
        ids.add(tz);
      }
    } catch {
      /* use fallback list below */
    }
  }

  if (ids.size <= SCHEDULING_TIMEZONE_IDS.length + ensureIncluded.length) {
    for (const tz of SCHEDULING_TIMEZONE_IDS) ids.add(tz);
  }

  return [...ids].sort((a, b) => {
    if (a === FALLBACK_TIME_ZONE) return -1;
    if (b === FALLBACK_TIME_ZONE) return 1;
    return a.localeCompare(b);
  });
}

export type SchedulingTimeZoneGroup = {
  region: string;
  zones: string[];
};

/** Group IANA ids by region prefix (e.g. America, Europe) for optgroup selects. */
export function groupSchedulingTimeZones(ids: string[]): SchedulingTimeZoneGroup[] {
  const groups = new Map<string, string[]>();

  for (const id of ids) {
    const region = id.includes("/") ? (id.split("/")[0] ?? "Other") : "Other";
    const list = groups.get(region) ?? [];
    list.push(id);
    groups.set(region, list);
  }

  const regionOrder = [...groups.keys()].sort((a, b) => {
    if (a === "Other") return 1;
    if (b === "Other") return -1;
    return a.localeCompare(b);
  });

  return regionOrder.map((region) => ({
    region,
    zones: (groups.get(region) ?? []).sort((a, b) => a.localeCompare(b)),
  }));
}

export function isValidIanaTimeZone(timeZone: string | null | undefined): boolean {
  if (typeof timeZone !== "string" || !timeZone.trim()) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timeZone.trim() });
    return true;
  } catch {
    return false;
  }
}

/** Coalesce missing/invalid stored time zones to UTC (legacy rows pre-migration). */
export function normalizeSchedulingTimeZone(timeZone: string | null | undefined): string {
  if (typeof timeZone !== "string" || !timeZone.trim()) return FALLBACK_TIME_ZONE;
  return isValidIanaTimeZone(timeZone) ? timeZone.trim() : FALLBACK_TIME_ZONE;
}

export function resolveDefaultSchedulingTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidIanaTimeZone(tz) ? tz : "UTC";
  } catch {
    return "UTC";
  }
}

export function schedulingTimeZoneLabel(timeZone: string | null | undefined): string {
  const zone = normalizeSchedulingTimeZone(timeZone);
  if (zone === FALLBACK_TIME_ZONE && (timeZone == null || timeZone === "")) {
    return "UTC";
  }
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    const display = zone.replace(/_/g, " ");
    return offset ? `${display} (${offset})` : display;
  } catch {
    return zone.replace(/_/g, " ");
  }
}

export function getZonedDateTimeParts(instant: Date, timeZone: string): {
  date: string;
  time: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(instant);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const hour = get("hour") === "24" ? "00" : get("hour");

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${hour}:${get("minute")}`,
  };
}

/** Wall-clock date + time in an IANA zone → UTC instant. */
export function zonedLocalToUtc(date: string, time: string, timeZone: string): Date {
  if (!isValidIanaTimeZone(timeZone)) {
    throw new Error("Invalid time zone.");
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("Invalid date or time.");
  }

  const targetKey = year * 1e8 + month * 1e6 + day * 1e4 + hour * 100 + minute;
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  function keyAt(ms: number): number {
    const parts = formatter.formatToParts(new Date(ms));
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? "0");
    const h = get("hour");
    return get("year") * 1e8 + get("month") * 1e6 + get("day") * 1e4 + h * 100 + get("minute");
  }

  for (let offset = -48 * 60; offset <= 48 * 60; offset += 1) {
    const ms = utcGuess + offset * 60_000;
    if (keyAt(ms) === targetKey) {
      return new Date(ms);
    }
  }

  throw new Error(`Could not resolve ${date} ${time} in ${timeZone}.`);
}

export function computeInterviewEndUtc(
  date: string,
  time: string,
  durationMinutes: InterviewDurationMinutes,
  timeZone: string,
): { startsAt: Date; endsAt: Date } {
  const startsAt = zonedLocalToUtc(date, time, timeZone);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);
  return { startsAt, endsAt };
}

export function defaultSchedulingFields(timeZone: string): {
  interviewDate: string;
  startTime: string;
  durationMinutes: InterviewDurationMinutes;
} {
  const now = new Date();
  const { date, time } = getZonedDateTimeParts(now, timeZone);
  const [hour, minute] = time.split(":").map(Number);
  const roundedTotal = Math.ceil((hour * 60 + minute) / 15) * 15;
  const roundedHour = Math.floor(roundedTotal / 60) % 24;
  const roundedMinute = roundedTotal % 60;
  const dayOffset = Math.floor(roundedTotal / (24 * 60));

  let interviewDate = date;
  if (dayOffset > 0) {
    const base = zonedLocalToUtc(date, "00:00", timeZone);
    interviewDate = getZonedDateTimeParts(
      new Date(base.getTime() + dayOffset * 86_400_000),
      timeZone,
    ).date;
  }

  const startTime = `${String(roundedHour).padStart(2, "0")}:${String(roundedMinute).padStart(2, "0")}`;

  return {
    interviewDate,
    startTime,
    durationMinutes: 60,
  };
}

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours} hr ${rem} min`;
}

export function formatInterviewRangeInZone(
  startsAt: Date | string,
  endsAt: Date | string,
  timeZone: string | null | undefined,
): string {
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
  const zone = normalizeSchedulingTimeZone(timeZone);

  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: zone,
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone,
  });

  const startDate = dateFmt.format(start);
  const endDate = dateFmt.format(end);
  const datePart = startDate === endDate ? startDate : `${startDate} – ${endDate}`;
  const timePart = `${timeFmt.format(start)} – ${timeFmt.format(end)}`;
  const zoneShort =
    new Intl.DateTimeFormat("en-GB", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(start)
      .find((part) => part.type === "timeZoneName")?.value ?? zone;

  return `${datePart}, ${timePart} (${zoneShort})`;
}

export function formatCandidateInterviewPreview(
  date: string,
  time: string,
  durationMinutes: InterviewDurationMinutes,
  schedulingTimeZone: string,
  candidateTimeZone: string | null | undefined,
): { schedulingLabel: string; candidateLabel: string; candidateTimeZone: string | null } {
  try {
    const { startsAt, endsAt } = computeInterviewEndUtc(
      date,
      time,
      durationMinutes,
      schedulingTimeZone,
    );
    const schedulingLabel = formatInterviewRangeInZone(startsAt, endsAt, schedulingTimeZone);

    if (!candidateTimeZone || !isValidIanaTimeZone(candidateTimeZone)) {
      return {
        schedulingLabel,
        candidateLabel: "Candidate timezone not set — add a timezone to the candidate profile to preview local time.",
        candidateTimeZone: null,
      };
    }

    if (candidateTimeZone === schedulingTimeZone) {
      return {
        schedulingLabel,
        candidateLabel: `Same as scheduling timezone (${schedulingTimeZoneLabel(candidateTimeZone)}).`,
        candidateTimeZone,
      };
    }

    const candidateLabel = formatInterviewRangeInZone(startsAt, endsAt, candidateTimeZone);
    return { schedulingLabel, candidateLabel, candidateTimeZone };
  } catch {
    return {
      schedulingLabel: "Enter a valid date, time, and timezone.",
      candidateLabel: "Preview unavailable until scheduling fields are valid.",
      candidateTimeZone: candidateTimeZone ?? null,
    };
  }
}

export function interviewDurationMinutes(startsAt: Date | string, endsAt: Date | string): number {
  const start = typeof startsAt === "string" ? new Date(startsAt) : startsAt;
  const end = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));
}
