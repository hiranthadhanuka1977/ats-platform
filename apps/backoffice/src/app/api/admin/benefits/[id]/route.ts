import { NextRequest, NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { countJobPostingRefs, lookupInUseResponse } from "@/lib/admin-lookup-job-refs";
import { prismaErrorResponse } from "@/lib/prisma-errors";

const MAX_DESC = 255;

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

  const data: { description?: string; sortOrder?: number; isActive?: boolean } = {};
  if (typeof body.description === "string") {
    const d = body.description.trim();
    if (!d) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Description cannot be empty." } },
        { status: 400 }
      );
    }
    if (d.length > MAX_DESC) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: `Description must be at most ${MAX_DESC} characters.` } },
        { status: 400 }
      );
    }
    data.description = d;
  }
  if (typeof body.sortOrder === "number" && Number.isFinite(body.sortOrder)) {
    data.sortOrder = Math.trunc(body.sortOrder);
  }
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "No fields to update." } }, { status: 400 });
  }

  try {
    const row = await prisma.benefit.update({ where: { id }, data });
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
    if ((await countJobPostingRefs("benefits", id)) > 0) return lookupInUseResponse();
    await prisma.benefit.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const { status, body: errBody } = prismaErrorResponse(err);
    return NextResponse.json(errBody, { status });
  }
}
