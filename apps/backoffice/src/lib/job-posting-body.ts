import type { JobPostingStatus, QualificationType } from "@prisma/client";
import { Prisma } from "@prisma/client";

const STATUSES: JobPostingStatus[] = ["draft", "published", "closed", "archived"];

function toDecimal(v: unknown): Prisma.Decimal | null {
  if (v === null || v === undefined || v === "") return null;
  const s = typeof v === "number" ? String(v) : String(v).trim().replace(/,/g, "");
  if (!s) return null;
  try {
    return new Prisma.Decimal(s);
  } catch {
    return null;
  }
}

function parseString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function parseIsoDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type ParsedJobChildren = {
  responsibilities: string[];
  qualifications: { description: string; type: QualificationType }[];
  skillIds: number[];
  benefitIds: number[];
  tagIds: number[];
};

/** PDP scalars for create/update (missing JSON keys → null / defaults). */
export type ParsedJobPdpScalars = {
  overview: string | null;
  roleSummary: string | null;
  applicationInfo: string | null;
  salaryMin: Prisma.Decimal | null;
  salaryMax: Prisma.Decimal | null;
  salaryCurrency: string | null;
  isSalaryVisible: boolean;
  isRemote: boolean;
  isFeatured: boolean;
  bannerImageUrl: string | null;
  bannerImageAlt: string | null;
  expiresAt: Date | null;
};

export function parseJobPostingPdpFromBody(body: Record<string, unknown>): {
  pdp: ParsedJobPdpScalars;
  children: ParsedJobChildren;
} {
  const children: ParsedJobChildren = {
    responsibilities: [],
    qualifications: [],
    skillIds: [],
    benefitIds: [],
    tagIds: [],
  };

  if (Array.isArray(body.responsibilities)) {
    children.responsibilities = body.responsibilities
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (Array.isArray(body.qualifications)) {
    for (const q of body.qualifications) {
      if (!q || typeof q !== "object") continue;
      const o = q as Record<string, unknown>;
      const description = typeof o.description === "string" ? o.description.trim() : "";
      if (!description) continue;
      const type = o.type === "preferred" ? "preferred" : "required";
      children.qualifications.push({ description, type });
    }
  }

  const idArray = (key: string): number[] => {
    const v = body[key];
    if (!Array.isArray(v)) return [];
    const out: number[] = [];
    for (const x of v) {
      const n = typeof x === "number" ? x : Number.parseInt(String(x), 10);
      if (Number.isFinite(n)) out.push(n);
    }
    return out;
  };
  children.skillIds = idArray("skillIds");
  children.benefitIds = idArray("benefitIds");
  children.tagIds = idArray("tagIds");

  const cur = parseString(body.salaryCurrency);
  const pdp: ParsedJobPdpScalars = {
    overview: typeof body.overview === "string" ? parseString(body.overview) : null,
    roleSummary: typeof body.roleSummary === "string" ? parseString(body.roleSummary) : null,
    applicationInfo: typeof body.applicationInfo === "string" ? parseString(body.applicationInfo) : null,
    salaryMin: toDecimal(body.salaryMin),
    salaryMax: toDecimal(body.salaryMax),
    salaryCurrency: cur && cur.length <= 3 ? cur.toUpperCase().slice(0, 3) : null,
    isSalaryVisible: typeof body.isSalaryVisible === "boolean" ? body.isSalaryVisible : false,
    isRemote: typeof body.isRemote === "boolean" ? body.isRemote : false,
    isFeatured: typeof body.isFeatured === "boolean" ? body.isFeatured : false,
    bannerImageUrl: typeof body.bannerImageUrl === "string" ? parseString(body.bannerImageUrl) : null,
    bannerImageAlt: typeof body.bannerImageAlt === "string" ? parseString(body.bannerImageAlt) : null,
    expiresAt: parseIsoDate(body.expiresAt),
  };

  return { pdp, children };
}

export function parseJobPostingCoreFromBody(body: Record<string, unknown>): {
  title?: string;
  slug?: string;
  summary?: string;
  departmentId?: number;
  locationId?: number;
  employmentTypeId?: number;
  experienceLevelId?: number;
  status?: JobPostingStatus;
} {
  const out: ReturnType<typeof parseJobPostingCoreFromBody> = {};

  if (typeof body.title === "string") out.title = body.title.trim();
  if (typeof body.slug === "string") out.slug = body.slug.trim();
  if (typeof body.summary === "string") out.summary = body.summary.trim();

  const num = (k: string) => {
    const v = body[k];
    const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
    return Number.isFinite(n) ? n : undefined;
  };
  const d = num("departmentId");
  const l = num("locationId");
  const e = num("employmentTypeId");
  const x = num("experienceLevelId");
  if (d !== undefined) out.departmentId = d;
  if (l !== undefined) out.locationId = l;
  if (e !== undefined) out.employmentTypeId = e;
  if (x !== undefined) out.experienceLevelId = x;

  if (typeof body.status === "string" && STATUSES.includes(body.status as JobPostingStatus)) {
    out.status = body.status as JobPostingStatus;
  }

  return out;
}
