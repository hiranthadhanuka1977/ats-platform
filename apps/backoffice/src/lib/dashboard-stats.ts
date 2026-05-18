import type { PrismaClient } from "@prisma/client";
import { getApplicationStatusMeta } from "@ats-platform/types";
import type { ActivityItem } from "@/components/dashboard/RecentActivity";
import type { PipelineStage } from "@/components/dashboard/PipelineHealth";
import type { StatItem } from "@/components/dashboard/StatRow";
import { formatActivityTime } from "@/lib/format-activity-time";

const PENDING_STATUSES = ["submitted", "under_review", "shortlisted"] as const;
const INTERVIEW_STATUSES = ["interview", "interview_scheduled", "interview_completed"] as const;
const PIPELINE_BUCKETS: { name: string; statuses: string[] }[] = [
  { name: "Submitted", statuses: ["submitted"] },
  { name: "Under review", statuses: ["under_review"] },
  { name: "Shortlisted", statuses: ["shortlisted"] },
  { name: "Interviewing", statuses: [...INTERVIEW_STATUSES] },
  { name: "Offered", statuses: ["offered"] },
  { name: "Hired", statuses: ["hired"] },
  { name: "Rejected", statuses: ["rejected"] },
  { name: "Withdrawn", statuses: ["withdrawn"] },
];

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatDeltaPercent(current: number, previous: number): { text: string; variant: "up" | "down" } {
  if (previous === 0) {
    if (current === 0) return { text: "No change vs last month", variant: "up" };
    return { text: "+100% vs last month", variant: "up" };
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return { text: "No change vs last month", variant: "up" };
  const sign = pct > 0 ? "+" : "";
  return {
    text: `${sign}${pct}% vs last month`,
    variant: pct >= 0 ? "up" : "down",
  };
}

function normalizeStatusKey(status: string): string {
  return status === "interview" ? "interview_scheduled" : status;
}

function activityIcon(toStatus: string, fromStatus: string | null): ActivityItem["icon"] {
  if (!fromStatus) return "doc";
  if (toStatus === "hired" || toStatus === "offered") return "check";
  if (INTERVIEW_STATUSES.includes(toStatus as (typeof INTERVIEW_STATUSES)[number])) return "calendar";
  return "doc";
}

function candidateDisplayName(profile: { firstName: string | null; lastName: string | null } | null, email: string): string {
  const full = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
  return full || email;
}

function computeEfficiencyScore(input: {
  totalApplications: number;
  hiredCount: number;
  advancedCount: number;
  staleInterviewCount: number;
  activeAdverts: number;
  advertsWithApplications: number;
}): number {
  if (input.totalApplications === 0) return 0;

  const advanceRate = (input.advancedCount / input.totalApplications) * 100;
  const hireRate = (input.hiredCount / input.totalApplications) * 100;
  const advertReach =
    input.activeAdverts === 0 ? 50 : (input.advertsWithApplications / input.activeAdverts) * 100;
  const stalePenalty = Math.min(25, input.staleInterviewCount * 4);

  const raw = 0.35 * advanceRate + 0.35 * hireRate * 2.5 + 0.2 * advertReach - stalePenalty;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export type DashboardStatsData = {
  stats: StatItem[];
  efficiencyScore: number;
  pipelineStages: PipelineStage[];
  recentActivity: ActivityItem[];
  stalledInterviewCount: number;
};

export async function getDashboardStats(prisma: PrismaClient): Promise<DashboardStatsData> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const startOfThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const startOfLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  const [
    activeAdverts,
    publishedThisWeek,
    totalCandidates,
    candidatesThisMonth,
    candidatesLastMonth,
    pendingApplications,
    newPendingThisWeek,
    statusGroups,
    hiredCount,
    totalApplications,
    advancedCount,
    staleInterviewCount,
    advertsWithApplications,
    recentEvents,
  ] = await Promise.all([
    prisma.jobPosting.count({ where: { status: "published" } }),
    prisma.jobPosting.count({
      where: { status: "published", postedAt: { gte: sevenDaysAgo } },
    }),
    prisma.candidateAccount.count(),
    prisma.candidateAccount.count({ where: { createdAt: { gte: startOfThisMonth } } }),
    prisma.candidateAccount.count({
      where: { createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } },
    }),
    prisma.application.count({ where: { status: { in: [...PENDING_STATUSES] } } }),
    prisma.application.count({
      where: {
        status: { in: [...PENDING_STATUSES] },
        appliedAt: { gte: sevenDaysAgo },
      },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.application.count({ where: { status: "hired" } }),
    prisma.application.count(),
    prisma.application.count({
      where: { status: { notIn: ["submitted", "rejected", "withdrawn"] } },
    }),
    prisma.application.count({
      where: {
        status: { in: [...INTERVIEW_STATUSES] },
        updatedAt: { lt: fourteenDaysAgo },
      },
    }),
    prisma.jobPosting.count({
      where: {
        status: "published",
        applications: { some: {} },
      },
    }),
    prisma.applicationStatusEvent.findMany({
      orderBy: { changedAt: "desc" },
      take: 8,
      include: {
        application: {
          include: {
            jobPosting: { select: { title: true } },
            candidateAccount: {
              select: {
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        },
        changedByStaff: { select: { name: true } },
      },
    }),
  ]);

  const countByStatus = new Map<string, number>(
    statusGroups.map((row) => [row.status as string, row._count._all]),
  );
  const pipelineDenominator = totalApplications;

  const pipelineStages: PipelineStage[] = PIPELINE_BUCKETS.map((bucket) => {
    const count = bucket.statuses.reduce((sum, status) => sum + (countByStatus.get(status) ?? 0), 0);
    const pct = pipelineDenominator > 0 ? Math.round((count / pipelineDenominator) * 100) : 0;
    const isMuted = bucket.name === "Withdrawn" || bucket.name === "Rejected";
    return {
      name: bucket.name,
      pct,
      barStyle: isMuted
        ? { width: `${pct}%`, background: "linear-gradient(90deg, #94a3b8, #cbd5e1)" }
        : { width: `${pct}%` },
    };
  });

  const candidateDelta = formatDeltaPercent(candidatesThisMonth, candidatesLastMonth);

  const pendingDeltaText =
    newPendingThisWeek > 0
      ? `+${formatCount(newPendingThisWeek)} new this week`
      : pendingApplications === 0
        ? "No pending applications"
        : "No new pending this week";

  const stats: StatItem[] = [
    {
      id: "adverts",
      value: formatCount(activeAdverts),
      label: "Active adverts",
      delta:
        publishedThisWeek > 0
          ? `+${formatCount(publishedThisWeek)} published this week`
          : "No new posts this week",
      deltaVariant: publishedThisWeek > 0 ? "up" : "down",
    },
    {
      id: "candidates",
      value: formatCount(totalCandidates),
      label: "Total candidates",
      delta: candidateDelta.text,
      deltaVariant: candidateDelta.variant,
    },
    {
      id: "pending",
      value: formatCount(pendingApplications),
      label: "Pending applications",
      delta: pendingDeltaText,
      deltaVariant: newPendingThisWeek > 0 ? "up" : "down",
    },
  ];

  const efficiencyScore = computeEfficiencyScore({
    totalApplications,
    hiredCount,
    advancedCount,
    staleInterviewCount,
    activeAdverts,
    advertsWithApplications,
  });

  const recentActivity: ActivityItem[] = recentEvents.map((event) => {
    const jobTitle = event.application.jobPosting.title;
    const candidateName = candidateDisplayName(
      event.application.candidateAccount.profile,
      event.application.candidateAccount.email,
    );
    const toMeta = getApplicationStatusMeta(normalizeStatusKey(event.toStatus));
    const actor = event.changedByStaff?.name?.trim();
    const timeLabel = formatActivityTime(event.changedAt);
    const meta = actor ? `${candidateName} · ${actor} · ${timeLabel}` : `${candidateName} · ${timeLabel}`;

    if (!event.fromStatus) {
      return {
        id: event.id,
        title: `New application — ${jobTitle}`,
        meta,
        icon: "doc" as const,
      };
    }

    const fromMeta = getApplicationStatusMeta(normalizeStatusKey(event.fromStatus));
    return {
      id: event.id,
      title: `${jobTitle} — ${fromMeta.label} → ${toMeta.label}`,
      meta,
      icon: activityIcon(event.toStatus, event.fromStatus),
    };
  });

  return {
    stats,
    efficiencyScore,
    pipelineStages,
    recentActivity,
    stalledInterviewCount: staleInterviewCount,
  };
}
