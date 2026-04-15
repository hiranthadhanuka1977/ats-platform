import Link from "next/link";

import { BookmarkButton } from "@/components/job-listing/BookmarkButton";
import { ShareButton } from "@/components/job-listing/ShareButton";
import { formatShortDate } from "@/lib/format";
import { badgeClass, getWorkplaceBadge } from "@/lib/job-badges";
import type { JobListItem } from "@/lib/jobs";

type Props = {
  job: JobListItem;
  isFirst?: boolean;
};

export function JobCard({ job, isFirst = false }: Props) {
  const detailPath = `/jobs/${job.slug}`;
  const workplace = getWorkplaceBadge(job);
  const featured = job.isFeatured;

  return (
    <article className={`job-card${featured ? " job-card--featured" : ""}`} role="listitem">
      <Link href={detailPath} className="job-card__stretched-link" aria-label={`View details for ${job.title}`}>
        <span className="sr-only">View details for {job.title}</span>
      </Link>
      <div className="job-card-header">
        <h3 className="job-card-title">
          <Link href={detailPath}>{job.title}</Link>
        </h3>
        <div className="job-card-top-actions" role="group" aria-label="Save or share job">
          {featured ? (
            <span className="featured-ribbon" role="img" aria-label="Featured">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
              </svg>
            </span>
          ) : null}
          <BookmarkButton jobTitle={job.title} />
          <ShareButton jobTitle={job.title} path={detailPath} />
        </div>
      </div>

      {isFirst ? (
        <div className="job-card-inline-banner" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- static decorative banner */}
          <img src="/images/hero/img01.jpg" alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="job-card-meta">
        <span className="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          </svg>
          {job.department.name}
        </span>
        <span className="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {job.location.city}, {job.location.country}
        </span>
        <span className="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          {job.experienceLevel.name}
        </span>
        <span className="meta-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {job.employmentType.name}
        </span>
      </div>

      <div className="job-card-divider" aria-hidden="true" />

      <p className="job-card-summary">{job.summary.trim() || "—"}</p>

      <div className="job-card-footer">
        <div className="job-card-tags">
          {workplace ? <span className={badgeClass(workplace.variant)}>{workplace.name}</span> : null}
          <span className="job-card-posted">Posted {formatShortDate(job.postedAt)}</span>
        </div>
        <div className="job-card-actions">
          <a href="/login" className="btn btn-primary job-card-actions__apply-lg">
            Apply Now<span className="sr-only"> — {job.title}</span>
          </a>
        </div>
      </div>
    </article>
  );
}
