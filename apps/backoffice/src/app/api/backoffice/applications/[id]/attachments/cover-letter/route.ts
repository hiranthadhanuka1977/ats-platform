import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { getCvStorageRoot } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function parseCoverLetterId(coverLetter: string | null): string | null {
  if (!coverLetter) return null;
  const m = /^cover_letter_id:([0-9a-f-]{36})$/i.exec(coverLetter.trim());
  return m?.[1] ?? null;
}

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

export async function GET(_request: NextRequest, ctx: Params) {
  const auth = await requireStaffSession();
  if (auth instanceof NextResponse) return auth;

  const applicationId = (await ctx.params).id;
  if (!applicationId || !/^[0-9a-f-]{36}$/i.test(applicationId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid application id." } },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { candidateAccountId: true, coverLetter: true },
  });
  if (!application) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Application not found." } }, { status: 404 });
  }

  const letterId = parseCoverLetterId(application.coverLetter);
  if (!letterId) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No cover letter file on this application." } },
      { status: 404 },
    );
  }

  const row = await prisma.candidateCoverLetter.findFirst({
    where: { id: letterId, candidateAccountId: application.candidateAccountId, mode: "file" },
    select: { id: true, fileName: true, fileUrl: true },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Cover letter file not found." } }, { status: 404 });
  }

  const absPath = resolveCoverLetterPath(application.candidateAccountId, row.fileUrl, row.id);
  if (!absPath) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Cover letter file path is unavailable." } },
      { status: 404 },
    );
  }

  try {
    const fileBuffer = await readFile(absPath);
    const lowerName = (row.fileName ?? "").toLowerCase();
    const contentType = lowerName.endsWith(".docx")
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
  } catch {
    return NextResponse.json({ error: { code: "READ_FAILED", message: "Could not read cover letter file." } }, { status: 500 });
  }
}
