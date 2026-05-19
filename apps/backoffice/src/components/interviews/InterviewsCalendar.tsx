"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatInterviewTimeRange,
  formatMonthYear,
  getCalendarCells,
  getWeekdayLabels,
  groupInterviewsByDay,
  parseUtcDayKey,
  utcDayKey,
  type InterviewCalendarItem,
} from "@/lib/interviews-calendar";

type Props = {
  interviews: InterviewCalendarItem[];
};

function formatSelectedDayLabel(dayKey: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseUtcDayKey(dayKey));
}

export function InterviewsCalendar({ interviews }: Props) {
  const now = new Date();
  const todayKey = utcDayKey(now);
  const [viewYear, setViewYear] = useState(now.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(now.getUTCMonth());
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(todayKey);

  const byDay = useMemo(() => groupInterviewsByDay(interviews), [interviews]);
  const cells = useMemo(() => getCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthInterviewCount = useMemo(() => {
    let count = 0;
    for (const cell of cells) {
      if (cell.inMonth) count += byDay.get(cell.dayKey)?.length ?? 0;
    }
    return count;
  }, [cells, byDay]);

  const selectedInterviews = selectedDayKey ? (byDay.get(selectedDayKey) ?? []) : [];

  function goMonth(delta: number) {
    const d = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(d.getUTCFullYear());
    setViewMonth(d.getUTCMonth());
  }

  function goToday() {
    const t = new Date();
    const key = utcDayKey(t);
    setViewYear(t.getUTCFullYear());
    setViewMonth(t.getUTCMonth());
    setSelectedDayKey(key);
  }

  return (
    <div className="bo-interviews-layout">
      <section className="bo-card bo-interviews-calendar-card" aria-labelledby="interviews-calendar-title">
        <div className="bo-interviews-calendar-toolbar">
          <h2 id="interviews-calendar-title" className="bo-interviews-calendar-month">
            {formatMonthYear(viewYear, viewMonth)}
          </h2>
          <div className="bo-interviews-calendar-nav">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => goMonth(-1)}>
              Previous
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={goToday}>
              Today
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => goMonth(1)}>
              Next
            </button>
          </div>
        </div>

        <p className="bo-interviews-calendar-summary">
          {monthInterviewCount === 0
            ? "No interviews scheduled this month."
            : `${monthInterviewCount} interview${monthInterviewCount === 1 ? "" : "s"} this month`}
          <span className="bo-interviews-calendar-utc-note"> · All times UTC</span>
        </p>

        <div className="bo-interviews-calendar-grid" role="grid" aria-label="Interview calendar">
          {getWeekdayLabels().map((label) => (
            <div key={label} className="bo-interviews-calendar-weekday" role="columnheader">
              {label}
            </div>
          ))}

          {cells.map((cell) => {
            const dayInterviews = byDay.get(cell.dayKey) ?? [];
            const isSelected = selectedDayKey === cell.dayKey;
            const isToday = cell.dayKey === todayKey;

            return (
              <button
                key={cell.dayKey}
                type="button"
                role="gridcell"
                className={[
                  "bo-interviews-calendar-cell",
                  !cell.inMonth ? "bo-interviews-calendar-cell--outside" : "",
                  isSelected ? "bo-interviews-calendar-cell--selected" : "",
                  isToday ? "bo-interviews-calendar-cell--today" : "",
                  dayInterviews.length > 0 ? "bo-interviews-calendar-cell--has-events" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDayKey(cell.dayKey)}
                aria-pressed={isSelected}
                aria-label={`${cell.date.getUTCDate()} ${formatMonthYear(cell.date.getUTCFullYear(), cell.date.getUTCMonth())}${dayInterviews.length ? `, ${dayInterviews.length} interview${dayInterviews.length === 1 ? "" : "s"}` : ""}`}
              >
                <span className="bo-interviews-calendar-day-num">{cell.date.getUTCDate()}</span>
                {dayInterviews.length > 0 ? (
                  <ul className="bo-interviews-calendar-events" aria-hidden="true">
                    {dayInterviews.slice(0, 2).map((item) => (
                      <li key={item.id} className="bo-interviews-calendar-event">
                        <span className="bo-interviews-calendar-event-time">
                          {new Intl.DateTimeFormat("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                            timeZone: "UTC",
                          }).format(new Date(item.startsAt))}
                        </span>
                        <span className="bo-interviews-calendar-event-name">{item.candidateName}</span>
                      </li>
                    ))}
                    {dayInterviews.length > 2 ? (
                      <li className="bo-interviews-calendar-event-more">+{dayInterviews.length - 2} more</li>
                    ) : null}
                  </ul>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bo-card bo-interviews-day-panel" aria-labelledby="interviews-day-title">
        <h2 id="interviews-day-title" className="bo-card-title">
          {selectedDayKey ? formatSelectedDayLabel(selectedDayKey) : "Select a day"}
        </h2>

        {selectedDayKey && selectedInterviews.length === 0 ? (
          <p className="bo-interviews-day-empty">No interviews scheduled for this day.</p>
        ) : null}

        {selectedInterviews.length > 0 ? (
          <ul className="bo-interviews-day-list">
            {selectedInterviews.map((item) => (
              <li key={item.id} className="bo-interviews-day-item">
                <p className="bo-interviews-day-item-time">{formatInterviewTimeRange(item.startsAt, item.endsAt)}</p>
                <p className="bo-interviews-day-item-candidate">{item.candidateName}</p>
                <p className="bo-interviews-day-item-job">{item.jobTitle}</p>
                <p className="bo-interviews-day-item-meta">
                  {item.notifyCandidateEmail ? "Email notification on" : "No email notification"}
                </p>
                <Link href={`/applications/${item.applicationId}`} className="bo-interviews-day-item-link">
                  View application →
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
