import { NextRequest, NextResponse } from "next/server";
import { applicationReopenSchema } from "@ats-platform/validators";
import { requireStaffSession } from "@/lib/admin-auth";
import { reopenApplication } from "@/lib/application-status-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const id = (await ctx.params).id;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application id." } },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  const parsed = applicationReopenSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body.";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: 400 });
  }

  const result = await reopenApplication(id, auth.userId, parsed.data);

  if ("httpStatus" in result) {
    return NextResponse.json(
      { error: { code: result.code, message: result.message } },
      { status: result.httpStatus },
    );
  }

  return NextResponse.json({
    data: {
      id: result.id,
      status: result.status,
      previousStatus: result.previousStatus,
      updatedAt: result.updatedAt,
    },
  });
}
