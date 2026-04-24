# API — Job detail page

**Doc version:** 1.2 (aligned with [`JobPosting`](../../../packages/db/prisma/schema.prisma), [`Application`](../../../packages/db/prisma/schema.prisma), [`ApplicationStatus`](../../../packages/db/prisma/schema.prisma), [`QualificationType`](../../../packages/db/prisma/schema.prisma), [`db-schema.md`](../db-schema.md) §2, §3, banner fields)

> Implementation status (22 Apr 2026): job detail/bookmark/apply routes described here are not yet implemented in `apps/api/src/modules/jobs` and related modules. Current backend has a stub `GET /api/v1/jobs`.

Endpoints for **one job by slug or ID**, **full content** (overview, responsibilities, qualifications, skills, benefits), **banner** metadata (`banner_image_url`, `banner_image_alt`), **bookmark**, **share** (client-side URL only — no API required), and **apply**.

---

## API dictionary

### Get job by slug (canonical)

| Key | Value |
|-----|--------|
| **Operation** | Full job detail for public page |
| **Method** | `GET` |
| **Path** | `/api/v1/jobs/{slug}` |
| **Auth** | Optional Bearer — adds `isBookmarked`, `application` summary if present |

**Path parameters**

| Param | Description |
|-------|-------------|
| `slug` | URL slug, e.g. `senior-business-analyst` (`job_postings.slug`) |

**Response `200 OK`**

```json
{
  "data": {
    "id": "uuid",
    "slug": "senior-business-analyst",
    "title": "Senior Business Analyst",
    "status": "published",
    "summary": "Short card summary…",
    "overview": "…",
    "roleSummary": "…",
    "applicationInfo": "Candidates must register…",
    "postedAt": "2026-04-05T00:00:00.000Z",
    "expiresAt": "2026-05-05T00:00:00.000Z",
    "isRemote": false,
    "salary": {
      "min": "80000.00",
      "max": "120000.00",
      "currency": "USD",
      "visible": false
    },
    "banner": {
      "imageUrl": "/software-developer.jpg",
      "imageAlt": "Life at TalentHub — workplace and culture"
    },
    "department": { "id": 2, "name": "Product & Delivery", "slug": "product" },
    "location": { "id": 1, "city": "Colombo", "country": "Sri Lanka", "slug": "colombo" },
    "employmentType": { "id": 1, "name": "Full-time", "slug": "full-time" },
    "experienceLevel": { "id": 4, "name": "Senior (5+ Years)", "slug": "senior" },
    "responsibilities": [
      { "id": 1, "description": "…", "sortOrder": 0 }
    ],
    "qualifications": {
      "required": [
        { "id": 1, "description": "…", "sortOrder": 0 }
      ],
      "preferred": [
        { "id": 2, "description": "…", "sortOrder": 0 }
      ]
    },
    "skills": [
      { "id": 1, "name": "Requirement Analysis", "sortOrder": 0 }
    ],
    "benefits": [
      { "id": 1, "description": "…", "sortOrder": 0 }
    ],
    "tags": [
      { "name": "On-site", "variant": "accent", "sortOrder": 0 }
    ],
    "isBookmarked": false,
    "myApplication": null
  }
}
```

| Field | Source |
|-------|--------|
| `status` | `JobPostingStatus` enum string — public `GET` only returns `published` (see [api/README.md](README.md), *Schema alignment*). |
| `banner` | `banner_image_url`, `banner_image_alt` — omit `banner` if URL null |
| `qualifications` | Split `job_qualifications` by `type` (`QualificationType`: `required` \| `preferred`) |
| `myApplication` | If authenticated: latest `applications` row for this candidate + job, or `null` — include `status` as `ApplicationStatus` (e.g. `submitted`, `under_review`, …). |
| `salary` | Omit or null fields when `is_salary_visible` is false |

**Errors**

| Code | HTTP | When |
|------|------|------|
| `NOT_FOUND` | 404 | Unknown slug, or job not `published`, or past `expires_at` |
| `GONE` | 410 | Optional — job closed |

---

### Get job by ID (internal or deep links)

| Key | Value |
|-----|--------|
| **Method** | `GET` |
| **Path** | `/api/v1/jobs/by-id/{id}` |

Same response shape as by slug. Use UUID from `job_postings.id`.

---

### Add bookmark

| Key | Value |
|-----|--------|
| **Operation** | Save job for candidate |
| **Method** | `PUT` |
| **Path** | `/api/v1/me/bookmarks/{jobId}` |
| **Auth** | Bearer (candidate) |

**Path:** `jobId` = `job_postings.id` (UUID).

**Response `204 No Content`** or `200` with `{ "data": { "bookmarked": true } }`.

**Errors**

| Code | HTTP | When |
|------|------|------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `NOT_FOUND` | 404 | Invalid job ID |

---

### Remove bookmark

| Key | Value |
|-----|--------|
| **Method** | `DELETE` |
| **Path** | `/api/v1/me/bookmarks/{jobId}` |
| **Auth** | Bearer (candidate) |

**Response `204 No Content`**

---

### Share

No server API required: front-end uses **Web Share API** or copies `window.location.href`. Optional analytics endpoint:

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/jobs/{jobId}/share-event` |
| **Auth** | Optional |

```json
{ "channel": "clipboard" }
```

For analytics only.

---

### Submit application

| Key | Value |
|-----|--------|
| **Operation** | Create application row |
| **Method** | `POST` |
| **Path** | `/api/v1/jobs/{jobId}/applications` |
| **Auth** | Bearer (candidate) |

**Path:** `jobId` = UUID or use slug variant `POST /api/v1/jobs/by-slug/{slug}/applications`.

**Request body**

```json
{
  "coverLetter": "…",
  "resumeUrl": "https://storage…/resume.pdf"
}
```

| Field | Type | Required |
|-------|------|----------|
| `coverLetter` | string | No |
| `resumeUrl` | string | No — may use upload endpoint first |

**Response `201 Created`**

```json
{
  "data": {
    "id": "uuid",
    "status": "submitted",
    "appliedAt": "2026-04-08T12:00:00.000Z",
    "job": { "id": "uuid", "title": "Senior Business Analyst", "slug": "…" }
  }
}
```

**Errors**

| Code | HTTP | When |
|------|------|------|
| `UNAUTHORIZED` | 401 | Not logged in |
| `ALREADY_APPLIED` | 409 | Unique `(candidate_id, job_posting_id)` |
| `JOB_NOT_ACCEPTING` | 400 | `JobPostingStatus` ≠ `published` or past `expires_at` |

Maps to `applications` table; `status` in the response is `ApplicationStatus` (initial create typically `submitted`).

---

### Presigned upload for resume (optional)

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/v1/uploads/resume` |
| **Auth** | Bearer (candidate) |

**Response**

```json
{
  "data": {
    "uploadUrl": "https://s3…",
    "resumeUrl": "https://cdn…/final.pdf",
    "expiresIn": 300
  }
}
```

Front-end `PUT`s file to `uploadUrl`, then sends `resumeUrl` in application body.

---

## UI mapping (`markup/candidate-portal/job-detail.html`)

| UI | API |
|----|-----|
| Breadcrumb / page load | `GET /jobs/{slug}` |
| Banner image | `data.banner.imageUrl`, `imageAlt` |
| Meta (department, location, …) | Embedded in `data` |
| Sections (overview, responsibilities, …) | Same response |
| Bookmark button | `PUT` / `DELETE /me/bookmarks/{jobId}` |
| Share | Client-only |
| Apply Now | `POST /jobs/{jobId}/applications` |

---

## Data model mapping

| Response section | Tables |
|------------------|--------|
| Core | `job_postings` |
| Lookups | `departments`, `locations`, `employment_types`, `experience_levels` |
| Lists | `job_responsibilities`, `job_qualifications`, `job_posting_skills` + `skills`, `job_posting_benefits` + `benefits`, `job_posting_tags` + `tags` |
| Bookmark | `bookmarks` |
| Apply | `applications` |

---

## Related

- [README.md](README.md) — *Schema alignment*, enums (`JobPostingStatus`, `ApplicationStatus`, `QualificationType`)  
- [job-listing.md](job-listing.md) — list and filters  
- [registration-sign-in.md](registration-sign-in.md) — account before apply  
- [authentication.md](authentication.md) — Bearer token
