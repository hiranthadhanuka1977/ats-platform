# Content model (designer-friendly)

## Core entities

| Entity | What it represents |
|--------|---------------------|
| **Application** | One candidate’s application to **one** job posting (unique pair) |
| **CandidateAccount** | Authenticated candidate; holds profile, CV artefacts, history |
| **JobPosting** | Role being hired |
| **CandidateCvParse** | Parsed CV file record (stored path, mime, filename) |
| **CandidateCoverLetter** | Cover letter as **text** or **file** (with optional `fileUrl`) |

---

## Application — fields relevant to UI

| Field | User-facing purpose |
|-------|---------------------|
| `status` | Pipeline column + labels |
| `appliedAt` | Table + pipeline week filter |
| `updatedAt` | Table + detail |
| `resumeUrl` | Often a **relative** download URL pointing at a specific **CV parse id** |
| `coverLetter` | Either `cover_letter_id:{uuid}` **or** legacy plain text |
| Structured answers | Experience, notice, salary, relocate, work mode, motivation, etc. |

---

## Cover letter storage (conceptual)

1. **File mode:** row in `CandidateCoverLetter` with `fileUrl` under shared storage; application references id.  
2. **Text mode:** body stored on row; application references id; UI shows text block.  
3. **Legacy:** plain string in `coverLetter` without id prefix — UI may still show text.  

---

## CV access paths

| Path | Who authenticates | Designer note |
|------|-------------------|----------------|
| Candidate portal download API | Candidate bearer token | Candidate-owned |
| Backoffice attachment download API | Staff session cookie | Staff-owned; avoids token mismatch |

---

## Status vocabulary

- Shared **`@ats-platform/types`** metadata (label + long description) keeps **table**, **pipeline**, and **detail** aligned.  
- **Tooltip / title** on status can expose long description for accessibility and training.  

---

## Environment (for portfolio honesty)

- **`NEXT_PUBLIC_MY_APPLICATIONS_BASE_URL`:** used to resolve **relative** profile CV URLs to an absolute candidate-app URL in staff UI.  
- **`CV_STORAGE_ROOT`:** optional; defaults to repo `storage/cvs` in dev — document for engineers doing local setup.  
