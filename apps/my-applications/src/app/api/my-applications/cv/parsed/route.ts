import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";
import { normalizeParsedPayload, type ParsedCvPayload } from "@/types/cv-parse";

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

  const parseId = new URL(request.url).searchParams.get("id")?.trim() ?? "";
  if (!parseId) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "id is required." } }, { status: 400 });
  }

  const row = await prisma.candidateCvParse.findFirst({
    where: { id: parseId, candidateAccountId: user.candidateAccountId },
    select: { id: true, originalFilename: true, parsedJson: true, status: true },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "CV upload not found." } }, { status: 404 });
  }
  if (!row.parsedJson) {
    return NextResponse.json(
      { error: { code: "NOT_PARSED", message: "This CV has not been parsed yet. Try processing it again." } },
      { status: 409 }
    );
  }

  const payload = normalizeParsedPayload(row.parsedJson) as ParsedCvPayload;

  return NextResponse.json({
    data: {
      parseId: row.id,
      fileName: row.originalFilename,
      payload,
    },
  });
}
