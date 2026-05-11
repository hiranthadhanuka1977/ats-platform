import Link from "next/link";

import { JobRowActions } from "@/components/job-listing/JobRowActions";
import { formatShortDate } from "@/lib/format";
import { listPublishedJobs } from "@/lib/jobs";

export const metadata = {
  title: "Job search | TalentHub My Applications",
  description: "Browse open positions and find your next role.",
};

const PAGE_PATH = "/job-search";

export default async function JobSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const readParam = (key: string) => {
    const value = sp[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const q = (readParam("q") ?? "").trim();
  const pageParam = Number.parseInt(readParam("page") ?? "1", 10);
  const page = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);

  const { jobs, total, totalPages } = await listPublishedJobs({
    q: q || undefined,
    page,
    sort: "recent",
  });

  const buildHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `${PAGE_PATH}?${query}` : PAGE_PATH;
  };

  return (
    <main id="main-content" className="bo-content">
      <section aria-labelledby="job-search-heading">
        <h1 id="job-search-heading" className="bo-page-title">
          Job search
        </h1>
        <p className="bo-page-sub">Simple in-app listing of currently published jobs.</p>

        <article className="bo-card bo-span-12" style={{ marginBottom: "1rem" }}>
          <form method="get" action={PAGE_PATH} role="search" aria-label="Search jobs">
            <label className="bo-label" htmlFor="job-search-q">
              Search
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.35rem" }}>
              <input
                id="job-search-q"
                name="q"
                type="search"
                className="form-input"
                placeholder="Search by title or keyword"
                defaultValue={q}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
              {q ? (
                <Link href={PAGE_PATH} className="btn btn-secondary">
                  Clear
                </Link>
              ) : null}
            </div>
          </form>
        </article>

        <article className="bo-card bo-span-12">
          <h2 className="bo-card-title" style={{ marginBottom: "0.75rem" }}>
            {total} jobs found
          </h2>

          {jobs.length === 0 ? (
            <p className="bo-page-sub" style={{ marginBottom: 0 }}>
              No jobs match your search.
            </p>
          ) : (
            <div>
              {jobs.map((job, index) => (
                <div key={job.id} style={{ padding: "0.75rem 0 0.85rem" }}>
                  <h3 style={{ margin: 0, color: "var(--color-secondary)" }}>{job.title}</h3>
                  <p className="bo-page-sub" style={{ margin: "0.35rem 0" }}>
                    {job.department.name} • {job.location.city}, {job.location.country} • {job.employmentType.name}
                  </p>
                  {job.summary ? (
                    <p style={{ margin: "0 0 0.35rem", color: "var(--color-text-secondary)" }}>{job.summary}</p>
                  ) : null}
                  <small style={{ color: "var(--color-text-secondary)" }}>Posted {formatShortDate(job.postedAt)}</small>
                  <JobRowActions slug={job.slug} title={job.title} />
                  {index < jobs.length - 1 ? (
                    <hr style={{ marginTop: "0.9rem", border: 0, borderTop: "1px solid var(--color-border)" }} />
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav aria-label="Job list pagination" style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
              {page > 1 ? (
                <Link href={buildHref(page - 1)} className="btn btn-secondary btn-sm">
                  Previous
                </Link>
              ) : (
                <span className="btn btn-secondary btn-sm" aria-disabled="true" style={{ opacity: 0.5 }}>
                  Previous
                </span>
              )}
              <span className="bo-page-sub" style={{ margin: 0 }}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={buildHref(page + 1)} className="btn btn-secondary btn-sm">
                  Next
                </Link>
              ) : (
                <span className="btn btn-secondary btn-sm" aria-disabled="true" style={{ opacity: 0.5 }}>
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </article>
      </section>
    </main>
  );
}
