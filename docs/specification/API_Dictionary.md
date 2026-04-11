# API Dictionary — Candidate Portal (ATS)

This is the **entry point** for HTTP API documentation that supports authentication, registration/sign-in, the job listing experience, and the job detail experience.

**Folder:** [`api/`](api/)

| Document | Contents |
|----------|----------|
| [**api/README.md**](api/README.md) | Conventions, error format, pagination, **master endpoint index** |
| [**api/authentication.md**](api/authentication.md) | Login, refresh, logout, `/auth/me` — **authenticating users** |
| [**api/registration-sign-in.md**](api/registration-sign-in.md) | Register, forgot/reset password, **OAuth** (Google, LinkedIn) |
| [**api/job-listing.md**](api/job-listing.md) | `GET /jobs`, filters, sort, pagination, **lookup** endpoints |
| [**api/job-detail.md**](api/job-detail.md) | `GET /jobs/{slug}`, bookmarks, **apply** |

---

## Quick reference

| Area | Base resources |
|------|----------------|
| **Auth** | `/api/v1/auth/*` |
| **Account** | `/api/v1/candidates/*` (register, password reset) |
| **Jobs (public)** | `/api/v1/jobs`, `/api/v1/jobs/{slug}` |
| **Lookups** | `/api/v1/lookups/*` |
| **Me (candidate)** | `/api/v1/me/bookmarks/*` |

All paths assume prefix **`/api/v1`** and JSON. See [api/README.md](api/README.md) for headers and error codes.

---

## Alignment

- **Data model:** [db-schema.md](db-schema.md), [schema.prisma](../../packages/db/prisma/schema.prisma)  
- **API enums & conventions:** [api/README.md](api/README.md) — *Schema alignment (Prisma & db-schema.md)* (camelCase JSON, `JobPostingStatus`, `ApplicationStatus`, `UserRole`, `QualificationType`, public jobs, email uniqueness)  
- **UI:** `docs/markup/candidate-portal/` — `job-listing.html`, `job-detail.html`, `login.html`

---

**Version:** 1.1  
**Date:** 08 April 2026
