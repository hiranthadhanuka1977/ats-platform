import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requireStaffSession } from "@/lib/admin-auth";
import { resolveStoredPath } from "@/lib/cv-storage";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

function parseCvIdFromResumeUrl(resumeUrl: string | null): string | null {
  if (!resumeUrl) return null;
  const m = /(?:\?|&)id=([^&]+)/.exec(resumeUrl);
  if (!m?.[1]) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
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
    select: { candidateAccountId: true, resumeUrl: true },
  });
  if (!application) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Application not found." } }, { status: 404 });
  }

  const cvId = parseCvIdFromResumeUrl(application.resumeUrl);
  if (!cvId) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "No CV attached to this application." } }, { status: 404 });
  }

  const row = await prisma.candidateCvParse.findFirst({
    where: { id: cvId, candidateAccountId: application.candidateAccountId },
    select: { storedPath: true, mimeType: true, originalFilename: true },
  });
  if (!row) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "CV file not found." } }, { status: 404 });
  }

  try {
    const absPath = resolveStoredPath(row.storedPath);
    const buf = await readFile(absPath);
    const headers = new Headers();
    headers.set("Content-Type", row.mimeType);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(row.originalFilename).replace(/'/g, "%27")}"`,
    );
    return new NextResponse(buf, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: { code: "READ_FAILED", message: "Could not read CV file." } }, { status: 500 });
  }
}
