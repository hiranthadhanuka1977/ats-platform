import Link from "next/link";
import { notFound } from "next/navigation";

import { BookmarkButton } from "@/components/job-listing/BookmarkButton";
import { ShareButton } from "@/components/job-listing/ShareButton";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";
import { formatShortDate } from "@/lib/format";
import { badgeClass, getWorkplaceBadge } from "@/lib/job-badges";
import type { JobDetail } from "@/lib/jobs";
import { getPublishedJobBySlug } from "@/lib/jobs";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) {
    return { title: "Job not found | TalentHub" };
  }
  return {
    title: `${job.title} — TalentHub`,
    description: job.summary.slice(0, 160),
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug);
  if (!job) notFound();

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <JobDetailHero job={job} />
      <main id="main-content">
        <div className="container detail-layout">
          <div className="detail-main">
            {job.bannerImageUrl ? (
              <div className="image-banner">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary employer URLs */}
                <img src={job.bannerImageUrl} alt={job.bannerImageAlt ?? ""} width={1200} height={300} loading="lazy" />
              </div>
            ) : (
              <div className="image-banner image-banner--placeholder" aria-hidden="true" />
            )}

            <JobDetailSections job={job} />
          </div>

          <aside className="detail-sidebar" aria-label="Job summary and apply">
            <JobSidebar job={job} />
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function JobDetailHero({ job }: { job: JobDetail }) {
  const workplace = getWorkplaceBadge(job);
  return (
    <section className="detail-hero" aria-labelledby="detail-heading">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">All Jobs</Link>
          <span className="breadcrumb-separator" aria-hidden="true">
            /
          </span>
          <span aria-current="page">{job.title}</span>
        </nav>

        <h1 id="detail-heading" className="detail-title">
          {job.title}
        </h1>

        <div className="detail-meta">
          <span className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            {job.department.name}
          </span>
          <span className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.location.city}, {job.location.country}
          </span>
          <span className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {job.employmentType.name}
          </span>
          <span className="meta-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            {job.experienceLevel.name}
          </span>
          {workplace ? (
            <span className="meta-item">
              <span className={badgeClass(workplace.variant)}>{workplace.name}</span>
            </span>
          ) : null}
        </div>

        <div className="detail-actions">
          <BookmarkButton jobTitle={job.title} className="icon-btn icon-btn--on-dark icon-btn--bookmark" withLabel />
          <ShareButton jobTitle={job.title} path={`/jobs/${job.slug}`} className="icon-btn icon-btn--on-dark icon-btn--share" withLabel />
        </div>
      </div>
    </section>
  );
}

function JobDetailSections({ job }: { job: JobDetail }) {
  const required = job.qualifications.filter((q) => q.type === "required");
  const preferred = job.qualifications.filter((q) => q.type === "preferred");

  return (
    <>
      {job.overview?.trim() ? (
        <section className="detail-section" aria-labelledby="section-overview">
          <h2 id="section-overview" className="detail-section-title">
            Job Overview
          </h2>
          <p className="detail-preline">{job.overview.trim()}</p>
        </section>
      ) : null}

      {job.roleSummary?.trim() ? (
        <section className="detail-section" aria-labelledby="section-summary">
          <h2 id="section-summary" className="detail-section-title">
            Role Summary
          </h2>
          <p className="detail-preline">{job.roleSummary.trim()}</p>
        </section>
      ) : null}

      {job.responsibilities.length > 0 ? (
        <section className="detail-section" aria-labelledby="section-responsibilities">
          <h2 id="section-responsibilities" className="detail-section-title">
            Key Responsibilities
          </h2>
          <ul>
            {job.responsibilities.map((r) => (
              <li key={r.id}>{r.description}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {required.length > 0 ? (
        <section className="detail-section" aria-labelledby="section-qualifications">
          <h2 id="section-qualifications" className="detail-section-title">
            Required Qualifications
          </h2>
          <ul>
            {required.map((q) => (
              <li key={q.id}>{q.description}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {preferred.length > 0 ? (
        <section className="detail-section" aria-labelledby="section-preferred">
          <h2 id="section-preferred" className="detail-section-title">
            Preferred Qualifications
          </h2>
          <ul>
            {preferred.map((q) => (
              <li key={q.id}>{q.description}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {job.jobPostingSkills.length > 0 ? (
        <section className="detail-section" aria-labelledby="section-skills">
          <h2 id="section-skills" className="detail-section-title">
            Required Skills
          </h2>
          <div className="skills-list">
            {job.jobPostingSkills.map((jps) => (
              <span key={jps.skillId} className="skill-tag">
                {jps.skill.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {job.jobPostingBenefits.length > 0 ? (
        <section className="detail-section" aria-labelledby="section-benefits">
          <h2 id="section-benefits" className="detail-section-title">
            What We Offer
          </h2>
          <ul>
            {job.jobPostingBenefits.map((jpb) => (
              <li key={jpb.benefitId}>{jpb.benefit.description}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {job.applicationInfo?.trim() ? (
        <section className="detail-section" aria-labelledby="section-apply">
          <h2 id="section-apply" className="detail-section-title">
            How to Apply
          </h2>
          <p className="detail-preline">{job.applicationInfo.trim()}</p>
        </section>
      ) : null}
    </>
  );
}

function JobSidebar({ job }: { job: JobDetail }) {
  return (
    <div className="sidebar-card">
      <h2 className="sidebar-card-title">Job Summary</h2>

      <div className="sidebar-info">
        <div className="sidebar-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          <div>
            <div className="sidebar-info-label">Department</div>
            <div className="sidebar-info-value">{job.department.name}</div>
          </div>
        </div>
        <div className="sidebar-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <div>
            <div className="sidebar-info-label">Location</div>
            <div className="sidebar-info-value">
              {job.location.city}, {job.location.country}
            </div>
          </div>
        </div>
        <div className="sidebar-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <div className="sidebar-info-label">Employment Type</div>
            <div className="sidebar-info-value">{job.employmentType.name}</div>
          </div>
        </div>
        <div className="sidebar-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <div>
            <div className="sidebar-info-label">Experience Level</div>
            <div className="sidebar-info-value">{job.experienceLevel.name}</div>
          </div>
        </div>
        <div className="sidebar-info-item">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <div>
            <div className="sidebar-info-label">Posted Date</div>
            <div className="sidebar-info-value">{formatShortDate(job.postedAt)}</div>
          </div>
        </div>
      </div>

      <hr className="sidebar-divider" />

      <a href="/login" className="btn btn-primary btn-lg btn-block">
        Apply Now
      </a>

      <p className="sidebar-note">Candidates must register or log in using Google, LinkedIn, or email to apply.</p>
    </div>
  );
}
