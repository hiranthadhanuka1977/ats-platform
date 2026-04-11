/**
 * Client-only draft for the create-job flow: form → review → POST.
 * Stored in sessionStorage so the user can return from review to edit.
 */

export const JOB_POSTING_CREATE_DRAFT_KEY = "ats:jobPostingCreateDraft";

export type JobPostingQualificationDraft = {
  description: string;
  type: "required" | "preferred";
};

/** Mirrors JobPostingForm state needed to restore the form and build the API body. */
export type JobPostingFormDraft = {
  title: string;
  slug: string;
  summary: string;
  departmentId: string;
  locationId: string;
  employmentTypeId: string;
  experienceLevelId: string;
  status: string;
  isRemote: boolean;
  isFeatured: boolean;
  overview: string;
  roleSummary: string;
  applicationInfo: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  isSalaryVisible: boolean;
  bannerImageUrl: string;
  bannerImageAlt: string;
  expiresAtLocal: string;
  responsibilitiesText: string;
  qualifications: JobPostingQualificationDraft[];
  skillIds: number[];
  benefitIds: number[];
  tagIds: number[];
};

export function saveJobPostingCreateDraft(draft: JobPostingFormDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(JOB_POSTING_CREATE_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* quota or private mode */
  }
}

export function loadJobPostingCreateDraft(): JobPostingFormDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(JOB_POSTING_CREATE_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as JobPostingFormDraft;
    if (!parsed || typeof parsed.title !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearJobPostingCreateDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(JOB_POSTING_CREATE_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

/** Same payload shape as JobPostingForm `buildBody()` for POST /api/backoffice/jobs */
export function draftToApiBody(draft: JobPostingFormDraft): Record<string, unknown> {
  const responsibilities = draft.responsibilitiesText
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const quals = draft.qualifications
    .map((q) => ({
      description: q.description.trim(),
      type: q.type,
    }))
    .filter((q) => q.description.length > 0);

  let expiresAt: string | null = null;
  if (draft.expiresAtLocal.trim()) {
    const d = new Date(draft.expiresAtLocal);
    expiresAt = Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  return {
    title: draft.title.trim(),
    summary: draft.summary.trim(),
    departmentId: Number(draft.departmentId),
    locationId: Number(draft.locationId),
    employmentTypeId: Number(draft.employmentTypeId),
    experienceLevelId: Number(draft.experienceLevelId),
    status: draft.status,
    isRemote: draft.isRemote,
    isFeatured: draft.isFeatured,
    slug: draft.slug.trim() || undefined,
    overview: draft.overview.trim() || null,
    roleSummary: draft.roleSummary.trim() || null,
    applicationInfo: draft.applicationInfo.trim() || null,
    salaryMin: draft.salaryMin.trim() || null,
    salaryMax: draft.salaryMax.trim() || null,
    salaryCurrency: draft.salaryCurrency.trim() || null,
    isSalaryVisible: draft.isSalaryVisible,
    bannerImageUrl: draft.bannerImageUrl.trim() || null,
    bannerImageAlt: draft.bannerImageAlt.trim() || null,
    expiresAt,
    responsibilities,
    qualifications: quals,
    skillIds: draft.skillIds,
    benefitIds: draft.benefitIds,
    tagIds: draft.tagIds,
  };
}
