import { NextRequest, NextResponse } from "next/server";
import { withAdminJsonResponse } from "@/lib/admin-api-route";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const MAX_DESC = 255;

export async function GET() {
  return withAdminJsonResponse(async () => {
    const auth = await requireStaffSession();
    if (auth instanceof NextResponse) return auth;
    const rows = await prisma.benefit.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { _count: { select: { jobPostingBenefits: true } } },
    });
    return NextResponse.json(
      rows.map(({ _count, ...r }) => ({ ...r, jobPostingCount: _count.jobPostingBenefits }))
    );
  });
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
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Description is required." } },
      { status: 400 }
    );
  }
  if (description.length > MAX_DESC) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: `Description must be at most ${MAX_DESC} characters.` } },
      { status: 400 }
    );
  }
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? Math.trunc(body.sortOrder) : 0;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  try {
    const row = await prisma.benefit.create({
      data: { description, sortOrder, isActive },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
