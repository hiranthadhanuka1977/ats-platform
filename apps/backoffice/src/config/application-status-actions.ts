import type { ApplicationStatusValue } from "@ats-platform/types";

/** Actions available from the application details header menu. */
export type ApplicationActionId = "schedule_interview" | "request_more_information";

export type ApplicationActionDefinition = {
  id: ApplicationActionId;
  label: string;
  /** Opens the schedule-interview modal instead of calling the API directly. */
  opensScheduleModal?: boolean;
  /** When set (and not using the schedule modal), PATCHes application status via the backoffice API. */
  nextStatus?: ApplicationStatusValue;
};

export const APPLICATION_ACTION_DEFINITIONS: Record<ApplicationActionId, ApplicationActionDefinition> = {
  schedule_interview: {
    id: "schedule_interview",
    label: "Schedule an Interview",
    opensScheduleModal: true,
  },
  request_more_information: {
    id: "request_more_information",
    label: "Request more information",
  },
};

const DEFAULT_ACTION_IDS: ApplicationActionId[] = ["request_more_information"];

/**
 * Per-status menu overrides. Statuses not listed here receive {@link DEFAULT_ACTION_IDS}.
 * Align keys with Prisma `ApplicationStatus` / `ApplicationStatusValue`.
 */
export const APPLICATION_STATUS_ACTION_IDS: Partial<Record<ApplicationStatusValue, ApplicationActionId[]>> = {
  shortlisted: ["schedule_interview", "request_more_information"],
};

/** Legacy DB value treated like `interview_scheduled` for action resolution only. */
const STATUS_ALIASES: Record<string, ApplicationStatusValue> = {
  interview: "interview_scheduled",
};

export function normalizeApplicationStatusForActions(status: string): ApplicationStatusValue | string {
  return STATUS_ALIASES[status] ?? status;
}

export function getApplicationActionsForStatus(
  status: string,
  options?: { hasScheduledInterview?: boolean },
): ApplicationActionDefinition[] {
  const normalized = normalizeApplicationStatusForActions(status);
  let ids =
    APPLICATION_STATUS_ACTION_IDS[normalized as ApplicationStatusValue] ?? DEFAULT_ACTION_IDS;
  if (options?.hasScheduledInterview) {
    ids = ids.filter((id) => id !== "schedule_interview");
  }
  return ids.map((id) => APPLICATION_ACTION_DEFINITIONS[id]);
}
