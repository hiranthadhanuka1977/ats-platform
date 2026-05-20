import type { Metadata } from "next";
import { ApplicationsPageClient } from "@/components/applications/ApplicationsPageClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Applications",
  description: "Review and manage candidate applications.",
};

export default async function ApplicationsPage() {
  const applications = await prisma.application.findMany({
    orderBy: { appliedAt: "desc" },
    include: {
      candidateAccount: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      jobPosting: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      _count: { select: { interviews: true } },
    },
    take: 500,
  });

  const initialApplications = applications.map((application) => {
    const fullName =
      `${application.candidateAccount.profile?.firstName ?? ""} ${application.candidateAccount.profile?.lastName ?? ""}`.trim() ||
      "Unnamed Candidate";
    return {
      id: application.id,
      status: application.status,
      appliedAt: application.appliedAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      relevance:
        application.relevanceScore != null
          ? {
              score: application.relevanceScore,
              breakdownText: application.relevanceBreakdown,
            }
          : null,
      candidate: {
        id: application.candidateAccount.id,
        name: fullName,
        email: application.candidateAccount.email,
      },
      job: {
        id: application.jobPosting.id,
        title: application.jobPosting.title,
      },
      hasScheduledInterview: application._count.interviews > 0,
    };
  });

  return (
    <main id="main-content" className="bo-content bo-content--applications">
      <ApplicationsPageClient initialApplications={initialApplications} />
    </main>
  );
}
