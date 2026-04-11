import { NextRequest, NextResponse } from "next/server";
import { withAdminJsonResponse } from "@/lib/admin-api-route";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const TAG_VARIANTS = new Set(["primary", "accent", "success", "warning"]);

export async function GET() {
  return withAdminJsonResponse(async () => {
    const auth = await requireStaffSession();
    if (auth instanceof NextResponse) return auth;
    const rows = await prisma.tag.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { jobPostingTags: true } } },
    });
    return NextResponse.json(
      rows.map(({ _count, ...r }) => ({ ...r, jobPostingCount: _count.jobPostingTags }))
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
  const variantRaw = typeof body.variant === "string" ? body.variant.trim() : "primary";
  const variant = TAG_VARIANTS.has(variantRaw) ? variantRaw : "primary";
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? Math.trunc(body.sortOrder) : 0;
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  try {
    const row = await prisma.tag.create({
      data: { name, variant, sortOrder, isActive },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
