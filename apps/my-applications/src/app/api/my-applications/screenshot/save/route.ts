import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBearerToken, verifyCandidateAccessToken } from "@/lib/verify-candidate-token";
import { normalizeParsedPayload, type ParsedCvPayload } from "@/types/cv-parse";

export const runtime = "nodejs";

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token." } }, { status: 401 });
  }
  const user = await verifyCandidateAccessToken(token);
  if (!user) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token." } }, { status: 401 });
  }

  let body: { payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid JSON." } }, { status: 400 });
  }
  if (body.payload === undefined) {
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "payload is required." } }, { status: 400 });
  }

  const payload = normalizeParsedPayload(body.payload) as ParsedCvPayload;
  const { firstName, lastName } = splitFullName(payload.candidate.fullName);

  await prisma.$transaction(async (tx) => {
    await tx.candidateProfile.upsert({
      where: { candidateAccountId: user.candidateAccountId },
      create: {
        candidateAccountId: user.candidateAccountId,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: payload.candidate.phone || null,
        location: payload.candidate.location || null,
        currentTitle: payload.candidate.currentTitle || null,
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        phone: payload.candidate.phone || null,
        location: payload.candidate.location || null,
        currentTitle: payload.candidate.currentTitle || null,
      },
    });

    await tx.candidateCvEducation.deleteMany({ where: { candidateAccountId: user.candidateAccountId } });
    await tx.candidateCvExperience.deleteMany({ where: { candidateAccountId: user.candidateAccountId } });

    if (payload.education.length) {
      await tx.candidateCvEducation.createMany({
        data: payload.education.map((e) => ({
          candidateAccountId: user.candidateAccountId,
          qualification: e.qualification.slice(0, 400),
          institution: e.institution.slice(0, 400),
          startDate: e.startDate ? e.startDate.slice(0, 80) : null,
          endDate: e.endDate ? e.endDate.slice(0, 80) : null,
        })),
      });
    }

    if (payload.experience.length) {
      await tx.candidateCvExperience.createMany({
        data: payload.experience.map((e) => ({
          candidateAccountId: user.candidateAccountId,
          company: e.company.slice(0, 300),
          role: e.role.slice(0, 300),
          startDate: e.startDate ? e.startDate.slice(0, 80) : null,
          endDate: e.endDate ? e.endDate.slice(0, 80) : null,
        })),
      });
    }
  });

  return NextResponse.json({ data: { ok: true } });
}
