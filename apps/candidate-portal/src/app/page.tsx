import Link from "next/link";

import { JobCard } from "@/components/job-listing/JobCard";
import { JobFilterForm } from "@/components/job-listing/JobFilterForm";
import { JobListingHero } from "@/components/job-listing/JobListingHero";
import { JobListingShell } from "@/components/job-listing/JobListingShell";
import { JobListToolbar } from "@/components/job-listing/JobListToolbar";
import { JobPagination } from "@/components/job-listing/JobPagination";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SkipLink } from "@/components/SkipLink";
import { getFilterOptions, listPublishedJobs } from "@/lib/jobs";
import { filtersToSearchRecord, parseJobListingSearch } from "@/lib/search-params";

export const metadata = {
  title: "Careers — Find Your Next Opportunity | TalentHub",
  description: "Browse open positions and find your perfect role. Join our team and build something meaningful.",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseJobListingSearch(sp);
  const [options, { jobs, total, page, totalPages }] = await Promise.all([
    getFilterOptions(),
    listPublishedJobs(filters),
  ]);
  const base = filtersToSearchRecord(filters);

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <JobListingHero filters={filters} options={options} />
      <main id="main-content">
        <JobListingShell
          filterForm={<JobFilterForm />}
        >
          <aside className="job-listing-marketing-banner" aria-label="Featured career support">
            <div className="job-listing-marketing-banner__copy">
              <p className="job-listing-marketing-banner__title">Stand out with a stronger profile</p>
              <p className="job-listing-marketing-banner__text">
                Upload your resume once and get matched with relevant openings faster.
              </p>
            </div>
            <Link href="/login" className="job-listing-marketing-banner__cta">
              Upload resume
            </Link>
          </aside>
          <JobListToolbar total={total} base={base} sort={filters.sort ?? "recent"} />
          {jobs.length === 0 ? (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
              <h3 className="empty-state-title">No jobs found</h3>
              <p className="empty-state-text">Try adjusting your filters or search terms to find what you&apos;re looking for.</p>
              <Link href="/" className="btn btn-primary">
                Clear filters
              </Link>
            </div>
          ) : (
            <>
              <div className="job-cards" role="list">
                {jobs.map((j) => (
                  <JobCard key={j.id} job={j} />
                ))}
              </div>
              <JobPagination page={page} totalPages={totalPages} base={base} />
            </>
          )}
        </JobListingShell>
      </main>
      <SiteFooter />
    </>
  );
}
