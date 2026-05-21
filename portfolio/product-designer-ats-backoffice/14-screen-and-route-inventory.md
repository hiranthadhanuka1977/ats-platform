# Screen and route inventory (repo ground truth)

*Aligned with [PRD §5](../../docs/specification/PRD.md) — May 2026. Paths relative to `apps/backoffice` unless noted.*

## Platform apps (context)

| App | Port | Key routes |
|-----|------|------------|
| `candidate-portal` | 3000 | `/`, `/jobs/[slug]` — public browse; auth redirects to 3002 |
| `my-applications` | 3002 | `/login`, `/register`, `/dashboard`, `/cv-upload`, `/jobs/[slug]/apply`, `/my-applications` |
| `backoffice` | 3001 | See below |
| `api` | 4000 | `/api/v1/auth/*`, `/api/v1/candidates/*` (domain routes stub) |

---

## Backoffice — dashboard

| Route file | URL | Purpose | PRD |
|------------|-----|---------|-----|
| `src/app/(dashboard)/page.tsx` | `/` | KPIs, pipeline health, recent activity, efficiency score | BO-10–14 |

---

## Backoffice — applications slice (portfolio focus)

| Route file | URL | Purpose | PRD |
|------------|-----|---------|-----|
| `src/app/(dashboard)/applications/page.tsx` | `/applications` | Applications hub — list + pipeline | BO-30–32 |
| `src/app/(dashboard)/applications/[id]/page.tsx` | `/applications/[id]` | Application detail | BO-38–39 |
| `src/components/applications/ApplicationsPageClient.tsx` | *(used by `/applications`)* | Table/pipeline UI, week logic, status patch, fullscreen | BO-31–33 |
| `src/components/applications/PipelineApplicationCard.tsx` | *(pipeline)* | Card drag + click navigation guard | BO-31 |

---

## Backoffice — jobs

| Route file | URL | Purpose | PRD |
|------------|-----|---------|-----|
| `src/app/(dashboard)/jobs/page.tsx` | `/jobs` | Job list with filters | BO-20 |
| `src/app/(dashboard)/jobs/new/page.tsx` | `/jobs/new` | Create job | BO-21 |
| `src/app/(dashboard)/jobs/new/review/page.tsx` | `/jobs/new/review` | Review before publish | BO-23 |
| `src/app/(dashboard)/jobs/new/success/page.tsx` | `/jobs/new/success` | Post-publish confirmation | BO-24 |
| `src/app/(dashboard)/jobs/[id]/edit/page.tsx` | `/jobs/[id]/edit` | Edit job | BO-22 |
| `src/app/(job-preview)/jobs/[id]/preview/page.tsx` | `/jobs/[id]/preview` | Candidate-facing preview | BO-25 |

---

## Backoffice — candidates & interviews

| Route file | URL | Purpose | PRD |
|------------|-----|---------|-----|
| `src/app/(dashboard)/candidates/page.tsx` | `/candidates` | Summary metrics | BO-50 |
| `src/app/(dashboard)/candidates/all/page.tsx` | `/candidates/all` | Searchable table | BO-51 |
| `src/app/(dashboard)/candidates/[id]/page.tsx` | `/candidates/[id]` | Detail; `?from=applications` back link | BO-52, BO-54 |
| `src/app/(dashboard)/candidates/[id]/edit/page.tsx` | `/candidates/[id]/edit` | Account status edit | BO-53 |
| `src/app/(dashboard)/interviews/page.tsx` | `/interviews` | Interview calendar | BO-60 |

---

## Backoffice — administration & placeholders

| Route file | URL | Purpose | PRD |
|------------|-----|---------|-----|
| `src/app/(dashboard)/administration/[section]/page.tsx` | `/administration/*` | Lookup CRUD | BO-70–73 |
| `src/app/(dashboard)/reports/page.tsx` | `/reports` | Placeholder | BO-75 |
| `src/app/(dashboard)/settings/page.tsx` | `/settings` | Placeholder | BO-76 |
| `src/app/(auth)/login/page.tsx` | `/login` | Staff auth split layout | BO-01 |

---

## API — staff BFF (`/api/backoffice/*`)

| Route | Method | Purpose | PRD |
|-------|--------|---------|-----|
| `applications/[id]/status` | `PATCH` | Update status with validation | BO-35 |
| `applications/[id]/status/undo` | `POST` | Undo last status change | BO-36 |
| `applications/[id]/reopen` | `POST` | Reopen from rejected | BO-37 |
| `applications/[id]/interviews` | `POST` | Schedule interview | BO-40 |
| `applications/[id]/attachments/cv` | `GET` | Staff download submitted CV | BO-39 |
| `applications/[id]/attachments/cover-letter` | `GET` | Staff download cover letter | BO-39 |
| `jobs`, `jobs/[id]`, `jobs/[id]/publish` | various | Jobs CRUD | BO-20–24 |
| `candidates/[id]/status` | `PATCH` | Candidate account status | BO-53 |

Full contract: [backoffice-applications.md](../../docs/specification/api/backoffice-applications.md).

---

## API — candidate BFF (`apps/my-applications`)

| Path prefix | Purpose | PRD |
|-------------|---------|-----|
| `/api/my-applications/cv/*` | Upload, parse, save, download | MA-09–11 |
| `/api/my-applications/cover-letters/*` | Cover letter library | MA-12 |
| `/api/my-applications/applications/*` | Apply, list | MA-07–08 |

---

## Shared packages

| Package | Note |
|---------|------|
| `@ats-platform/types` | `APPLICATION_STATUS_TRANSITIONS`, status labels |
| `@ats-platform/validators` | Status PATCH, reopen, undo schemas |
| `@ats-platform/db` | Prisma client; relevance scoring helper |

---

## Design system

| Asset | Location |
|-------|----------|
| HTML catalog | `docs/design-system/index.html` |
| Layout templates | Portal shell, job listing, auth split, dashboard shell, pipeline viewport |
| Tokens + components | `docs/design-system/tokens.css`, `components.css`, `layouts.css` |

---

## Screenshot checklist for portfolio

- [ ] `/` — dashboard KPIs and pipeline health
- [ ] `/applications` — table with grouped candidate
- [ ] `/applications` — pipeline with week toolbar and fullscreen toggle
- [ ] `/applications` — terminal tabs (Rejected / Withdrawn)
- [ ] `/applications/[id]` — header + submission + documents + status history
- [ ] `/applications/[id]` — schedule interview modal
- [ ] `/interviews` — calendar view
- [ ] `/candidates/[id]?from=applications` — back link label
- [ ] Disabled **Next week** state (tooltip optional in caption)
- [ ] Reject modal with required reason
- [ ] `my-applications` apply flow *(optional — platform context)*
