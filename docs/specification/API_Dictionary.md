# API Dictionary — Candidate Portal (ATS)

This is the **entry point** for HTTP API documentation. It now reflects the currently implemented auth + candidate account flows and marks stub modules clearly.

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
| **Candidate Account** | `/api/v1/candidates/*` (register, verify OTP, resend OTP, forgot/reset password) |
| **Backoffice Candidate Admin** | `/api/backoffice/candidates/{id}/status` (status update) |
| **Stub domains** | `/api/v1/jobs`, `/api/v1/applications`, `/api/v1/interviews`, `/api/v1/users`, `/api/v1/notifications` |
| **Health probe** | `/health` (outside `/api/v1`) |

All paths assume prefix **`/api/v1`** and JSON. See [api/README.md](api/README.md) for headers and error codes.

---

## Alignment

- **Data model:** [db-schema.md](db-schema.md), [schema.prisma](../../packages/db/prisma/schema.prisma)  
- **API enums & conventions:** [api/README.md](api/README.md) — *Schema alignment and current endpoint index*  
- **UI:** `docs/markup/candidate-portal/` — `job-listing.html`, `job-detail.html`, `login.html`

---

**Version:** 1.2  
**Date:** 22 April 2026
