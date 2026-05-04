import path from "node:path";
import { NextResponse } from "next/server";
import { extractTextFromCvFile } from "@/lib/cv-extract-text";
import { parseCvText } from "@/lib/cv-parse-from-text";
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

  let body: { parseId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON." } }, { status: 400 });
  }
  const parseId = typeof body.parseId === "string" ? body.parseId.trim() : "";
  if (!parseId) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "parseId is required." } }, { status: 400 });
  }

  const row = await prisma.candidateCvParse.findFirst({
    where: { id: parseId, candidateAccountId: user.candidateAccountId },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "CV upload not found." } }, { status: 404 });
  }

  const absPath = path.join(/*turbopackIgnore: true*/ process.cwd(), row.storedPath.replace(/\//g, path.sep));

  let extracted: string;
  try {
    extracted = await extractTextFromCvFile(row.mimeType, absPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: { code: "EXTRACT_FAILED", message: msg } }, { status: 422 });
  }

  const payload = await parseCvText(extracted);

  await prisma.candidateCvParse.update({
    where: { id: row.id },
    data: {
      extractedText: extracted.slice(0, 500_000),
      parsedJson: payload as object,
      status: "draft",
    },
  });

  return NextResponse.json({ data: { parseId: row.id, payload } });
}
