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
| [**api/my-applications-routes.md**](api/my-applications-routes.md) | Candidate dashboard: CV upload/parse/save/download + screenshot extract/save (`apps/my-applications` Next.js handlers) |

---

## Quick reference

| Area | Base resources |
|------|----------------|
| **Central HTTP API** (`apps/api`, port **4000**) | Prefix **`/api/v1`** — JSON unless noted |
| **Auth** | `/api/v1/auth/*` |
| **Candidate Account** | `/api/v1/candidates/*` (register, verify OTP, resend OTP, forgot/reset password) |
| **Stub domains** | `/api/v1/jobs`, `/api/v1/applications`, `/api/v1/interviews`, `/api/v1/users`, `/api/v1/notifications` return stub payloads until implemented |
| **My Applications (Next.js)** | App-local **`/api/my-applications/*`** on the candidate portal app (port **3002**) — CV + screenshot import; Bearer JWT — see [api/my-applications-routes.md](api/my-applications-routes.md) |
| **Backoffice (Next.js)** | App-local **`/api/auth/*`**, **`/api/backoffice/*`**, **`/api/admin/*`** on the staff app (port **3001**) — summary in [api/README.md](api/README.md) |
| **Health probe** | **`/health`** on the central API (outside `/api/v1`) |

Paths under **`/api/v1`** use JSON. Next.js routes follow each app’s origin. See [api/README.md](api/README.md) for headers and error codes.

---

## Alignment

- **Data model:** [db-schema.md](db-schema.md), [schema.prisma](../../packages/db/prisma/schema.prisma)  
- **API enums & conventions:** [api/README.md](api/README.md) — *Schema alignment and current endpoint index*  
- **UI:** public jobs UX in `docs/markup/candidate-portal/` (`job-listing.html`, `job-detail.html`); candidate auth/dashboard and CV/screenshot import routes live in `apps/my-applications`.

---

**Version:** 1.3  
**Date:** 6 May 2026
