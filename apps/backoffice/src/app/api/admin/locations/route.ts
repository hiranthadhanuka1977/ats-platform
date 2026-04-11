import { NextRequest, NextResponse } from "next/server";
import { withAdminJsonResponse } from "@/lib/admin-api-route";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";
import { slugify } from "@/lib/slugify";

export async function GET() {
  return withAdminJsonResponse(async () => {
    const auth = await requireStaffSession();
    if (auth instanceof NextResponse) return auth;
    const rows = await prisma.location.findMany({
      orderBy: [{ sortOrder: "asc" }, { city: "asc" }],
      include: { _count: { select: { jobPostings: true } } },
    });
    return NextResponse.json(
      rows.map(({ _count, ...r }) => ({ ...r, jobPostingCount: _count.jobPostings }))
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
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  if (!city || !country) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "City and country are required." } },
      { status: 400 }
    );
  }
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugRaw ? slugify(slugRaw) : slugify(`${city}-${country}`);
  if (!slug) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Slug could not be derived." } }, { status: 400 });
  }
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? Math.trunc(body.sortOrder) : 0;

  try {
    const row = await prisma.location.create({
      data: { city, country, slug, isActive, sortOrder },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
