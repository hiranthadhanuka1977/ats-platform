# TalentHub — Feature Backlog

**Product:** TalentHub ATS  
**Document version:** 1.1  
**Date:** 19 May 2026  
**Ground truth:** [PRD.md](./PRD.md) · as-built codebase (May 2026)

This backlog lists platform capabilities with **TH-** feature codes. It reflects what is **implemented today**, what is **partial**, and what remains **planned** or **out of scope** for the SME-first product direction.

**User stories:** Every feature has a plain-language **user story** in **[FEATURE_BACKLOG_CURSOR_PROMPTS.md](./FEATURE_BACKLOG_CURSOR_PROMPTS.md)** — search for `#### TH-XXX` or use the [quick reference](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#quick-reference--open-work-stories) for open work.

---

## Legend

### Status

| Status | Meaning |
|--------|---------|
| **Done** | Shipped and usable in local/dev as-built |
| **Partial** | Core exists; gaps noted in Description |
| **Planned** | Specified or stubbed; not fully delivered |
| **Out of scope** | Explicitly deferred for current product phase |

### Priority (planned / partial items only)

| Priority | Meaning |
|----------|---------|
| **P0** | Blocks core hiring loop or trust |
| **P1** | High value for SME adoption; near-term |
| **P2** | Important; medium-term |
| **P3** | Nice-to-have / enterprise stretch |

### Apps

| Tag | Application | Port |
|-----|-------------|------|
| **CP** | candidate-portal | 3000 |
| **MA** | my-applications | 3002 |
| **BO** | backoffice | 3001 |
| **API** | apps/api (Hono) | 4000 |
| **PKG** | packages/* | — |

### PRD cross-reference

Where applicable, **PRD ID** maps to requirement rows in [PRD §5](./PRD.md#5-functional-requirements).

### User stories

| Status | How to read the story |
|--------|------------------------|
| **Done** | Describes behaviour users should experience today — use for QA checklists |
| **Partial** | Core journey exists; acceptance criteria include the known gap |
| **Planned** | Future capability from the user's perspective |
| **Out of scope** | Explains why the capability is deferred |

Stories live in **[FEATURE_BACKLOG_CURSOR_PROMPTS.md](./FEATURE_BACKLOG_CURSOR_PROMPTS.md)**.

---

## Summary

| Status | Count |
|--------|------:|
| Done | 88 |
| Partial | 6 |
| Planned | 25 |
| Out of scope | 4 |
| **Total** | **123** |

---

## 1. Platform & infrastructure

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-001 | npm monorepo (four runtime apps + shared packages) | PKG | Done | — | — | `npm run dev:all` |
| TH-002 | Single PostgreSQL schema via `@ats-platform/db` | PKG | Done | — | — | Prisma migrations at repo root |
| TH-003 | Local filesystem upload storage (`UPLOAD_ROOT`) | PKG | Done | — | — | `storage/cvs/`, `storage/cover-letters/` |
| TH-004 | Shared Zod validators (`@ats-platform/validators`) | PKG | Done | — | — | BFF + API payloads |
| TH-005 | Shared types and status transition matrix | PKG | Done | — | — | `@ats-platform/types` |
| TH-006 | Shared UI primitives (`@ats-platform/ui`) | PKG | Done | — | — | Used where cross-app |
| TH-007 | Local-first dev environment spec | PKG | Done | — | — | See [ATS_Local_Environment_Specification.md](./ATS_Local_Environment_Specification.md) |
| TH-008 | Cloud object storage (S3-compatible) | PKG | Planned | — | P2 | Replace local disk for production |
| TH-009 | Email delivery service (OTP, status, interview) | PKG | Planned | — | P0 | Dev OTP hardcoded; `notifyCandidate*` not wired |
| TH-010 | Product analytics / success metrics instrumentation | PKG | Planned | PRD §11 | P2 | Apply completion, triage time, parse rate |
| TH-011 | Multi-tenant / per-company data isolation | PKG | Out of scope | PRD §10 | — | Single-tenant assumptions today |
| TH-012 | Horizontal scaling / CDN / job queue | PKG | Planned | PRD §8.4 | P3 | Dev-oriented architecture |

*User stories: [§1 Platform](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#1-platform--infrastructure) (TH-001–TH-012)*

---

## 2. Candidate portal (public discovery)

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-020 | Published job listings with pagination | CP | Done | CP-01 | — | Server-side Prisma |
| TH-021 | Filters: department, location, employment type, experience, remote | CP | Done | CP-02 | — | URL search params |
| TH-022 | Full-text search on title/summary | CP | Done | CP-03 | — | `q` parameter |
| TH-023 | Job detail: overview, responsibilities, qualifications, skills, benefits, tags | CP | Done | CP-04 | — | `/jobs/[slug]` |
| TH-024 | Salary display when `is_salary_visible` | CP | Done | CP-05 | — | |
| TH-025 | Featured job highlighting | CP | Done | CP-06 | — | |
| TH-026 | Banner image on job detail | CP | Done | CP-07 | — | |
| TH-027 | Apply CTA redirects to My Applications | CP | Done | CP-08 | — | No in-portal apply |
| TH-028 | Accessible shell (skip link, sticky header, footer) | CP | Done | CP-09 | — | WCAG-oriented |
| TH-029 | Bookmark jobs | CP | Planned | CP-11 | P2 | `bookmarks` table exists; no portal API/UI |
| TH-030 | Candidate auth / apply inside portal | CP | Out of scope | CP-10 | — | Port 3002 owns auth + apply |

*User stories: [§2 Candidate portal](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#2-candidate-portal) (TH-020–TH-030)*

---

## 3. My Applications (candidate workspace)

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-040 | Register with email and password | MA, API | Done | MA-01 | — | Central API |
| TH-041 | Email verification via OTP | MA, API | Done | MA-02 | — | Dev OTP `111111` |
| TH-042 | Login, logout, session refresh | MA, API | Done | MA-03 | — | Bearer JWT; 15m idle logout |
| TH-043 | Forgot / reset password UI | MA | Partial | MA-04 | P1 | API exists; no candidate UI |
| TH-044 | Dashboard with onboarding journey and recent applications | MA | Done | MA-05 | — | |
| TH-045 | Job search (published jobs) | MA | Done | MA-06 | — | Simpler filters than portal |
| TH-046 | Job detail and apply flow | MA | Done | MA-07 | — | CV required; optional cover letter |
| TH-047 | Application list with status | MA | Done | MA-08 | — | |
| TH-048 | CV upload (PDF, DOC, DOCX, max 10 MB) | MA | Done | MA-09 | — | |
| TH-049 | CV text extraction + OpenAI parse → structured profile | MA | Done | MA-10 | — | Requires `OPENAI_API_KEY` |
| TH-050 | CV library: list, default, download, delete | MA | Done | MA-11 | — | |
| TH-051 | Cover letter library (file + text modes) | MA | Done | MA-12 | — | |
| TH-052 | Screening questions on apply | MA | Done | MA-13 | — | Per-application fields |
| TH-053 | Profile screenshot import (LinkedIn-style) | MA | Partial | MA-14 | P3 | Prototype on `/my-profile` |
| TH-054 | Bookmark jobs | MA | Planned | MA-15 | P2 | Schema only |
| TH-055 | Withdraw application (candidate-initiated) | MA | Planned | MA-16 | P1 | `withdrawn` status in pipeline; candidate UI TBD |
| TH-056 | Candidate timezone on profile | MA | Partial | — | P1 | DB field `timeZone`; no edit UI; used in interview preview |
| TH-057 | Mobile-optimised apply flow | MA | Partial | — | P1 | Responsive web; audit gaps on small targets |
| TH-058 | Production email OTP (replace dev code) | MA, API | Planned | — | P0 | Depends on TH-009 |

*User stories: [§3 My Applications](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#3-my-applications) (TH-040–TH-058)*

---

## 4. Backoffice — authentication & shell

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-070 | Staff login with httpOnly session cookies | BO | Done | BO-01 | — | Prisma `users` |
| TH-071 | Staff roles: admin, recruiter, hiring_manager | BO | Done | BO-02 | — | Enum on `User` |
| TH-072 | Sidebar, top bar, mobile navigation shell | BO | Done | BO-03 | — | `BackOfficeShell` |
| TH-073 | Skip link and session activity tracking | BO | Done | BO-04 | — | |
| TH-074 | Middleware protection on dashboard routes | BO | Done | BO-05 | — | Cookie `bo_access` |
| TH-075 | SSO / OAuth staff login | BO | Out of scope | PRD §10 | — | Email/password only |

*User stories: [§4 Backoffice auth](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#4-backoffice--auth--shell) (TH-070–TH-075)*

---

## 5. Backoffice — dashboard

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-080 | KPI stat row (open jobs, applications, etc.) | BO | Done | BO-10 | — | |
| TH-081 | Pipeline health snapshot | BO | Done | BO-11 | — | |
| TH-082 | Recent activity feed | BO | Done | BO-12 | — | |
| TH-083 | Efficiency score card | BO | Done | BO-13 | — | |
| TH-084 | Curator insight (stalled interviews) | BO | Done | BO-14 | — | |

*User stories: [§5 Dashboard](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#5-backoffice--dashboard) (TH-080–TH-084)*

---

## 6. Backoffice — job posting

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-090 | Jobs list with search, filters, pagination | BO | Done | BO-20 | — | |
| TH-091 | Create job (multi-section form) | BO | Done | BO-21 | — | |
| TH-092 | Edit existing job | BO | Done | BO-22 | — | |
| TH-093 | Review step before publish | BO | Done | BO-23 | — | |
| TH-094 | Publish / draft status | BO | Done | BO-24 | — | |
| TH-095 | Candidate-facing job preview | BO | Done | BO-25 | — | `/jobs/[id]/preview` |
| TH-096 | Relational content: responsibilities, qualifications, skills, benefits, tags | BO | Done | BO-26 | — | |
| TH-097 | Salary range and visibility toggle | BO | Done | BO-27 | — | |
| TH-098 | Remote and featured flags | BO | Done | BO-28 | — | |
| TH-099 | Banner image URL and alt text | BO | Done | BO-29 | — | |

*User stories: [§6 Jobs](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#6-backoffice--jobs) (TH-090–TH-099)*

---

## 7. Backoffice — applications & pipeline

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-110 | Applications table view with sort and filters | BO | Done | BO-30 | — | |
| TH-111 | Kanban pipeline view (default) | BO | Done | BO-31 | — | Drag-and-drop status changes |
| TH-112 | Toggle list ↔ pipeline; fullscreen pipeline mode | BO | Done | BO-32 | — | |
| TH-113 | Week-scoped pipeline (past + current week only) | BO | Done | BO-33 | — | No future weeks |
| TH-114 | Ten application statuses with server-validated transitions | BO | Done | BO-34 | — | See PRD §6 |
| TH-115 | Status PATCH with reason, notes, optimistic concurrency | BO | Done | BO-35 | — | 409 on conflict |
| TH-116 | Undo last status change | BO | Done | BO-36 | — | Inline undo in banner |
| TH-117 | Reopen from rejected (controlled action) | BO | Done | BO-37 | — | Mandatory reason |
| TH-118 | Application detail packet page | BO | Done | BO-38 | — | `/applications/[id]` |
| TH-119 | Download CV and cover letter (staff) | BO | Done | BO-39 | — | Authenticated BFF |
| TH-120 | Schedule interview (one row per application) | BO | Done | BO-40 | — | `application_interviews` |
| TH-121 | Interview form: date, start time, duration (15–120 min) | BO | Done | — | — | Schedule modal |
| TH-122 | Interview scheduling timezone (IANA) + candidate time preview | BO | Done | — | — | `schedulingTimeZone` on interview |
| TH-123 | Gate: interview required before `interview_scheduled` status | BO | Done | BO-62 | — | API validation |
| TH-124 | Cancel scheduled interview on backward pipeline move | BO | Done | — | — | Modal + `cancelInterview` payload |
| TH-125 | Status change audit log | BO | Done | BO-42 | — | `application_status_events` |
| TH-126 | Terminal columns: Rejected, Withdrawn | BO | Done | BO-43 | — | Separate from active board |
| TH-127 | Pipeline keyboard “Move to” menu (drag alternative) | BO | Done | — | — | Accessibility |
| TH-128 | AI relevance score on applications | BO | Partial | BO-41 | P2 | Requires `OPENAI_API_KEY`; optional |
| TH-129 | AI bias awareness notice on relevance UI | BO | Done | — | — | Flyover + Kanban tooltips |
| TH-130 | Email notification on status change | BO | Planned | BO-44 | P0 | `notifyCandidate` field; delivery TBD |
| TH-131 | Email notification on interview schedule | BO | Planned | — | P0 | `notifyCandidateEmail` queued flag only |
| TH-132 | Reschedule interview (PATCH) | BO | Planned | — | P2 | Not implemented; cancel + recreate workaround |
| TH-133 | Side drawer quick-view on pipeline card | BO | Planned | — | P3 | Spec mentioned; full page used today |

*User stories: [§7 Applications & pipeline](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#7-backoffice--applications--pipeline) (TH-110–TH-133)*

---

## 8. Backoffice — candidates

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-140 | Candidates summary dashboard | BO | Done | BO-50 | — | |
| TH-141 | Searchable candidates table | BO | Done | BO-51 | — | |
| TH-142 | Candidate detail: profile, CV history, applications | BO | Done | BO-52 | — | |
| TH-143 | Edit candidate account status | BO | Done | BO-53 | — | |
| TH-144 | Return navigation from candidate → applications context | BO | Done | BO-54 | — | `?from=applications` |
| TH-145 | Harden staff auth on candidate status PATCH | BO | Planned | — | P1 | Alignment report follow-up |

*User stories: [§8 Candidates](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#8-backoffice--candidates) (TH-140–TH-145)*

---

## 9. Backoffice — interviews

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-150 | Interviews calendar page | BO | Done | BO-60 | — | `/interviews` |
| TH-151 | Schedule from application detail | BO | Done | BO-61 | — | |
| TH-152 | Calendar sync (Google / Outlook) | BO | Planned | — | P2 | In-product scheduling only today |

*User stories: [§9 Interviews](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#9-backoffice--interviews) (TH-150–TH-152)*

---

## 10. Backoffice — administration

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-160 | CRUD companies | BO | Done | BO-70 | — | `/administration/companies` |
| TH-161 | CRUD departments and locations | BO | Done | BO-71 | — | |
| TH-162 | CRUD employment types and experience levels | BO | Done | BO-72 | — | |
| TH-163 | CRUD skills, tags, benefits | BO | Done | BO-73 | — | |
| TH-164 | Staff user management UI | BO | Planned | BO-74 | P1 | No admin CRUD for `users` yet |
| TH-165 | Reports and analytics | BO | Planned | BO-75 | P2 | Placeholder page only |
| TH-166 | System settings | BO | Planned | BO-76 | P2 | Placeholder page only |

*User stories: [§10 Administration](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#10-backoffice--administration) (TH-160–TH-166)*

---

## 11. Central API (Hono)

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-170 | Health probe | API | Done | API-01 | — | `/health` |
| TH-171 | Staff and candidate login (audience-aware JWT) | API | Done | API-02 | — | |
| TH-172 | `/auth/me`, logout, refresh | API | Done | API-03 | — | |
| TH-173 | Candidate register, verify, resend OTP | API | Done | API-04 | — | |
| TH-174 | Forgot / reset password API | API | Done | API-05 | — | |
| TH-175 | Jobs REST API (`/api/v1/jobs`) | API | Planned | API-06 | P2 | Stub only; logic in Next BFFs |
| TH-176 | Applications REST API | API | Planned | API-07 | P2 | Stub only |
| TH-177 | Interviews REST API | API | Planned | API-08 | P2 | Stub only |
| TH-178 | Users REST API | API | Planned | — | P2 | Stub only |
| TH-179 | Notifications service | API | Out of scope | API-09 | — | Stub; no Prisma model |
| TH-180 | Migrate backoffice BFF logic to Hono modules | API, BO | Planned | PRD §10 | P2 | Documented alignment step |

*User stories: [§11 Central API](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#11-central-api-hono) (TH-170–TH-180)*

---

## 12. Non-functional & compliance

| Code | Feature | App | Status | PRD | Priority | Notes |
|------|---------|-----|--------|-----|----------|-------|
| TH-190 | WCAG 2.2 Level AA target | All | Partial | PRD §8.1 | P1 | [wcag22-audit.md](../reports/wcag22-audit.md) rev 1.1 — 17 fails |
| TH-191 | Pipeline / status modal focus trap and Escape | BO | Planned | — | P1 | Audit gap |
| TH-192 | Footer legal pages (Privacy, Terms, Accessibility) | CP, MA | Planned | — | P2 | Currently `href="#"` |
| TH-193 | PDPA/GDPR hardening (HttpOnly candidate tokens) | MA | Planned | PRD §8.2 | P2 | [pdpa-gdpr-audit.md](../reports/pdpa-gdpr-audit.md) |
| TH-194 | Password hashing and account lockout | API | Done | PRD §8.3 | — | bcrypt |
| TH-195 | Staff route middleware; candidate Bearer JWT | BO, MA | Done | PRD §8.3 | — | |
| TH-196 | File upload type and size validation | MA | Done | PRD §8.3 | — | CV endpoints |
| TH-197 | HTML design system catalog | All | Done | PRD §8.5 | — | [design-system/index.html](../design-system/index.html) |
| TH-198 | Responsive web (no native apps) | All | Done | PRD §10 | — | Mobile gaps tracked in audits |

*User stories: [§12 Non-functional](./FEATURE_BACKLOG_CURSOR_PROMPTS.md#12-non-functional--compliance) (TH-190–TH-198)*

---

## Prioritized backlog — open work

Items with status **Partial** or **Planned**, ordered by priority.

### P0 — Core loop / trust

| Code | Feature | App | Effort hint |
|------|---------|-----|-------------|
| TH-009 | Email delivery service | PKG | Large |
| TH-058 | Production email OTP | MA, API | Medium (depends TH-009) |
| TH-130 | Status change email to candidate | BO | Medium (depends TH-009) |
| TH-131 | Interview schedule email to candidate | BO | Medium (depends TH-009) |

### P1 — SME adoption

| Code | Feature | App | Effort hint |
|------|---------|-----|-------------|
| TH-043 | Forgot / reset password UI | MA | Small |
| TH-055 | Withdraw application (candidate) | MA | Medium |
| TH-056 | Candidate timezone edit on profile | MA | Small |
| TH-057 | Mobile apply UX hardening | MA | Medium |
| TH-145 | Staff auth on candidate status PATCH | BO | Small |
| TH-164 | Staff user management UI | BO | Medium |
| TH-190 | WCAG remediation (critical paths) | All | Medium |
| TH-191 | Pipeline modal focus trap | BO | Small |

### P2 — Growth & platform

| Code | Feature | App | Effort hint |
|------|---------|-----|-------------|
| TH-008 | Cloud object storage | PKG | Medium |
| TH-010 | Product analytics | PKG | Medium |
| TH-029 | Bookmark jobs (portal) | CP | Medium |
| TH-054 | Bookmark jobs (workspace) | MA | Medium |
| TH-128 | AI relevance scoring (production-ready) | BO | Medium |
| TH-132 | Reschedule interview | BO | Medium |
| TH-150 | Calendar sync (Google/Outlook) | BO | Large |
| TH-165 | Reports and analytics | BO | Large |
| TH-166 | System settings | BO | Medium |
| TH-175 | Jobs REST API | API | Large |
| TH-176 | Applications REST API | API | Large |
| TH-177 | Interviews REST API | API | Medium |
| TH-178 | Users REST API | API | Medium |
| TH-180 | BFF → Hono migration | API, BO | Large |
| TH-192 | Footer legal pages | CP, MA | Small |
| TH-193 | HttpOnly candidate token migration | MA | Medium |

### P3 — Stretch

| Code | Feature | App | Effort hint |
|------|---------|-----|-------------|
| TH-012 | Horizontal scaling / CDN | PKG | Large |
| TH-053 | Profile screenshot import (production) | MA | Medium |
| TH-133 | Pipeline side drawer quick-view | BO | Medium |

---

## Out of scope (current phase)

| Code | Feature | Rationale |
|------|---------|-----------|
| TH-011 | Multi-tenant isolation | Single-tenant SME MVP |
| TH-030 | Candidate auth in portal | My Applications owns auth |
| TH-075 | SSO / OAuth staff login | Email/password sufficient for MVP |
| TH-179 | Notifications microservice | No DB model; defer |

*Native mobile apps are not planned; all surfaces are responsive web (see TH-198).*

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 19 May 2026 | Initial backlog from PRD v1.0 and as-built codebase |
| 1.2 | 21 May 2026 | Replaced Cursor prompts with plain-language user stories in companion doc |

---

## Related documentation

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product requirements and status summary |
| [ATS_Application_State_UI_API_Requirements.md](./ATS_Application_State_UI_API_Requirements.md) | Pipeline rules and BFF contracts |
| [API_Dictionary.md](./API_Dictionary.md) | HTTP API entry point |
| [implementation-alignment-2026.md](../reports/implementation-alignment-2026.md) | Spec vs code alignment |
| [FEATURE_BACKLOG_CURSOR_PROMPTS.md](./FEATURE_BACKLOG_CURSOR_PROMPTS.md) | User story per TH feature |
| [wcag22-audit.md](../reports/wcag22-audit.md) | Accessibility backlog input |
| [pdpa-gdpr-audit.md](../reports/pdpa-gdpr-audit.md) | Privacy backlog input |
