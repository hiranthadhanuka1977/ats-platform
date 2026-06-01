# Product Requirements Document — TalentHub ATS Platform

**Product:** TalentHub (ATS Platform)  
**Document version:** 1.0  
**Date:** 20 May 2026  
**Status:** As-built — reflects implementation in the `ats-platform` monorepo as of May 2026  

---

## 1. Executive summary

TalentHub is an applicant tracking system (ATS) delivered as an npm monorepo with four runtime applications:

| Application | Port | Audience |
|-------------|------|----------|
| **Candidate portal** | 3000 | Public job seekers browsing open roles |
| **My Applications** | 3002 | Registered candidates managing profile, CV, and applications |
| **Backoffice** | 3001 | Internal recruiters and hiring staff |
| **Central API** | 4000 | Shared authentication and candidate account services |

The platform supports the full core hiring loop: **publish jobs → discover and apply → triage in a Kanban pipeline → progress through interview and offer stages → hire or reject**. Job data, applications, and staff workflows are persisted in PostgreSQL via Prisma. Most domain logic runs in Next.js route handlers (BFF pattern); the central Hono API handles auth and candidate registration only.

This PRD consolidates product intent from specifications, static markup, and the live codebase. It distinguishes **implemented**, **partial**, and **planned** capabilities so stakeholders can align on what exists today versus what remains.

---

## 2. Vision and objectives

### 2.1 Vision

Give hiring teams a focused backoffice to triage and progress applications efficiently, while giving candidates a clear path from job discovery to application tracking — without fragmenting context across jobs, candidates, and pipeline views.

### 2.2 Product objectives

1. **Reduce time-to-triage** — Staff can review who applied, for which job, when, with what documents, from a single applications hub (list and Kanban views).
2. **Enforce valid hiring workflow** — Application status changes follow a defined transition matrix with audit logging, terminal-state rules, and controlled reopen flows.
3. **Enable self-service candidate onboarding** — Candidates register, verify email, upload a CV, and apply without staff intervention.
4. **Maintain a single source of truth** — One PostgreSQL schema (`@ats-platform/db`) shared across all apps; shared validators and types in workspace packages.
5. **Support local-first development** — File uploads to disk, optional OpenAI for CV parsing and relevance scoring, documented environment setup.

### 2.3 Design principles

- **Progressive disclosure** — Summary in list/pipeline; depth on application and candidate detail pages.
- **Application as unit of work** — Candidate and job are linked contexts, not separate workflows.
- **Honest system state** — Disable or block impossible transitions rather than failing silently after the fact.
- **Implementation-aligned documentation** — Specs, API dictionary, design system, and audits track the Next.js apps, not legacy static markup alone.

---

## 3. Users and personas

### 3.1 Candidate (external)

- Browses published jobs on the public portal.
- Registers and logs in via My Applications.
- Uploads CV, optionally attaches cover letters, submits applications with screening answers.
- Tracks application status on a personal dashboard.

### 3.2 Recruiter / hiring manager (internal)

- Logs into backoffice with staff credentials (`users` table).
- Creates and publishes job postings.
- Reviews applications in list or Kanban pipeline; changes status, schedules interviews, downloads attachments.
- Manages candidate records and lookup data (departments, locations, skills, etc.).

### 3.3 Administrator (internal)

- Same backoffice access with admin role.
- Maintains reference data via Administration CRUD screens.
- (Future) User management, reports, system settings — UI placeholders exist today.

---

## 4. Product architecture

### 4.1 High-level system diagram

```text
┌─────────────────────┐     ┌─────────────────────┐
│  candidate-portal   │     │   my-applications   │
│  (public browse)    │────▶│  (auth + apply)     │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           │         ┌─────────────────┼─────────────────┐
           │         │                 │                 │
           ▼         ▼                 ▼                 ▼
    ┌──────────────────────────────────────────────────────────┐
    │              PostgreSQL (@ats-platform/db)               │
    └──────────────────────────────────────────────────────────┘
           ▲                 ▲
           │                 │
┌──────────┴──────────┐     │     ┌─────────────────────┐
│     backoffice      │─────┘     │    apps/api         │
│  (staff BFF + UI)   │           │  auth + candidates  │
└─────────────────────┘           └─────────────────────┘
```

### 4.2 Request routing pattern

| Concern | Where implemented |
|---------|-------------------|
| Staff session (httpOnly cookies) | `apps/backoffice` — `/api/auth/*`, `/api/backoffice/*`, `/api/admin/*` |
| Candidate JWT (Bearer + refresh) | `apps/api` — `/api/v1/auth/*`; consumed by `apps/my-applications` |
| Candidate registration / OTP | `apps/api` — `/api/v1/candidates/*` |
| Public job listing | `apps/candidate-portal` — Prisma in server components (`src/lib/jobs.ts`) |
| CV upload, apply, profile | `apps/my-applications` — `/api/my-applications/*` |
| Jobs CRUD, pipeline, interviews | `apps/backoffice` — Next.js route handlers |
| Central domain API | **Stubs** — `/api/v1/jobs`, `/applications`, `/interviews`, `/users`, `/notifications` |

### 4.3 Shared packages

| Package | Role |
|---------|------|
| `@ats-platform/db` | Prisma schema, migrations, client |
| `@ats-platform/validators` | Zod schemas for API and BFF payloads |
| `@ats-platform/types` | DTOs, `APPLICATION_STATUS_TRANSITIONS` |
| `@ats-platform/ui` | Shared React primitives (where used) |
| `@ats-platform/auth` | Session/JWT abstractions |

### 4.4 File storage

Local filesystem under `UPLOAD_ROOT` (default `./storage` at repo root):

- `storage/cvs/{candidateAccountId}/`
- `storage/cover-letters/{candidateAccountId}/`

---

## 5. Functional requirements

Each requirement uses status: **Done** | **Partial** | **Planned** | **Out of scope**.

### 5.1 Public job discovery (candidate-portal)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| CP-01 | Display published job listings with pagination | **Done** | Server-side Prisma query |
| CP-02 | Filter by department, location, employment type, experience, remote | **Done** | URL-driven search params |
| CP-03 | Full-text search on job title/summary | **Done** | `q` parameter |
| CP-04 | Job detail page with overview, responsibilities, qualifications, skills, benefits, tags | **Done** | `/jobs/[slug]` |
| CP-05 | Salary display when `is_salary_visible` | **Done** | |
| CP-06 | Featured job highlighting | **Done** | `is_featured` flag |
| CP-07 | Banner image on job detail | **Done** | `banner_image_url`, `banner_image_alt` |
| CP-08 | Apply CTA links to My Applications login | **Done** | No in-portal apply |
| CP-09 | Skip link, sticky header, accessible footer | **Done** | WCAG-oriented markup |
| CP-10 | Candidate auth, apply, bookmarks in portal | **Out of scope** | Redirects to port 3002 |
| CP-11 | Bookmark jobs | **Planned** | DB model exists; no API in portal |

### 5.2 Candidate account and workspace (my-applications)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| MA-01 | Register with email and password | **Done** | Central API |
| MA-02 | Email verification via OTP | **Done** | Dev OTP `111111` documented |
| MA-03 | Login / logout / session refresh | **Done** | Bearer JWT; 15m idle logout in UI |
| MA-04 | Forgot / reset password | **Partial** | API exists; **no UI** |
| MA-05 | Dashboard with onboarding journey and recent applications | **Done** | |
| MA-06 | Job search (published jobs) | **Done** | Simpler filters than portal |
| MA-07 | Job detail and apply flow | **Done** | CV required; optional cover letter |
| MA-08 | Application list with status | **Done** | |
| MA-09 | CV upload (PDF, DOC, DOCX) | **Done** | Max 10 MB |
| MA-10 | CV parse and structured save to profile | **Done** | Text extraction + OpenAI |
| MA-11 | CV library: list, default, download, delete | **Done** | |
| MA-12 | Cover letter library (file + text modes) | **Done** | |
| MA-13 | Screening questions on apply | **Done** | Per-application fields |
| MA-14 | Profile screenshot import (LinkedIn-style) | **Partial** | Prototype on `/my-profile` |
| MA-15 | Bookmark jobs | **Planned** | Schema only |
| MA-16 | Withdraw application | **Planned** | Status exists in pipeline; candidate UI TBD |

### 5.3 Staff authentication and shell (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-01 | Staff login with httpOnly session cookies | **Done** | Prisma `users` table |
| BO-02 | Role-based staff accounts (admin, recruiter, hiring_manager) | **Done** | Enum on `User` |
| BO-03 | Sidebar navigation, top bar, mobile nav | **Done** | `BackOfficeShell` |
| BO-04 | Skip link and session activity tracking | **Done** | |
| BO-05 | Middleware protection on dashboard routes | **Done** | Cookie `bo_access` |

### 5.4 Dashboard (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-10 | KPI stat row (open jobs, applications, etc.) | **Done** | |
| BO-11 | Pipeline health snapshot | **Done** | |
| BO-12 | Recent activity feed | **Done** | |
| BO-13 | Efficiency score card | **Done** | |
| BO-14 | Curator insight (stalled interviews) | **Done** | |

### 5.5 Job posting management (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-20 | List jobs with search, filters, pagination | **Done** | |
| BO-21 | Create job (multi-section form) | **Done** | |
| BO-22 | Edit existing job | **Done** | |
| BO-23 | Review step before publish | **Done** | |
| BO-24 | Publish / draft status | **Done** | |
| BO-25 | Job preview (candidate-facing layout) | **Done** | `/jobs/[id]/preview` |
| BO-26 | Relational content: responsibilities, qualifications, skills, benefits, tags | **Done** | |
| BO-27 | Salary range and visibility toggle | **Done** | |
| BO-28 | Remote and featured flags | **Done** | |
| BO-29 | Banner image URL and alt text | **Done** | |

### 5.6 Applications hub and pipeline (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-30 | Applications list view with sorting and filters | **Done** | |
| BO-31 | Kanban pipeline view (default) | **Done** | Drag-and-drop status changes |
| BO-32 | Toggle list ↔ pipeline; fullscreen pipeline mode | **Done** | `bo-content--pipeline` |
| BO-33 | Week-scoped pipeline browsing | **Done** | Past and current week |
| BO-34 | Ten application statuses with transition validation | **Done** | See §6 |
| BO-35 | Status PATCH with reason, notes, optimistic concurrency | **Done** | `/api/backoffice/applications/{id}/status` |
| BO-36 | Undo last status change | **Done** | |
| BO-37 | Reopen from rejected (controlled action) | **Done** | Mandatory reason |
| BO-38 | Application detail: applicant, job link, submission, documents | **Done** | |
| BO-39 | Download CV and cover letter (staff) | **Done** | |
| BO-40 | Schedule interview (one per application) | **Done** | `application_interviews` |
| BO-41 | AI relevance score on applications | **Partial** | Requires `OPENAI_API_KEY` |
| BO-42 | Status change audit log | **Done** | `application_status_events` |
| BO-43 | Terminal columns: Rejected, Withdrawn | **Done** | Separate from active board |
| BO-44 | Email notification on status change | **Planned** | `notifyCandidate` field exists; delivery TBD |

### 5.7 Candidates (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-50 | Candidates summary dashboard | **Done** | |
| BO-51 | Searchable candidates table | **Done** | |
| BO-52 | Candidate detail: profile, CV history, applications | **Done** | |
| BO-53 | Edit candidate account status | **Done** | |
| BO-54 | Return navigation from candidate → applications context | **Done** | Context preserved where specified |

### 5.8 Interviews (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-60 | Interviews calendar page | **Done** | `/interviews` |
| BO-61 | Schedule from application detail | **Done** | |
| BO-62 | Interview required before `interview_scheduled` status | **Done** | API validation |

### 5.9 Administration (backoffice)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| BO-70 | CRUD for companies | **Done** | `/administration/companies` |
| BO-71 | CRUD for departments, locations | **Done** | |
| BO-72 | CRUD for employment types, experience levels | **Done** | |
| BO-73 | CRUD for skills, tags, benefits | **Done** | |
| BO-74 | Staff user management UI | **Planned** | |
| BO-75 | Reports | **Planned** | Placeholder page |
| BO-76 | Settings | **Planned** | Placeholder page |

### 5.10 Central API (apps/api)

| ID | Requirement | Status | Notes |
|----|-------------|--------|-------|
| API-01 | Health probe | **Done** | `/health` |
| API-02 | Staff and candidate login | **Done** | Audience-aware JWT |
| API-03 | `/auth/me`, logout, refresh | **Done** | |
| API-04 | Candidate register, verify, resend OTP | **Done** | |
| API-05 | Forgot / reset password | **Done** | |
| API-06 | Jobs REST API | **Planned** | Stub only |
| API-07 | Applications REST API | **Planned** | Stub only |
| API-08 | Interviews REST API | **Planned** | Stub only |
| API-09 | Notifications | **Out of scope** | Stub; no DB model |

---

## 6. Application lifecycle

### 6.1 Status enum (10 values)

| Status | Pipeline column | Terminal |
|--------|-----------------|----------|
| `submitted` | Submitted | No |
| `under_review` | Under Review | No |
| `shortlisted` | Shortlisted | No |
| `interview_scheduled` | Interview Scheduled | No |
| `interview_completed` | Interview Completed | No |
| `offered` | Offered | No |
| `hired` | Hired | Yes |
| `rejected` | Rejected | Yes* |
| `withdrawn` | Withdrawn | Yes |

\* Rejected allows controlled **reopen** to `under_review` or `shortlisted` only.

### 6.2 Active Kanban columns

```text
Submitted → Under Review → Shortlisted → Interview Scheduled → Interview Completed → Offered → Hired
```

Rejected and Withdrawn appear as separate tabs or filtered views.

### 6.3 Business rules (summary)

- **Reject** requires a reason.
- **Withdraw** requires a withdrawal source.
- **Hired** from **Offered** requires `offerAccepted: true`.
- **Interview Scheduled** requires an `application_interviews` row.
- Transitions from **Rejected** use reopen endpoint, not standard PATCH.
- **Hired** and **Withdrawn** are terminal for normal PATCH.
- Optimistic concurrency via optional `expectedUpdatedAt` (409 on conflict).

Full matrix and payloads: [ATS_Application_State_UI_API_Requirements.md](ATS_Application_State_UI_API_Requirements.md), [api/backoffice-applications.md](api/backoffice-applications.md).

---

## 7. Data model (summary)

Canonical schema: `packages/db/prisma/schema.prisma`. Documented in [db-schema.md](db-schema.md).

| Domain | Key entities |
|--------|--------------|
| Lookups | `Company`, `Department`, `Location`, `EmploymentType`, `ExperienceLevel`, `Skill`, `Benefit`, `Tag` |
| Staff | `User` |
| Jobs | `JobPosting` + related content tables |
| Candidates | `CandidateAccount`, `CandidateProfile`, `CandidateCvParse`, education/experience, sessions, tokens |
| Applications | `Application`, `ApplicationStatusEvent`, `ApplicationInterview` |
| Engagement | `Bookmark`, `CandidateCoverLetter` |

---

## 8. Non-functional requirements

### 8.1 Accessibility

- Target **WCAG 2.2 Level AA** for Next.js apps.
- Audits: [wcag22-audit.md](../reports/wcag22-audit.md) (revision 1.1, May 2026).
- Known gaps: modal focus traps (**TH-191**), placeholder legal footer links (**TH-192**), pipeline live-region announcements — tracked in audit and [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) (TH-190–TH-192).

### 8.2 Privacy and data protection

- PDPA/GDPR-oriented audit: [pdpa-gdpr-audit.md](../reports/pdpa-gdpr-audit.md) (revision 1.1, May 2026).
- Candidate PII in profile, CV files, and application attachments.
- Staff sessions via httpOnly cookies; candidate tokens in localStorage (**TH-193** HttpOnly migration).
- AI relevance scoring with in-app human-review notice; email notify flags without delivery (**TH-009**, **TH-130**, **TH-131**).

### 8.3 Security

- Password hashing (bcrypt) for staff and candidates.
- Account lockout on failed login attempts (API).
- Staff routes gated by middleware; candidate routes require Bearer JWT.
- File upload type and size validation on CV endpoints.

### 8.4 Performance and scale (current assumptions)

- Local/dev-oriented: filesystem storage, single PostgreSQL instance.
- Pipeline loads up to 500 applications server-side (backoffice).
- No CDN, email queue, or horizontal scaling documented yet.

### 8.5 Design system

- HTML catalog: [design-system/index.html](../design-system/index.html).
- Tokens, components, and **layout templates** (portal shell, job listing, auth split, dashboard shell, pipeline viewport).
- Source-aligned with `apps/*/src/styles`.

---

## 9. User journeys (as-built)

### 9.1 Candidate: discover and apply

```text
Browse jobs (portal :3000)
  → Register / login (my-applications :3002 + API :4000)
  → Upload and parse CV
  → Apply to job (select CV, optional cover letter, screening answers)
  → Track status on dashboard
```

### 9.2 Staff: publish and hire

```text
Login (backoffice :3001)
  → Create and publish job
  → Review applications (list or Kanban)
  → Move cards / PATCH status (with rules)
  → Schedule interview when needed
  → Progress to Offered → Hired (or Reject with reason)
  → Download CV / cover letter from detail page
```

### 9.3 Admin: maintain reference data

```text
Login → Administration → CRUD on lookups (departments, skills, etc.)
```

---

## 10. Out of scope and known gaps

| Item | Notes |
|------|-------|
| Central Hono jobs/applications/interviews API | Stubs; logic lives in Next BFFs |
| Notifications service | No Prisma model; stub endpoint |
| Backoffice Reports & Settings | Placeholder UI only |
| Candidate bookmarks | DB ready; no end-to-end flow |
| Password reset UI (candidate) | API only |
| Email delivery (OTP, status notifications) | Dev OTP hardcoded; `notifyCandidate` not wired |
| Multi-tenant / multi-company isolation | Single-tenant assumptions |
| Mobile-native apps | Responsive web only |
| SSO / OAuth (Google, etc.) | Staff uses email/password |
| Extract BFF to central API | Documented as future alignment step |

Recommended follow-ups from [implementation-alignment-2026.md](../reports/implementation-alignment-2026.md):

1. Harden staff auth on candidate status PATCH if exposed broadly.
2. Re-audit accessibility on pipeline and my-applications flows after changes.
3. Implement or formally defer central `/api/v1/jobs` and `/api/v1/applications`.

---

## 11. Success metrics (suggested)

| Metric | Definition | Baseline |
|--------|------------|----------|
| Time to first triage | Staff opens application detail from pipeline | Qualitative — flow exists |
| Apply completion rate | Started apply → submitted application | Not instrumented |
| Invalid transition rate | PATCH rejected due to rules | Audit via `application_status_events` |
| CV parse success rate | Upload → confirmed profile | Not instrumented |
| Accessibility defects | WCAG audit open items | See audit report |

Instrumentation and analytics are **planned**; no product analytics layer is implemented.

---

## 12. Release and environment

| Environment | Command | Apps |
|-------------|---------|------|
| Local dev | `npm run dev:all` | 3000, 3001, 3002, 4000 |
| Database | `npm run db:migrate` | PostgreSQL via root `.env` |

See [ATS_Local_Environment_Specification.md](ATS_Local_Environment_Specification.md) for env vars (`DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `UPLOAD_ROOT`).

---

## 13. Related documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) | Monorepo layout and scripts |
| [API_Dictionary.md](API_Dictionary.md) | HTTP API entry point |
| [db-schema.md](db-schema.md) | Relational model |
| [ATS_Application_State_UI_API_Requirements.md](ATS_Application_State_UI_API_Requirements.md) | Pipeline product spec |
| [api/backoffice-applications.md](api/backoffice-applications.md) | Staff BFF contract |
| [api/my-applications-routes.md](api/my-applications-routes.md) | Candidate BFF contract |
| [implementation-alignment-2026.md](../reports/implementation-alignment-2026.md) | Spec vs code alignment |
| [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) | TH-coded feature backlog (done / partial / planned) |
| [FEATURE_BACKLOG_CURSOR_PROMPTS.md](./FEATURE_BACKLOG_CURSOR_PROMPTS.md) | Copy-paste Cursor Agent prompt per TH feature |
| [design-system/README.md](../design-system/README.md) | UI tokens and layouts |

---

## 14. Document history

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 20 May 2026 | — | Initial PRD synthesized from specs and as-built implementation |

---

*This PRD describes what has been built and documented. For endpoint-level detail, prefer the API dictionary and module-specific specs over this summary.*
