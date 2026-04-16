import Link from "next/link";

import { BookmarkButton } from "@/components/job-listing/BookmarkButton";
import { formatShortDate } from "@/lib/format";
import { getWorkplaceBadge } from "@/lib/job-badges";
import type { JobListItem } from "@/lib/jobs";

type Props = {
  job: JobListItem;
};

export function JobCard({ job }: Props) {
  const detailPath = `/jobs/${job.slug}`;
  const workplace = getWorkplaceBadge(job);
  const featured = job.isFeatured;

  return (
    <article className={`job-card${featured ? " job-card--featured" : ""}`} role="listitem">
      <div className="job-card-icon-box" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a4 4 0 0 1 8 0v2" />
          <path d="M3 12h18" />
        </svg>
      </div>

      <div className="job-card-body">
        <div className="job-card-topline">
          <div className="job-card-topline-meta">
            {featured ? <span className="job-card-pill">Featured</span> : null}
            <span className="job-card-posted">Posted {formatShortDate(job.postedAt)}</span>
          </div>
        </div>

        <div className="job-card-header">
          <h3 className="job-card-title">
            <Link href={detailPath}>{job.title}</Link>
          </h3>
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
              <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
            </svg>
            {workplace?.name ?? job.employmentType.name}
          </span>
        </div>
      </div>

      <div className="job-card-footer">
        <BookmarkButton jobTitle={job.title} className="job-card-save icon-btn icon-btn--bookmark" />
        <Link href={detailPath} className="btn btn-primary job-card-actions__view">
          View Details<span className="sr-only"> — {job.title}</span>
        </Link>
      </div>
    </article>
  );
}
