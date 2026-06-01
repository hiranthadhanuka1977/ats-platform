# Implementation alignment — May 2026

**Date:** 19 May 2026  
**Last revised:** 21 May 2026 (revision 1.1)  
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
| Interviews | Not in early API dictionary | `application_interviews` table; **one row per application**; schedule via redesigned modal with **timezone** + notify flag; **cancel interview** on backward pipeline move |
| AI relevance | Not in early markup | OpenAI scoring + **`AiRelevanceBiasNotice`** (human-review guidance) |
| Email notifications | Spec / modals imply delivery | **`notifyCandidate*` flags only** — delivery **TH-009** / **TH-130** / **TH-131** |
| WCAG / PDPA reports | **Revision 1.1 · 21 May 2026** — [wcag22-audit.md](wcag22-audit.md), [pdpa-gdpr-audit.md](pdpa-gdpr-audit.md) cover Next.js apps + latest backlog |
| Feature inventory | PRD only | [FEATURE_BACKLOG.md](../specification/FEATURE_BACKLOG.md) — 123 TH codes (88 Done) |

## Compliance artefacts (Stage ④)

| Report | Revision | Key open backlog |
|--------|----------|------------------|
| [wcag22-audit.md](wcag22-audit.md) | 1.1 | TH-190, TH-191, TH-192 |
| [pdpa-gdpr-audit.md](pdpa-gdpr-audit.md) | 1.1 | TH-009, TH-130–131, TH-192, TH-193, TH-145 |

Process context: [portfolio/process-diagrams/ats-ai-development-process.md](../portfolio/process-diagrams/ats-ai-development-process.md).

## File storage (local)

Configured via `UPLOAD_ROOT` (default `./storage` at repo root):

- `storage/cvs/{candidateAccountId}/`
- `storage/cover-letters/{candidateAccountId}/`

See [ATS_Local_Environment_Specification.md](../specification/ATS_Local_Environment_Specification.md).

## Recommended follow-ups

1. **TH-145** — Add staff auth to `PATCH /api/backoffice/candidates/{id}/status`.
2. **TH-009 / TH-130 / TH-131** — Wire email delivery; align modal UX with actual send.
3. **TH-192 / TH-193** — Legal footer pages; HttpOnly candidate session tokens.
4. **TH-190 / TH-191** — WCAG remediation on pipeline modals and critical paths.
5. **TH-056** — Candidate timezone edit UI (DB field exists; used in interview preview).
6. Re-audit accessibility and privacy after the above ship.
