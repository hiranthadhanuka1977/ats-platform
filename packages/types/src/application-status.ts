export type ApplicationStatusValue =
  | "submitted"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "interview_scheduled"
  | "interview_completed"
  | "offered"
  | "hired"
  | "rejected"
  | "withdrawn";

export type ApplicationStatusMeta = {
  value: ApplicationStatusValue;
  label: string;
  description: string;
};

export const APPLICATION_STATUS_META: Record<ApplicationStatusValue, ApplicationStatusMeta> = {
  submitted: {
    value: "submitted",
    label: "Submitted",
    description: "Application successfully submitted",
  },
  under_review: {
    value: "under_review",
    label: "Under Review",
    description: "Recruiter is reviewing the application",
  },
  shortlisted: {
    value: "shortlisted",
    label: "Shortlisted",
    description: "Candidate passed initial screening",
  },
  interview_scheduled: {
    value: "interview_scheduled",
    label: "Interview Scheduled",
    description: "Interview has been arranged",
  },
  interview_completed: {
    value: "interview_completed",
    label: "Interview Completed",
    description: "Interview is done and feedback can be reviewed",
  },
  offered: {
    value: "offered",
    label: "Offered",
    description: "Candidate has been selected and offer issued",
  },
  hired: {
    value: "hired",
    label: "Hired",
    description: "Candidate accepted and hiring is completed",
  },
  rejected: {
    value: "rejected",
    label: "Rejected",
    description: "Candidate is no longer considered",
  },
  withdrawn: {
    value: "withdrawn",
    label: "Withdrawn",
    description: "Candidate withdrew the application",
  },
  // Legacy value retained for backward compatibility.
  interview: {
    value: "interview",
    label: "Interview",
    description: "Candidate is in the interview stage",
  },
};

export function getApplicationStatusMeta(status: string): ApplicationStatusMeta {
  const known = APPLICATION_STATUS_META[status as ApplicationStatusValue];
  if (known) return known;
  const fallbackLabel = status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return {
    value: "submitted",
    label: fallbackLabel,
    description: "Application status",
  };
}
