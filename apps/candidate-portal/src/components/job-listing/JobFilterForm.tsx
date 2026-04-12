import Link from "next/link";

import type { getFilterOptions } from "@/lib/jobs";
import type { JobListFilters } from "@/lib/jobs";

type Options = Awaited<ReturnType<typeof getFilterOptions>>;

type Props = {
  filters: JobListFilters;
  options: Options;
};

export function JobFilterForm({ filters, options }: Props) {
  const q = filters.q ?? "";
  const sortHidden = filters.sort === "az";

  return (
    <>
      <div className="filter-header">
        <h2 className="filter-title">Filters</h2>
        <Link href="/" className="filter-clear">
          Clear all
        </Link>
      </div>

      <form method="get" action="/">
        {sortHidden ? <input type="hidden" name="sort" value="az" /> : null}

        <div className="filter-group">
          <label htmlFor="filter-search" className="filter-label">
            Search
          </label>
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              id="filter-search"
              name="q"
              className="form-input"
              placeholder="Job title or keyword"
              defaultValue={q}
            />
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-location" className="filter-label">
            Location
          </label>
          <select id="filter-location" name="location" className="form-select" defaultValue={filters.location ?? ""}>
            <option value="">All Locations</option>
            {options.locations.map((loc) => (
              <option key={loc.id} value={loc.slug}>
                {loc.city}, {loc.country}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-department" className="filter-label">
            Department
          </label>
          <select id="filter-department" name="department" className="form-select" defaultValue={filters.department ?? ""}>
            <option value="">All Departments</option>
            {options.departments.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-type" className="filter-label">
            Employment Type
          </label>
          <select id="filter-type" name="employmentType" className="form-select" defaultValue={filters.employmentType ?? ""}>
            <option value="">All Types</option>
            {options.employmentTypes.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-experience" className="filter-label">
            Experience Level
          </label>
          <select id="filter-experience" name="experience" className="form-select" defaultValue={filters.experience ?? ""}>
            <option value="">Any Experience</option>
            {options.experienceLevels.map((e) => (
              <option key={e.id} value={e.slug}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-date" className="filter-label">
            Date Posted
          </label>
          <select id="filter-date" name="postedWithin" className="form-select" defaultValue={filters.postedWithin ?? ""}>
            <option value="">Any Time</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filter-remote" className="filter-label">
            Remote
          </label>
          <select id="filter-remote" name="remote" className="form-select" defaultValue={filters.remote ? "1" : ""}>
            <option value="">Any</option>
            <option value="1">Remote only</option>
          </select>
        </div>

        <div className="filter-group">
          <button type="submit" className="btn btn-primary btn-block">
            Apply filters
          </button>
        </div>
      </form>
    </>
  );
}
