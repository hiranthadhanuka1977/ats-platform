import { unlink } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveStoredPath } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

function parseDefaultCvId(resumeUrl: string | null | undefined): string | null {
  if (!resumeUrl) return null;
  const m = /[?&]id=([^&]+)/.exec(resumeUrl);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

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

  const [row, profile] = await Promise.all([
    prisma.candidateCvParse.findFirst({
      where: { id: cvId, candidateAccountId: user.candidateAccountId },
      select: { id: true, storedPath: true },
    }),
    prisma.candidateProfile.findUnique({
      where: { candidateAccountId: user.candidateAccountId },
      select: { resumeUrl: true },
    }),
  ]);

  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "CV not found." } }, { status: 404 });
  }

  const defaultCvId = parseDefaultCvId(profile?.resumeUrl);
  if (defaultCvId === cvId) {
    return NextResponse.json(
      { error: { code: "DEFAULT_CV_PROTECTED", message: "Default CV cannot be deleted. Choose another default first." } },
      { status: 409 }
    );
  }

  await prisma.candidateCvParse.delete({ where: { id: row.id } });

  try {
    await unlink(resolveStoredPath(row.storedPath));
  } catch {
    // Ignore missing/locked file errors after DB deletion.
  }

  return NextResponse.json({ data: { deletedCvId: cvId } });
}
