"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  defaultSchedulingFields,
  formatCandidateInterviewPreview,
  formatDurationLabel,
  groupSchedulingTimeZones,
  INTERVIEW_DURATION_MINUTES,
  listSchedulingTimeZoneIds,
  resolveDefaultSchedulingTimeZone,
  schedulingTimeZoneLabel,
  type InterviewDurationMinutes,
} from "@ats-platform/utils/interview-scheduling";

type Props = {
  open: boolean;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  candidateTimeZone?: string | null;
  jobTitle: string;
  onClose: () => void;
  onScheduled: (message: string) => void;
  onError: (message: string) => void;
};

function candidateInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function durationChipLabel(minutes: InterviewDurationMinutes): string {
  if (minutes < 60) return `${minutes}m`;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function ScheduleInterviewModal({
  open,
  applicationId,
  candidateName,
  candidateEmail,
  candidateTimeZone = null,
  jobTitle,
  onClose,
  onScheduled,
  onError,
}: Props) {
  const titleId = useId();
  const previewId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const defaultTimeZone = resolveDefaultSchedulingTimeZone();
  const initialFields = defaultSchedulingFields(defaultTimeZone);

  const [interviewDate, setInterviewDate] = useState(initialFields.interviewDate);
  const [startTime, setStartTime] = useState(initialFields.startTime);
  const [durationMinutes, setDurationMinutes] = useState<InterviewDurationMinutes>(
    initialFields.durationMinutes,
  );
  const [schedulingTimeZone, setSchedulingTimeZone] = useState(defaultTimeZone);
  const [notifyCandidateEmail, setNotifyCandidateEmail] = useState(true);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const timezoneGroups = useMemo(() => {
    const ids = listSchedulingTimeZoneIds(resolveDefaultSchedulingTimeZone());
    return groupSchedulingTimeZones(ids).map((group) => ({
      ...group,
      options: group.zones.map((value) => ({
        value,
        label: schedulingTimeZoneLabel(value),
      })),
    }));
  }, [open]);

  const preview = useMemo(
    () =>
      formatCandidateInterviewPreview(
        interviewDate,
        startTime,
        durationMinutes,
        schedulingTimeZone,
        candidateTimeZone,
      ),
    [interviewDate, startTime, durationMinutes, schedulingTimeZone, candidateTimeZone],
  );

  useEffect(() => {
    if (!open) return;
    const tz = resolveDefaultSchedulingTimeZone();
    const fields = defaultSchedulingFields(tz);
    setInterviewDate(fields.interviewDate);
    setStartTime(fields.startTime);
    setDurationMinutes(fields.durationMinutes);
    setSchedulingTimeZone(tz);
    setNotifyCandidateEmail(true);
    setFieldError(null);
    setSubmitting(false);
    dialogRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, submitting, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFieldError(null);

    if (!interviewDate || !startTime) {
      setFieldError("Interview date and start time are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/backoffice/applications/${applicationId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewDate,
          startTime,
          durationMinutes,
          schedulingTimeZone,
          notifyCandidateEmail,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: { emailNotificationQueued?: boolean };
        error?: { message?: string };
      };

      if (!res.ok) {
        onError(json.error?.message ?? "Could not schedule interview.");
        setSubmitting(false);
        return;
      }

      const emailNote =
        json.data?.emailNotificationQueued && notifyCandidateEmail
          ? ` Email notification queued for ${candidateEmail}.`
          : "";
      onScheduled(`Interview scheduled for ${candidateName}.${emailNote}`);
      onClose();
    } catch {
      onError("Network error while scheduling interview.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bo-modal-backdrop" role="presentation" onClick={submitting ? undefined : onClose}>
      <div
        ref={dialogRef}
        className="bo-schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bo-schedule-modal__header">
          <div className="bo-schedule-modal__header-text">
            <h2 id={titleId} className="bo-schedule-modal__title">
              Schedule interview
            </h2>
            <p className="bo-schedule-modal__subtitle">Pick a slot and confirm the candidate preview.</p>
          </div>
          <button
            type="button"
            className="bo-schedule-modal__close"
            aria-label="Close"
            disabled={submitting}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="bo-schedule-modal__context">
          <span className="bo-schedule-modal__avatar" aria-hidden="true">
            {candidateInitials(candidateName)}
          </span>
          <div className="bo-schedule-modal__context-body">
            <p className="bo-schedule-modal__context-name">{candidateName}</p>
            <p className="bo-schedule-modal__context-job">{jobTitle}</p>
          </div>
        </div>

        <form className="bo-schedule-modal__form" onSubmit={(e) => void handleSubmit(e)}>
          <fieldset className="bo-schedule-modal__section" disabled={submitting}>
            <legend className="bo-schedule-modal__legend">When</legend>
            <div className="bo-schedule-modal__when-row">
              <label className="bo-schedule-modal__field">
                <span className="bo-schedule-modal__label">Date</span>
                <input
                  type="date"
                  className="bo-schedule-modal__input"
                  value={interviewDate}
                  required
                  onChange={(e) => setInterviewDate(e.target.value)}
                />
              </label>
              <label className="bo-schedule-modal__field">
                <span className="bo-schedule-modal__label">Start time</span>
                <input
                  type="time"
                  className="bo-schedule-modal__input"
                  value={startTime}
                  required
                  step={900}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="bo-schedule-modal__section" disabled={submitting}>
            <legend className="bo-schedule-modal__legend">Duration</legend>
            <div className="bo-schedule-modal__duration-grid" role="group" aria-label="Interview duration">
              {INTERVIEW_DURATION_MINUTES.map((minutes) => {
                const selected = durationMinutes === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    className={`bo-schedule-modal__duration${selected ? " is-selected" : ""}`}
                    aria-pressed={selected}
                    onClick={() => setDurationMinutes(minutes)}
                  >
                    <span className="bo-schedule-modal__duration-short">{durationChipLabel(minutes)}</span>
                    <span className="bo-schedule-modal__duration-full">{formatDurationLabel(minutes)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <label className="bo-schedule-modal__field bo-schedule-modal__field--full">
            <span className="bo-schedule-modal__label">Time zone</span>
            <select
              className="bo-schedule-modal__input bo-schedule-modal__select"
              value={schedulingTimeZone}
              required
              disabled={submitting}
              onChange={(e) => setSchedulingTimeZone(e.target.value)}
            >
              {timezoneGroups.map((group) => (
                <optgroup key={group.region} label={group.region}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <div id={previewId} className="bo-schedule-modal__preview" role="status" aria-live="polite">
            <div className="bo-schedule-modal__preview-head">
              <span className="bo-schedule-modal__preview-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </span>
              <span className="bo-schedule-modal__preview-title">Candidate time preview</span>
            </div>
            <dl className="bo-schedule-modal__preview-list">
              <div className="bo-schedule-modal__preview-item">
                <dt>Your scheduling time</dt>
                <dd>{preview.schedulingLabel}</dd>
              </div>
              <div className="bo-schedule-modal__preview-item">
                <dt>Candidate local</dt>
                <dd>{preview.candidateLabel}</dd>
              </div>
            </dl>
          </div>

          <label className="bo-schedule-modal__notify">
            <input
              type="checkbox"
              checked={notifyCandidateEmail}
              disabled={submitting}
              onChange={(e) => setNotifyCandidateEmail(e.target.checked)}
            />
            <span>
              Email the candidate at <strong>{candidateEmail}</strong>
            </span>
          </label>

          {fieldError ? (
            <p className="bo-schedule-modal__error" role="alert">
              {fieldError}
            </p>
          ) : null}

          <footer className="bo-schedule-modal__footer">
            <button type="button" className="btn btn-secondary" disabled={submitting} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Scheduling…" : "Schedule interview"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
