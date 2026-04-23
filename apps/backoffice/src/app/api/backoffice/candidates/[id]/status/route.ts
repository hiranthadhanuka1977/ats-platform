import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["pending_verification", "active", "locked", "disabled"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: Request, ctx: RouteContext) {
  const { id } = await ctx.params;

  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON body." } }, { status: 400 });
  }

  const status = typeof body.status === "string" ? body.status : "";
  if (!ALLOWED_STATUSES.has(status)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Status must be one of pending_verification, active, locked, disabled." } },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.candidateAccount.update({
      where: { id },
      data: {
        status: status as "pending_verification" | "active" | "locked" | "disabled",
        ...(status !== "locked" ? { lockedUntil: null } : {}),
      },
      select: { id: true, status: true },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Candidate not found." } }, { status: 404 });
  }
}
