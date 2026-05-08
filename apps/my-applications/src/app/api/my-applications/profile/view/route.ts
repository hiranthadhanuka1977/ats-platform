import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";
import type { ParsedCvPayload } from "@/types/cv-parse";
import { emptyParsedCvPayload } from "@/types/cv-parse";

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

  const [account, profile, educationRows, experienceRows] = await Promise.all([
    prisma.candidateAccount.findUnique({
      where: { id: user.candidateAccountId },
      select: { email: true },
    }),
    prisma.candidateProfile.findUnique({
      where: { candidateAccountId: user.candidateAccountId },
      select: { firstName: true, lastName: true, phone: true, location: true, currentTitle: true },
    }),
    prisma.candidateCvEducation.findMany({
      where: { candidateAccountId: user.candidateAccountId },
      orderBy: { createdAt: "desc" },
      select: { qualification: true, institution: true, startDate: true, endDate: true },
    }),
    prisma.candidateCvExperience.findMany({
      where: { candidateAccountId: user.candidateAccountId },
      orderBy: { createdAt: "desc" },
      select: { company: true, role: true, startDate: true, endDate: true },
    }),
  ]);

  const payload: ParsedCvPayload = emptyParsedCvPayload();
  payload.candidate.fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();
  payload.candidate.email = account?.email ?? "";
  payload.candidate.phone = profile?.phone ?? "";
  payload.candidate.location = profile?.location ?? "";
  payload.candidate.currentTitle = profile?.currentTitle ?? "";
  payload.education = educationRows.map((r) => ({
    qualification: r.qualification ?? "",
    institution: r.institution ?? "",
    startDate: r.startDate ?? "",
    endDate: r.endDate ?? "",
  }));
  payload.experience = experienceRows.map((r) => ({
    company: r.company ?? "",
    role: r.role ?? "",
    startDate: r.startDate ?? "",
    endDate: r.endDate ?? "",
  }));

  const basicProfileComplete =
    isNonEmpty(account?.email) &&
    isNonEmpty(profile?.firstName) &&
    isNonEmpty(profile?.lastName) &&
    isNonEmpty(profile?.phone) &&
    isNonEmpty(profile?.location) &&
    isNonEmpty(profile?.currentTitle);
  const completeProfileDone = basicProfileComplete && experienceRows.length > 0 && educationRows.length > 0;

  return NextResponse.json({
    data: {
      payload,
      readOnly: completeProfileDone,
    },
  });
}
