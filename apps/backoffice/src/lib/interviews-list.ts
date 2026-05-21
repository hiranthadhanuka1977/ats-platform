import { prisma } from "@/lib/prisma";
import type { InterviewCalendarItem } from "@/lib/interviews-calendar";

export async function listInterviewsForCalendar(): Promise<InterviewCalendarItem[]> {
  const rows = await prisma.applicationInterview.findMany({
    orderBy: { startsAt: "asc" },
    include: {
      application: {
        select: {
          id: true,
          candidateAccount: {
            select: {
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
              title: true,
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const profile = row.application.candidateAccount.profile;
    const candidateName =
      `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || "Unnamed candidate";

    return {
      id: row.id,
      applicationId: row.application.id,
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      schedulingTimeZone: row.schedulingTimeZone ?? "UTC",
      candidateName,
      jobTitle: row.application.jobPosting.title,
      notifyCandidateEmail: row.notifyCandidateEmail,
    };
  });
}
