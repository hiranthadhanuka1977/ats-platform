/** Prisma include for full job posting (PDP + relations). */
export const JOB_POSTING_FULL_INCLUDE = {
  department: { select: { id: true, name: true, slug: true } },
  location: { select: { id: true, city: true, country: true, slug: true } },
  employmentType: { select: { id: true, name: true, slug: true } },
  experienceLevel: { select: { id: true, name: true, slug: true } },
  responsibilities: true,
  qualifications: true,
  jobPostingSkills: { include: { skill: { select: { id: true, name: true } } } },
  jobPostingBenefits: { include: { benefit: { select: { id: true, description: true } } } },
  jobPostingTags: { include: { tag: { select: { id: true, name: true, variant: true } } } },
} as const;
