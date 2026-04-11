import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { prismaErrorResponse } from "@/lib/prisma-errors";
import { slugify } from "@/lib/slugify";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;
  const id = Number.parseInt((await ctx.params).id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "INVALID_JSON" } }, { status: 400 });
  }

  const data: {
    city?: string;
    country?: string;
    slug?: string;
    isActive?: boolean;
    sortOrder?: number;
  } = {};
  if (typeof body.city === "string") data.city = body.city.trim();
  if (typeof body.country === "string") data.country = body.country.trim();
  if (typeof body.slug === "string") {
    const s = slugify(body.slug.trim());
    if (s) data.slug = s;
  }
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    data.sortOrder = Math.trunc(body.sortOrder);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No fields to update." } }, { status: 400 });
  }

  try {
    const row = await prisma.location.update({ where: { id }, data });
    return NextResponse.json(row);
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}

export async function DELETE(_request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;
  const id = Number.parseInt((await ctx.params).id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });
  }
  try {
    await prisma.location.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
