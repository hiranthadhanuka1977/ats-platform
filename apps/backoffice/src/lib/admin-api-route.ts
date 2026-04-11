import { NextResponse } from "next/server";
import { prismaErrorResponse } from "@/lib/prisma-errors";

/** Wrap admin route logic so Prisma errors (e.g. P2022 missing columns) return JSON instead of an unhandled 500. */
export async function withAdminJsonResponse(run: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await run();
  } catch (err) {
    const { status, body } = prismaErrorResponse(err);
    return NextResponse.json(body, { status });
  }
}
