 "use client";

import { useRef, useState } from "react";

import type { JobListFilters } from "@/lib/jobs";
import type { getFilterOptions } from "@/lib/jobs";
import { filtersToSearchRecord } from "@/lib/search-params";

type Options = Awaited<ReturnType<typeof getFilterOptions>>;

type Props = {
  filters: JobListFilters;
  options: Options;
};

export function JobListingHero({ filters, options }: Props) {
  const q = filters.q ?? "";
  const formRef = useRef<HTMLFormElement>(null);
  const [loadingControl, setLoadingControl] = useState<string | null>(null);
  const hasActiveQuickFilters = Boolean(
    (filters.department && filters.department.length > 0) ||
      (filters.location && filters.location.length > 0) ||
      (filters.experience && filters.experience.length > 0) ||
      filters.remote,
  );
  const hidden = filtersToSearchRecord(filters);
  delete hidden.q;
  delete hidden.department;
  delete hidden.location;
  delete hidden.experience;
  delete hidden.remote;
  delete hidden.page;

  const submitFilters = (controlName: string) => {
    setLoadingControl(controlName);
    formRef.current?.requestSubmit();
  };

  const clearQuickFilters = () => {
    const form = formRef.current;
    if (!form) return;
    setLoadingControl("clear");

    const department = form.elements.namedItem("department");
    const location = form.elements.namedItem("location");
    const experience = form.elements.namedItem("experience");
    const remote = form.elements.namedItem("remote");

    if (department instanceof HTMLSelectElement) department.value = "";
    if (location instanceof HTMLSelectElement) location.value = "";
    if (experience instanceof HTMLSelectElement) experience.value = "";
    if (remote instanceof HTMLInputElement) remote.checked = false;

    form.requestSubmit();
  };

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="container">
        <h1 id="hero-heading" className="hero-title">
          Let&apos;s build the next big thing together
        </h1>
        <p className="hero-description">Find high-impact roles with teams building ambitious products.</p>

        <form ref={formRef} className="hero-search" role="search" aria-label="Search jobs" method="get" action="/">
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
          <div className="hero-quick-filters">
            <div className={`hero-filter-control${loadingControl === "department" ? " is-loading" : ""}`}>
              <select
                name="department"
                className="form-select hero-filter-select"
                defaultValue={filters.department ?? ""}
                aria-label="Filter by department"
                onChange={() => submitFilters("department")}
              >
                <option value="">All departments</option>
                {options.departments.map((d) => (
                  <option key={d.id} value={d.slug}>
                    {d.name}
                  </option>
                ))}
              </select>
              <span className="hero-filter-loader" aria-hidden="true" />
            </div>
            <div className={`hero-filter-control${loadingControl === "location" ? " is-loading" : ""}`}>
              <select
                name="location"
                className="form-select hero-filter-select"
                defaultValue={filters.location ?? ""}
                aria-label="Filter by location"
                onChange={() => submitFilters("location")}
              >
                <option value="">All locations</option>
                {options.locations.map((loc) => (
                  <option key={loc.id} value={loc.slug}>
                    {loc.city}, {loc.country}
                  </option>
                ))}
              </select>
              <span className="hero-filter-loader" aria-hidden="true" />
            </div>
            <div className={`hero-filter-control${loadingControl === "experience" ? " is-loading" : ""}`}>
              <select
                name="experience"
                className="form-select hero-filter-select"
                defaultValue={filters.experience ?? ""}
                aria-label="Filter by experience level"
                onChange={() => submitFilters("experience")}
              >
                <option value="">Any experience</option>
                {options.experienceLevels.map((e) => (
                  <option key={e.id} value={e.slug}>
                    {e.name}
                  </option>
                ))}
              </select>
              <span className="hero-filter-loader" aria-hidden="true" />
            </div>
            <div className="hero-remote-control">
              <label className="hero-remote-check">
                <input type="checkbox" name="remote" value="1" defaultChecked={filters.remote === true} />
                Remote only
              </label>
              {hasActiveQuickFilters ? (
                <button
                  type="button"
                  className="hero-filter-clear-btn"
                  onClick={clearQuickFilters}
                  disabled={loadingControl !== null}
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
