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
  const coverLetterModeRaw = formData.get("coverLetterMode");
  const coverLetterRaw = formData.get("coverLetter");
  const coverLetterTextRaw = formData.get("coverLetterText");
  const experienceYearsRaw = formData.get("experienceYears");
  const experienceMonthsRaw = formData.get("experienceMonths");
  const hasDomainExperienceRaw = formData.get("hasDomainExperience");
  const noticePeriodsRaw = formData.get("noticePeriods");
  const salaryExpectationAnnualRaw = formData.get("salaryExpectationAnnual");
  const willingToRelocateRaw = formData.get("willingToRelocate");
  const isLegallyAuthorizedToWorkRaw = formData.get("isLegallyAuthorizedToWork");
  const workModePreferenceRaw = formData.get("workModePreference");
  const shortMotivationRaw = formData.get("shortMotivation");

  const jobSlug = typeof jobSlugRaw === "string" ? jobSlugRaw.trim() : "";
  const cvId = typeof cvIdRaw === "string" ? cvIdRaw.trim() : "";
  const coverLetterMode = coverLetterModeRaw === "text" ? "text" : "file";
  const coverLetterText = typeof coverLetterTextRaw === "string" ? coverLetterTextRaw.trim() : "";
  const experienceYearsInput = typeof experienceYearsRaw === "string" ? experienceYearsRaw.trim() : "";
  const experienceYears = Number.parseInt(experienceYearsInput.length > 0 ? experienceYearsInput : "0", 10);
  const experienceMonthsInput = typeof experienceMonthsRaw === "string" ? experienceMonthsRaw.trim() : "";
  const experienceMonths = Number.parseInt(experienceMonthsInput.length > 0 ? experienceMonthsInput : "0", 10);
  const hasDomainExperience = hasDomainExperienceRaw === "yes" ? true : hasDomainExperienceRaw === "no" ? false : null;
  const noticePeriods = typeof noticePeriodsRaw === "string" ? noticePeriodsRaw : "[]";
  const salaryExpectationAnnual = Number.parseFloat(
    typeof salaryExpectationAnnualRaw === "string" ? salaryExpectationAnnualRaw.trim() : "",
  );
  const willingToRelocate = willingToRelocateRaw === "yes" ? true : willingToRelocateRaw === "no" ? false : null;
  const isLegallyAuthorizedToWork =
    isLegallyAuthorizedToWorkRaw === "yes" ? true : isLegallyAuthorizedToWorkRaw === "no" ? false : null;
  const workModePreference = typeof workModePreferenceRaw === "string" ? workModePreferenceRaw.trim() : "";
  const shortMotivation = typeof shortMotivationRaw === "string" ? shortMotivationRaw.trim() : "";

  if (!jobSlug || !cvId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "jobSlug and cvId are required." } },
      { status: 400 },
    );
  }
  if (coverLetterMode === "text" && coverLetterText.length === 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Cover letter text is required." } },
      { status: 400 },
    );
  }
  if (!experienceYearsInput && !experienceMonthsInput) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Experience is required (years or months)." } },
      { status: 400 },
    );
  }
  if (Number.isNaN(experienceYears) || experienceYears < 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Experience years must be 0 or greater when provided." } },
      { status: 400 },
    );
  }
  if (Number.isNaN(experienceMonths) || experienceMonths < 0 || experienceMonths > 11) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Experience months must be between 0 and 11 when provided." } },
      { status: 400 },
    );
  }
  if (hasDomainExperience == null) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Relevant domain experience is required." } },
      { status: 400 },
    );
  }
  let noticePeriodsList: string[] = [];
  try {
    const parsed = JSON.parse(noticePeriods) as unknown;
    if (Array.isArray(parsed)) {
      noticePeriodsList = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    noticePeriodsList = [];
  }
  if (noticePeriodsList.length === 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "At least one notice period option is required." } },
      { status: 400 },
    );
  }
  if (Number.isNaN(salaryExpectationAnnual) || salaryExpectationAnnual < 0) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Salary expectation is required." } },
      { status: 400 },
    );
  }
  if (willingToRelocate == null) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Relocation preference is required." } },
      { status: 400 },
    );
  }
  if (isLegallyAuthorizedToWork == null) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Work authorization is required." } },
      { status: 400 },
    );
  }
  if (!workModePreference) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Work mode preference is required." } },
      { status: 400 },
    );
  }
  if (coverLetterMode === "file") {
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
  }

  try {
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

    const resumeUrl = `/api/my-applications/cv/download?id=${encodeURIComponent(cvId)}`;

    const coverLetterId = randomUUID();
    let coverLetterValueForApplication = "";

    if (coverLetterMode === "file" && coverLetterRaw instanceof File) {
      const resolved = resolveCoverLetterMimeAndExt(coverLetterRaw);
      if (!resolved) {
        return NextResponse.json(
          { error: { code: "UNSUPPORTED_TYPE", message: "Cover letter must be PDF or Word (.doc, .docx)." } },
          { status: 415 },
        );
      }
      const storageRoot = getCvStorageRoot();
      const coverLettersDir = path.join(storageRoot, "..", "cover-letters", user.candidateAccountId);
      await mkdir(coverLettersDir, { recursive: true });
      const coverLetterStoredName = `${coverLetterId}${resolved.ext}`;
      const coverLetterAbsPath = path.join(coverLettersDir, coverLetterStoredName);
      const coverLetterBuffer = Buffer.from(await coverLetterRaw.arrayBuffer());
      await writeFile(coverLetterAbsPath, coverLetterBuffer);
      const coverLetterUrl = `/storage/cover-letters/${encodeURIComponent(user.candidateAccountId)}/${encodeURIComponent(coverLetterStoredName)}`;

      await prisma.candidateCoverLetter.create({
        data: {
          id: coverLetterId,
          candidateAccountId: user.candidateAccountId,
          mode: "file",
          fileUrl: coverLetterUrl,
          fileName: coverLetterRaw.name.slice(0, 255),
        },
      });
      coverLetterValueForApplication = `cover_letter_id:${coverLetterId}`;
    } else {
      await prisma.candidateCoverLetter.create({
        data: {
          id: coverLetterId,
          candidateAccountId: user.candidateAccountId,
          mode: "text",
          body: coverLetterText,
        },
      });
      coverLetterValueForApplication = `cover_letter_id:${coverLetterId}`;
    }

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
        coverLetter: coverLetterValueForApplication,
        experienceYears,
        experienceMonths,
        hasDomainExperience,
        noticePeriods: JSON.stringify(noticePeriodsList),
        salaryExpectationAnnual,
        willingToRelocate,
        workModePreference: workModePreference.slice(0, 50),
        shortMotivation: shortMotivation.length > 0 ? shortMotivation : null,
      },
      update: {
        status: "submitted",
        resumeUrl,
        coverLetter: coverLetterValueForApplication,
        experienceYears,
        experienceMonths,
        hasDomainExperience,
        noticePeriods: JSON.stringify(noticePeriodsList),
        salaryExpectationAnnual,
        willingToRelocate,
        workModePreference: workModePreference.slice(0, 50),
        shortMotivation: shortMotivation.length > 0 ? shortMotivation : null,
        appliedAt: new Date(),
      },
      select: { id: true, status: true },
    });

    await prisma.$executeRaw`
      UPDATE applications
      SET is_legally_authorized_to_work = ${isLegallyAuthorizedToWork}
      WHERE id = ${application.id}::uuid;
    `;

    const { scoreApplicationRelevanceOnApply } = await import("@/lib/score-application-relevance");
    void scoreApplicationRelevanceOnApply(application.id);

    return NextResponse.json({
      data: {
        applicationId: application.id,
        status: application.status,
        jobSlug: job.slug,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit application.";
    return NextResponse.json(
      { error: { code: "APPLICATION_SUBMIT_FAILED", message } },
      { status: 500 },
    );
  }
}
