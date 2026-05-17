import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ensureApplicationRelevanceScore } from "@ats-platform/db";
import { requireStaffSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getServerEnv } from "@/lib/server-env";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const applicationId = (await ctx.params).id;
  if (!applicationId || !/^[0-9a-f-]{36}$/i.test(applicationId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application id." } },
      { status: 400 },
    );
  }

  const apiKey = getServerEnv("OPENAI_API_KEY");
  if (!apiKey) {
    return NextResponse.json(
      {
        error: {
          code: "SERVICE_UNAVAILABLE",
          message:
            "Relevance scoring is not configured. Add OPENAI_API_KEY to the repo root .env or apps/backoffice/.env.local, then restart backoffice.",
        },
      },
      { status: 503 },
    );
  }

  const forceRefresh =
    request.nextUrl.searchParams.get("refresh") === "1" ||
    request.nextUrl.searchParams.get("refresh") === "true";

  try {
    const result = await ensureApplicationRelevanceScore({
      applicationId,
      prisma,
      apiKey,
      model: getServerEnv("OPENAI_RELEVANCE_MODEL") || undefined,
      forceRefresh,
    });

    return NextResponse.json({
      data: {
        score: result.score,
        breakdownText: result.breakdownText,
        cached: result.cached,
        scoredAt: result.scoredAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not compute relevance score.";
    if (message === "Application not found") {
      return NextResponse.json({ error: { code: "NOT_FOUND", message } }, { status: 404 });
    }
    return NextResponse.json({ error: { code: "OPENAI_ERROR", message } }, { status: 502 });
  }
}
