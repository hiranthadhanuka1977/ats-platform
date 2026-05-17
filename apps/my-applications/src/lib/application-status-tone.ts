export type ApplicationStatusTone = "pending" | "progress" | "success" | "negative" | "neutral";

export function getApplicationStatusTone(status: string): ApplicationStatusTone {
  switch (status) {
    case "hired":
    case "offered":
      return "success";
    case "shortlisted":
    case "interview":
    case "interview_scheduled":
    case "interview_completed":
      return "progress";
    case "rejected":
      return "negative";
    case "withdrawn":
      return "neutral";
    case "submitted":
    case "under_review":
    default:
      return "pending";
  }
}
