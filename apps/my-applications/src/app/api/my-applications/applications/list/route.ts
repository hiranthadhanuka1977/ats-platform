import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Missing bearer token." } },
      { status: 401 },
    );
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const sortBy = url.searchParams.get("sortBy") === "updatedAt" ? "updatedAt" : "appliedAt";
  const limit =
    limitParam != null
      ? Math.min(50, Math.max(1, Number.parseInt(limitParam, 10) || 1))
      : undefined;

  const applications = await prisma.application.findMany({
    where: { candidateAccountId: user.candidateAccountId },
    orderBy: { [sortBy]: "desc" },
    ...(limit != null ? { take: limit } : {}),
    include: {
      jobPosting: {
        select: {
          id: true,
          slug: true,
          title: true,
          department: { select: { name: true } },
          location: { select: { city: true, country: true } },
        },
      },
    },
  });

  return NextResponse.json({
    data: applications.map((application) => ({
      id: application.id,
      status: application.status,
      appliedAt: application.appliedAt.toISOString(),
      updatedAt: application.updatedAt.toISOString(),
      job: {
        id: application.jobPosting.id,
        slug: application.jobPosting.slug,
        title: application.jobPosting.title,
        department: application.jobPosting.department.name,
        location: `${application.jobPosting.location.city}, ${application.jobPosting.location.country}`,
      },
    })),
  });
}
