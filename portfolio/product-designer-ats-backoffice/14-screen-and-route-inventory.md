# Screen and route inventory (repo ground truth)

*Generated as a designer-facing map of implemented routes for the portfolio slice. Paths are relative to `apps/backoffice` unless noted.*

## Staff applications slice

| Route file | URL | Purpose |
|------------|-----|---------|
| `src/app/(dashboard)/applications/page.tsx` | `/applications` | Applications hub — client component for table + pipeline |
| `src/app/(dashboard)/applications/[id]/page.tsx` | `/applications/[id]` | Application detail — server page |
| `src/components/applications/ApplicationsPageClient.tsx` | *(used by `/applications`)* | Table / pipeline UI, week logic, status patch |
| `src/components/applications/PipelineApplicationCard.tsx` | *(used in pipeline)* | Card drag + click navigation guard |

## API (staff)

| Route file | Method | Purpose |
|------------|--------|---------|
| `src/app/api/backoffice/applications/[id]/status/route.ts` | `PATCH` | Update application status |
| `src/app/api/backoffice/applications/[id]/attachments/cv/route.ts` | `GET` | Staff download submitted CV |
| `src/app/api/backoffice/applications/[id]/attachments/cover-letter/route.ts` | `GET` | Staff download cover letter file |

## Related staff surfaces

| Route file | URL | Portfolio relevance |
|------------|-----|---------------------|
| `src/app/(dashboard)/candidates/[id]/page.tsx` | `/candidates/[id]` | Candidate detail; respects `?from=applications` for back link |
| `src/app/(dashboard)/candidates/all/page.tsx` | `/candidates/all` | Default back target when not from applications |
| `src/app/(dashboard)/jobs/[id]/edit/page.tsx` | `/jobs/[id]/edit` | Linked from application detail for job corrections |

## Shared product language

| Package | Note |
|---------|------|
| `packages/types` — application status | Labels + descriptions for consistent status copy |

## Candidate-side (context only)

| App | Note |
|-----|------|
| `apps/my-applications` | Apply flow writes `resumeUrl`, `coverLetter` reference, storage paths |
| Env `NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL` | Resolves relative profile CV URLs in backoffice |

---

## Screenshot checklist for portfolio

- [ ] `/applications` — table with grouped candidate  
- [ ] `/applications` — pipeline with week toolbar  
- [ ] `/applications/[id]` — header + submission + documents  
- [ ] `/candidates/[id]?from=applications` — back link label  
- [ ] Disabled **Next week** state (tooltip optional in caption)  
