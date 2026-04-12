import Link from "next/link";

import { BookmarkButton } from "@/components/job-listing/BookmarkButton";
import { ShareButton } from "@/components/job-listing/ShareButton";
import { formatShortDate, isRecentPost } from "@/lib/format";
import { badgeClass, getWorkplaceBadge } from "@/lib/job-badges";
import type { JobListItem } from "@/lib/jobs";

type Props = {
  job: JobListItem;
};

export function JobCard({ job }: Props) {
  const detailPath = `/jobs/${job.slug}`;
  const workplace = getWorkplaceBadge(job);
  const isNew = isRecentPost(job.postedAt, 7);
  const featured = job.isFeatured;

  return (
    <article className={`job-card${featured ? " job-card--featured" : ""}`} role="listitem">
      <div className="job-card-header">
        <h3 className="job-card-title">
          <Link href={detailPath}>{job.title}</Link>
        </h3>
        {featured ? (
          <span className="featured-ribbon" role="img" aria-label="Featured">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
            </svg>
          </span>
        ) : isNew ? (
          <span className="badge badge-success">New</span>
        ) : null}
      </div>

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
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {job.employmentType.name}
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
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Posted {formatShortDate(job.postedAt)}
        </span>
      </div>

      <p className="job-card-summary">{job.summary.trim() || "—"}</p>

      <div className="job-card-footer">
        <div className="job-card-tags">
          <span className="badge badge-primary">{job.employmentType.name}</span>
          {workplace ? <span className={badgeClass(workplace.variant)}>{workplace.name}</span> : null}
        </div>
        <div className="job-card-actions">
          <Link href={detailPath} className="btn btn-secondary btn-sm">
            View Details<span className="sr-only"> — {job.title}</span>
          </Link>
          <a href="/login" className="btn btn-primary btn-sm">
            Apply Now<span className="sr-only"> — {job.title}</span>
          </a>
          <BookmarkButton jobTitle={job.title} />
          <ShareButton jobTitle={job.title} path={detailPath} />
        </div>
      </div>
    </article>
  );
}
