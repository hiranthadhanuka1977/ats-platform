"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  defaultSchedulingFields,
  formatCandidateInterviewPreview,
  formatDurationLabel,
  INTERVIEW_DURATION_MINUTES,
  resolveDefaultSchedulingTimeZone,
  SCHEDULING_TIMEZONE_IDS,
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

function buildTimezoneOptions(preferredTimeZone: string) {
  const ids = new Set<string>([preferredTimeZone, ...SCHEDULING_TIMEZONE_IDS]);
  return [...ids].map((value) => ({
    value,
    label: schedulingTimeZoneLabel(value),
  }));
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

  const timezoneOptions = useMemo(
    () => buildTimezoneOptions(schedulingTimeZone),
    [schedulingTimeZone],
  );

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
        className="bo-modal bo-modal--schedule-interview"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="bo-modal-title">
          Schedule an interview
        </h2>
        <p className="bo-modal-body bo-modal-body--schedule-context">
          <strong>{candidateName}</strong> · {jobTitle}
        </p>

        <form className="bo-modal-form bo-modal-form--schedule-interview" onSubmit={(e) => void handleSubmit(e)}>
          <div className="bo-schedule-interview-fields">
            <label className="form-label">
              <span className="form-label-text">
                Interview date <span className="bo-required">*</span>
              </span>
              <input
                type="date"
                className="form-input"
                value={interviewDate}
                required
                disabled={submitting}
                onChange={(e) => setInterviewDate(e.target.value)}
              />
            </label>

            <label className="form-label">
              <span className="form-label-text">
                Start time <span className="bo-required">*</span>
              </span>
              <input
                type="time"
                className="form-input form-input--time"
                value={startTime}
                required
                step={900}
                disabled={submitting}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>

            <label className="form-label">
              <span className="form-label-text">
                Duration <span className="bo-required">*</span>
              </span>
              <select
                className="form-input"
                value={durationMinutes}
                required
                disabled={submitting}
                onChange={(e) =>
                  setDurationMinutes(Number(e.target.value) as InterviewDurationMinutes)
                }
              >
                {INTERVIEW_DURATION_MINUTES.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {formatDurationLabel(minutes)}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-label">
              <span className="form-label-text">
                Time zone <span className="bo-required">*</span>
              </span>
              <select
                className="form-input"
                value={schedulingTimeZone}
                required
                disabled={submitting}
                onChange={(e) => setSchedulingTimeZone(e.target.value)}
              >
                {timezoneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            id={previewId}
            className="bo-schedule-interview-preview"
            role="status"
            aria-live="polite"
          >
            <p className="bo-schedule-interview-preview-title">Candidate time preview</p>
            <div className="bo-schedule-interview-preview-row">
              <span className="bo-schedule-interview-preview-label">Scheduling time</span>
              <span className="bo-schedule-interview-preview-value">{preview.schedulingLabel}</span>
            </div>
            <div className="bo-schedule-interview-preview-row">
              <span className="bo-schedule-interview-preview-label">Candidate local</span>
              <span className="bo-schedule-interview-preview-value">{preview.candidateLabel}</span>
            </div>
          </div>

          <label className="bo-schedule-interview-checkbox">
            <input
              type="checkbox"
              checked={notifyCandidateEmail}
              disabled={submitting}
              onChange={(e) => setNotifyCandidateEmail(e.target.checked)}
            />
            <span>
              Send email notification to <strong>{candidateEmail}</strong>
            </span>
          </label>

          {fieldError ? (
            <p className="bo-login-error" role="alert">
              {fieldError}
            </p>
          ) : null}

          <div className="bo-modal-actions">
            <button type="button" className="btn btn-secondary" disabled={submitting} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Scheduling…" : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
