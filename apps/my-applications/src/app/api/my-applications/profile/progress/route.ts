import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";

export const runtime = "nodejs";

function isNonEmpty(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
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

  const [account, profile, experienceCount, educationCount, cvCount, coverLetterCount] = await Promise.all([
    prisma.candidateAccount.findUnique({
      where: { id: user.candidateAccountId },
      select: { email: true },
    }),
    prisma.candidateProfile.findUnique({
      where: { candidateAccountId: user.candidateAccountId },
      select: { firstName: true, lastName: true, phone: true, location: true, currentTitle: true },
    }),
    prisma.candidateCvExperience.count({
      where: { candidateAccountId: user.candidateAccountId },
    }),
    prisma.candidateCvEducation.count({
      where: { candidateAccountId: user.candidateAccountId },
    }),
    prisma.candidateCvParse.count({
      where: { candidateAccountId: user.candidateAccountId },
    }),
    prisma.candidateCoverLetter.count({
      where: { candidateAccountId: user.candidateAccountId },
    }),
  ]);

  const basicProfileComplete =
    isNonEmpty(account?.email) &&
    isNonEmpty(profile?.firstName) &&
    isNonEmpty(profile?.lastName) &&
    isNonEmpty(profile?.phone) &&
    isNonEmpty(profile?.location) &&
    isNonEmpty(profile?.currentTitle);

  const completeProfileDone = basicProfileComplete && experienceCount > 0 && educationCount > 0;

  return NextResponse.json({
    data: {
      basicProfileComplete,
      hasExperience: experienceCount > 0,
      hasEducation: educationCount > 0,
      hasCv: cvCount > 0,
      hasCoverLetter: coverLetterCount > 0,
      completeProfileDone,
      experienceCount,
      educationCount,
      cvCount,
    },
  });
}
