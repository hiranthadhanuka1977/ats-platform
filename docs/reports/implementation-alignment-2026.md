# Implementation alignment — May 2026

**Date:** 19 May 2026  
**Purpose:** Bridge gap between static `docs/markup/` audits and the live monorepo.

## Runtime apps (source of truth for behaviour)

| App | Port | Primary docs |
|-----|------|----------------|
| `apps/candidate-portal` | 3000 | [job-listing.md](../specification/api/job-listing.md) (target contract); jobs loaded via **Prisma in Next.js** (`src/lib/jobs.ts`), not `GET /api/v1/jobs` |
| `apps/my-applications` | 3002 | [my-applications-routes.md](../specification/api/my-applications-routes.md) |
| `apps/backoffice` | 3001 | [backoffice-applications.md](../specification/api/backoffice-applications.md) |
| `apps/api` | 4000 | [api/README.md](../specification/api/README.md) — auth + candidates live; jobs/applications/interviews **stubs** |

## Documented vs implemented highlights

| Area | Spec / markup | Implementation |
|------|----------------|----------------|
| Public job list | `GET /api/v1/jobs` | Stub on API; **candidate-portal** queries `job_postings` via Prisma |
| Application pipeline | Static backoffice HTML | **backoffice** `/applications` Kanban + list; status APIs under `/api/backoffice/applications/*` |
| Application statuses | Older docs listed 7 values | **10** Prisma enum values incl. `interview_scheduled`, `interview_completed`, `hired` |
| Interviews | Not in early API dictionary | `application_interviews` table; **one row per application**; schedule via backoffice POST |
| WCAG / PDPA reports | Apr 2026 markup review | Re-run against Next.js UI before release claims |

## File storage (local)

Configured via `UPLOAD_ROOT` (default `./storage` at repo root):

- `storage/cvs/{candidateAccountId}/`
- `storage/cover-letters/{candidateAccountId}/`

See [ATS_Local_Environment_Specification.md](../specification/ATS_Local_Environment_Specification.md).

## Recommended follow-ups

1. Add staff auth to `PATCH /api/backoffice/candidates/{id}/status`.
2. Re-audit accessibility on backoffice pipeline and my-applications flows.
3. Implement or document central `/api/v1/jobs` and `/api/v1/applications` when extracting BFF logic to Hono.
