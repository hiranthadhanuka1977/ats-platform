import type { JobListFilters } from "@/lib/jobs";

import type { ListingSearchRecord } from "@/lib/listing-url";

export function parseJobListingSearch(sp: Record<string, string | string[] | undefined>): JobListFilters {
  const get = (k: string) => {
    const v = sp[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  const posted = get("postedWithin");
  const validPosted: JobListFilters["postedWithin"] =
    posted === "24h" || posted === "7d" || posted === "30d" ? posted : undefined;
  const pageRaw = get("page");
  const page = Math.max(1, parseInt(pageRaw ?? "1", 10) || 1);

  return {
    q: get("q"),
    department: get("department"),
    location: get("location"),
    employmentType: get("employmentType"),
    experience: get("experience"),
    remote: get("remote") === "1" || get("remote") === "true",
    postedWithin: validPosted,
    sort: get("sort") === "az" ? "az" : "recent",
    page,
  };
}

export function filtersToSearchRecord(f: JobListFilters): ListingSearchRecord {
  const r: ListingSearchRecord = {};
  if (f.q) r.q = f.q;
  if (f.department) r.department = f.department;
  if (f.location) r.location = f.location;
  if (f.employmentType) r.employmentType = f.employmentType;
  if (f.experience) r.experience = f.experience;
  if (f.remote) r.remote = "1";
  if (f.postedWithin) r.postedWithin = f.postedWithin;
  if (f.sort === "az") r.sort = "az";
  if (f.page && f.page > 1) r.page = String(f.page);
  return r;
}
