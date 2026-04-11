import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;
  const rows = await prisma.employmentType.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json(rows);
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
  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  const slug = slugRaw ? slugify(slugRaw) : slugify(name);
  if (!slug) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Slug could not be derived." } }, { status: 400 });
  }
  const sortOrder = typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder) ? Math.trunc(body.sortOrder) : 0;

  try {
    const row = await prisma.employmentType.create({
      data: { name, slug, sortOrder },
    });
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
