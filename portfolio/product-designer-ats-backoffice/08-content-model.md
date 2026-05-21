# Content model (designer-friendly)

*Aligned with [PRD §6–§7](../../docs/specification/PRD.md) and `packages/db/prisma/schema.prisma`.*

## Core entities

| Entity | What it represents |
|--------|---------------------|
| **Application** | One candidate’s application to **one** job posting (unique pair) |
| **ApplicationStatusEvent** | Audit row for each status change (who, when, from → to, reason) |
| **ApplicationInterview** | **One** scheduled interview per application (required before `interview_scheduled` status) |
| **CandidateAccount** | Authenticated candidate; holds profile, CV artefacts, history |
| **JobPosting** | Role being hired (draft or published) |
| **CandidateCvParse** | Parsed CV file record (stored path, mime, filename) |
| **CandidateCoverLetter** | Cover letter as **text** or **file** (with optional `fileUrl`) |
| **User** | Staff account (admin, recruiter, hiring_manager) |

---

## Application status vocabulary (10 values)

| API / DB value | Pipeline column | Terminal |
|----------------|-----------------|----------|
| `submitted` | Submitted | No |
| `under_review` | Under Review | No |
| `shortlisted` | Shortlisted | No |
| `interview_scheduled` | Interview Scheduled | No |
| `interview_completed` | Interview Completed | No |
| `offered` | Offered | No |
| `hired` | Hired | Yes |
| `rejected` | Rejected | Yes* |
| `withdrawn` | Withdrawn | Yes |

\* **Rejected** allows controlled **reopen** to `under_review` or `shortlisted` only (not drag-and-drop).

Shared **`@ats-platform/types`** metadata (label + long description) keeps **table**, **pipeline**, and **detail** aligned. Transition rules: `APPLICATION_STATUS_TRANSITIONS`.

---

## Application — fields relevant to UI

| Field | User-facing purpose |
|-------|---------------------|
| `status` | Pipeline column + labels |
| `appliedAt` | Table + pipeline week filter |
| `updatedAt` | Table + detail; optimistic concurrency |
| `resumeUrl` | Often a **relative** download URL pointing at a specific **CV parse id** |
| `coverLetter` | Either `cover_letter_id:{uuid}` **or** legacy plain text |
| Structured answers | Experience, notice, salary, relocate, work mode, motivation, etc. |
| Relevance score | Optional AI score on pipeline cards *(partial — OpenAI)* |

---

## Status events (audit)

Each PATCH, undo, or reopen writes an **ApplicationStatusEvent**:

- Previous and new status
- Optional reason, note, actor
- Timestamp for history timeline on application detail

---

## Interview record

| Field | User-facing purpose |
|-------|---------------------|
| `scheduledAt` | Calendar display; validation gate for status |
| `locationOrLink` | In-person or video |
| `notes` | Internal context |

**Rule:** moving to `interview_scheduled` (or certain paths from `interview_completed`) requires an existing interview row.

---

## Cover letter storage (conceptual)

1. **File mode:** row in `CandidateCoverLetter` with `fileUrl` under shared storage; application references id.
2. **Text mode:** body stored on row; application references id; UI shows text block.
3. **Legacy:** plain string in `coverLetter` without id prefix — UI may still show text.

---

## CV access paths

| Path | Who authenticates | Designer note |
|------|-------------------|---------------|
| Candidate download API | Candidate bearer token | Candidate-owned (`my-applications`) |
| Backoffice attachment download API | Staff session cookie | Staff-owned; avoids token mismatch |

Storage: `storage/cvs/{candidateAccountId}/`, `storage/cover-letters/{candidateAccountId}/` (PRD §4.4).

---

## Environment (for portfolio honesty)

- **`NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL`:** resolves **relative** profile CV URLs to absolute candidate-app URL in staff UI.
- **`UPLOAD_ROOT`:** defaults to repo `storage/` in dev.
- **`OPENAI_API_KEY`:** optional; enables CV parse (candidate) and relevance scoring (staff pipeline).

---

## Reference

- [db-schema.md](../../docs/specification/db-schema.md)
- [backoffice-applications.md](../../docs/specification/api/backoffice-applications.md)
