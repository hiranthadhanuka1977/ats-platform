import type { ApplicationStatusValue } from "./application-status";

/** Canonical statuses used for pipeline rules (legacy `interview` maps to interview_scheduled). */
export type PipelineStatus = Exclude<ApplicationStatusValue, "interview">;

export const ACTIVE_PIPELINE_STATUSES: PipelineStatus[] = [
  "submitted",
  "under_review",
  "shortlisted",
  "interview_scheduled",
  "interview_completed",
  "offered",
  "hired",
];

export const TERMINAL_PIPELINE_STATUSES: PipelineStatus[] = ["rejected", "withdrawn"];

export const REOPEN_TARGET_STATUSES: PipelineStatus[] = ["under_review", "shortlisted"];

/** Allowed transitions per spec §5 (snake_case keys). */
export const APPLICATION_STATUS_TRANSITIONS: Record<PipelineStatus, PipelineStatus[]> = {
  submitted: ["under_review", "shortlisted", "rejected", "withdrawn"],
  under_review: ["shortlisted", "interview_scheduled", "rejected", "withdrawn"],
  shortlisted: ["under_review", "interview_scheduled", "rejected", "withdrawn"],
  interview_scheduled: ["interview_completed", "rejected", "withdrawn"],
  interview_completed: ["shortlisted", "interview_scheduled", "offered", "rejected", "withdrawn"],
  offered: ["hired", "rejected", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};

export type StatusTransitionErrorCode =
  | "INVALID_TARGET_STATUS"
  | "INVALID_STATUS_TRANSITION"
  | "USE_REOPEN_ACTION"
  | "TERMINAL_STATE"
  | "REJECTION_REASON_REQUIRED"
  | "WITHDRAWAL_SOURCE_REQUIRED"
  | "OFFER_ACCEPTANCE_REQUIRED"
  | "INTERVIEW_RECORD_REQUIRED"
  | "STATUS_CONFLICT";

export function normalizePipelineStatus(status: string): PipelineStatus | null {
  const normalized = status === "interview" ? "interview_scheduled" : status;
  if (normalized in APPLICATION_STATUS_TRANSITIONS) {
    return normalized as PipelineStatus;
  }
  return null;
}

export function getAllowedTargetStatuses(fromStatus: string): PipelineStatus[] {
  const from = normalizePipelineStatus(fromStatus);
  if (!from) return [];
  return APPLICATION_STATUS_TRANSITIONS[from];
}

export function canTransition(fromStatus: string, toStatus: string): boolean {
  const from = normalizePipelineStatus(fromStatus);
  const to = normalizePipelineStatus(toStatus);
  if (!from || !to) return false;
  return APPLICATION_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalForDragDrop(status: string): boolean {
  const s = normalizePipelineStatus(status);
  return s === "hired" || s === "withdrawn" || s === "rejected";
}

export function requiresReopenAction(fromStatus: string, toStatus: string): boolean {
  const from = normalizePipelineStatus(fromStatus);
  const to = normalizePipelineStatus(toStatus);
  if (from !== "rejected" || !to) return false;
  return REOPEN_TARGET_STATUSES.includes(to);
}

export function isValidReopenTarget(toStatus: string): toStatus is (typeof REOPEN_TARGET_STATUSES)[number] {
  const to = normalizePipelineStatus(toStatus);
  return to !== null && REOPEN_TARGET_STATUSES.includes(to);
}

export function formatTransitionErrorMessage(fromStatus: string, toStatus: string): string {
  const from = normalizePipelineStatus(fromStatus);
  const to = normalizePipelineStatus(toStatus);
  const fromLabel = from ? from.replace(/_/g, " ") : fromStatus;
  const toLabel = to ? to.replace(/_/g, " ") : toStatus;
  return `This application cannot be moved from ${fromLabel} to ${toLabel}.`;
}
