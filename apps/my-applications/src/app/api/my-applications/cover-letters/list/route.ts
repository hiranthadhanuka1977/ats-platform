import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token." } }, { status: 401 });
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } }, { status: 401 });
  }

  const rows = await prisma.candidateCoverLetter.findMany({
    where: {
      candidateAccountId: user.candidateAccountId,
      mode: "file",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    data: {
      coverLetters: rows.map((row) => ({
        id: row.id,
        fileName: row.fileName ?? "Cover letter",
        fileUrl: row.fileUrl,
        createdAt: row.createdAt.toISOString(),
      })),
    },
  });
}
