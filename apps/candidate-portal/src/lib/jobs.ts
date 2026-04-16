import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const JOB_LIST_PAGE_SIZE = 10;

export type JobListFilters = {
  q?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  experience?: string;
  remote?: boolean;
  postedWithin?: "24h" | "7d" | "30d";
  sort?: "recent" | "az";
  page?: number;
};

const jobListInclude = {
  department: true,
  location: true,
  employmentType: true,
  experienceLevel: true,
  jobPostingTags: { include: { tag: true } },
} satisfies Prisma.JobPostingInclude;

export type JobListItem = Prisma.JobPostingGetPayload<{ include: typeof jobListInclude }>;

export async function getFilterOptions() {
  const [departments, locations, employmentTypes, experienceLevels] = await Promise.all([
    prisma.department.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.location.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.employmentType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.experienceLevel.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  return { departments, locations, employmentTypes, experienceLevels };
}

function buildWhere(filters: JobListFilters): Prisma.JobPostingWhereInput {
  const now = new Date();
  const conditions: Prisma.JobPostingWhereInput[] = [
    { status: "published" },
    { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
  ];

  const q = filters.q?.trim();
  if (q) {
    conditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { overview: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.department) {
    conditions.push({ department: { slug: filters.department } });
  }
  if (filters.location) {
    conditions.push({ location: { slug: filters.location } });
  }
  if (filters.employmentType) {
    conditions.push({ employmentType: { slug: filters.employmentType } });
  }
  if (filters.experience) {
    conditions.push({ experienceLevel: { slug: filters.experience } });
  }
  if (filters.remote === true) {
    conditions.push({ isRemote: true });
  }

  if (filters.postedWithin) {
    const ms =
      filters.postedWithin === "24h"
        ? 24 * 60 * 60 * 1000
        : filters.postedWithin === "7d"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;
    const since = new Date(now.getTime() - ms);
    conditions.push({ postedAt: { gte: since } });
  }

  return { AND: conditions };
}

export async function listPublishedJobs(filters: JobListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = JOB_LIST_PAGE_SIZE;
  const where = buildWhere(filters);

  const orderBy: Prisma.JobPostingOrderByWithRelationInput =
    filters.sort === "az" ? { title: "asc" } : { postedAt: "desc" };

  const [total, jobs] = await Promise.all([
    prisma.jobPosting.count({ where }),
    prisma.jobPosting.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: jobListInclude,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { jobs, total, page, pageSize, totalPages };
}

const jobDetailInclude = {
  department: true,
  location: true,
  employmentType: true,
  experienceLevel: true,
  responsibilities: { orderBy: { sortOrder: "asc" as const } },
  qualifications: { orderBy: { sortOrder: "asc" as const } },
  jobPostingSkills: { orderBy: { sortOrder: "asc" as const }, include: { skill: true } },
  jobPostingBenefits: { orderBy: { sortOrder: "asc" as const }, include: { benefit: true } },
  jobPostingTags: { include: { tag: true } },
  _count: { select: { applications: true, bookmarks: true } },
} satisfies Prisma.JobPostingInclude;

export type JobDetail = Prisma.JobPostingGetPayload<{ include: typeof jobDetailInclude }>;

export async function getPublishedJobBySlug(slug: string): Promise<JobDetail | null> {
  const now = new Date();
  return prisma.jobPosting.findFirst({
    where: {
      slug,
      status: "published",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    include: jobDetailInclude,
  });
}
