import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCvStorageRoot } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

function resolveCoverLetterPath(candidateAccountId: string, fileUrl: string | null, id: string): string | null {
  if (!fileUrl) return null;
  try {
    const parsed = new URL(fileUrl, "http://localhost");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const filename = parts.at(-1);
    if (!filename) return null;
    const decodedName = decodeURIComponent(filename);
    const root = path.join(getCvStorageRoot(), "..", "cover-letters");
    return path.join(root, candidateAccountId, decodedName);
  } catch {
    const root = path.join(getCvStorageRoot(), "..", "cover-letters");
    return path.join(root, candidateAccountId, `${id}.pdf`);
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

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  if (!id) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "id query parameter is required." } }, { status: 400 });
  }

  const row = await prisma.candidateCoverLetter.findFirst({
    where: { id, candidateAccountId: user.candidateAccountId, mode: "file" },
    select: { id: true, fileName: true, fileUrl: true },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cover letter not found." } }, { status: 404 });
  }

  const absPath = resolveCoverLetterPath(user.candidateAccountId, row.fileUrl, row.id);
  if (!absPath) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cover letter file path is unavailable." } }, { status: 404 });
  }

  const fileBuffer = await readFile(absPath);
  const lowerName = (row.fileName ?? "").toLowerCase();
  const contentType =
    lowerName.endsWith(".docx")
      ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      : lowerName.endsWith(".doc")
        ? "application/msword"
        : "application/pdf";

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${encodeURIComponent(row.fileName ?? `cover-letter-${row.id}`).replace(/'/g, "%27")}"`,
  );

  return new NextResponse(fileBuffer, { status: 200, headers });
}
