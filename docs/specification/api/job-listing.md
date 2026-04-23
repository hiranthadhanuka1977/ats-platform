# API — Job listing page

**Doc version:** 1.1 (aligned with [`JobPosting`](../../../packages/db/prisma/schema.prisma), [`JobPostingStatus`](../../../packages/db/prisma/schema.prisma), [`db-schema.md`](../db-schema.md) §2.1, §5, GIN index)

> Implementation status (22 Apr 2026): only `GET /api/v1/jobs` exists and currently returns a stub payload from `apps/api/src/modules/jobs/index.ts`. The endpoints below are target contracts, not fully implemented yet.

Endpoints that power **search**, **filters**, **sort**, **pagination**, **results count**, **hero department pills**, and **lookup data** for dropdowns. Matches `docs/markup/candidate-portal/job-listing.html` and `db-schema.md` filters.

**Published jobs only:** server-side filter `JobPostingStatus.published` (Prisma enum / `status` column) **and** `expires_at IS NULL OR expires_at > now()`. Do not return `draft`, `closed`, or `archived` on public `GET /jobs`.

---

## API dictionary

### List published jobs

| Key | Value |
|-----|--------|
| **Operation** | Paginated list of job cards |
| **Method** | `GET` |
| **Path** | `/api/v1/jobs` |
| **Auth** | Optional — if Bearer token present, include `isBookmarked` per item |

**Query parameters**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Keyword / full-text search over `title`, `summary`, `overview` — ideally backed by `idx_postings_fulltext` ([db-schema.md §2.1](../db-schema.md)) when deployed |
| `location` | string | — | **Slug** of location, e.g. `colombo` (maps `locations.slug`) |
| `department` | string | — | **Slug** of department, e.g. `engineering`, `product` |
| `employmentType` | string | — | **Slug** of `employment_types`, e.g. `full-time` |
| `experience` | string | — | **Slug** of `experience_levels`, e.g. `senior` |
| `postedAfter` | string | — | ISO date or preset: `24h`, `7d`, `30d` (server translates to `posted_at >= …`) |
| `remoteOnly` | boolean | `false` | `job_postings.is_remote = true` |
| `sort` | string | `posted_at_desc` | See sort enum below |
| `page` | integer | `1` | 1-based |
| `pageSize` | integer | `15` | Max e.g. 50 |

**Sort enum**

| Value | SQL / order |
|-------|-------------|
| `posted_at_desc` | `ORDER BY is_featured DESC, posted_at DESC` (featured first) |
| `posted_at_asc` | Oldest first |
| `title_asc` | Title A–Z |
| `title_desc` | Title Z–A |
| `relevance` | If `q` set — rank by search score; else fallback to `posted_at_desc` |

**Response `200 OK`**

```json
{
  "data": {
    "items": [
      {
        "id": "uuid",
        "slug": "senior-business-analyst",
        "title": "Senior Business Analyst",
        "summary": "We are looking for…",
        "postedAt": "2026-04-05T00:00:00.000Z",
        "isFeatured": true,
        "isRemote": false,
        "isNew": true,
        "department": { "id": 2, "name": "Product & Delivery", "slug": "product" },
        "location": { "id": 1, "display": "Colombo, Sri Lanka", "slug": "colombo" },
        "employmentType": { "id": 1, "name": "Full-time", "slug": "full-time" },
        "experienceLevel": { "id": 4, "name": "Senior (5+ Years)", "slug": "senior" },
        "tags": [
          { "name": "On-site", "variant": "accent" }
        ],
        "isBookmarked": false
      }
    ],
    "meta": {
      "page": 1,
      "pageSize": 15,
      "totalCount": 24,
      "totalPages": 2
    }
  }
}
```

| Field | Source |
|-------|--------|
| `isNew` | Derived: `posted_at >= now() - 7 days` |
| `isBookmarked` | `bookmarks` for current candidate when authenticated |
| `tags` | `job_posting_tags` → `tags` |

**Errors**

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Invalid `page` / `pageSize` |

---

### Hero search (optional dedicated endpoint)

If the hero search only mirrors the filter panel, **reuse** `GET /jobs?q=…&page=1`. No separate endpoint is required unless you want search analytics.

| Key | Value |
|-----|--------|
| **Operation** | Same as list — keyword passed as `q` |
| **Method** | `GET` |
| **Path** | `/api/v1/jobs?q=…` |

---

### Department filter (hero pills)

Hero pills set the same filter as the department dropdown: **`department=<slug>`** on `GET /api/v1/jobs`.

---

### Lookup: locations

| Key | Value |
|-----|--------|
| **Operation** | List active locations for filter dropdown |
| **Method** | `GET` |
| **Path** | `/api/v1/lookups/locations` |
| **Auth** | None |

**Response `200 OK`**

```json
{
  "data": [
    { "id": 1, "slug": "colombo", "label": "Colombo, Sri Lanka", "sortOrder": 0 }
  ]
}
```

Maps to `locations` where `is_active = true`, ordered by `sort_order`.

---

### Lookup: departments

| Key | Value |
|-----|--------|
| **Operation** | List active departments (filters + hero pills) |
| **Method** | `GET` |
| **Path** | `/api/v1/lookups/departments` |
| **Auth** | None |

**Response `200 OK`**

```json
{
  "data": [
    { "id": 1, "slug": "engineering", "name": "Engineering", "sortOrder": 0 }
  ]
}
```

---

### Lookup: employment types

| Key | Value |
|-----|--------|
| **Method** | `GET` |
| **Path** | `/api/v1/lookups/employment-types` |

---

### Lookup: experience levels

| Key | Value |
|-----|--------|
| **Method** | `GET` |
| **Path** | `/api/v1/lookups/experience-levels` |

---

### Aggregate lookups (optional)

| Key | Value |
|-----|--------|
| **Operation** | Single round-trip for all filter dropdowns |
| **Method** | `GET` |
| **Path** | `/api/v1/lookups/job-filters` |

**Response `200 OK`**

```json
{
  "data": {
    "locations": [ ],
    "departments": [ ],
    "employmentTypes": [ ],
    "experienceLevels": [ ]
  }
}
```

---

## UI mapping (`markup/candidate-portal/job-listing.html`)

| UI | Query / API |
|----|-------------|
| Hero search | `GET /jobs?q=…` |
| Department pills | `GET /jobs?department=<slug>` |
| Filter: Search | `q` |
| Filter: Location | `location` |
| Filter: Department | `department` |
| Filter: Employment type | `employmentType` |
| Filter: Experience | `experience` |
| Filter: Date posted | `postedAfter` |
| Remote only | `remoteOnly=true` |
| Sort dropdown | `sort` |
| Results count | `meta.totalCount` |
| Pagination | `page`, `pageSize` |
| Featured star | `item.isFeatured` |
| Bookmark icon | `PUT /me/bookmarks/{id}` when toggled; list shows `isBookmarked` |

---

## Data model mapping

| Query param | Table / column |
|-------------|----------------|
| `location` | `locations.slug` |
| `department` | `departments.slug` |
| `employmentType` | `employment_types.slug` |
| `experience` | `experience_levels.slug` |
| `remoteOnly` | `job_postings.is_remote` |
| `q` | Full-text / `ILIKE` on title, summary, overview (see GIN index in db-schema) |
| Featured ordering | `job_postings.is_featured` |
| Status filter (internal) | Not on public API; public list always implies `published` |

---

## Related

- [README.md](README.md) — *Schema alignment*, `JobPostingStatus`, search `q` vs GIN index  
- [job-detail.md](job-detail.md) — single job and apply  
- [authentication.md](authentication.md) — optional bearer for `isBookmarked`
