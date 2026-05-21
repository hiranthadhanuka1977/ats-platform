# Case study — TalentHub staff applications workflow (ATS backoffice)

**Role:** Product Designer  
**Project type:** Product slice within **TalentHub ATS** — a multi-app hiring platform monorepo  
**Timeline:** *[Add your dates, e.g. “3 weeks, iterative”]*  
**Team:** *[Solo / with engineers — fill in]*  
**Tools:** Figma *(recommended)*, Notion, GitHub, Cursor / VS Code *(implementation collaboration)*  
**Ground truth:** [PRD — TalentHub ATS Platform](../../docs/specification/PRD.md) (as-built, May 2026)

---

> **How to use in Notion:** Import this file or paste by section. Replace `[bracketed placeholders]` with your screenshots, Figma links, and metrics. Delete this callout after import.

---

## 1. Overview

Hiring teams need to **review applications at volume** without losing context: who applied, for which role, with which documents, and where they sit in the funnel. This case study covers a **staff backoffice** slice within **TalentHub**—a platform that also includes a public job portal, a candidate workspace, and shared auth services.

**Platform context**

| App | Port | Role |
|-----|------|------|
| Candidate portal | 3000 | Public job discovery |
| My Applications | 3002 | Register, CV, apply, track status |
| Backoffice | 3001 | Staff hiring workflows *(this case study)* |
| Central API | 4000 | Auth + candidate registration |

**What I owned**

- Problem framing, IA alignment, and primary user journeys  
- Interaction model for **table vs pipeline**, **week-scoped pipeline**, **status workflow**, and **navigation return paths**  
- Specification for edge cases (future weeks, drag vs click, terminal states, interview gate, cross-linking candidate and job)  
- Design system alignment: tokens, components, **layout templates**  
- Collaboration with implementation: patterns, acceptance-style criteria, and content model clarity  

**Outcome (as-built)**

- **Applications hub:** **table** (grouped by candidate) and **pipeline** (status columns, pipeline default) with **fullscreen** mode  
- **Week-based pipeline navigation** (previous / next / this week) with guard against **future** weeks  
- **Application detail** with applicant summary, job context, submission answers, **status history**, **CV / cover letter** access, and **interview scheduling**  
- **Ten-status lifecycle** with validated transitions, **undo**, **controlled reopen**, and audit logging  
- **Interviews calendar** at `/interviews`  
- **Deep links** from applications to candidate profile with **back path** to Applications  
- **Dashboard** with KPIs, pipeline health, and recent activity  
- **Jobs CRUD** and **administration** lookups supporting the same hiring loop  

---

## 2. Problem

**Primary problem**

Staff users need to **scan, prioritise, and act** on applications while preserving **trust in data** (correct person, correct job, correct artefacts) and **orientation** (where they came from, where to go next).

**Pain points addressed**

- **Cognitive overload** when every application appears in the pipeline at once  
- **Fragmented context** when job, person, and documents live in disconnected surfaces  
- **Dead-end navigation** when drilling from a list into a profile without a sensible return path  
- **Operational risk** when status changes are easy to mis-trigger (drag vs click) or violate hiring rules  
- **Pipeline dishonesty** when status says “Interview Scheduled” but no interview exists  

**Constraints**

- Multi-app platform: candidate documents originate from **my-applications**; staff UI must not assume public URLs alone  
- Internal tool velocity: reuse **design tokens**, shared types, and existing card/table patterns  
- Honest scope: metrics below are suggested in PRD; replace with your data when available  

### Market context (research)

ATS products are widely described as **essential but resented**—recruiters cite click-heavy UX and shallow automation; candidates cite the **application black hole** and silence after apply. I synthesised public discourse (reviews, recruiter blogs, candidate surveys) before scoping this slice.

**Key signals:** ~43% of HR pros rate their TA stack “good or excellent”; table + board dual views and week-scoped pipelines are recurring patterns; governed status and packet pages address top recruiter frustrations.

→ Full case-study insert: [18-market-research-summary.md](./18-market-research-summary.md) · Deep dive: [17-netnographic-ats-research.md](./17-netnographic-ats-research.md)

---

## 3. Users and goals

**Primary persona — Staff recruiter / hiring coordinator**

- Reviews new applications daily  
- Updates pipeline status as decisions progress  
- Schedules interviews and needs **full application packet** in one place  

**Secondary — Administrator**

- Maintains lookup data (departments, skills, locations) via Administration CRUD  

**Jobs to be done (JTBD)**

- *When I open Applications, I want to see what’s new and grouped by person so I don’t duplicate outreach.*  
- *When I work the funnel, I want a pipeline by time window so I focus on this week’s cohort.*  
- *When I need detail, I want one page that summarises the applicant, submission, documents, and status history—with links to edit the job or open the candidate profile.*  
- *When I schedule an interview, I want that recorded before the pipeline shows Interview Scheduled.*  

Full stories: `02-user-stories-and-jtbd.md`

---

## 4. Process (design → implementation)

### 4.1 Discover and frame

- Mapped **backoffice** areas (dashboard, jobs, candidates, applications, interviews) to avoid orphan flows  
- Aligned scope with as-built [PRD](../../docs/specification/PRD.md)  
- Conducted **netnographic market research** — [18-market-research-summary.md](./18-market-research-summary.md) *(case study insert)* · [full report](./17-netnographic-ats-research.md)  
- Wrote **user stories** and **acceptance-style notes** (`02-user-stories-and-jtbd.md`)  
- Captured **competitive / pattern** notes (`03-competitive-and-pattern-notes.md`)

### 4.2 Structure and flows

- Documented **IA** and routes (`04-information-architecture.md`)  
- Drew **task flows**: list → pipeline → detail → interview; platform apply flow (`05-task-flows.md`)  

### 4.3 Design explorations

- **Table view:** candidate-centric grouping  
- **Pipeline view:** columns mapped to **ten application statuses**; **week scope** at top; terminal tabs for Rejected / Withdrawn  
- **Application detail:** job & timeline, submission, documents, status history, interview modal, applicant deep link  
- **Design system:** HTML catalog with tokens, components, layout templates (`docs/design-system/`)  

Wireframe / state notes: `06-wireframes-and-states.md`.  
*[Screenshot: Applications — table view]*  
*[Screenshot: Applications — pipeline with week controls]*  
*[Screenshot: Application detail — documents + status history]*  
*[Screenshot: Interviews calendar]*  

### 4.4 Specification and handoff

- Interaction spec: week boundaries, drag vs click, status validation, undo/reopen, interview gate, `from=applications` (`07-interaction-spec-handoff.md`)  
- Content model: Application, StatusEvent, Interview, Candidate, JobPosting (`08-content-model.md`)  
- API contract: [backoffice-applications.md](../../docs/specification/api/backoffice-applications.md)  

### 4.5 Validation (lightweight)

- Usability script with 5+ tasks in `09-usability-test-plan.md`  
- *[Add results: completion rate, quotes, changes made]*  

### 4.6 Build and QA (designer involvement)

- Aligned **shared status labels** and transition map across surfaces  
- Verified **orientation**: back links and deep links  
- Confirmed **edge states**: empty week, reject reason required, interview gate, missing documents  
- WCAG / PDPA audits updated for Next.js apps ([reports](../../docs/reports/))  

---

## 5. Solution (what shipped)

### Applications hub

- **Table** and **Pipeline** tabs; pipeline is default for funnel work  
- **Fullscreen pipeline** mode for focused review  
- Optional **AI relevance score** on cards when OpenAI configured  

### Pipeline — week-scoped

- Filters by **submitted week** (UTC Monday–Sunday)  
- **Previous week**, **Next week** (disabled at current week), **This week** when in the past  
- **Active columns:** Submitted → … → Hired  
- **Terminal:** Rejected, Withdrawn (separate views)  

### Status workflow

- Drag-and-drop with **server-validated** transitions  
- **Reject** requires reason; **reopen** from rejected is a controlled action  
- **Undo** last status change  
- **Audit history** on application detail  

### Application detail

- Route: **`/applications/[id]`**  
- Sections: job & timeline, submission, documents, status history, schedule interview, applicant link, profile summary  
- Job link to **edit** surface  

### Interviews

- Schedule from application detail (**one interview per application**)  
- **Calendar** page at `/interviews`  

### Trust and access

- Staff attachment endpoints for CV and cover letter (session cookie, not candidate token)  
- Document provenance from **my-applications** apply flow  

### Platform context (supporting surfaces)

- **Dashboard:** KPIs, pipeline health, recent activity  
- **Jobs:** create, edit, review, publish, preview  
- **Administration:** lookup CRUD  
- **Design system:** browser-viewable HTML catalog with layout templates  

---

## 6. Impact

*[Replace with your real data. PRD suggests:]*

| Signal | Before | After |
|--------|--------|-------|
| Time to open full packet | Multiple navigations | Single `/applications/[id]` page |
| Pipeline focus | All-time mix | Week cohort |
| Status traceability | Ad-hoc | Audit events + undo/reopen |
| Interview alignment | Disconnected | Schedule gate + calendar |
| Orientation errors | Generic back links | `?from=applications` |

Qualitative: *[1–2 recruiter quotes]*  

---

## 7. Reflection

**What worked**

- **Two list modes** (table + pipeline) for different review rhythms  
- **Time scope** in the pipeline reduced ambient noise  
- **Application detail** as anchor reduced context switching  
- **Validated transitions** built trust with ops users  
- **PRD + design system** kept portfolio and implementation aligned  

**Tradeoffs**

- **UTC weeks** — may need local timezone toggle for global teams  
- **Drag + click** — required micro-interaction guard  
- **BFF in Next.js** — fast to ship; central API still stub for domain routes  

**Next iteration**

- Inline PDF preview  
- Email notifications on status change  
- Reports / Settings (currently placeholders)  
- Saved filters and team views  

Full write-up: `11-reflection-tradeoffs.md`

---

## 8. Appendix index (on disk)

All files in `portfolio/product-designer-ats-backoffice/`:

- `01-problem-framing-and-role.md`  
- `02-user-stories-and-jtbd.md`  
- `03-competitive-and-pattern-notes.md`  
- `17-netnographic-ats-research.md`  
- `18-market-research-summary.md`  
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
- `15-ai-workflow-design-and-development.md`  
- `16-ai-workflow-process-diagram.md`  
- `diagrams/` — exported flow diagrams  

**Repo docs:** [PRD](../../docs/specification/PRD.md) · [Design system](../../docs/design-system/index.html) · [Application state spec](../../docs/specification/ATS_Application_State_UI_API_Requirements.md)

---

## 9. Credits and confidentiality

**Your name:** *[Add]*  
**Links:** *[Figma, prototype, GitHub (if public)]*  
**Confidentiality:** If this repo is private, use **blurred screenshots** or **redacted Figma** for public portfolio.

---

*End of Notion case study body.*
