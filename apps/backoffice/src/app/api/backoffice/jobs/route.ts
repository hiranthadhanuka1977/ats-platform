import type { JobPostingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
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

function parseStatus(s: string | null): JobPostingStatus | undefined {
  if (!s || s === "all") return undefined;
  return STATUSES.includes(s as JobPostingStatus) ? (s as JobPostingStatus) : undefined;
}

export async function GET(request: NextRequest) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "20", 10) || 20));
  const q = (searchParams.get("q") ?? "").trim();
  const statusParam = searchParams.get("status");
  const departmentId = searchParams.get("departmentId");
  const locationId = searchParams.get("locationId");
  const employmentTypeId = searchParams.get("employmentTypeId");
  const experienceLevelId = searchParams.get("experienceLevelId");
  const remoteOnly = searchParams.get("remoteOnly") === "true";
  const sort = searchParams.get("sort") ?? "updated_desc";

  const where: Prisma.JobPostingWhereInput = {};

  const st = parseStatus(statusParam);
  if (st) where.status = st;

  if (departmentId) {
    const id = Number.parseInt(departmentId, 10);
    if (Number.isFinite(id)) where.departmentId = id;
  }
  if (locationId) {
    const id = Number.parseInt(locationId, 10);
    if (Number.isFinite(id)) where.locationId = id;
  }
  if (employmentTypeId) {
    const id = Number.parseInt(employmentTypeId, 10);
    if (Number.isFinite(id)) where.employmentTypeId = id;
  }
  if (experienceLevelId) {
    const id = Number.parseInt(experienceLevelId, 10);
    if (Number.isFinite(id)) where.experienceLevelId = id;
  }
  if (remoteOnly) where.isRemote = true;

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { summary: { contains: q, mode: "insensitive" } },
      { overview: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: Prisma.JobPostingOrderByWithRelationInput = { updatedAt: "desc" };
  switch (sort) {
    case "posted_desc":
      orderBy = { postedAt: "desc" };
      break;
    case "posted_asc":
      orderBy = { postedAt: "asc" };
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "title_desc":
      orderBy = { title: "desc" };
      break;
    case "updated_asc":
      orderBy = { updatedAt: "asc" };
      break;
    case "updated_desc":
    default:
      orderBy = { updatedAt: "desc" };
  }

  try {
    const [totalCount, rows] = await Promise.all([
      prisma.jobPosting.count({ where }),
      prisma.jobPosting.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          department: { select: { id: true, name: true, slug: true } },
          location: { select: { id: true, city: true, country: true, slug: true } },
          employmentType: { select: { id: true, name: true, slug: true } },
          experienceLevel: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    const items = rows.map((j) => ({
      id: j.id,
      slug: j.slug,
      title: j.title,
      summary: j.summary,
      status: j.status,
      postedAt: j.postedAt?.toISOString() ?? null,
      updatedAt: j.updatedAt.toISOString(),
      createdAt: j.createdAt.toISOString(),
      isRemote: j.isRemote,
      isFeatured: j.isFeatured,
      department: j.department,
      location: j.location,
      employmentType: j.employmentType,
      experienceLevel: j.experienceLevel,
    }));

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    return NextResponse.json({
      items,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (err) {
    const { status, body } = prismaErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON" } }, { status: 400 });
  }

  const core = parseJobPostingCoreFromBody(body);
  const title = core.title ?? "";
  if (!title || title.length > 200) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Title is required (max 200 characters)." } },
      { status: 400 }
    );
  }

  const summary = core.summary ?? "";
  if (!summary || summary.length > 500) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Summary is required (max 500 characters)." } },
      { status: 400 }
    );
  }

  const departmentId = core.departmentId;
  const locationId = core.locationId;
  const employmentTypeId = core.employmentTypeId;
  const experienceLevelId = core.experienceLevelId;
  if (
    departmentId === undefined ||
    locationId === undefined ||
    employmentTypeId === undefined ||
    experienceLevelId === undefined
  ) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Department, location, employment type, and experience level are required." } },
      { status: 400 }
    );
  }

  let status: JobPostingStatus = "draft";
  if (core.status && STATUSES.includes(core.status)) {
    status = core.status;
  }

  const slugInput = core.slug;
  let slug: string;
  try {
    slug = await allocateJobSlug(title, slugInput);
  } catch {
    return NextResponse.json({ error: { code: "SLUG_ERROR" } }, { status: 500 });
  }

  const { pdp, children } = parseJobPostingPdpFromBody(body);

  const now = new Date();
  const postedAt = status === "published" ? now : null;

  try {
    const row = await prisma.$transaction(async (tx) => {
      const job = await tx.jobPosting.create({
        data: {
          title,
          slug,
          departmentId,
          locationId,
          employmentTypeId,
          experienceLevelId,
          summary,
          status,
          isRemote: pdp.isRemote,
          isFeatured: pdp.isFeatured,
          postedAt,
          createdById: auth.userId,
          overview: pdp.overview,
          roleSummary: pdp.roleSummary,
          applicationInfo: pdp.applicationInfo,
          salaryMin: pdp.salaryMin,
          salaryMax: pdp.salaryMax,
          salaryCurrency: pdp.salaryCurrency,
          isSalaryVisible: pdp.isSalaryVisible,
          bannerImageUrl: pdp.bannerImageUrl,
          bannerImageAlt: pdp.bannerImageAlt,
          expiresAt: pdp.expiresAt,
        },
      });
      await syncJobPostingChildren(tx, job.id, children);
      return tx.jobPosting.findUniqueOrThrow({
        where: { id: job.id },
        include: JOB_POSTING_FULL_INCLUDE,
      });
    });

    return NextResponse.json({ item: serializeJobPostingFull(row) }, { status: 201 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
