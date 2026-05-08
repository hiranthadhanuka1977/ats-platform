import { NextResponse } from "next/server";
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

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token." } }, { status: 401 });
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } }, { status: 401 });
  }

  const [rows, profile] = await Promise.all([
    prisma.candidateCvParse.findMany({
      where: { candidateAccountId: user.candidateAccountId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalFilename: true,
        mimeType: true,
        createdAt: true,
      },
    }),
    prisma.candidateProfile.findUnique({
      where: { candidateAccountId: user.candidateAccountId },
      select: { resumeUrl: true },
    }),
  ]);

  const defaultCvId = parseDefaultCvId(profile?.resumeUrl);

  return NextResponse.json({
    data: {
      defaultCvId,
      cvs: rows.map((r) => ({
        id: r.id,
        originalFilename: r.originalFilename,
        mimeType: r.mimeType,
        createdAt: r.createdAt.toISOString(),
      })),
    },
  });
}
