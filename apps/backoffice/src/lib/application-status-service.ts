import type { ApplicationStatus } from "@prisma/client";
import { recordApplicationStatusEvent } from "@ats-platform/db";
import type {
  ApplicationReopenInput,
  ApplicationStatusPatchInput,
  ApplicationStatusUndoInput,
} from "@ats-platform/validators";
import {
  canTransition,
  formatTransitionErrorMessage,
  isValidReopenTarget,
  normalizePipelineStatus,
  requiresReopenAction,
  type StatusTransitionErrorCode,
} from "@ats-platform/types";
import { prisma } from "@/lib/prisma";

export type StatusUpdateSuccess = {
  id: string;
  status: string;
  previousStatus: string;
  updatedAt: string;
};

export type StatusUpdateFailure = {
  code:
    | StatusTransitionErrorCode
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "UPDATE_FAILED"
    | "UNDO_NOT_AVAILABLE";
  message: string;
  httpStatus: number;
};

const BACKWARD_FROM_INTERVIEW_TARGETS = new Set(["under_review", "shortlisted"]);

function mapToPrismaStatus(status: string): ApplicationStatus {
  if (status === "interview") return "interview_scheduled";
  return status as ApplicationStatus;
}

function validateTransitionRequest(
  fromStatus: string,
  input: ApplicationStatusPatchInput,
): StatusUpdateFailure | null {
  const from = normalizePipelineStatus(fromStatus);
  const to = normalizePipelineStatus(input.status);

  if (!from || !to) {
    return {
      code: "INVALID_TARGET_STATUS",
      message: "Invalid application status.",
      httpStatus: 400,
    };
  }

  if (from === "rejected") {
    return {
      code: "USE_REOPEN_ACTION",
      message: "Rejected applications must be reopened using the Reopen Application action.",
      httpStatus: 409,
    };
  }

  if (from === "hired" || from === "withdrawn") {
    return {
      code: "TERMINAL_STATE",
      message: `Applications in ${from.replace(/_/g, " ")} cannot be updated through the pipeline.`,
      httpStatus: 409,
    };
  }

  if (!canTransition(fromStatus, input.status)) {
    return {
      code: "INVALID_STATUS_TRANSITION",
      message: formatTransitionErrorMessage(fromStatus, input.status),
      httpStatus: 409,
    };
  }

  if (to === "rejected" && !input.reason?.trim()) {
    return {
      code: "REJECTION_REASON_REQUIRED",
      message: "A rejection reason is required.",
      httpStatus: 400,
    };
  }

  if (to === "withdrawn" && !input.withdrawalSource?.trim()) {
    return {
      code: "WITHDRAWAL_SOURCE_REQUIRED",
      message: "Withdrawal source is required.",
      httpStatus: 400,
    };
  }

  if (from === "offered" && to === "hired" && input.offerAccepted !== true) {
    return {
      code: "OFFER_ACCEPTANCE_REQUIRED",
      message: "Offer acceptance must be confirmed before marking as hired.",
      httpStatus: 400,
    };
  }

  if (requiresReopenAction(fromStatus, input.status)) {
    return {
      code: "USE_REOPEN_ACTION",
      message: "Use the Reopen Application action for this transition.",
      httpStatus: 409,
    };
  }

  return null;
}

export async function updateApplicationStatus(
  applicationId: string,
  staffUserId: string,
  input: ApplicationStatusPatchInput,
): Promise<StatusUpdateSuccess | StatusUpdateFailure> {
  const existing = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      updatedAt: true,
      _count: { select: { interviews: true } },
    },
  });

  if (!existing) {
    return { code: "NOT_FOUND", message: "Application not found.", httpStatus: 404 };
  }

  if (
    input.expectedUpdatedAt &&
    existing.updatedAt.toISOString() !== input.expectedUpdatedAt
  ) {
    return {
      code: "STATUS_CONFLICT",
      message: "Application status has changed. Please refresh the board.",
      httpStatus: 409,
    };
  }

  const validationError = validateTransitionRequest(existing.status, input);
  if (validationError) return validationError;

  const fromNormalized = normalizePipelineStatus(existing.status);
  const toNormalized = normalizePipelineStatus(input.status);

  if (
    toNormalized === "interview_scheduled" &&
    existing._count.interviews < 1
  ) {
    return {
      code: "INTERVIEW_RECORD_REQUIRED",
      message: "Schedule an interview before moving to Interview Scheduled.",
      httpStatus: 409,
    };
  }

  if (
    fromNormalized === "interview_scheduled" &&
    toNormalized === "interview_completed" &&
    existing._count.interviews < 1
  ) {
    return {
      code: "INTERVIEW_RECORD_REQUIRED",
      message: "Schedule an interview before marking as interview completed.",
      httpStatus: 409,
    };
  }

  if (
    fromNormalized === "interview_scheduled" &&
    toNormalized &&
    BACKWARD_FROM_INTERVIEW_TARGETS.has(toNormalized) &&
    existing._count.interviews > 0 &&
    input.cancelInterview !== true
  ) {
    return {
      code: "INTERVIEW_CANCEL_REQUIRED",
      message: "Cancel the scheduled interview before moving this application backward in the pipeline.",
      httpStatus: 409,
    };
  }

  const prismaStatus = mapToPrismaStatus(input.status);
  const noteParts: string[] = [];
  if (input.note?.trim()) noteParts.push(input.note.trim());
  if (input.withdrawalSource?.trim()) {
    noteParts.push(`Withdrawal source: ${input.withdrawalSource.trim()}`);
  }
  if (input.notifyCandidate) noteParts.push("Notify candidate: yes");
  if (input.cancelInterview) noteParts.push("Scheduled interview cancelled");
  if (input.cancelInterview && input.notifyCandidate) {
    noteParts.push("Interview cancellation notification: yes");
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (
        fromNormalized === "interview_scheduled" &&
        toNormalized &&
        BACKWARD_FROM_INTERVIEW_TARGETS.has(toNormalized) &&
        input.cancelInterview
      ) {
        await tx.applicationInterview.deleteMany({ where: { applicationId } });
      }

      const row = await tx.application.update({
        where: { id: applicationId },
        data: { status: prismaStatus },
        select: { id: true, status: true, updatedAt: true },
      });

      await recordApplicationStatusEvent(tx, {
        applicationId,
        fromStatus: existing.status,
        toStatus: row.status,
        reason: input.reason?.trim() || null,
        note: noteParts.length > 0 ? noteParts.join("\n") : null,
        changeSource: "pipeline",
        changedByStaffId: staffUserId,
      });

      return row;
    });

    return {
      id: updated.id,
      status: updated.status,
      previousStatus: existing.status,
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update application status.";
    return { code: "UPDATE_FAILED", message, httpStatus: 500 };
  }
}

export async function reopenApplication(
  applicationId: string,
  staffUserId: string,
  input: ApplicationReopenInput,
): Promise<StatusUpdateSuccess | StatusUpdateFailure> {
  if (!isValidReopenTarget(input.targetStatus)) {
    return {
      code: "INVALID_TARGET_STATUS",
      message: "Invalid reopen target status.",
      httpStatus: 400,
    };
  }

  const existing = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, updatedAt: true },
  });

  if (!existing) {
    return { code: "NOT_FOUND", message: "Application not found.", httpStatus: 404 };
  }

  if (normalizePipelineStatus(existing.status) !== "rejected") {
    return {
      code: "INVALID_STATUS_TRANSITION",
      message: "Only rejected applications can be reopened.",
      httpStatus: 409,
    };
  }

  if (
    input.expectedUpdatedAt &&
    existing.updatedAt.toISOString() !== input.expectedUpdatedAt
  ) {
    return {
      code: "STATUS_CONFLICT",
      message: "Application status has changed. Please refresh the board.",
      httpStatus: 409,
    };
  }

  const prismaStatus = mapToPrismaStatus(input.targetStatus);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.application.update({
        where: { id: applicationId },
        data: { status: prismaStatus },
        select: { id: true, status: true, updatedAt: true },
      });

      await recordApplicationStatusEvent(tx, {
        applicationId,
        fromStatus: existing.status,
        toStatus: row.status,
        reason: input.reason.trim(),
        note: input.note?.trim() || null,
        changeSource: "reopen",
        changedByStaffId: staffUserId,
      });

      return row;
    });

    return {
      id: updated.id,
      status: updated.status,
      previousStatus: existing.status,
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not reopen application.";
    return { code: "UPDATE_FAILED", message, httpStatus: 500 };
  }
}

const UNDOABLE_CHANGE_SOURCES = new Set(["pipeline", "reopen"]);

function statusesMatch(a: string, b: string): boolean {
  const left = normalizePipelineStatus(a);
  const right = normalizePipelineStatus(b);
  return left !== null && left === right;
}

/** Reverts the latest pipeline/reopen status change by the current staff member. */
export async function undoApplicationStatus(
  applicationId: string,
  staffUserId: string,
  input: ApplicationStatusUndoInput,
): Promise<StatusUpdateSuccess | StatusUpdateFailure> {
  const existing = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, updatedAt: true },
  });

  if (!existing) {
    return { code: "NOT_FOUND", message: "Application not found.", httpStatus: 404 };
  }

  if (existing.updatedAt.toISOString() !== input.expectedUpdatedAt) {
    return {
      code: "STATUS_CONFLICT",
      message: "Application status has changed. Please refresh the board.",
      httpStatus: 409,
    };
  }

  if (!statusesMatch(existing.status, input.currentStatus)) {
    return {
      code: "UNDO_NOT_AVAILABLE",
      message: "This move can no longer be undone.",
      httpStatus: 409,
    };
  }

  if (!normalizePipelineStatus(input.previousStatus)) {
    return {
      code: "VALIDATION_ERROR",
      message: "Invalid previous status.",
      httpStatus: 400,
    };
  }

  const latestEvent = await prisma.applicationStatusEvent.findFirst({
    where: { applicationId },
    orderBy: { changedAt: "desc" },
    select: {
      fromStatus: true,
      toStatus: true,
      changedByStaffId: true,
      changeSource: true,
    },
  });

  if (
    !latestEvent ||
    !latestEvent.fromStatus ||
    !statusesMatch(latestEvent.fromStatus, input.previousStatus) ||
    !statusesMatch(latestEvent.toStatus, input.currentStatus) ||
    latestEvent.changedByStaffId !== staffUserId ||
    !latestEvent.changeSource ||
    !UNDOABLE_CHANGE_SOURCES.has(latestEvent.changeSource)
  ) {
    return {
      code: "UNDO_NOT_AVAILABLE",
      message: "Only your most recent pipeline move can be undone.",
      httpStatus: 409,
    };
  }

  const prismaStatus = mapToPrismaStatus(input.previousStatus);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const row = await tx.application.update({
        where: { id: applicationId },
        data: { status: prismaStatus },
        select: { id: true, status: true, updatedAt: true },
      });

      await recordApplicationStatusEvent(tx, {
        applicationId,
        fromStatus: existing.status,
        toStatus: row.status,
        reason: "Pipeline undo",
        changeSource: "undo",
        changedByStaffId: staffUserId,
      });

      return row;
    });

    return {
      id: updated.id,
      status: updated.status,
      previousStatus: existing.status,
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not undo status change.";
    return { code: "UPDATE_FAILED", message, httpStatus: 500 };
  }
}
