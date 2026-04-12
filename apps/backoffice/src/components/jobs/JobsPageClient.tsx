"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { IconLayoutGrid, IconLayoutList, IconPreview } from "@/components/backoffice/nav-icons";
import { clearJobPostingCreateDraft } from "@/lib/job-posting-create-draft";

type Lookup = { id: number; name: string; slug: string };
type LocationLookup = { id: number; city: string; country: string; slug: string };

export type JobListItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  status: string;
  postedAt: string | null;
  updatedAt: string;
  isRemote: boolean;
  isFeatured: boolean;
  department: Lookup;
  location: LocationLookup;
  employmentType: Lookup;
  experienceLevel: Lookup;
};

type FormOptions = {
  departments: Lookup[];
  locations: LocationLookup[];
  employmentTypes: Lookup[];
  experienceLevels: Lookup[];
};

function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function countActiveFilters(a: {
  q: string;
  status: string;
  departmentId: string;
  locationId: string;
  employmentTypeId: string;
  experienceLevelId: string;
  remoteOnly: boolean;
  sort: string;
}): number {
  let n = 0;
  if (a.q.trim()) n++;
  if (a.status !== "all") n++;
  if (a.departmentId) n++;
  if (a.locationId) n++;
  if (a.employmentTypeId) n++;
  if (a.experienceLevelId) n++;
  if (a.remoteOnly) n++;
  if (a.sort !== "updated_desc") n++;
  return n;
}

const JOBS_VIEW_STORAGE_KEY = "bo-jobs-view-mode";

function FilterDotsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="12" cy="19" r="2" />
    </svg>
  );
}

export function JobsPageClient() {
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [departmentId, setDepartmentId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [employmentTypeId, setEmploymentTypeId] = useState("");
  const [experienceLevelId, setExperienceLevelId] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState("updated_desc");

  const [applied, setApplied] = useState({
    q: "",
    status: "all",
    departmentId: "",
    locationId: "",
    employmentTypeId: "",
    experienceLevelId: "",
    remoteOnly: false,
    sort: "updated_desc",
    page: 1,
  });

  const [items, setItems] = useState<JobListItem[]>([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 20, totalCount: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const [filterOpen, setFilterOpen] = useState(false);
  const filterWrapRef = useRef<HTMLDivElement>(null);
  const filterFlyoverId = useId();
  const filterHeadingId = useId();

  const activeFilterCount = countActiveFilters(applied);

  useEffect(() => {
    try {
      const v = localStorage.getItem(JOBS_VIEW_STORAGE_KEY);
      if (v === "grid" || v === "list") setViewMode(v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/backoffice/jobs/form-options", { credentials: "include" });
        if (!res.ok) throw new Error("Could not load filter options.");
        const data = (await res.json()) as FormOptions;
        if (!cancelled) {
          setOptions(data);
          setOptionsError(null);
        }
      } catch (e) {
        if (!cancelled) setOptionsError(e instanceof Error ? e.message : "Failed to load options.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadJobs = useCallback(async (params: typeof applied) => {
    setLoading(true);
    setListError(null);
    try {
      const sp = new URLSearchParams();
      sp.set("page", String(params.page));
      sp.set("pageSize", "20");
      sp.set("sort", params.sort);
      if (params.q.trim()) sp.set("q", params.q.trim());
      if (params.status !== "all") sp.set("status", params.status);
      if (params.departmentId) sp.set("departmentId", params.departmentId);
      if (params.locationId) sp.set("locationId", params.locationId);
      if (params.employmentTypeId) sp.set("employmentTypeId", params.employmentTypeId);
      if (params.experienceLevelId) sp.set("experienceLevelId", params.experienceLevelId);
      if (params.remoteOnly) sp.set("remoteOnly", "true");

      const res = await fetch(`/api/backoffice/jobs?${sp.toString()}`, { credentials: "include" });
      if (!res.ok) {
        const text = await res.text();
        try {
          const j = JSON.parse(text) as { error?: { message?: string } };
          throw new Error(j?.error?.message ?? res.statusText);
        } catch {
          throw new Error(res.statusText);
        }
      }
      const data = (await res.json()) as {
        items: JobListItem[];
        meta: { page: number; pageSize: number; totalCount: number; totalPages: number };
      };
      setItems(data.items);
      setMeta(data.meta);
    } catch (e) {
      setListError(e instanceof Error ? e.message : "Failed to load jobs.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadJobs(applied);
  }, [applied, loadJobs]);

  useEffect(() => {
    if (!filterOpen) return;
    function onDocMouseDown(ev: MouseEvent) {
      const el = filterWrapRef.current;
      if (el && !el.contains(ev.target as Node)) {
        setFilterOpen(false);
      }
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setFilterOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [filterOpen]);

  function applyFilters() {
    setApplied({
      q,
      status,
      departmentId,
      locationId,
      employmentTypeId,
      experienceLevelId,
      remoteOnly,
      sort,
      page: 1,
    });
    setFilterOpen(false);
  }

  function onFilterFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    applyFilters();
  }

  /** Enter on native `<select>` does not submit a form; handle explicitly. Checkbox: apply after toggling with Space. */
  function onFilterFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    const t = e.target;
    if (t instanceof HTMLSelectElement) {
      e.preventDefault();
      applyFilters();
      return;
    }
    if (t instanceof HTMLInputElement && t.type === "checkbox") {
      e.preventDefault();
      applyFilters();
    }
  }

  function resetFilters() {
    setQ("");
    setStatus("all");
    setDepartmentId("");
    setLocationId("");
    setEmploymentTypeId("");
    setExperienceLevelId("");
    setRemoteOnly(false);
    setSort("updated_desc");
    setApplied({
      q: "",
      status: "all",
      departmentId: "",
      locationId: "",
      employmentTypeId: "",
      experienceLevelId: "",
      remoteOnly: false,
      sort: "updated_desc",
      page: 1,
    });
    setFilterOpen(false);
  }

  function goPage(p: number) {
    setApplied((prev) => ({ ...prev, page: Math.max(1, Math.min(p, meta.totalPages)) }));
  }

  function setViewModePersist(mode: "list" | "grid") {
    setViewMode(mode);
    try {
      localStorage.setItem(JOBS_VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <header className="bo-jobs-header">
        <div>
          <h1 className="bo-page-title">Jobs</h1>
          <p className="bo-page-sub">
            Create and manage job postings. Open the filter menu (⋮) beside the results to search title, summary,
            and overview, or narrow by department, location, employment type, experience, remote, and status.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="btn btn-primary btn-sm"
          onClick={() => clearJobPostingCreateDraft()}
        >
          Create job posting
        </Link>
      </header>

      {optionsError && (
        <div className="bo-admin-alert" role="alert">
          {optionsError}
        </div>
      )}

      {listError && (
        <div className="bo-admin-alert" role="alert">
          {listError}
        </div>
      )}

      <section className="bo-card bo-jobs-table-wrap" aria-labelledby="jobs-list-heading">
        <div className="bo-jobs-table-toolbar">
          <h2 id="jobs-list-heading" className="bo-card-title">
            Job postings
          </h2>
          <div className="bo-jobs-toolbar-right">
            {!loading && (
              <p className="bo-jobs-count">
                {meta.totalCount === 0
                  ? "No results"
                  : `${meta.totalCount} result${meta.totalCount === 1 ? "" : "s"} · page ${meta.page} of ${meta.totalPages}`}
              </p>
            )}
            <div className="bo-jobs-view-toggle" role="group" aria-label="View mode">
              <button
                type="button"
                aria-pressed={viewMode === "list"}
                aria-label="List view"
                title="List view"
                onClick={() => setViewModePersist("list")}
              >
                <IconLayoutList />
              </button>
              <button
                type="button"
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view"
                title="Grid view"
                onClick={() => setViewModePersist("grid")}
              >
                <IconLayoutGrid />
              </button>
            </div>
            <div className="bo-jobs-filter-wrap" ref={filterWrapRef}>
              <button
                type="button"
                className="bo-jobs-filter-trigger"
                title="Filters"
                aria-expanded={filterOpen}
                aria-haspopup="dialog"
                aria-controls={filterFlyoverId}
                aria-label={
                  activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : "Filters"
                }
                onClick={() => setFilterOpen((o) => !o)}
              >
                <span className="bo-jobs-filter-trigger-icon" aria-hidden>
                  <FilterDotsIcon />
                </span>
                {activeFilterCount > 0 ? (
                  <span className="bo-jobs-filter-badge" aria-hidden>
                    {activeFilterCount > 99 ? "99+" : activeFilterCount}
                  </span>
                ) : null}
              </button>
              {filterOpen ? (
                <div
                  id={filterFlyoverId}
                  className="bo-jobs-filter-flyover"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={filterHeadingId}
                >
                  <h3 id={filterHeadingId} className="bo-jobs-filter-flyover-title">
                    Filters
                  </h3>
                  <p className="bo-jobs-filter-flyover-intro">
                    Search title, summary, and overview. Narrow by status, department, location, type, experience, and
                    remote. Press Enter in the search box or on a dropdown to apply and close.
                  </p>
                  <form
                    className="bo-jobs-filter-form"
                    onSubmit={onFilterFormSubmit}
                    onKeyDown={onFilterFormKeyDown}
                  >
                  <div className="bo-jobs-filters-grid">
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-q">
                        Search
                      </label>
                      <input
                        id="jobs-filter-q"
                        className="bo-input"
                        type="search"
                        placeholder="Title or summary"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                      />
                    </div>
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-status">
                        Status
                      </label>
                      <select
                        id="jobs-filter-status"
                        className="bo-input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="all">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-dept">
                        Department
                      </label>
                      <select
                        id="jobs-filter-dept"
                        className="bo-input"
                        value={departmentId}
                        onChange={(e) => setDepartmentId(e.target.value)}
                        disabled={!options}
                      >
                        <option value="">All</option>
                        {options?.departments.map((d) => (
                          <option key={d.id} value={String(d.id)}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-loc">
                        Location
                      </label>
                      <select
                        id="jobs-filter-loc"
                        className="bo-input"
                        value={locationId}
                        onChange={(e) => setLocationId(e.target.value)}
                        disabled={!options}
                      >
                        <option value="">All</option>
                        {options?.locations.map((l) => (
                          <option key={l.id} value={String(l.id)}>
                            {l.city}, {l.country}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-emp">
                        Employment type
                      </label>
                      <select
                        id="jobs-filter-emp"
                        className="bo-input"
                        value={employmentTypeId}
                        onChange={(e) => setEmploymentTypeId(e.target.value)}
                        disabled={!options}
                      >
                        <option value="">All</option>
                        {options?.employmentTypes.map((e) => (
                          <option key={e.id} value={String(e.id)}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-exp">
                        Experience level
                      </label>
                      <select
                        id="jobs-filter-exp"
                        className="bo-input"
                        value={experienceLevelId}
                        onChange={(e) => setExperienceLevelId(e.target.value)}
                        disabled={!options}
                      >
                        <option value="">All</option>
                        {options?.experienceLevels.map((e) => (
                          <option key={e.id} value={String(e.id)}>
                            {e.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="bo-field">
                      <label className="bo-label" htmlFor="jobs-filter-sort">
                        Sort
                      </label>
                      <select
                        id="jobs-filter-sort"
                        className="bo-input"
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      >
                        <option value="updated_desc">Recently updated</option>
                        <option value="updated_asc">Oldest update</option>
                        <option value="posted_desc">Recently posted</option>
                        <option value="posted_asc">Oldest posted</option>
                        <option value="title_asc">Title A–Z</option>
                        <option value="title_desc">Title Z–A</option>
                      </select>
                    </div>
                    <div className="bo-field bo-jobs-filters-remote">
                      <label className="bo-label bo-label--inline">
                        <input type="checkbox" checked={remoteOnly} onChange={(e) => setRemoteOnly(e.target.checked)} />
                        Remote only
                      </label>
                    </div>
                  </div>
                  <div className="bo-jobs-filters-actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                      Apply filters
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={resetFilters}>
                      Reset
                    </button>
                  </div>
                  </form>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {loading ? (
          <p className="bo-admin-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="bo-admin-muted">No job postings match your filters. Try adjusting filters or create a new posting.</p>
        ) : (
          <>
            {viewMode === "list" ? (
              <div className="bo-admin-table-scroll">
                <table className="bo-admin-table bo-jobs-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Department</th>
                      <th>Location</th>
                      <th>Type</th>
                      <th>Posted</th>
                      <th>Updated</th>
                      <th>Flags</th>
                      <th className="bo-admin-table-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((j) => (
                      <tr key={j.id}>
                        <td>
                          <Link href={`/jobs/${j.id}/edit`} className="bo-jobs-title">
                            {j.title}
                          </Link>
                        </td>
                        <td>
                          <span className={`bo-job-status bo-job-status--${j.status}`}>{j.status}</span>
                        </td>
                        <td>{j.department.name}</td>
                        <td>
                          {j.location.city}, {j.location.country}
                        </td>
                        <td>{j.employmentType.name}</td>
                        <td>{formatShortDate(j.postedAt)}</td>
                        <td>{formatShortDate(j.updatedAt)}</td>
                        <td>
                          {j.isFeatured && <span className="bo-jobs-flag">Featured</span>}
                          {j.isRemote && <span className="bo-jobs-flag">Remote</span>}
                          {!j.isFeatured && !j.isRemote && "—"}
                        </td>
                        <td className="bo-admin-table-actions bo-jobs-actions-cell">
                          <Link
                            href={`/jobs/${j.id}/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bo-jobs-preview-link"
                            title="Preview in new tab"
                            aria-label={`Preview ${j.title} in new tab`}
                          >
                            <IconPreview />
                          </Link>
                          <Link href={`/jobs/${j.id}/edit`} className="btn btn-secondary btn-sm">
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ul className="bo-jobs-grid" aria-labelledby="jobs-list-heading">
                {items.map((j) => (
                  <li key={j.id} className="bo-jobs-card">
                    <div className="bo-jobs-card-inner">
                      <div className="bo-jobs-card-head">
                        <Link href={`/jobs/${j.id}/edit`} className="bo-jobs-card-title">
                          {j.title}
                        </Link>
                      </div>
                      <p className="bo-jobs-card-summary">{j.summary.trim() || "—"}</p>
                      <p className="bo-jobs-card-meta">
                        {j.department.name}
                        <span className="bo-jobs-card-meta-sep" aria-hidden>
                          {" "}
                          ·{" "}
                        </span>
                        {j.location.city}, {j.location.country}
                        <span className="bo-jobs-card-meta-sep" aria-hidden>
                          {" "}
                          ·{" "}
                        </span>
                        {j.employmentType.name}
                      </p>
                      <p className="bo-jobs-card-dates-line">
                        {j.postedAt ? (
                          <>
                            Posted {formatShortDate(j.postedAt)}
                            <span className="bo-jobs-card-meta-sep" aria-hidden>
                              {" "}
                              ·{" "}
                            </span>
                          </>
                        ) : null}
                        Updated {formatShortDate(j.updatedAt)}
                      </p>
                      <div className="bo-jobs-card-footer">
                        <div className="bo-jobs-card-footer-start">
                          <span className={`bo-job-status bo-job-status--${j.status}`}>{j.status}</span>
                          <div className="bo-jobs-card-flags">
                            {j.isFeatured && <span className="bo-jobs-flag">Featured</span>}
                            {j.isRemote && <span className="bo-jobs-flag">Remote</span>}
                          </div>
                        </div>
                        <div className="bo-jobs-actions-cell">
                          <Link
                            href={`/jobs/${j.id}/preview`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bo-jobs-preview-link"
                            title="Preview in new tab"
                            aria-label={`Preview ${j.title} in new tab`}
                          >
                            <IconPreview />
                          </Link>
                          <Link href={`/jobs/${j.id}/edit`} className="btn btn-secondary btn-sm">
                            Edit
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {meta.totalPages > 1 && (
              <nav className="bo-jobs-pagination" aria-label="Pagination">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={meta.page <= 1}
                  onClick={() => goPage(meta.page - 1)}
                >
                  Previous
                </button>
                <span className="bo-jobs-page-indicator">
                  Page {meta.page} / {meta.totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => goPage(meta.page + 1)}
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}
