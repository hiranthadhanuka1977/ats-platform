import path from "node:path";
import { readFile } from "node:fs/promises";
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

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "id query parameter is required." } }, { status: 400 });
  }

  const row = await prisma.candidateCvParse.findFirst({
    where: { id, candidateAccountId: user.candidateAccountId },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "File not found." } }, { status: 404 });
  }

  const absPath = path.join(/*turbopackIgnore: true*/ process.cwd(), row.storedPath.replace(/\//g, path.sep));
  const buf = await readFile(absPath);

  const headers = new Headers();
  headers.set("Content-Type", row.mimeType);
  headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(row.originalFilename).replace(/'/g, "%27")}"`);

  return new NextResponse(buf, { status: 200, headers });
}
