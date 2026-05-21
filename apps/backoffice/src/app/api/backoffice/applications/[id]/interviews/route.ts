import { NextRequest, NextResponse } from "next/server";
import type { ApplicationStatus } from "@prisma/client";
import { recordApplicationStatusEvent } from "@ats-platform/db";
import { scheduleInterviewSchema } from "@ats-platform/validators";
import {
  computeInterviewEndUtc,
  isValidIanaTimeZone,
  type InterviewDurationMinutes,
} from "@ats-platform/utils/interview-scheduling";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const INTERVIEW_SCHEDULED_STATUS = "interview_scheduled" satisfies ApplicationStatus;

function mapInterviewRow(row: {
  id: string;
  applicationId: string;
  startsAt: Date;
  endsAt: Date;
  schedulingTimeZone: string;
  notifyCandidateEmail: boolean;
  notificationSentAt: Date | null;
}) {
  return {
    id: row.id,
    applicationId: row.applicationId,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    schedulingTimeZone: row.schedulingTimeZone,
    durationMinutes: Math.round((row.endsAt.getTime() - row.startsAt.getTime()) / 60_000),
    notifyCandidateEmail: row.notifyCandidateEmail,
    notificationSentAt: row.notificationSentAt?.toISOString() ?? null,
  };
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } }, { status: 400 });
  }

  const parsed = scheduleInterviewSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body.";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }

  if (!isValidIanaTimeZone(parsed.data.schedulingTimeZone)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid scheduling time zone." } },
      { status: 400 },
    );
  }

  let startsAt: Date;
  let endsAt: Date;
  try {
    const computed = computeInterviewEndUtc(
      parsed.data.interviewDate,
      parsed.data.startTime,
      parsed.data.durationMinutes as InterviewDurationMinutes,
      parsed.data.schedulingTimeZone,
    );
    startsAt = computed.startsAt;
    endsAt = computed.endsAt;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid interview date or time.";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }

  const notifyCandidateEmail = parsed.data.notifyCandidateEmail !== false;

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

  const existingInterview = await prisma.applicationInterview.findFirst({
    where: { applicationId },
    select: { id: true },
  });

  if (existingInterview) {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT",
          message: "This application already has a scheduled interview. Reschedule or remove it before scheduling another.",
        },
      },
      { status: 409 },
    );
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
          schedulingTimeZone: parsed.data.schedulingTimeZone,
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
        interview: mapInterviewRow(interview),
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
        ...mapInterviewRow(row),
        scheduledBy: row.scheduledByStaff?.name ?? null,
      })),
    },
  });
}
