import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { JOB_POSTING_FULL_INCLUDE } from "@/lib/job-posting-queries";
import { serializeJobPostingFull } from "@/lib/job-posting-serialize";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";

type Params = { params: Promise<{ id: string }> };

/** Sets the posting to published and `posted_at` when first published. Does not alter children or PDP fields. */
export async function POST(_request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const id = (await ctx.params).id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }

  try {
    const existing = await prisma.jobPosting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
    }

    const now = new Date();
    const postedAt = existing.postedAt ?? now;

    const row = await prisma.jobPosting.update({
      where: { id },
      data: {
        status: "published",
        postedAt,
      },
      include: JOB_POSTING_FULL_INCLUDE,
    });

    return NextResponse.json({ item: serializeJobPostingFull(row) });
  } catch (err) {
    const { status, body } = prismaErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
