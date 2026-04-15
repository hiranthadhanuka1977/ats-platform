import type { JobListFilters } from "@/lib/jobs";
import { filtersToSearchRecord } from "@/lib/search-params";

type Props = {
  filters: JobListFilters;
};

export function JobListingHero({ filters }: Props) {
  const q = filters.q ?? "";
  const hidden = filtersToSearchRecord(filters);
  delete hidden.q;
  delete hidden.page;

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container">
        <h1 id="hero-heading" className="hero-title">
          Let&apos;s build the next big thing together
        </h1>
        <p className="hero-description">
          We believe in ideas that matter. Passionate about making software even better.
        </p>

        <form className="hero-search" role="search" aria-label="Search jobs" method="get" action="/">
          {Object.entries(hidden).map(([k, v]) =>
            v ? <input key={k} type="hidden" name={k} value={v} /> : null,
          )}
          <div className="hero-search-inner">
            <svg className="hero-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              id="hero-search-input"
              name="q"
              className="hero-search-input"
              placeholder="I'm looking for..."
              aria-label="Search by job title, keyword, or location"
              defaultValue={q}
            />
            <button type="submit" className="btn btn-primary hero-search-btn">
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
