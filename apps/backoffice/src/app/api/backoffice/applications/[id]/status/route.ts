import { NextRequest, NextResponse } from "next/server";
import type { ApplicationStatusValue } from "@ats-platform/types";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES = new Set<ApplicationStatusValue>([
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "interview_scheduled",
  "interview_completed",
  "offered",
  "hired",
  "rejected",
  "withdrawn",
]);

export async function PATCH(request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const id = (await ctx.params).id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application id." } },
      { status: 400 },
    );
  }

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (!ALLOWED_STATUSES.has(status as ApplicationStatusValue)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application status." } },
      { status: 400 },
    );
  }

  try {
    const updatedRows = await prisma.$queryRaw<Array<{ id: string; status: string; updated_at: Date }>>`
      UPDATE applications
      SET status = ${status}::"ApplicationStatus",
          updated_at = NOW()
      WHERE id = ${id}::uuid
      RETURNING id, status::text, updated_at;
    `;
    const updated = updatedRows[0];
    if (!updated) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Application not found." } },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        status: updated.status,
        updatedAt: updated.updated_at.toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update application status.";
    return NextResponse.json(
      { error: { code: "UPDATE_FAILED", message } },
      { status: 500 },
    );
  }
}
