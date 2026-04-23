"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearJobPostingCreateDraft,
  loadJobPostingCreateDraft,
  type JobPostingFormDraft,
  saveJobPostingCreateDraft,
} from "@/lib/job-posting-create-draft";
import type { SerializedJobPosting } from "@/lib/job-posting-serialize";
import {
  formatSalaryDigitsWithCommas,
  salaryInputToDigits,
  salaryValueToDigits,
} from "@/lib/salary-input";

type Lookup = { id: number; name: string; slug: string };
type LocationLookup = { id: number; city: string; country: string; slug: string };
type BenefitLookup = { id: number; description: string };
type TagLookup = { id: number; name: string; variant: string };

type FormOptions = {
  departments: Lookup[];
  locations: LocationLookup[];
  employmentTypes: Lookup[];
  experienceLevels: Lookup[];
  skills: { id: number; name: string }[];
  benefits: BenefitLookup[];
  tags: TagLookup[];
};

type QualRow = { description: string; type: "required" | "preferred" };

/** Fields validated before submit (matches API required core fields). */
type CoreFieldKey =
  | "title"
  | "summary"
  | "departmentId"
  | "locationId"
  | "employmentTypeId"
  | "experienceLevelId";

const CORE_FIELD_ORDER: CoreFieldKey[] = [
  "title",
  "summary",
  "departmentId",
  "locationId",
  "employmentTypeId",
  "experienceLevelId",
];

const CORE_FIELD_IDS: Record<CoreFieldKey, string> = {
  title: "job-title",
  summary: "job-summary",
  departmentId: "job-dept",
  locationId: "job-loc",
  employmentTypeId: "job-emp",
  experienceLevelId: "job-exp",
};

function emptyQual(): QualRow {
  return { description: "", type: "required" };
}

function ReqStar() {
  return (
    <span className="bo-label-required" aria-hidden="true">
      *
    </span>
  );
}

function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  mode: "create" | "edit";
  jobId?: string;
  initialJob?: SerializedJobPosting;
};

export function JobPostingForm({ mode, jobId, initialJob }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [employmentTypeId, setEmploymentTypeId] = useState("");
  const [experienceLevelId, setExperienceLevelId] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [isRemote, setIsRemote] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  const [overview, setOverview] = useState("");
  const [roleSummary, setRoleSummary] = useState("");
  const [applicationInfo, setApplicationInfo] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("");
  const [isSalaryVisible, setIsSalaryVisible] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerImageAlt, setBannerImageAlt] = useState("");
  const [expiresAtLocal, setExpiresAtLocal] = useState("");

  const [responsibilitiesText, setResponsibilitiesText] = useState("");
  const [qualifications, setQualifications] = useState<QualRow[]>([emptyQual()]);
  const [skillIds, setSkillIds] = useState<number[]>([]);
  const [benefitIds, setBenefitIds] = useState<number[]>([]);
  const [tagIds, setTagIds] = useState<number[]>([]);

  const [skillPick, setSkillPick] = useState("");
  const [benefitPick, setBenefitPick] = useState("");
  const [tagPick, setTagPick] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CoreFieldKey, string>>>({});

  function clearCoreError(key: CoreFieldKey) {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function validateForm(): boolean {
    const next: Partial<Record<CoreFieldKey, string>> = {};
    const t = title.trim();
    if (!t) next.title = "Job title is required.";
    else if (t.length > 200) next.title = "Job title must be at most 200 characters.";

    const s = summary.trim();
    if (!s) next.summary = "Summary is required.";
    else if (s.length > 500) next.summary = "Summary must be at most 500 characters.";

    if (!departmentId) next.departmentId = "Please select a department.";
    if (!locationId) next.locationId = "Please select a location.";
    if (!employmentTypeId) next.employmentTypeId = "Please select an employment type.";
    if (!experienceLevelId) next.experienceLevelId = "Please select an experience level.";

    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      const firstKey = CORE_FIELD_ORDER.find((k) => next[k]);
      if (firstKey) {
        const id = CORE_FIELD_IDS[firstKey];
        window.setTimeout(() => document.getElementById(id)?.focus(), 0);
      }
      return false;
    }
    return true;
  }

  const hydrateFromDraft = useCallback((d: JobPostingFormDraft) => {
    setTitle(d.title);
    setSlug(d.slug);
    setSummary(d.summary);
    setDepartmentId(d.departmentId);
    setLocationId(d.locationId);
    setEmploymentTypeId(d.employmentTypeId);
    setExperienceLevelId(d.experienceLevelId);
    setStatus(d.status);
    setIsRemote(d.isRemote);
    setIsFeatured(d.isFeatured);
    setOverview(d.overview);
    setRoleSummary(d.roleSummary);
    setApplicationInfo(d.applicationInfo);
    setSalaryMin(salaryValueToDigits(d.salaryMin));
    setSalaryMax(salaryValueToDigits(d.salaryMax));
    setSalaryCurrency(d.salaryCurrency);
    setIsSalaryVisible(d.isSalaryVisible);
    setBannerImageUrl(d.bannerImageUrl);
    setBannerImageAlt(d.bannerImageAlt);
    setExpiresAtLocal(d.expiresAtLocal);
    setResponsibilitiesText(d.responsibilitiesText);
    setQualifications(d.qualifications.length ? d.qualifications.map((q) => ({ ...q })) : [emptyQual()]);
    setSkillIds([...d.skillIds]);
    setBenefitIds([...d.benefitIds]);
    setTagIds([...d.tagIds]);
    setFieldErrors({});
  }, []);

  const hydrateFromJob = useCallback((j: SerializedJobPosting) => {
    setTitle(j.title);
    setSlug(j.slug);
    setSummary(j.summary);
    setDepartmentId(String(j.departmentId));
    setLocationId(String(j.locationId));
    setEmploymentTypeId(String(j.employmentTypeId));
    setExperienceLevelId(String(j.experienceLevelId));
    setStatus(j.status);
    setIsRemote(j.isRemote);
    setIsFeatured(j.isFeatured);
    setOverview(j.overview ?? "");
    setRoleSummary(j.roleSummary ?? "");
    setApplicationInfo(j.applicationInfo ?? "");
    setSalaryMin(salaryValueToDigits(j.salaryMin));
    setSalaryMax(salaryValueToDigits(j.salaryMax));
    setSalaryCurrency(j.salaryCurrency ?? "");
    setIsSalaryVisible(j.isSalaryVisible);
    setBannerImageUrl(j.bannerImageUrl ?? "");
    setBannerImageAlt(j.bannerImageAlt ?? "");
    setExpiresAtLocal(toDatetimeLocalValue(j.expiresAt));
    setResponsibilitiesText(j.responsibilities.length ? j.responsibilities.join("\n") : "");
    setQualifications(j.qualifications.length ? j.qualifications.map((q) => ({ description: q.description, type: q.type === "preferred" ? "preferred" : "required" })) : [emptyQual()]);
    setSkillIds([...j.skillIds]);
    setBenefitIds([...j.benefitIds]);
    setTagIds([...j.tagIds]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/backoffice/jobs/form-options", { credentials: "include" });
        if (!res.ok) throw new Error("Could not load form options.");
        const data = (await res.json()) as FormOptions;
        if (!cancelled) setOptions(data);
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "Failed to load.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialJob) {
      hydrateFromJob(initialJob);
    }
  }, [mode, initialJob, hydrateFromJob]);

  /** Restore form after returning from the review step (`?fromReview=1`). */
  useEffect(() => {
    if (mode !== "create") return;
    if (searchParams.get("fromReview") !== "1") return;
    const draft = loadJobPostingCreateDraft();
    if (!draft) return;
    hydrateFromDraft(draft);
    router.replace("/jobs/new");
  }, [mode, searchParams, router, hydrateFromDraft]);

  function buildDraft(): JobPostingFormDraft {
    return {
      title,
      slug,
      summary,
      departmentId,
      locationId,
      employmentTypeId,
      experienceLevelId,
      status,
      isRemote,
      isFeatured,
      overview,
      roleSummary,
      applicationInfo,
      salaryMin,
      salaryMax,
      salaryCurrency,
      isSalaryVisible,
      bannerImageUrl,
      bannerImageAlt,
      expiresAtLocal,
      responsibilitiesText,
      qualifications: qualifications.map((q) => ({ description: q.description, type: q.type })),
      skillIds: [...skillIds],
      benefitIds: [...benefitIds],
      tagIds: [...tagIds],
    };
  }

  function buildBody(): Record<string, unknown> {
    const responsibilities = responsibilitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const quals = qualifications
      .map((q) => ({
        description: q.description.trim(),
        type: q.type,
      }))
      .filter((q) => q.description.length > 0);

    let expiresAt: string | null = null;
    if (expiresAtLocal.trim()) {
      const d = new Date(expiresAtLocal);
      expiresAt = Number.isNaN(d.getTime()) ? null : d.toISOString();
    }

    return {
      title: title.trim(),
      summary: summary.trim(),
      departmentId: Number(departmentId),
      locationId: Number(locationId),
      employmentTypeId: Number(employmentTypeId),
      experienceLevelId: Number(experienceLevelId),
      status,
      isRemote,
      isFeatured,
      slug: slug.trim() || undefined,
      overview: overview.trim() || null,
      roleSummary: roleSummary.trim() || null,
      applicationInfo: applicationInfo.trim() || null,
      salaryMin: salaryMin.trim() || null,
      salaryMax: salaryMax.trim() || null,
      salaryCurrency: salaryCurrency.trim() || null,
      isSalaryVisible,
      bannerImageUrl: bannerImageUrl.trim() || null,
      bannerImageAlt: bannerImageAlt.trim() || null,
      expiresAt,
      responsibilities,
      qualifications: quals,
      skillIds,
      benefitIds,
      tagIds,
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    if (!options) {
      setSubmitError("Form options are still loading. Please wait a moment and try again.");
      return;
    }

    if (mode === "create") {
      saveJobPostingCreateDraft(buildDraft());
      router.push("/jobs/new/review");
      return;
    }

    setSubmitting(true);
    try {
      const body = buildBody();
      const res = await fetch(`/api/backoffice/jobs/${jobId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: string } };
        throw new Error(j?.error?.message ?? j?.error?.code ?? res.statusText);
      }
      router.push("/jobs");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  function addSkill() {
    const id = Number.parseInt(skillPick, 10);
    if (!Number.isFinite(id) || skillIds.includes(id)) return;
    setSkillIds((prev) => [...prev, id]);
    setSkillPick("");
  }

  function removeSkill(id: number) {
    setSkillIds((prev) => prev.filter((x) => x !== id));
  }

  function addBenefit() {
    const id = Number.parseInt(benefitPick, 10);
    if (!Number.isFinite(id) || benefitIds.includes(id)) return;
    setBenefitIds((prev) => [...prev, id]);
    setBenefitPick("");
  }

  function removeBenefit(id: number) {
    setBenefitIds((prev) => prev.filter((x) => x !== id));
  }

  function addTag() {
    const id = Number.parseInt(tagPick, 10);
    if (!Number.isFinite(id) || tagIds.includes(id)) return;
    setTagIds((prev) => [...prev, id]);
    setTagPick("");
  }

  function removeTag(id: number) {
    setTagIds((prev) => prev.filter((x) => x !== id));
  }

  return (
    <form className="bo-card bo-job-create-form" onSubmit={(e) => void onSubmit(e)} noValidate>
      {loadError && (
        <div className="bo-admin-alert" role="alert">
          {loadError}
        </div>
      )}
      {submitError && (
        <div className="bo-admin-alert" role="alert">
          {submitError}
        </div>
      )}

      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Basics</h2>
        <div className="bo-admin-form-grid">
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-title">
              Job title <ReqStar />
            </label>
            {fieldErrors.title ? (
              <p id="job-title-error" className="bo-field-error" role="alert">
                {fieldErrors.title}
              </p>
            ) : null}
            <input
              id="job-title"
              className={`bo-input${fieldErrors.title ? " bo-input-error" : ""}`}
              value={title}
              autoFocus
              onChange={(e) => {
                setTitle(e.target.value);
                clearCoreError("title");
              }}
              maxLength={200}
              autoComplete="off"
              aria-invalid={fieldErrors.title ? true : undefined}
              aria-describedby={fieldErrors.title ? "job-title-error" : undefined}
              aria-required
            />
          </div>
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-slug">
              Slug <span className="bo-label-hint">(optional on create; change on edit to rename URL segment)</span>
            </label>
            <input
              id="job-slug"
              className="bo-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              maxLength={220}
              autoComplete="off"
            />
          </div>
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-summary">
              Summary <ReqStar />
              <span className="bo-label-hint">(listing card — max 500 characters)</span>
            </label>
            {fieldErrors.summary ? (
              <p id="job-summary-error" className="bo-field-error" role="alert">
                {fieldErrors.summary}
              </p>
            ) : null}
            <textarea
              id="job-summary"
              className={`bo-input bo-textarea${fieldErrors.summary ? " bo-input-error" : ""}`}
              value={summary}
              onChange={(e) => {
                setSummary(e.target.value);
                clearCoreError("summary");
              }}
              maxLength={500}
              rows={4}
              aria-invalid={fieldErrors.summary ? true : undefined}
              aria-describedby={fieldErrors.summary ? "job-summary-error" : undefined}
              aria-required
            />
            <span className="bo-field-hint">{summary.length}/500</span>
          </div>

          <div className="bo-field">
            <label className="bo-label" htmlFor="job-dept">
              Department <ReqStar />
            </label>
            {fieldErrors.departmentId ? (
              <p id="job-dept-error" className="bo-field-error" role="alert">
                {fieldErrors.departmentId}
              </p>
            ) : null}
            <select
              id="job-dept"
              className={`bo-input${fieldErrors.departmentId ? " bo-input-error" : ""}`}
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                clearCoreError("departmentId");
              }}
              disabled={!options}
              aria-invalid={fieldErrors.departmentId ? true : undefined}
              aria-describedby={fieldErrors.departmentId ? "job-dept-error" : undefined}
              aria-required
            >
              <option value="">Select…</option>
              {options?.departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-loc">
              Location <ReqStar />
            </label>
            {fieldErrors.locationId ? (
              <p id="job-loc-error" className="bo-field-error" role="alert">
                {fieldErrors.locationId}
              </p>
            ) : null}
            <select
              id="job-loc"
              className={`bo-input${fieldErrors.locationId ? " bo-input-error" : ""}`}
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                clearCoreError("locationId");
              }}
              disabled={!options}
              aria-invalid={fieldErrors.locationId ? true : undefined}
              aria-describedby={fieldErrors.locationId ? "job-loc-error" : undefined}
              aria-required
            >
              <option value="">Select…</option>
              {options?.locations.map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.city}, {l.country}
                </option>
              ))}
            </select>
          </div>
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-emp">
              Employment type <ReqStar />
            </label>
            {fieldErrors.employmentTypeId ? (
              <p id="job-emp-error" className="bo-field-error" role="alert">
                {fieldErrors.employmentTypeId}
              </p>
            ) : null}
            <select
              id="job-emp"
              className={`bo-input${fieldErrors.employmentTypeId ? " bo-input-error" : ""}`}
              value={employmentTypeId}
              onChange={(e) => {
                setEmploymentTypeId(e.target.value);
                clearCoreError("employmentTypeId");
              }}
              disabled={!options}
              aria-invalid={fieldErrors.employmentTypeId ? true : undefined}
              aria-describedby={fieldErrors.employmentTypeId ? "job-emp-error" : undefined}
              aria-required
            >
              <option value="">Select…</option>
              {options?.employmentTypes.map((et) => (
                <option key={et.id} value={String(et.id)}>
                  {et.name}
                </option>
              ))}
            </select>
          </div>
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-exp">
              Experience level <ReqStar />
            </label>
            {fieldErrors.experienceLevelId ? (
              <p id="job-exp-error" className="bo-field-error" role="alert">
                {fieldErrors.experienceLevelId}
              </p>
            ) : null}
            <select
              id="job-exp"
              className={`bo-input${fieldErrors.experienceLevelId ? " bo-input-error" : ""}`}
              value={experienceLevelId}
              onChange={(e) => {
                setExperienceLevelId(e.target.value);
                clearCoreError("experienceLevelId");
              }}
              disabled={!options}
              aria-invalid={fieldErrors.experienceLevelId ? true : undefined}
              aria-describedby={fieldErrors.experienceLevelId ? "job-exp-error" : undefined}
              aria-required
            >
              <option value="">Select…</option>
              {options?.experienceLevels.map((ex) => (
                <option key={ex.id} value={String(ex.id)}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bo-field">
            <label className="bo-label" htmlFor="job-status">
              Status
            </label>
            <select id="job-status" className="bo-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="bo-field bo-jobs-filters-remote">
            <label className="bo-label bo-label--inline">
              <input type="checkbox" checked={isRemote} onChange={(e) => setIsRemote(e.target.checked)} />
              Remote role
            </label>
          </div>
          <div className="bo-field bo-jobs-filters-remote">
            <label className="bo-label bo-label--inline">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Featured listing
            </label>
          </div>
        </div>
      </div>

      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Detail page content</h2>
        <p className="bo-page-sub bo-job-form-hint">
          Maps to job detail template: overview, role summary, application instructions, poster image, and expiry.
        </p>
        <div className="bo-admin-form-grid">
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-overview">
              Job overview
            </label>
            <textarea
              id="job-overview"
              className="bo-input bo-textarea"
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              rows={5}
            />
          </div>
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-role-summary">
              Role summary
            </label>
            <textarea
              id="job-role-summary"
              className="bo-input bo-textarea"
              value={roleSummary}
              onChange={(e) => setRoleSummary(e.target.value)}
              rows={4}
            />
          </div>
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-app-info">
              Application information
            </label>
            <textarea
              id="job-app-info"
              className="bo-input bo-textarea"
              value={applicationInfo}
              onChange={(e) => setApplicationInfo(e.target.value)}
              rows={4}
            />
          </div>
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-banner-url">
              Banner image URL
            </label>
            <input
              id="job-banner-url"
              className="bo-input"
              value={bannerImageUrl}
              onChange={(e) => setBannerImageUrl(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="bo-field" style={{ gridColumn: "1 / -1" }}>
            <label className="bo-label" htmlFor="job-banner-alt">
              Banner image alt text
            </label>
            <input
              id="job-banner-alt"
              className="bo-input"
              value={bannerImageAlt}
              onChange={(e) => setBannerImageAlt(e.target.value)}
              maxLength={255}
            />
          </div>
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-expires">
              Expires at
            </label>
            <input
              id="job-expires"
              className="bo-input"
              type="datetime-local"
              value={expiresAtLocal}
              onChange={(e) => setExpiresAtLocal(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Compensation</h2>
        <div className="bo-admin-form-grid">
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-salary-min">
              Salary min
            </label>
            <input
              id="job-salary-min"
              className="bo-input"
              value={formatSalaryDigitsWithCommas(salaryMin)}
              onChange={(e) => setSalaryMin(salaryInputToDigits(e.target.value))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 80,000"
            />
          </div>
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-salary-max">
              Salary max
            </label>
            <input
              id="job-salary-max"
              className="bo-input"
              value={formatSalaryDigitsWithCommas(salaryMax)}
              onChange={(e) => setSalaryMax(salaryInputToDigits(e.target.value))}
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 120,000"
            />
          </div>
          <div className="bo-field">
            <label className="bo-label" htmlFor="job-currency">
              Currency (ISO 4217)
            </label>
            <input
              id="job-currency"
              className="bo-input"
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value.toUpperCase().slice(0, 3))}
              maxLength={3}
              placeholder="USD"
            />
          </div>
          <div className="bo-field bo-jobs-filters-remote">
            <label className="bo-label bo-label--inline">
              <input type="checkbox" checked={isSalaryVisible} onChange={(e) => setIsSalaryVisible(e.target.checked)} />
              Show salary on listing / detail
            </label>
          </div>
        </div>
      </div>

      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Responsibilities</h2>
        <p className="bo-page-sub bo-job-form-hint">One bullet per line; order is preserved.</p>
        <div className="bo-field">
          <label className="bo-label" htmlFor="job-resp">
            Key responsibilities
          </label>
          <textarea
            id="job-resp"
            className="bo-input bo-textarea"
            value={responsibilitiesText}
            onChange={(e) => setResponsibilitiesText(e.target.value)}
            rows={6}
            placeholder="Gather requirements&#10;Collaborate with engineering&#10;…"
          />
        </div>
      </div>

      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Qualifications</h2>
        <p className="bo-page-sub bo-job-form-hint">Mark each line as required or preferred.</p>
        <div className="bo-job-qual-list">
          {qualifications.map((row, i) => (
            <div key={i} className="bo-job-qual-row">
              <input
                className="bo-input"
                value={row.description}
                onChange={(e) => {
                  const next = [...qualifications];
                  next[i] = { ...next[i], description: e.target.value };
                  setQualifications(next);
                }}
                placeholder="Qualification description"
              />
              <select
                className="bo-input"
                value={row.type}
                onChange={(e) => {
                  const next = [...qualifications];
                  next[i] = { ...next[i], type: e.target.value as "required" | "preferred" };
                  setQualifications(next);
                }}
              >
                <option value="required">Required</option>
                <option value="preferred">Preferred</option>
              </select>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setQualifications((q) => q.filter((_, j) => j !== i))}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setQualifications((q) => [...q, emptyQual()])}>
            Add qualification
          </button>
        </div>
      </div>

      <div className="bo-job-form-section">
        <h2 className="bo-job-form-section-title">Skills, benefits &amp; tags</h2>
        <p className="bo-page-sub bo-job-form-hint">
          Order matches display order on the candidate job detail page. Maintenance lists are managed under Administration.
        </p>

        <div className="bo-field">
          <span className="bo-label">Skills</span>
          <div className="bo-job-pick-row">
            <select className="bo-input" value={skillPick} onChange={(e) => setSkillPick(e.target.value)} disabled={!options}>
              <option value="">Add skill…</option>
              {options?.skills.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>
              Add
            </button>
          </div>
          <ul className="bo-job-chip-list">
            {skillIds.map((id) => {
              const name = options?.skills.find((s) => s.id === id)?.name ?? `#${id}`;
              return (
                <li key={id}>
                  {name}{" "}
                  <button type="button" className="bo-job-chip-remove" onClick={() => removeSkill(id)}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bo-field">
          <span className="bo-label">Benefits</span>
          <div className="bo-job-pick-row">
            <select className="bo-input" value={benefitPick} onChange={(e) => setBenefitPick(e.target.value)} disabled={!options}>
              <option value="">Add benefit…</option>
              {options?.benefits.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.description}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addBenefit}>
              Add
            </button>
          </div>
          <ul className="bo-job-chip-list">
            {benefitIds.map((id) => {
              const label = options?.benefits.find((b) => b.id === id)?.description ?? `#${id}`;
              return (
                <li key={id}>
                  {label}{" "}
                  <button type="button" className="bo-job-chip-remove" onClick={() => removeBenefit(id)}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bo-field">
          <span className="bo-label">Tags</span>
          <div className="bo-job-pick-row">
            <select className="bo-input" value={tagPick} onChange={(e) => setTagPick(e.target.value)} disabled={!options}>
              <option value="">Add tag…</option>
              {options?.tags.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name} ({t.variant})
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>
              Add
            </button>
          </div>
          <ul className="bo-job-chip-list">
            {tagIds.map((id) => {
              const t = options?.tags.find((x) => x.id === id);
              return (
                <li key={id}>
                  {t ? `${t.name} (${t.variant})` : `#${id}`}{" "}
                  <button type="button" className="bo-job-chip-remove" onClick={() => removeTag(id)}>
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="bo-admin-form-actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={submitting || !options}>
          {submitting
            ? "Saving…"
            : mode === "create"
              ? "Review posting"
              : "Save changes"}
        </button>
        <Link
          href="/jobs"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (mode === "create") clearJobPostingCreateDraft();
          }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
