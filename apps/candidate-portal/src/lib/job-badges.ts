import type { JobListItem } from "@/lib/jobs";

export type BadgeVariant = "primary" | "accent" | "success" | "warning";

export function getWorkplaceBadge(
  job: Pick<JobListItem, "isRemote" | "jobPostingTags">,
): { name: string; variant: BadgeVariant } | null {
  const names = new Set(job.jobPostingTags.map((j) => j.tag.name));
  if (names.has("Remote")) return { name: "Remote", variant: "success" };
  if (names.has("Hybrid")) return { name: "Hybrid", variant: "warning" };
  if (names.has("On-site")) return { name: "On-site", variant: "accent" };
  if (job.isRemote) return { name: "Remote", variant: "success" };
  return null;
}

export function badgeClass(variant: BadgeVariant): string {
  switch (variant) {
    case "accent":
      return "badge badge-accent";
    case "success":
      return "badge badge-success";
    case "warning":
      return "badge badge-warning";
    default:
      return "badge badge-primary";
  }
}
