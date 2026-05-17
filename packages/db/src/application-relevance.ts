import type { PrismaClient } from "@prisma/client";
import {
  buildApplicationAnswersSummary,
  buildCvText,
  buildJobPostingText,
  buildRelevanceInputHashPayload,
  computeRelevanceInputHash,
  parseCvIdFromResumeUrl,
  scoreJobCvRelevanceWithOpenAI,
} from "@ats-platform/utils/application-relevance";

export type ApplicationRelevanceResult = {
  score: number;
  breakdownText: string | null;
  cached: boolean;
  scoredAt: string | null;
};

const applicationInclude = {
  jobPosting: {
    include: {
      experienceLevel: true,
      employmentType: true,
      location: true,
      responsibilities: { orderBy: { sortOrder: "asc" as const } },
      qualifications: { orderBy: { sortOrder: "asc" as const } },
      jobPostingSkills: { include: { skill: true } },
    },
  },
} as const;

export async function ensureApplicationRelevanceScore(options: {
  applicationId: string;
  prisma: PrismaClient;
  apiKey: string;
  model?: string;
  forceRefresh?: boolean;
}): Promise<ApplicationRelevanceResult> {
  const { applicationId, prisma, apiKey, model, forceRefresh = false } = options;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: applicationInclude,
  });

  if (!application) {
    throw new Error("Application not found");
  }

  const cvId = parseCvIdFromResumeUrl(application.resumeUrl);
  const cvRow = cvId
    ? await prisma.candidateCvParse.findFirst({
        where: { id: cvId, candidateAccountId: application.candidateAccountId },
        select: { id: true, updatedAt: true, extractedText: true, parsedJson: true },
      })
    : null;

  const inputHash = computeRelevanceInputHash(
    buildRelevanceInputHashPayload(application, application.jobPosting, cvRow),
  );

  const storedHash = application.relevanceInputHash;
  const storedScore = application.relevanceScore;

  if (
    !forceRefresh &&
    storedScore != null &&
    storedHash != null &&
    storedHash === inputHash
  ) {
    return {
      score: storedScore,
      breakdownText: application.relevanceBreakdown,
      cached: true,
      scoredAt: application.relevanceScoredAt?.toISOString() ?? null,
    };
  }

  const jobText = buildJobPostingText(application.jobPosting);
  const cvText = buildCvText(cvRow);
  const answersSummary = buildApplicationAnswersSummary(application);

  const { score, breakdownText } = await scoreJobCvRelevanceWithOpenAI({
    apiKey,
    model,
    jobPostingText: jobText,
    cvText,
    applicationAnswersSummary: answersSummary || undefined,
  });

  const scoredAt = new Date();

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      relevanceScore: score,
      relevanceBreakdown: breakdownText,
      relevanceScoredAt: scoredAt,
      relevanceInputHash: inputHash,
    },
  });

  return {
    score,
    breakdownText,
    cached: false,
    scoredAt: scoredAt.toISOString(),
  };
}
