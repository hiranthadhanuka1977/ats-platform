import type { JobPostingStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { parseJobPostingCoreFromBody, parseJobPostingPdpFromBody } from "@/lib/job-posting-body";
import { syncJobPostingChildren } from "@/lib/job-posting-children";
import { allocateJobSlug } from "@/lib/job-posting-slug";
import { JOB_POSTING_FULL_INCLUDE } from "@/lib/job-posting-queries";
import { serializeJobPostingFull } from "@/lib/job-posting-serialize";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const STATUSES: JobPostingStatus[] = ["draft", "published", "closed", "archived"];

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const id = (await ctx.params).id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  try {
    const row = await prisma.jobPosting.findUnique({
      where: { id },
      include: JOB_POSTING_FULL_INCLUDE,
    });
    if (!row) {
      return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
    }
    return NextResponse.json({ item: serializeJobPostingFull(row) });
  } catch (err) {
    const { status, body } = prismaErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const id = (await ctx.params).id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON" } }, { status: 400 });
  }

  const core = parseJobPostingCoreFromBody(body);
  const { pdp, children } = parseJobPostingPdpFromBody(body);

  try {
    const existing = await prisma.jobPosting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
    }

    const title = core.title ?? existing.title;
    if (!title || title.length > 200) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Title is required (max 200 characters)." } },
        { status: 400 }
      );
    }

    const summary = core.summary ?? existing.summary;
    if (!summary || summary.length > 500) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Summary is required (max 500 characters)." } },
        { status: 400 }
      );
    }

    const departmentId = core.departmentId ?? existing.departmentId;
    const locationId = core.locationId ?? existing.locationId;
    const employmentTypeId = core.employmentTypeId ?? existing.employmentTypeId;
    const experienceLevelId = core.experienceLevelId ?? existing.experienceLevelId;

    let status: JobPostingStatus = existing.status;
    if (core.status && STATUSES.includes(core.status)) {
      status = core.status;
    }

    let slug = existing.slug;
    if (core.slug !== undefined) {
      const s = core.slug.trim();
      if (s !== existing.slug) {
        slug = await allocateJobSlug(title, s);
      }
    }

    const now = new Date();
    let postedAt = existing.postedAt;
    if (status === "published" && !postedAt) {
      postedAt = now;
    }
    if (status !== "published" && existing.status === "published") {
      /* keep postedAt for history */
    }

    const row = await prisma.$transaction(async (tx) => {
      await tx.jobPosting.update({
        where: { id },
        data: {
          title,
          slug,
          summary,
          departmentId,
          locationId,
          employmentTypeId,
          experienceLevelId,
          status,
          postedAt,
          overview: pdp.overview,
          roleSummary: pdp.roleSummary,
          applicationInfo: pdp.applicationInfo,
          salaryMin: pdp.salaryMin,
          salaryMax: pdp.salaryMax,
          salaryCurrency: pdp.salaryCurrency,
          isSalaryVisible: pdp.isSalaryVisible,
          isRemote: pdp.isRemote,
          isFeatured: pdp.isFeatured,
          bannerImageUrl: pdp.bannerImageUrl,
          bannerImageAlt: pdp.bannerImageAlt,
          expiresAt: pdp.expiresAt,
        },
      });
      await syncJobPostingChildren(tx, id, children);
      return tx.jobPosting.findUniqueOrThrow({
        where: { id },
        include: JOB_POSTING_FULL_INCLUDE,
      });
    });

    return NextResponse.json({ item: serializeJobPostingFull(row) });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
