import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCvStorageRoot } from "@/lib/cv-storage";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_COVER_LETTER = new Map<string, string>([
  ["application/pdf", ".pdf"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/msword", ".doc"],
]);

function extFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return ".pdf";
  if (lower.endsWith(".docx")) return ".docx";
  if (lower.endsWith(".doc")) return ".doc";
  return "";
}

function resolveCoverLetterMimeAndExt(file: File): { mime: string; ext: string } | null {
  const nameExt = extFromName(file.name);
  let mime = (file.type || "").trim();
  if (!mime || mime === "application/octet-stream") {
    if (nameExt === ".pdf") mime = "application/pdf";
    else if (nameExt === ".docx") mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (nameExt === ".doc") mime = "application/msword";
    else return null;
  }
  const ext = ALLOWED_COVER_LETTER.get(mime) ?? nameExt;
  if (!ALLOWED_COVER_LETTER.has(mime) || !ext) return null;
  return { mime, ext };
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Missing bearer token." } },
      { status: 401 },
    );
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Expected multipart form data." } },
      { status: 400 },
    );
  }

  const jobSlugRaw = formData.get("jobSlug");
  const cvIdRaw = formData.get("cvId");
  const coverLetterRaw = formData.get("coverLetter");

  const jobSlug = typeof jobSlugRaw === "string" ? jobSlugRaw.trim() : "";
  const cvId = typeof cvIdRaw === "string" ? cvIdRaw.trim() : "";

  if (!jobSlug || !cvId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "jobSlug and cvId are required." } },
      { status: 400 },
    );
  }
  if (!(coverLetterRaw instanceof File)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Cover letter file is required." } },
      { status: 400 },
    );
  }
  if (coverLetterRaw.size > MAX_BYTES) {
    return NextResponse.json(
      { error: { code: "FILE_TOO_LARGE", message: "Maximum cover letter size is 10 MB." } },
      { status: 413 },
    );
  }
  const resolved = resolveCoverLetterMimeAndExt(coverLetterRaw);
  if (!resolved) {
    return NextResponse.json(
      { error: { code: "UNSUPPORTED_TYPE", message: "Cover letter must be PDF or Word (.doc, .docx)." } },
      { status: 415 },
    );
  }

  const [job, cv] = await Promise.all([
    prisma.jobPosting.findFirst({
      where: {
        slug: jobSlug,
        status: "published",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true, slug: true },
    }),
    prisma.candidateCvParse.findFirst({
      where: { id: cvId, candidateAccountId: user.candidateAccountId },
      select: { id: true },
    }),
  ]);

  if (!job) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Job not found." } }, { status: 404 });
  }
  if (!cv) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: "Selected CV not found." } }, { status: 404 });
  }

  const storageRoot = getCvStorageRoot();
  const coverLettersDir = path.join(storageRoot, "..", "cover-letters", user.candidateAccountId);
  await mkdir(coverLettersDir, { recursive: true });
  const coverLetterStoredName = `${randomUUID()}${resolved.ext}`;
  const coverLetterAbsPath = path.join(coverLettersDir, coverLetterStoredName);
  const coverLetterBuffer = Buffer.from(await coverLetterRaw.arrayBuffer());
  await writeFile(coverLetterAbsPath, coverLetterBuffer);

  const resumeUrl = `/api/my-applications/cv/download?id=${encodeURIComponent(cvId)}`;
  const coverLetterUrl = `/storage/cover-letters/${encodeURIComponent(user.candidateAccountId)}/${encodeURIComponent(coverLetterStoredName)}`;

  const application = await prisma.application.upsert({
    where: {
      candidateAccountId_jobPostingId: {
        candidateAccountId: user.candidateAccountId,
        jobPostingId: job.id,
      },
    },
    create: {
      candidateAccountId: user.candidateAccountId,
      jobPostingId: job.id,
      status: "submitted",
      resumeUrl,
      coverLetter: coverLetterUrl,
    },
    update: {
      status: "submitted",
      resumeUrl,
      coverLetter: coverLetterUrl,
      appliedAt: new Date(),
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    data: {
      applicationId: application.id,
      status: application.status,
      jobSlug: job.slug,
    },
  });
}
