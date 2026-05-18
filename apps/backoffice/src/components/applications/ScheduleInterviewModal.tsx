"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  open: boolean;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  onClose: () => void;
  onScheduled: (message: string) => void;
  onError: (message: string) => void;
};

function defaultStartLocal(): string {
  const d = new Date();
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  return toDatetimeLocalValue(d);
}

function defaultEndLocal(startLocal: string): string {
  const start = fromDatetimeLocalValue(startLocal);
  if (!start) return startLocal;
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return toDatetimeLocalValue(end);
}

function toDatetimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): Date | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function ScheduleInterviewModal({
  open,
  applicationId,
  candidateName,
  candidateEmail,
  jobTitle,
  onClose,
  onScheduled,
  onError,
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const initialStart = defaultStartLocal();
  const [startsAtLocal, setStartsAtLocal] = useState(initialStart);
  const [endsAtLocal, setEndsAtLocal] = useState(() => defaultEndLocal(initialStart));
  const [notifyCandidateEmail, setNotifyCandidateEmail] = useState(true);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const start = defaultStartLocal();
    setStartsAtLocal(start);
    setEndsAtLocal(defaultEndLocal(start));
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

    const startsAt = fromDatetimeLocalValue(startsAtLocal);
    const endsAt = fromDatetimeLocalValue(endsAtLocal);

    if (!startsAt || !endsAt) {
      setFieldError("Start and end date/time are required.");
      return;
    }
    if (endsAt.getTime() <= startsAt.getTime()) {
      setFieldError("End time must be after start time.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/backoffice/applications/${applicationId}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
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
        <p className="bo-modal-body" style={{ marginTop: 0 }}>
          <strong>{candidateName}</strong> · {jobTitle}
        </p>

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="bo-schedule-interview-grid">
            <label className="form-label">
              From <span className="bo-required">*</span>
              <input
                type="datetime-local"
                className="form-input"
                value={startsAtLocal}
                required
                disabled={submitting}
                onChange={(e) => {
                  const next = e.target.value;
                  setStartsAtLocal(next);
                  const end = fromDatetimeLocalValue(endsAtLocal);
                  const start = fromDatetimeLocalValue(next);
                  if (start && end && end.getTime() <= start.getTime()) {
                    setEndsAtLocal(defaultEndLocal(next));
                  }
                }}
              />
            </label>
            <label className="form-label">
              To <span className="bo-required">*</span>
              <input
                type="datetime-local"
                className="form-input"
                value={endsAtLocal}
                required
                min={startsAtLocal || undefined}
                disabled={submitting}
                onChange={(e) => setEndsAtLocal(e.target.value)}
              />
            </label>
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
            <p className="bo-login-error" role="alert" style={{ marginTop: "0.75rem" }}>
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
