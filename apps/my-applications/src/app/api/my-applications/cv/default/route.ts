import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token." } }, { status: 401 });
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } }, { status: 401 });
  }

  let body: { cvId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON." } }, { status: 400 });
  }

  const cvId = typeof body.cvId === "string" ? body.cvId.trim() : "";
  if (!cvId) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "cvId is required." } }, { status: 400 });
  }

  const row = await prisma.candidateCvParse.findFirst({
    where: { id: cvId, candidateAccountId: user.candidateAccountId },
    select: { id: true },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "CV not found." } }, { status: 404 });
  }

  const resumeUrl = `/api/my-applications/cv/download?id=${encodeURIComponent(cvId)}`;
  await prisma.candidateProfile.upsert({
    where: { candidateAccountId: user.candidateAccountId },
    create: {
      candidateAccountId: user.candidateAccountId,
      resumeUrl,
    },
    update: {
      resumeUrl,
    },
  });

  return NextResponse.json({ data: { defaultCvId: cvId } });
}
