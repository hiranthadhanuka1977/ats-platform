import { NextRequest, NextResponse } from "next/server";
import type { ApplicationStatus } from "@prisma/client";
import { recordApplicationStatusEvent } from "@ats-platform/db";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const INTERVIEW_SCHEDULED_STATUS = "interview_scheduled" satisfies ApplicationStatus;

function parseInstant(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const applicationId = (await ctx.params).id;
  if (!applicationId || !/^[0-9a-f-]{36}$/i.test(applicationId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application id." } },
      { status: 400 },
    );
  }

  let body: { startsAt?: unknown; endsAt?: unknown; notifyCandidateEmail?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } }, { status: 400 });
  }

  const startsAt = parseInstant(body.startsAt);
  const endsAt = parseInstant(body.endsAt);
  const notifyCandidateEmail = body.notifyCandidateEmail !== false;

  if (!startsAt || !endsAt) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Interview start and end date/time are required." } },
      { status: 400 },
    );
  }

  if (endsAt.getTime() <= startsAt.getTime()) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "End time must be after start time." } },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      status: true,
      candidateAccount: { select: { email: true } },
    },
  });

  if (!application) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Application not found." } }, { status: 404 });
  }

  const now = new Date();
  const notificationSentAt = notifyCandidateEmail ? now : null;

  try {
    const interview = await prisma.$transaction(async (tx) => {
      const created = await tx.applicationInterview.create({
        data: {
          applicationId,
          startsAt,
          endsAt,
          notifyCandidateEmail,
          notificationSentAt,
          scheduledByStaffId: auth.userId,
        },
      });

      if (application.status !== INTERVIEW_SCHEDULED_STATUS) {
        await tx.application.update({
          where: { id: applicationId },
          data: { status: INTERVIEW_SCHEDULED_STATUS },
        });

        await recordApplicationStatusEvent(tx, {
          applicationId,
          fromStatus: application.status,
          toStatus: INTERVIEW_SCHEDULED_STATUS,
          changedByStaffId: auth.userId,
        });
      }

      return created;
    });

    return NextResponse.json({
      data: {
        interview: {
          id: interview.id,
          applicationId: interview.applicationId,
          startsAt: interview.startsAt.toISOString(),
          endsAt: interview.endsAt.toISOString(),
          notifyCandidateEmail: interview.notifyCandidateEmail,
          notificationSentAt: interview.notificationSentAt?.toISOString() ?? null,
        },
        emailNotificationQueued: notifyCandidateEmail,
        candidateEmail: application.candidateAccount.email,
      },
    });
  } catch (err) {
    console.error("[applications/interviews] schedule failed:", err);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Could not schedule interview." } },
      { status: 500 },
    );
  }
}

export async function GET(_request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const applicationId = (await ctx.params).id;
  if (!applicationId || !/^[0-9a-f-]{36}$/i.test(applicationId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application id." } },
      { status: 400 },
    );
  }

  const interviews = await prisma.applicationInterview.findMany({
    where: { applicationId },
    orderBy: { startsAt: "desc" },
    include: {
      scheduledByStaff: { select: { name: true } },
    },
  });

  return NextResponse.json({
    data: {
      interviews: interviews.map((row) => ({
        id: row.id,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt.toISOString(),
        notifyCandidateEmail: row.notifyCandidateEmail,
        notificationSentAt: row.notificationSentAt?.toISOString() ?? null,
        scheduledBy: row.scheduledByStaff?.name ?? null,
      })),
    },
  });
}
