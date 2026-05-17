# Case study — Staff applications workflow (ATS backoffice)

**Role:** Product Designer  
**Project type:** Product slice within a hiring / ATS platform monorepo  
**Timeline:** *[Add your dates, e.g. “3 weeks, iterative”]*  
**Team:** *[Solo / with engineers — fill in]*  
**Tools:** Figma *(recommended)*, Notion, GitHub, Cursor / VS Code *(implementation collaboration)*

---

> **How to use in Notion:** Import this file or paste by section. Replace `[bracketed placeholders]` with your screenshots, Figma links, and metrics. Delete this callout after import.

---

## 1. Overview

Hiring teams need to **review applications at volume** without losing context: who applied, for which role, with which documents, and where they sit in the funnel. This case study covers a **staff backoffice** slice that connects **list views**, a **status pipeline**, and a **dedicated application detail** surface—so recruiters can move quickly from triage to deep read without dead ends.

**What I owned**

- Problem framing, IA alignment, and primary user journeys  
- Interaction model for **table vs pipeline**, **week-scoped pipeline**, and **navigation return paths**  
- Specification for edge cases (future weeks, drag vs click, cross-linking candidate and job)  
- Collaboration with implementation: patterns, acceptance-style criteria, and content model clarity  

**Outcome**

- A coherent **Applications** hub: **table** (grouped by candidate) and **pipeline** (status columns)  
- **Week-based pipeline navigation** (previous / next / this week) with a guard against selecting **future** weeks  
- **Application detail** page with applicant summary (aligned with candidate profile patterns), job context, submission answers, and **CV / cover letter** access patterns appropriate for staff tools  
- **Deep links** from applications listing to candidate profile with a **back path** to Applications  

---

## 2. Problem

**Primary problem**

Staff users need to **scan, prioritise, and act** on applications while preserving **trust in data** (correct person, correct job, correct artefacts) and **orientation** (where they came from, where to go next).

**Pain points addressed**

- **Cognitive overload** when every application is shown in the pipeline at once  
- **Fragmented context** when job, person, and documents live in disconnected mental models  
- **Dead-end navigation** when drilling from a list into a profile without a sensible return path  
- **Operational risk** when status changes are easy to mis-trigger alongside navigation (e.g. drag vs click)  

**Constraints**

- Internal tool velocity: reuse existing **design tokens / card / table** patterns where possible  
- Multi-app platform: candidate documents may originate from **my-applications**; staff UI must not assume public URLs alone  
- Honest scope: this is a **platform slice**; metrics below are suggested, not claimed without your data  

---

## 3. Users and goals

**Primary persona — Staff recruiter / hiring coordinator**

- Reviews new applications daily  
- Updates pipeline status as decisions progress  
- Occasionally needs **full application packet** (CV, cover letter, structured answers) in one place  

**Jobs to be done (JTBD)**

- *When I open Applications, I want to see what’s new and grouped by person so I don’t duplicate outreach.*  
- *When I work the funnel, I want a pipeline by time window so I focus on this week’s cohort.*  
- *When I need detail, I want one page that summarises the applicant and the submission, with links to edit the job or open the candidate profile.*  

---

## 4. Process (design → implementation)

### 4.1 Discover and frame

- Mapped existing **backoffice** areas (dashboard, jobs, candidates, applications) to avoid orphan flows  
- Wrote lightweight **user stories** and **acceptance-style notes** (see appendix `02-user-stories-and-jtbd.md`)  
- Captured **competitive / pattern** notes for ATS tables + kanban (see `03-competitive-and-pattern-notes.md`)  

### 4.2 Structure and flows

- Documented **IA** and primary routes (see `04-information-architecture.md`)  
- Drew **task flows**: list → pipeline → detail → back; list → candidate → back (see `05-task-flows.md`)  

### 4.3 Design explorations

- **Table view:** candidate-centric grouping with clear secondary rows for multiple applications  
- **Pipeline view:** columns mapped to **application status**; **week scope** controlled at the top  
- **Application detail:** modular sections (job & timeline, submission, documents, applicant deep link, profile mirror)  

Wireframe / state notes live in `06-wireframes-and-states.md`.  
*[Screenshot: Applications — table view]*  
*[Screenshot: Applications — pipeline with week controls]*  
*[Screenshot: Application detail — documents + applicant]*  

### 4.4 Specification and handoff

- Interaction spec: week boundaries, disabled “next week” when at current week, pipeline card **click** vs **drag** behaviour, query param for **return navigation** (`from=applications`)  
- Content model: Application ↔ Candidate ↔ JobPosting; cover letter stored as **reference id** or **text**; CV reference via application `resumeUrl` pattern (see `07-interaction-spec-handoff.md`, `08-content-model.md`)  

### 4.5 Validation (lightweight)

- Usability script with 5 tasks in `09-usability-test-plan.md`  
- *[Add results: completion rate, quotes, changes made]*  

### 4.6 Build and QA (designer involvement)

- Aligned on **shared status labels** across surfaces for consistent language  
- Verified **orientation**: back links and deep links behave as specified  
- Confirmed **edge states**: empty week, updating status, no CV / no cover letter  

---

## 5. Solution (what shipped — narrative)

### Applications hub

- **Table** and **Pipeline** tabs for one mental model, two modes of work (scan vs funnel)  
- Table supports **candidate grouping** and links into **candidate profile** with return context to Applications  

### Pipeline — week-scoped

- Pipeline content filters by **submitted week** (documented as **UTC Monday–Sunday** in product copy for consistency with timestamps)  
- Controls: **Previous week**, **Next week** (disabled at current week — **no future weeks**), **This week** when navigated into the past  

### Application detail

- Route: **`/applications/[id]`**  
- Sections: job & timeline, submission fields, documents (submitted CV, default profile CV, cover letter file or text), applicant link, profile / experience / education summary consistent with candidate detail patterns  
- Job link to **edit** surface for operational follow-up  

### Trust and access (design implication)

- Staff-only attachment endpoints support **secure download** without assuming a candidate bearer token in the browser—documented as a **design + eng** decision in appendices  

---

## 6. Impact

*[Replace with your real data. Examples:]*

| Signal | Before | After |
|--------|--------|-------|
| Time to open full packet | *[e.g. 3+ navigations]* | *[e.g. 1 page + downloads]* |
| Pipeline focus | All-time mix | Week cohort |
| Orientation errors | *[subjective]* | Explicit back + query param |

Qualitative: *[1–2 recruiter quotes]*  

---

## 7. Reflection

**What worked**

- Pairing **two list modes** (table + pipeline) to match different review rhythms  
- Making **time scope** explicit in the pipeline reduced ambient noise  
- A single **application detail** anchor reduced context switching  

**Tradeoffs**

- **UTC weeks** simplify engineering consistency but may need a future toggle for **local timezone** if users are global  
- **Drag + click** on the same card required a deliberate micro-interaction rule to avoid accidental navigation after drag  
- **Currency / salary display** choices (e.g. GBP) should follow org locale in a production pass  

**Next iteration**

- Inline preview for PDFs  
- Audit trail per status change  
- Saved filters and saved weeks for teams  

Full tradeoff write-up: `11-reflection-tradeoffs.md`  

---

## 8. Appendix index (on disk)

All files live alongside this document in `portfolio/product-designer-ats-backoffice/`:

- `01-problem-framing-and-role.md`  
- `02-user-stories-and-jtbd.md`  
- `03-competitive-and-pattern-notes.md`  
- `04-information-architecture.md`  
- `05-task-flows.md`  
- `06-wireframes-and-states.md`  
- `07-interaction-spec-handoff.md`  
- `08-content-model.md`  
- `09-usability-test-plan.md`  
- `10-before-after.md`  
- `11-reflection-tradeoffs.md`  
- `12-presentation-deck-outline.md`  
- `13-loom-video-script.md`  
- `14-screen-and-route-inventory.md`  

---

## 9. Credits and confidentiality

**Your name:** *[Add]*  
**Links:** *[Figma, prototype, GitHub (if public)]*  
**Confidentiality:** If this repo is private, use **blurred screenshots** or **redacted Figma** for public portfolio.

---

*End of Notion case study body.*
