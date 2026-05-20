# API Documentation — Candidate Portal (ATS)

**Version:** 1.4  
**Date:** 19 May 2026  
**Base path (central API):** `/api/v1`  
**Format:** JSON over HTTPS (central API and typical Next.js JSON handlers)  
**Auth:** Bearer access token (JWT) for protected routes; public routes for published job data.

This folder describes REST-style APIs that back:

- public jobs browsing (`apps/candidate-portal`, `docs/markup/candidate-portal/job-listing.html`, `job-detail.html`)
- candidate account workflows and dashboard APIs (`apps/my-applications` — see [my-applications-routes.md](my-applications-routes.md))
- staff back office (`apps/backoffice` — app-local route summary below)

Everything aligns with [`schema.prisma`](../../../packages/db/prisma/schema.prisma) and [`db-schema.md`](../db-schema.md) where data is persisted.

---

## Documents

| File | Scope |
|------|--------|
| [authentication.md](authentication.md) | Sessions, tokens, logout — **authenticating** callers |
| [registration-sign-in.md](registration-sign-in.md) | Registration, OTP verification/resend, email/password sign-in, password recovery |
| [job-listing.md](job-listing.md) | Job listing page — search, filters, sort, pagination, lookups |
| [job-detail.md](job-detail.md) | Job detail target contract — single job, apply, bookmarks (implementation in progress) |
| [my-applications-routes.md](my-applications-routes.md) | Candidate app Next.js routes: CV import + screenshot-based profile import |
| [backoffice-applications.md](backoffice-applications.md) | Staff app: application status, undo, reopen, interviews, relevance, attachments |

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

- **UUIDs** for `job_postings`, `candidate_accounts`, `applications`, `users` (matches schema).
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
| **Candidate email** | Register/login should normalize email to **lowercase** and use `candidate_accounts.email_normalized` for lookups. |
| **Search (`q`)** | Keyword search should use the same fields as the GIN full-text index when present (`title`, `summary`, `overview`) — see `idx_postings_fulltext` in [db-schema.md §2.1](../db-schema.md). |

**Prisma enum → API string values (same token names)**

| Prisma enum | Values |
|-------------|--------|
| `JobPostingStatus` | `draft`, `published`, `closed`, `archived` |
| `ApplicationStatus` | `submitted`, `under_review`, `shortlisted`, `interview` (legacy), `interview_scheduled`, `interview_completed`, `offered`, `hired`, `rejected`, `withdrawn` |
| `UserRole` | `admin`, `recruiter`, `hiring_manager` |
| `QualificationType` | `required`, `preferred` |

DDL-only note: hand-written SQL in [db-schema.md §5](../db-schema.md) uses `VARCHAR` + `CHECK` for some of these; Prisma migrations emit native PostgreSQL **ENUM** types — **logical** values are identical. See **§5.1**.

---

## Master API dictionary (quick index)

### Central service (`apps/api` — prefix `/api/v1`)

| Domain | Method | Path | Summary |
|--------|--------|------|---------|
| Auth | POST | `/auth/login` | Email/password login for `candidate` and `staff` audiences |
| Auth | GET | `/auth/me` | Current principal (candidate or staff) |
| Auth | POST | `/auth/logout` | Logout (returns `204`) |
| Account | POST | `/candidates/register` | Register candidate and issue verification OTP |
| Account | POST | `/candidates/resend-otp` | Resend verification OTP with cooldown/rate limits |
| Account | POST | `/candidates/verify-email` | Verify account using 6-digit OTP |
| Account | POST | `/candidates/forgot-password` | Request password reset |
| Account | POST | `/candidates/reset-password` | Complete password reset |
| Jobs | GET | `/jobs` | Stub endpoint (`{ module: "jobs", message: "stub — implement job routes" }`) |
| Applications | GET | `/applications` | Stub endpoint |
| Interviews | GET | `/interviews` | Stub endpoint |
| Users | GET | `/users` | Stub endpoint |
| Notifications | GET | `/notifications` | Stub endpoint |

`/health` on the same server is **outside** `/api/v1` and returns a JSON liveness payload.

### Candidate app — Next.js (`apps/my-applications`, origin e.g. `http://localhost:3002`)

Bearer JWT (candidate). Details: [my-applications-routes.md](my-applications-routes.md).

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/my-applications/cv/upload` | Upload PDF/Word; returns `parseId` |
| POST | `/api/my-applications/cv/parse` | Text extraction + structured parse |
| POST | `/api/my-applications/cv/save` | Save parsed CV to profile |
| GET | `/api/my-applications/cv/download` | Download original file (`?id=`) |
| POST | `/api/my-applications/screenshot/extract` | Image + section → structured rows (requires `OPENAI_API_KEY`) |
| POST | `/api/my-applications/screenshot/save` | Save full payload from screenshot flow |

### Backoffice — Next.js (`apps/backoffice`, origin e.g. `http://localhost:3001`)

Staff session cookies via **`/api/auth/login`** (and refresh/logout). Domain routes are app-local, not the central `/api/v1` tree.

| Area | Typical paths | Summary |
|------|----------------|---------|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/refresh` | Staff authentication |
| Jobs | `GET/POST /api/backoffice/jobs`, `GET/PATCH/DELETE /api/backoffice/jobs/{id}`, `POST /api/backoffice/jobs/{id}/publish`, `GET /api/backoffice/jobs/form-options` | Job posting CRUD and publish |
| Applications | `PATCH /api/backoffice/applications/{id}/status`, `POST .../status/undo`, `POST .../reopen`, `GET/POST .../interviews`, `GET .../relevance-score`, `GET .../attachments/cv`, `GET .../attachments/cover-letter` | Pipeline status, interview, scoring, files — see [backoffice-applications.md](backoffice-applications.md) |
| Candidates | `PATCH /api/backoffice/candidates/{id}/status` | **Candidate account** status (`active`, `locked`, etc.) — not application pipeline status |
| Admin lookups | `/api/admin/departments`, `/api/admin/locations`, `/api/admin/skills`, `/api/admin/tags`, `/api/admin/benefits`, `/api/admin/experience-levels`, `/api/admin/employment-types` (collection + `/{id}`) | Reference data for job builder |

Implementations live under `apps/backoffice/src/app/api/`. UI routes: `/applications` (pipeline default), `/applications/{id}`, `/interviews`.

---

## Security notes

- Store **refresh tokens** in httpOnly, Secure, SameSite cookies when using browser clients; or secure mobile storage for native apps.
- **Rate-limit** login, register, resend-otp, verify-email, and forgot-password endpoints.
- **Never** return `password_hash` in any response.

---

## Related specification

- [../db-schema.md](../db-schema.md) — data model, §5 DDL, **§5.1** DDL vs Prisma  
- [schema.prisma](../../../packages/db/prisma/schema.prisma) — Prisma models and enums
