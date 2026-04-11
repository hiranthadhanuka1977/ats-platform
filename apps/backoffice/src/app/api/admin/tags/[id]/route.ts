import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { countJobPostingRefs, lookupInUseResponse } from "@/lib/admin-lookup-job-refs";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const TAG_VARIANTS = new Set(["primary", "accent", "success", "warning"]);

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
    name?: string;
    variant?: string;
    sortOrder?: number;
    isActive?: boolean;
  } = {};
  if (typeof body.name === "string") data.name = body.name.trim();
  if (typeof body.variant === "string") {
    const v = body.variant.trim();
    if (TAG_VARIANTS.has(v)) data.variant = v;
  }
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    data.sortOrder = Math.trunc(body.sortOrder);
  }
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No fields to update." } }, { status: 400 });
  }

  try {
    const row = await prisma.tag.update({ where: { id }, data });
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
    if ((await countJobPostingRefs("tags", id)) > 0) return lookupInUseResponse();
    await prisma.tag.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
