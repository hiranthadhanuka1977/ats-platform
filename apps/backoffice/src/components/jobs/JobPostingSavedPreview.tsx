import type { SerializedJobPosting } from "@/lib/job-posting-serialize";

function isLikelyImageUrl(s: string | null): boolean {
  const t = (s ?? "").trim();
  if (!t) return false;
  return t.startsWith("http://") || t.startsWith("https://") || t.startsWith("/");
}

function formatExpiresIso(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

type Props = {
  job: SerializedJobPosting;
};

/**
 * Read-only candidate-style job detail with sticky Job summary sidebar. Used on standalone `/jobs/[id]/preview` — no app chrome.
 */
export function JobPostingSavedPreview({ job }: Props) {
  const dept = job.department.name;
  const locLabel = `${job.location.city}, ${job.location.country}`;
  const emp = job.employmentType.name;
  const exp = job.experienceLevel.name;
  const salaryLine =
    job.salaryMin?.trim() || job.salaryMax?.trim()
      ? `${job.salaryMin || "—"} – ${job.salaryMax || "—"} ${job.salaryCurrency?.trim() || ""}`.trim()
      : null;
  const responsibilities = job.responsibilities;
  const reqQuals = job.qualifications.filter((q) => q.type === "required" && q.description.trim());
  const prefQuals = job.qualifications.filter((q) => q.type === "preferred" && q.description.trim());
  const skillNames = job.skills.map((s) => s.name);
  const benefitLines = job.benefits.map((b) => b.description);
  const tagLabels = job.tags.map((t) => t.name);

  const bannerUrl = job.bannerImageUrl?.trim() ?? "";
  const showBanner = isLikelyImageUrl(bannerUrl);

  return (
    <article className="bo-job-preview-page">
      <header className="bo-job-preview-hero" aria-labelledby="bo-job-preview-heading">
        <h1 id="bo-job-preview-heading" className="bo-job-preview-title">
          {job.title || "Untitled role"}
        </h1>

        <p className="bo-job-preview-summary">{job.summary || "—"}</p>

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

        {(job.isRemote || job.isFeatured || tagLabels.length > 0) && (
          <div className="bo-job-preview-hero-tags">
            {job.isRemote && <span className="bo-job-preview-pill bo-job-preview-pill--remote">Remote</span>}
            {job.isFeatured && <span className="bo-job-preview-pill bo-job-preview-pill--featured">Featured</span>}
            {tagLabels.map((name, i) => (
              <span key={`tag-${i}-${name}`} className="bo-job-preview-pill">
                {name}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="bo-job-preview-layout">
        <div className="bo-job-preview-main">
        {showBanner ? (
          <div className="bo-job-preview-banner">
            <img
              src={bannerUrl}
              alt={job.bannerImageAlt?.trim() || "Job banner"}
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
          <h2 id="bo-section-overview" className="bo-job-preview-section-title">
            Job overview
          </h2>
          <div className="bo-job-preview-prose">
            {job.overview?.trim() ? (
              <p className="bo-job-preview-preline">{job.overview}</p>
            ) : (
              <p className="bo-admin-muted">No overview added.</p>
            )}
          </div>
        </section>

        <section className="bo-job-preview-section" aria-labelledby="bo-section-role">
          <h2 id="bo-section-role" className="bo-job-preview-section-title">
            Role summary
          </h2>
          <div className="bo-job-preview-prose">
            {job.roleSummary?.trim() ? (
              <p className="bo-job-preview-preline">{job.roleSummary}</p>
            ) : (
              <p className="bo-admin-muted">No role summary added.</p>
            )}
          </div>
        </section>

        <section className="bo-job-preview-section" aria-labelledby="bo-section-resp">
          <h2 id="bo-section-resp" className="bo-job-preview-section-title">
            Key responsibilities
          </h2>
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
          <h2 id="bo-section-req-qual" className="bo-job-preview-section-title">
            Required qualifications
          </h2>
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
          <h2 id="bo-section-pref-qual" className="bo-job-preview-section-title">
            Preferred qualifications
          </h2>
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
          <h2 id="bo-section-skills" className="bo-job-preview-section-title">
            Skills
          </h2>
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
          <h2 id="bo-section-benefits" className="bo-job-preview-section-title">
            What we offer
          </h2>
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
          <h2 id="bo-section-apply" className="bo-job-preview-section-title">
            Application information
          </h2>
          <div className="bo-job-preview-prose">
            {job.applicationInfo?.trim() ? (
              <p className="bo-job-preview-preline">{job.applicationInfo}</p>
            ) : (
              <p className="bo-admin-muted">No instructions added.</p>
            )}
          </div>
        </section>
        </div>

        <aside className="bo-job-preview-sidebar" aria-label="Job summary">
          <div className="bo-job-preview-sidebar-card">
            <h3 className="bo-job-preview-sidebar-title">Job summary</h3>
            <p className="bo-job-preview-sidebar-lead">{job.summary || "—"}</p>

            <dl className="bo-job-preview-sidebar-dl">
              <div>
                <dt>Listing status</dt>
                <dd>
                  <span className={`bo-job-status bo-job-status--${job.status}`}>{job.status}</span>
                </dd>
              </div>
              <div>
                <dt>URL slug</dt>
                <dd>
                  {job.slug.trim() ? <code className="bo-admin-code">{job.slug.trim()}</code> : <em>Generated from title</em>}
                </dd>
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
              {job.isSalaryVisible && salaryLine && (
                <div>
                  <dt>Salary</dt>
                  <dd>{salaryLine}</dd>
                </div>
              )}
              <div>
                <dt>Expires</dt>
                <dd>{formatExpiresIso(job.expiresAt)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </article>
  );
}
