import { NextRequest, NextResponse } from "next/server";
import { withAdminJsonResponse } from "@/lib/admin-api-route";
import { parseOptionalUrl } from "@/lib/admin-optional-url";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";

export async function GET() {
  return withAdminJsonResponse(async () => {
    const auth = await requireStaffSession();
    if (auth instanceof NextResponse) return auth;
    const rows = await prisma.company.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { jobPostings: true } } },
    });
    return NextResponse.json(
      rows.map((row) => {
        const { _count, ...r } = row;
        return { ...r, jobPostingCount: _count.jobPostings };
      }),
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
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Name is required." } }, { status: 400 });
  }
  if (name.length > 200) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Name must be at most 200 characters." } },
      { status: 400 },
    );
  }
  const logoUrl = parseOptionalUrl(body.logoUrl);
  const websiteUrl = parseOptionalUrl(body.websiteUrl);
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? Math.trunc(body.sortOrder) : 0;

  try {
    const row = await prisma.company.create({
      data: { name, logoUrl, websiteUrl, isActive, sortOrder },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
