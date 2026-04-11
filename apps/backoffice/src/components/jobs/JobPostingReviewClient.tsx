"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearJobPostingCreateDraft,
  draftToApiBody,
  loadJobPostingCreateDraft,
  type JobPostingFormDraft,
} from "@/lib/job-posting-create-draft";

type Lookup = { id: number; name: string; slug: string };
type LocationLookup = { id: number; city: string; country: string; slug: string };
type FormOptions = {
  departments: Lookup[];
  locations: LocationLookup[];
  employmentTypes: Lookup[];
  experienceLevels: Lookup[];
  skills: { id: number; name: string }[];
  benefits: { id: number; description: string }[];
  tags: { id: number; name: string; variant: string }[];
};

function formatExpires(local: string): string {
  if (!local.trim()) return "—";
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isLikelyImageUrl(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  return t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/");
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}

export function JobPostingReviewClient() {
  const router = useRouter();
  const [draft, setDraft] = useState<JobPostingFormDraft | null>(null);
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const d = loadJobPostingCreateDraft();
    if (!d) {
      router.replace("/jobs/new");
      return;
    }
    setDraft(d);
  }, [router]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/backoffice/jobs/form-options", { credentials: "include" });
        if (!res.ok) throw new Error("Could not load labels.");
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

  const confirmCreate = useCallback(async () => {
    const d = draft ?? loadJobPostingCreateDraft();
    if (!d) {
      router.replace("/jobs/new");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const body = draftToApiBody(d);
      const res = await fetch("/api/backoffice/jobs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: string } };
        throw new Error(j?.error?.message ?? j?.error?.code ?? res.statusText);
      }
      const data = (await res.json()) as { item: { id: string; status: string } };
      clearJobPostingCreateDraft();
      const { id: jobId, status: jobStatus } = data.item;
      const q = new URLSearchParams({ jobId, status: jobStatus });
      router.replace(`/jobs/new/success?${q.toString()}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }, [draft, router]);

  function makeChanges() {
    router.push("/jobs/new?fromReview=1");
  }

  const resolved = useMemo(() => {
    if (!draft) return null;
    const dept = options?.departments.find((x) => x.id === Number(draft.departmentId))?.name ?? "—";
    const loc = options?.locations.find((x) => x.id === Number(draft.locationId));
    const locLabel = loc ? `${loc.city}, ${loc.country}` : "—";
    const emp = options?.employmentTypes.find((x) => x.id === Number(draft.employmentTypeId))?.name ?? "—";
    const exp = options?.experienceLevels.find((x) => x.id === Number(draft.experienceLevelId))?.name ?? "—";
    const responsibilities = draft.responsibilitiesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const reqQuals = draft.qualifications.filter((q) => q.type === "required" && q.description.trim());
    const prefQuals = draft.qualifications.filter((q) => q.type === "preferred" && q.description.trim());
    const skillNames = draft.skillIds.map((id) => options?.skills.find((s) => s.id === id)?.name ?? `#${id}`);
    const benefitLines = draft.benefitIds.map((id) => options?.benefits.find((b) => b.id === id)?.description ?? `#${id}`);
    const tagLabels = draft.tagIds.map((id) => {
      const t = options?.tags.find((x) => x.id === id);
      return t ? t.name : `#${id}`;
    });
    const salaryLine =
      draft.salaryMin.trim() || draft.salaryMax.trim()
        ? `${draft.salaryMin || "—"} – ${draft.salaryMax || "—"} ${draft.salaryCurrency.trim() || ""}`.trim()
        : null;
    return {
      dept,
      locLabel,
      emp,
      exp,
      responsibilities,
      reqQuals,
      prefQuals,
      skillNames,
      benefitLines,
      tagLabels,
      salaryLine,
    };
  }, [draft, options]);

  if (!draft || !resolved) {
    return (
      <p className="bo-admin-muted" role="status">
        Loading preview…
      </p>
    );
  }

  const { dept, locLabel, emp, exp, responsibilities, reqQuals, prefQuals, skillNames, benefitLines, tagLabels, salaryLine } =
    resolved;

  const bannerUrl = draft.bannerImageUrl.trim();
  const showBanner = isLikelyImageUrl(bannerUrl);

  return (
    <div className="bo-job-preview-page">
      <div className="bo-job-preview-page-intro">
        <h1 className="bo-page-title">Review job posting</h1>
        <p className="bo-page-sub">
          Preview below follows the candidate job detail layout. Confirm to save the posting, or return to the form to
          make changes.
        </p>
      </div>

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

      <section className="bo-job-preview-hero" aria-labelledby="bo-job-preview-heading">
        <nav className="bo-job-preview-breadcrumb" aria-label="Breadcrumb">
          <Link href="/jobs">Jobs</Link>
          <span className="bo-job-preview-breadcrumb-sep" aria-hidden="true">
            /
          </span>
          <span aria-current="page">Preview</span>
        </nav>

        <h2 id="bo-job-preview-heading" className="bo-job-preview-title">
          {draft.title || "Untitled role"}
        </h2>

        <p className="bo-job-preview-summary">{draft.summary || "—"}</p>

        <div className="bo-job-preview-meta">
          <span className="bo-job-preview-meta-item">
            <IconBriefcase className="bo-job-preview-meta-icon" />
            {dept}
          </span>
          <span className="bo-job-preview-meta-item">
            <IconPin className="bo-job-preview-meta-icon" />
            {locLabel}
          </span>
          <span className="bo-job-preview-meta-item">
            <IconClock className="bo-job-preview-meta-icon" />
            {emp}
          </span>
          <span className="bo-job-preview-meta-item">
            <IconUser className="bo-job-preview-meta-icon" />
            {exp}
          </span>
        </div>

        {(draft.isRemote || draft.isFeatured || tagLabels.length > 0) && (
          <div className="bo-job-preview-hero-tags">
            {draft.isRemote && <span className="bo-job-preview-pill bo-job-preview-pill--remote">Remote</span>}
            {draft.isFeatured && <span className="bo-job-preview-pill bo-job-preview-pill--featured">Featured</span>}
            {tagLabels.map((name, i) => (
              <span key={`tag-${i}-${name}`} className="bo-job-preview-pill">
                {name}
              </span>
            ))}
          </div>
        )}
      </section>

      <div className="bo-job-preview-layout">
        <div className="bo-job-preview-main">
          {showBanner ? (
            <div className="bo-job-preview-banner">
              <img
                src={bannerUrl}
                alt={draft.bannerImageAlt.trim() || "Job banner"}
                className="bo-job-preview-banner-img"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="bo-job-preview-banner bo-job-preview-banner--placeholder" role="img" aria-label="No banner image">
              <span>No banner image</span>
            </div>
          )}

          <section className="bo-job-preview-section" aria-labelledby="bo-section-overview">
            <h3 id="bo-section-overview" className="bo-job-preview-section-title">
              Job overview
            </h3>
            <div className="bo-job-preview-prose">
              {draft.overview.trim() ? (
                <p className="bo-job-preview-preline">{draft.overview}</p>
              ) : (
                <p className="bo-admin-muted">No overview added.</p>
              )}
            </div>
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-role">
            <h3 id="bo-section-role" className="bo-job-preview-section-title">
              Role summary
            </h3>
            <div className="bo-job-preview-prose">
              {draft.roleSummary.trim() ? (
                <p className="bo-job-preview-preline">{draft.roleSummary}</p>
              ) : (
                <p className="bo-admin-muted">No role summary added.</p>
              )}
            </div>
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-resp">
            <h3 id="bo-section-resp" className="bo-job-preview-section-title">
              Key responsibilities
            </h3>
            {responsibilities.length === 0 ? (
              <p className="bo-admin-muted">None listed.</p>
            ) : (
              <ul className="bo-job-preview-list">
                {responsibilities.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-req-qual">
            <h3 id="bo-section-req-qual" className="bo-job-preview-section-title">
              Required qualifications
            </h3>
            {reqQuals.length === 0 ? (
              <p className="bo-admin-muted">None listed.</p>
            ) : (
              <ul className="bo-job-preview-list">
                {reqQuals.map((q, i) => (
                  <li key={i}>{q.description.trim()}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-pref-qual">
            <h3 id="bo-section-pref-qual" className="bo-job-preview-section-title">
              Preferred qualifications
            </h3>
            {prefQuals.length === 0 ? (
              <p className="bo-admin-muted">None listed.</p>
            ) : (
              <ul className="bo-job-preview-list">
                {prefQuals.map((q, i) => (
                  <li key={i}>{q.description.trim()}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-skills">
            <h3 id="bo-section-skills" className="bo-job-preview-section-title">
              Skills
            </h3>
            {skillNames.length === 0 ? (
              <p className="bo-admin-muted">None selected.</p>
            ) : (
              <div className="bo-job-preview-skills">
                {skillNames.map((name, i) => (
                  <span key={`skill-${i}-${name}`} className="bo-job-preview-skill-tag">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-benefits">
            <h3 id="bo-section-benefits" className="bo-job-preview-section-title">
              What we offer
            </h3>
            {benefitLines.length === 0 ? (
              <p className="bo-admin-muted">No benefits selected.</p>
            ) : (
              <ul className="bo-job-preview-list">
                {benefitLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="bo-job-preview-section" aria-labelledby="bo-section-apply">
            <h3 id="bo-section-apply" className="bo-job-preview-section-title">
              Application information
            </h3>
            <div className="bo-job-preview-prose">
              {draft.applicationInfo.trim() ? (
                <p className="bo-job-preview-preline">{draft.applicationInfo}</p>
              ) : (
                <p className="bo-admin-muted">No instructions added.</p>
              )}
            </div>
          </section>
        </div>

        <aside className="bo-job-preview-sidebar" aria-label="Job summary and actions">
          <div className="bo-job-preview-sidebar-card">
            <h3 className="bo-job-preview-sidebar-title">Job summary</h3>
            <p className="bo-job-preview-sidebar-lead">{draft.summary || "—"}</p>

            <dl className="bo-job-preview-sidebar-dl">
              <div>
                <dt>Listing status</dt>
                <dd>
                  <span className={`bo-job-status bo-job-status--${draft.status}`}>{draft.status}</span>
                </dd>
              </div>
              <div>
                <dt>URL slug</dt>
                <dd>{draft.slug.trim() ? <code className="bo-admin-code">{draft.slug.trim()}</code> : <em>Generated from title</em>}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{dept}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{locLabel}</dd>
              </div>
              <div>
                <dt>Employment type</dt>
                <dd>{emp}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{exp}</dd>
              </div>
              {draft.isSalaryVisible && salaryLine && (
                <div>
                  <dt>Salary</dt>
                  <dd>{salaryLine}</dd>
                </div>
              )}
              <div>
                <dt>Expires</dt>
                <dd>{formatExpires(draft.expiresAtLocal)}</dd>
              </div>
            </dl>

            <p className="bo-job-preview-sidebar-note">
              Candidates will use the public job detail page to read this content and apply. This preview is read-only.
            </p>

            <div className="bo-job-preview-sidebar-actions">
              <button type="button" className="btn btn-primary btn-sm" disabled={submitting} onClick={() => void confirmCreate()}>
                {submitting ? "Creating…" : "Confirm and create posting"}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={submitting} onClick={makeChanges}>
                Make changes
              </button>
              <Link href="/jobs" className="btn btn-secondary btn-sm" onClick={() => clearJobPostingCreateDraft()}>
                Cancel
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
