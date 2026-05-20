"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import type { PipelineStatus } from "@ats-platform/types";
import { getApplicationStatusMeta } from "@ats-platform/types";

const WITHDRAWAL_SOURCES = [
  "Candidate Request",
  "Recruiter Update",
  "Duplicate Application",
  "Other",
] as const;

type BaseProps = {
  open: boolean;
  candidateName: string;
  jobTitle: string;
  onClose: () => void;
};

type RejectProps = BaseProps & {
  onConfirm: (payload: { reason: string; note: string; notifyCandidate: boolean }) => void;
  submitting: boolean;
};

export function PipelineRejectModal({
  open,
  candidateName,
  jobTitle,
  onClose,
  onConfirm,
  submitting,
}: RejectProps) {
  const titleId = useId();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [notifyCandidate, setNotifyCandidate] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setNote("");
    setNotifyCandidate(false);
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell titleId={titleId} title="Reject application" onClose={submitting ? undefined : onClose}>
      <p className="bo-modal-body" style={{ marginTop: 0 }}>
        <strong>{candidateName}</strong> · {jobTitle}
      </p>
      <form
        className="bo-modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason.trim() || submitting) return;
          onConfirm({ reason: reason.trim(), note: note.trim(), notifyCandidate });
        }}
      >
        <label className="form-label">
          Rejection reason <span className="bo-required">*</span>
          <textarea
            className="form-input"
            rows={3}
            required
            value={reason}
            disabled={submitting}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label className="form-label">
          Internal note
          <textarea
            className="form-input"
            rows={2}
            value={note}
            disabled={submitting}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <label className="bo-schedule-interview-checkbox">
          <input
            type="checkbox"
            checked={notifyCandidate}
            disabled={submitting}
            onChange={(e) => setNotifyCandidate(e.target.checked)}
          />
          <span>Notify candidate by email</span>
        </label>
        <ModalActions
          submitting={submitting}
          confirmLabel="Reject"
          confirmType="submit"
          onCancel={onClose}
          confirmDisabled={!reason.trim()}
        />
      </form>
    </ModalShell>
  );
}

type WithdrawProps = BaseProps & {
  onConfirm: (payload: { withdrawalSource: string; reason: string; note: string }) => void;
  submitting: boolean;
};

export function PipelineWithdrawModal({
  open,
  candidateName,
  jobTitle,
  onClose,
  onConfirm,
  submitting,
}: WithdrawProps) {
  const titleId = useId();
  const [source, setSource] = useState<string>(WITHDRAWAL_SOURCES[0]);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setSource(WITHDRAWAL_SOURCES[0]);
    setReason("");
    setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell titleId={titleId} title="Mark as withdrawn" onClose={submitting ? undefined : onClose}>
      <p className="bo-modal-body" style={{ marginTop: 0 }}>
        <strong>{candidateName}</strong> · {jobTitle}
      </p>
      <form
        className="bo-modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (submitting) return;
          onConfirm({ withdrawalSource: source, reason: reason.trim(), note: note.trim() });
        }}
      >
        <label className="form-label">
          Withdrawal source <span className="bo-required">*</span>
          <select
            className="form-input"
            value={source}
            disabled={submitting}
            onChange={(e) => setSource(e.target.value)}
          >
            {WITHDRAWAL_SOURCES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="form-label">
          Reason
          <textarea
            className="form-input"
            rows={2}
            value={reason}
            disabled={submitting}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label className="form-label">
          Internal note
          <textarea
            className="form-input"
            rows={2}
            value={note}
            disabled={submitting}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <ModalActions submitting={submitting} confirmLabel="Withdraw" confirmType="submit" onCancel={onClose} />
      </form>
    </ModalShell>
  );
}

type HiredProps = BaseProps & {
  onConfirm: () => void;
  submitting: boolean;
};

export function PipelineHiredModal({ open, candidateName, jobTitle, onClose, onConfirm, submitting }: HiredProps) {
  const titleId = useId();
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setConfirmed(false);
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell titleId={titleId} title="Confirm hire" onClose={submitting ? undefined : onClose}>
      <p className="bo-modal-body" style={{ marginTop: 0 }}>
        <strong>{candidateName}</strong> · {jobTitle}
      </p>
      <form
        className="bo-modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!confirmed || submitting) return;
          onConfirm();
        }}
      >
        <p className="bo-modal-body">
          Offered → Hired requires confirmation that the candidate has accepted the offer.
        </p>
        <label className="bo-schedule-interview-checkbox">
          <input
            type="checkbox"
            checked={confirmed}
            disabled={submitting}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span>Offer acceptance confirmed</span>
        </label>
        <ModalActions
          submitting={submitting}
          confirmLabel="Mark as hired"
          confirmType="submit"
          onCancel={onClose}
          confirmDisabled={!confirmed}
        />
      </form>
    </ModalShell>
  );
}

type ReopenProps = BaseProps & {
  onConfirm: (payload: { targetStatus: PipelineStatus; reason: string; note: string }) => void;
  submitting: boolean;
};

type MissingInterviewProps = BaseProps & {
  onScheduleNow: () => void;
};

export function PipelineMissingInterviewModal({
  open,
  candidateName,
  jobTitle,
  onClose,
  onScheduleNow,
}: MissingInterviewProps) {
  const titleId = useId();

  if (!open) return null;

  return (
    <ModalShell titleId={titleId} title="No interview scheduled" onClose={onClose}>
      <p className="bo-modal-body" style={{ marginTop: 0 }}>
        <strong>{candidateName}</strong> · {jobTitle}
      </p>
      <p className="bo-modal-body">
        There is no interview scheduled for this application. Do you want to schedule one now?
      </p>
      <ModalActions
        submitting={false}
        confirmLabel="Schedule now"
        cancelLabel="Cancel"
        onCancel={onClose}
        onConfirm={onScheduleNow}
      />
    </ModalShell>
  );
}

export function PipelineReopenModal({ open, candidateName, jobTitle, onClose, onConfirm, submitting }: ReopenProps) {
  const titleId = useId();
  const [targetStatus, setTargetStatus] = useState<PipelineStatus>("under_review");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setTargetStatus("under_review");
    setReason("");
    setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <ModalShell titleId={titleId} title="Reopen application" onClose={submitting ? undefined : onClose}>
      <p className="bo-modal-body" style={{ marginTop: 0 }}>
        <strong>{candidateName}</strong> · {jobTitle}
      </p>
      <form
        className="bo-modal-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!reason.trim() || submitting) return;
          onConfirm({ targetStatus, reason: reason.trim(), note: note.trim() });
        }}
      >
        <label className="form-label">
          Target status <span className="bo-required">*</span>
          <select
            className="form-input"
            value={targetStatus}
            disabled={submitting}
            onChange={(e) => setTargetStatus(e.target.value as PipelineStatus)}
          >
            <option value="under_review">{getApplicationStatusMeta("under_review").label}</option>
            <option value="shortlisted">{getApplicationStatusMeta("shortlisted").label}</option>
          </select>
        </label>
        <label className="form-label">
          Reopen reason <span className="bo-required">*</span>
          <textarea
            className="form-input"
            rows={3}
            required
            value={reason}
            disabled={submitting}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>
        <label className="form-label">
          Internal note
          <textarea
            className="form-input"
            rows={2}
            value={note}
            disabled={submitting}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <ModalActions
          submitting={submitting}
          confirmLabel="Reopen"
          confirmType="submit"
          onCancel={onClose}
          confirmDisabled={!reason.trim()}
        />
      </form>
    </ModalShell>
  );
}

function ModalShell({
  titleId,
  title,
  children,
  onClose,
}: {
  titleId: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="bo-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="bo-modal bo-modal--status"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className="bo-modal-title">
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}

function ModalActions({
  submitting,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmType = "button",
  onCancel,
  onConfirm,
  confirmDisabled,
}: {
  submitting: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  confirmType?: "button" | "submit";
  onCancel: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
}) {
  return (
    <div className="bo-modal-actions">
      <button type="button" className="btn btn-secondary" disabled={submitting} onClick={onCancel}>
        {cancelLabel}
      </button>
      <button
        type={confirmType}
        className="btn btn-primary"
        disabled={submitting || confirmDisabled}
        onClick={confirmType === "button" ? onConfirm : undefined}
      >
        {submitting ? "Saving…" : confirmLabel}
      </button>
    </div>
  );
}
