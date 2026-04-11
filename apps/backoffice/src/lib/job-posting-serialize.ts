import type { Prisma } from "@prisma/client";
import type { JOB_POSTING_FULL_INCLUDE } from "@/lib/job-posting-queries";

export type JobPostingFullPayload = Prisma.JobPostingGetPayload<{ include: typeof JOB_POSTING_FULL_INCLUDE }>;

export type SerializedJobPosting = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  status: string;
  departmentId: number;
  locationId: number;
  employmentTypeId: number;
  experienceLevelId: number;
  overview: string | null;
  roleSummary: string | null;
  applicationInfo: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
  isSalaryVisible: boolean;
  isRemote: boolean;
  isFeatured: boolean;
  bannerImageUrl: string | null;
  bannerImageAlt: string | null;
  postedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string | null;
  department: { id: number; name: string; slug: string };
  location: { id: number; city: string; country: string; slug: string };
  employmentType: { id: number; name: string; slug: string };
  experienceLevel: { id: number; name: string; slug: string };
  responsibilities: string[];
  qualifications: { description: string; type: string }[];
  skills: { id: number; name: string }[];
  benefits: { id: number; description: string }[];
  tags: { id: number; name: string; variant: string }[];
  skillIds: number[];
  benefitIds: number[];
  tagIds: number[];
};

/** JSON-safe job posting for API and form initial state. */
export function serializeJobPostingFull(job: JobPostingFullPayload): SerializedJobPosting {
  const sortResp = [...job.responsibilities].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortQual = [...job.qualifications].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortSkills = [...job.jobPostingSkills].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortBen = [...job.jobPostingBenefits].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortTags = [...job.jobPostingTags].sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    summary: job.summary,
    status: job.status,
    departmentId: job.departmentId,
    locationId: job.locationId,
    employmentTypeId: job.employmentTypeId,
    experienceLevelId: job.experienceLevelId,
    overview: job.overview,
    roleSummary: job.roleSummary,
    applicationInfo: job.applicationInfo,
    salaryMin: job.salaryMin?.toString() ?? null,
    salaryMax: job.salaryMax?.toString() ?? null,
    salaryCurrency: job.salaryCurrency,
    isSalaryVisible: job.isSalaryVisible,
    isRemote: job.isRemote,
    isFeatured: job.isFeatured,
    bannerImageUrl: job.bannerImageUrl,
    bannerImageAlt: job.bannerImageAlt,
    postedAt: job.postedAt?.toISOString() ?? null,
    expiresAt: job.expiresAt?.toISOString() ?? null,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    createdById: job.createdById,
    department: job.department,
    location: job.location,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    responsibilities: sortResp.map((r) => r.description),
    qualifications: sortQual.map((q) => ({ description: q.description, type: q.type })),
    skills: sortSkills.map((s) => ({ id: s.skill.id, name: s.skill.name })),
    benefits: sortBen.map((b) => ({ id: b.benefit.id, description: b.benefit.description })),
    tags: sortTags.map((t) => ({ id: t.tag.id, name: t.tag.name, variant: t.tag.variant })),
    skillIds: sortSkills.map((s) => s.skill.id),
    benefitIds: sortBen.map((b) => b.benefit.id),
    tagIds: sortTags.map((t) => t.tag.id),
  };
}
