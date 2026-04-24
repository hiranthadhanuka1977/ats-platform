# API Dictionary — Candidate Portal (ATS)

This is the **entry point** for HTTP API documentation. It now reflects the currently implemented auth + candidate account flows and marks stub modules clearly.

**Folder:** [`api/`](api/)

| Document | Contents |
|----------|----------|
| [**api/README.md**](api/README.md) | Conventions, error format, pagination, **master endpoint index** |
| [**api/authentication.md**](api/authentication.md) | Implemented auth endpoints: login, logout, `/auth/me` |
| [**api/registration-sign-in.md**](api/registration-sign-in.md) | Register, OTP verify/resend, forgot/reset password |
| [**api/job-listing.md**](api/job-listing.md) | Target contract for `GET /jobs` + filters (currently stub in API module) |
| [**api/job-detail.md**](api/job-detail.md) | Target contract for job detail/apply/bookmarks (not fully implemented) |

---

## Quick reference

| Area | Base resources |
|------|----------------|
| **Auth** | `/api/v1/auth/*` |
| **Candidate Account** | `/api/v1/candidates/*` (register, verify OTP, resend OTP, forgot/reset password) |
| **Backoffice Candidate Admin** | Backoffice app route `/api/backoffice/candidates/{id}/status` (not part of central `apps/api` `/api/v1` module set) |
| **Stub domains** | `/api/v1/jobs`, `/api/v1/applications`, `/api/v1/interviews`, `/api/v1/users`, `/api/v1/notifications` |
| **Health probe** | `/health` (outside `/api/v1`) |

All paths assume prefix **`/api/v1`** and JSON. See [api/README.md](api/README.md) for headers and error codes.

---

## Alignment

- **Data model:** [db-schema.md](db-schema.md), [schema.prisma](../../packages/db/prisma/schema.prisma)  
- **API enums & conventions:** [api/README.md](api/README.md) — *Schema alignment and current endpoint index*  
- **UI:** public jobs UX in `docs/markup/candidate-portal/` (`job-listing.html`, `job-detail.html`); candidate auth/dashboard is now in `apps/my-applications`.

---

**Version:** 1.2  
**Date:** 22 April 2026
