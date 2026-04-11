# API Documentation — Candidate Portal (ATS)

**Version:** 1.1  
**Date:** 08 April 2026  
**Base path:** `/api/v1`  
**Format:** JSON over HTTPS  
**Auth:** Bearer access token (JWT) for protected routes; public routes for published job data.

This folder describes REST-style APIs that back the candidate-portal markup (`docs/markup/candidate-portal/`: `job-listing.html`, `job-detail.html`, `login.html`) and align with [`schema.prisma`](../../../packages/db/prisma/schema.prisma) and [`db-schema.md`](../db-schema.md) (including **§5.1** hand-written DDL vs Prisma).

---

## Documents

| File | Scope |
|------|--------|
| [authentication.md](authentication.md) | Sessions, tokens, logout — **authenticating** callers |
| [registration-sign-in.md](registration-sign-in.md) | Registration, email/password sign-in, OAuth, password recovery |
| [job-listing.md](job-listing.md) | Job listing page — search, filters, sort, pagination, lookups |
| [job-detail.md](job-detail.md) | Job detail page — single job, apply, bookmarks |

---

## Conventions

### Headers (typical)

| Header | When |
|--------|------|
| `Authorization: Bearer <access_token>` | Protected routes (candidate or staff) |
| `Content-Type: application/json` | Request bodies with JSON |
| `Accept: application/json` | All JSON responses |
| `Idempotency-Key: <uuid>` | Optional on `POST` that create resources (applications) |

### Success envelope (recommended)

```json
{
  "data": { },
  "meta": { }
}
```

`meta` may include pagination: `{ "page": 1, "pageSize": 15, "totalCount": 124 }`.

### Error envelope

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable summary",
    "details": [ { "field": "email", "message": "Invalid format" } ]
  }
}
```

### Common HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No content (delete / logout body-less) |
| `400` | Bad request / validation |
| `401` | Missing or invalid authentication |
| `403` | Authenticated but not allowed |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate application) |
| `422` | Semantic validation |
| `429` | Rate limited |
| `500` | Server error |

### Identifiers

- **UUIDs** for `job_postings`, `candidates`, `applications`, `users` (matches schema).
- **Slugs** for SEO-friendly job URLs (`senior-business-analyst`).

### Versioning

Prefix all routes with `/api/v1`. Breaking changes require `/api/v2`.

### Schema alignment (Prisma & `db-schema.md`)

| Topic | API behaviour |
|-------|-----------------|
| **JSON naming** | Request/response bodies use **camelCase** (e.g. `postedAt`, `firstName`). Maps to Prisma Client / `@map` snake_case columns (`posted_at`, `first_name`). |
| **Enums** | String values in JSON match Prisma enums (same names as PostgreSQL enums after migrate). See table below. |
| **Public jobs** | List and public detail endpoints return only rows with `JobPostingStatus` = `published` and not past `expires_at`. Do not expose drafts via public routes. |
| **Staff `role`** | `/auth/me` for staff returns `role` as one of: `admin`, `recruiter`, `hiring_manager` (`UserRole`). |
| **Candidate email** | Register/login should normalise email to **lowercase**. Uniqueness follows [`candidates`](../db-schema.md): Prisma `@@unique([email])` is case-sensitive; [§5 DDL](../db-schema.md) uses `LOWER(email)` — implement the stricter rule in API or migration (see §5.1). |
| **Search (`q`)** | Keyword search should use the same fields as the GIN full-text index when present (`title`, `summary`, `overview`) — see `idx_postings_fulltext` in [db-schema.md §2.1](../db-schema.md). |

**Prisma enum → API string values (same token names)**

| Prisma enum | Values |
|-------------|--------|
| `JobPostingStatus` | `draft`, `published`, `closed`, `archived` |
| `ApplicationStatus` | `submitted`, `under_review`, `shortlisted`, `interview`, `offered`, `rejected`, `withdrawn` |
| `UserRole` | `admin`, `recruiter`, `hiring_manager` |
| `QualificationType` | `required`, `preferred` |

DDL-only note: hand-written SQL in [db-schema.md §5](../db-schema.md) uses `VARCHAR` + `CHECK` for some of these; Prisma migrations emit native PostgreSQL **ENUM** types — **logical** values are identical. See **§5.1**.

---

## Master API dictionary (quick index)

| Domain | Method | Path | Summary |
|--------|--------|------|---------|
| Auth | POST | `/auth/login` | Email/password login (candidates or staff — separate clients) |
| Auth | POST | `/auth/refresh` | Issue new access token from refresh token |
| Auth | POST | `/auth/logout` | Invalidate refresh session |
| Auth | GET | `/auth/me` | Current principal (candidate or internal user) |
| Account | POST | `/candidates/register` | Register candidate account |
| Account | POST | `/candidates/forgot-password` | Request password reset email |
| Account | POST | `/candidates/reset-password` | Complete reset with token |
| OAuth | GET | `/auth/oauth/{provider}/start` | Redirect to Google / LinkedIn |
| OAuth | GET | `/auth/oauth/{provider}/callback` | OAuth callback — issues tokens |
| Jobs | GET | `/jobs` | List published jobs (filters, sort, page) |
| Jobs | GET | `/jobs/{slug}` | Job detail by slug |
| Lookups | GET | `/lookups/locations` | Locations for filter dropdown |
| Lookups | GET | `/lookups/departments` | Departments for filters / hero pills |
| Lookups | GET | `/lookups/employment-types` | Employment types |
| Lookups | GET | `/lookups/experience-levels` | Experience levels |
| Candidate | GET | `/me/bookmarks` | List bookmarked job IDs or summaries |
| Candidate | PUT | `/me/bookmarks/{jobId}` | Add bookmark |
| Candidate | DELETE | `/me/bookmarks/{jobId}` | Remove bookmark |
| Apply | POST | `/jobs/{jobId}/applications` | Submit application (authenticated candidate) |

Staff/admin APIs (posting CRUD) are out of scope for this candidate-facing dictionary unless you add a separate `admin-api.md` later.

---

## Security notes

- Store **refresh tokens** in httpOnly, Secure, SameSite cookies when using browser clients; or secure mobile storage for native apps.
- **Rate-limit** login, register, forgot-password, and OAuth endpoints.
- **Never** return `password_hash` in any response.

---

## Related specification

- [../db-schema.md](../db-schema.md) — data model, §5 DDL, **§5.1** DDL vs Prisma  
- [schema.prisma](../../../packages/db/prisma/schema.prisma) — Prisma models and enums
