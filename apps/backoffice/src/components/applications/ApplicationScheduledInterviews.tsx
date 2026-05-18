export type ApplicationInterviewDisplay = {
  id: string;
  startsAt: Date | string;
  endsAt: Date | string;
  notifyCandidateEmail: boolean;
  notificationSentAt: Date | string | null;
  scheduledByName: string | null;
};

type Props = {
  interviews: ApplicationInterviewDisplay[];
};

function toDate(value: Date | string): Date {
  return typeof value === "string" ? new Date(value) : value;
}

function formatInterviewDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatInterviewTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function formatDurationMinutes(start: Date, end: Date): string {
  const minutes = Math.round((end.getTime() - start.getTime()) / 60_000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} hr ${rem} min` : `${hours} hr`;
}

function interviewPhase(startsAt: Date, endsAt: Date): "upcoming" | "in_progress" | "past" {
  const now = Date.now();
  if (now < startsAt.getTime()) return "upcoming";
  if (now <= endsAt.getTime()) return "in_progress";
  return "past";
}

function formatInterviewDateRange(start: Date, end: Date): string {
  const startLabel = formatInterviewDate(start);
  const endLabel = formatInterviewDate(end);
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z"
      />
    </svg>
  );
}

export function ApplicationScheduledInterviews({ interviews }: Props) {
  if (interviews.length === 0) return null;

  const sorted = [...interviews].sort(
    (a, b) => toDate(a.startsAt).getTime() - toDate(b.startsAt).getTime(),
  );

  return (
    <section className="bo-application-interviews" aria-labelledby="application-interviews-heading">
      <h2 id="application-interviews-heading" className="bo-application-interviews-heading">
        Scheduled interview{sorted.length > 1 ? "s" : ""}
      </h2>
      <ul className="bo-application-interviews-list">
        {sorted.map((interview) => {
          const startsAt = toDate(interview.startsAt);
          const endsAt = toDate(interview.endsAt);
          const phase = interviewPhase(startsAt, endsAt);

          return (
            <li
              key={interview.id}
              className={`bo-application-interview-card bo-application-interview-card--${phase}`}
            >
              <div className="bo-application-interview-icon" aria-hidden="true">
                <CalendarIcon />
              </div>
              <div className="bo-application-interview-body">
                <div className="bo-application-interview-primary">
                  <p className="bo-application-interview-when">
                    <time dateTime={startsAt.toISOString()}>{formatInterviewDateRange(startsAt, endsAt)}</time>
                  </p>
                  <span className={`bo-application-interview-phase bo-application-interview-phase--${phase}`}>
                    {phase === "upcoming"
                      ? "Upcoming"
                      : phase === "in_progress"
                        ? "In progress"
                        : "Completed"}
                  </span>
                </div>
                <p className="bo-application-interview-time">
                  <time dateTime={startsAt.toISOString()}>{formatInterviewTime(startsAt)}</time>
                  {" – "}
                  <time dateTime={endsAt.toISOString()}>{formatInterviewTime(endsAt)}</time>
                  <span className="bo-application-interview-utc"> UTC</span>
                  <span className="bo-application-interview-duration-inline">
                    · {formatDurationMinutes(startsAt, endsAt)}
                  </span>
                </p>
                <ul className="bo-application-interview-meta">
                  {interview.notifyCandidateEmail ? (
                    <li>
                      <span
                        className={`bo-application-interview-badge${
                          interview.notificationSentAt
                            ? " bo-application-interview-badge--sent"
                            : " bo-application-interview-badge--pending"
                        }`}
                      >
                        {interview.notificationSentAt
                          ? "Email sent to candidate"
                          : "Email notification pending"}
                      </span>
                    </li>
                  ) : (
                    <li>
                      <span className="bo-application-interview-badge bo-application-interview-badge--muted">
                        No email notification
                      </span>
                    </li>
                  )}
                  {interview.scheduledByName ? (
                    <li className="bo-application-interview-scheduler">
                      Scheduled by {interview.scheduledByName}
                    </li>
                  ) : null}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
