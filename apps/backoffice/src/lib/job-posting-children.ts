import type { Prisma } from "@prisma/client";

export type JobChildrenInput = {
  responsibilities: string[];
  qualifications: { description: string; type: "required" | "preferred" }[];
  skillIds: number[];
  benefitIds: number[];
  tagIds: number[];
};

/** Replace all junction / child rows for a job posting (used after create and on PATCH). */
export async function syncJobPostingChildren(
  tx: Prisma.TransactionClient,
  jobPostingId: string,
  input: JobChildrenInput
): Promise<void> {
  await tx.jobResponsibility.deleteMany({ where: { jobPostingId } });
  await tx.jobQualification.deleteMany({ where: { jobPostingId } });
  await tx.jobPostingSkill.deleteMany({ where: { jobPostingId } });
  await tx.jobPostingBenefit.deleteMany({ where: { jobPostingId } });
  await tx.jobPostingTag.deleteMany({ where: { jobPostingId } });

  const resp = input.responsibilities
    .map((s) => s.trim())
    .filter(Boolean)
    .map((description, i) => ({
      jobPostingId,
      description,
      sortOrder: i,
    }));
  if (resp.length) {
    await tx.jobResponsibility.createMany({ data: resp });
  }

  const quals = input.qualifications.filter((q) => q.description.trim());
  for (let i = 0; i < quals.length; i++) {
    await tx.jobQualification.create({
      data: {
        jobPostingId,
        description: quals[i].description.trim(),
        type: quals[i].type,
        sortOrder: i,
      },
    });
  }

  const uniqOrder = (ids: number[]): number[] => {
    const seen = new Set<number>();
    return ids.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const sIds = uniqOrder(input.skillIds);
  if (sIds.length) {
    await tx.jobPostingSkill.createMany({
      data: sIds.map((skillId, i) => ({ jobPostingId, skillId, sortOrder: i })),
    });
  }

  const bIds = uniqOrder(input.benefitIds);
  if (bIds.length) {
    await tx.jobPostingBenefit.createMany({
      data: bIds.map((benefitId, i) => ({ jobPostingId, benefitId, sortOrder: i })),
    });
  }

  const tIds = uniqOrder(input.tagIds);
  if (tIds.length) {
    await tx.jobPostingTag.createMany({
      data: tIds.map((tagId, i) => ({ jobPostingId, tagId, sortOrder: i })),
    });
  }
}
