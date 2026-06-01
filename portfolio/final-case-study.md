# Case Study: AI Assisted Designing and Implementation of an Applicant Tracking System (ATS)

**Role:** Product Designer, UX Designer, Developer  
**Project:** TalentHub ATS — multi-app hiring platform (`ats-platform` monorepo)  
**Timeline:** *05 April 2026 - In Progress*  
**Tools:**  Cursor, VS Code, ChatGPT, Claude Code, GitHub  
**Ground truth:** [PRD](../docs/specification/PRD.md) · [Feature backlog](../docs/specification/FEATURE_BACKLOG.md) · [Information architecture](../docs/information-architecture.md) · **[Case study website](case-study/index.html)**

> **Portfolio use:** Replace `[bracketed placeholders]` with screenshots, Figma links, and metrics. Import into Notion, Slides, or a portfolio site by section.

---

## Executive summary

**TalentHub is designed for small and medium organizations (SME / SMB)** — lean People/TA (Talent Aquisition) teams (often one to a few recruiters, with hiring managers wearing multiple hats) who must run hiring reliably but cannot justify enterprise license bands, six-week implementations, or CRM and analytics modules a 30-person company will never use.

Netnographic research across public ATS discourse shows these teams caught in a **market squeeze**: **enterprise tools** (Greenhouse, Lever, Workday) offer structure but bring cost, setup overhead, and admin complexity; **budget SMB tools** (JazzHR, Breezy, Zoho) win on price but teams **outgrow** them on pipeline integrity, audit, and scheduling honesty. **TalentHub’s design bet** is **mid-market workflow craft at SMB-appropriate scope** — cohort pipeline, governed status, application packet page, in-product scheduling — without enterprise packaging.

**TalentHub** ships as a **multi-app platform**: public job portal, candidate workspace, and staff backoffice — backed by shared data, a design system, and compliance specs. The project used a **hybrid lifecycle**: human-centered discovery, specification, and validation paired with **AI-assisted documentation and implementation** in controlled increments.

**Primary design focus:** the **staff applications workflow** — table and pipeline triage, week-scoped funnel review, application detail as the decision anchor, governed status transitions, and interview scheduling aligned with pipeline state.

## Platform context


| App                  | Audience                            | Purpose                                                |
| -------------------- | ----------------------------------- | ------------------------------------------------------ |
| **Candidate portal** | Job seekers (public)                | Browse, search, and read job listings                  |
| **My Applications**  | Job seekers (signed in)             | Register, upload CV, apply, track application status   |
| **Backoffice**       | Recruiters, hiring managers, admins | Jobs, pipeline, candidates, interviews, administration |
| **Central API**      | Server                              | Auth, registration, OTP, password reset                |


## Problem & research

### Product intent — why SME / SMB

Across public discourse, ATS products are **essential but resented**. Recruiters describe them as slow and click-heavy; candidates describe hiring as **opaque, impersonal, and silent** after apply. For SMEs, that resentment is compounded: they need software that works on day one, but the market pushes them toward either **expensive enterprise tools they cannot afford to mis-buy** or **cheap tools they outgrow within a year** — with no dedicated TA ops admin to absorb either failure mode.

Research source: [17-netnographic-ats-research.md §0](product-designer-ats-backoffice/17-netnographic-ats-research.md#0-product-intent--why-sme--smb) · [§2 Executive summary](product-designer-ats-backoffice/17-netnographic-ats-research.md#2-executive-summary)

### Market pain themes (from netnography)

**Recruiters and hiring staff**


| Theme                 | Discourse signal                                                                        |
| --------------------- | --------------------------------------------------------------------------------------- |
| UX and cognitive load | Click-heavy navigation, slow load times, daily “back to Excel” when the tool fails      |
| Search and triage     | Weak filtering; hard to see who applied, for which role, with which documents           |
| Pipeline integrity    | Status that does not match reality (e.g. “Interview Scheduled” with no meeting)         |
| Automation gap        | Promised automation that does not match real workflows                                  |
| Enterprise friction   | Long implementation, permission sprawl, integration and reporting gaps                  |
| SME-specific          | No TA ops admin · 6+ week go-live · outgrowing budget tools · wrong buy is catastrophic |


**Candidates**


| Theme                  | Discourse signal                                                |
| ---------------------- | --------------------------------------------------------------- |
| Application black hole | Majority rarely or never receive updates after applying         |
| Opacity                | Most doubt a human reviewed their resume                        |
| Application friction   | Long forms drive abandonment; mobile-unfriendly apply           |
| Ghosting               | Silence preferred to nothing — even rejection beats no response |


### Pain points → design responses


| Pain (research + product)                                    | TalentHub response                                                                      |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **SME: no TA ops admin** — tool must be self-explanatory     | Clear IA, dual table/pipeline views, governed defaults                                  |
| **SME: Excel as shadow ATS** when UX fails                   | Week-scoped pipeline · packet page · one- or two-click path to resume                   |
| **Cognitive overload** — every application visible at once   | **Week-scoped pipeline** (past + current week only)                                     |
| **Fragmented context** — job, person, documents disconnected | **Application detail** as single packet page                                            |
| **Dead-end navigation** after drilling into a profile        | `**?from=applications`** return paths                                                   |
| **Operational risk** — accidental status changes             | Validated transitions · reject reason · drag vs click guard · **Move to** keyboard menu |
| **Pipeline dishonesty** — status without backing data        | **Interview gate** + schedule modal before “Interview Scheduled”                        |
| **Candidate black hole** — no visibility after apply         | Status list in My Applications · audit trail for staff *(email notify planned)*         |
| **Long apply friction**                                      | CV library reuse · optional cover letter · screening on apply form                      |
| **Right-sized depth vs enterprise bloat**                    | Core loop only — no CRM nurture or reporting suites on day one                          |


### Market context

**TalentHub targets the underserved middle:** workflow honesty and triage craft without enterprise packaging — the surfaces recruiters resent most in netnographic data, scoped for teams that need **low cost, good UX, and reduced setup time**.


| Research artefact        | Link                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Full netnographic report | [17-netnographic-ats-research.md](product-designer-ats-backoffice/17-netnographic-ats-research.md) |
| Case study summary       | [18-market-research-summary.md](product-designer-ats-backoffice/18-market-research-summary.md)     |
| Slide-ready deck         | [19-netnographic-deck-slides.md](product-designer-ats-backoffice/19-netnographic-deck-slides.md)   |


`[Screenshot: Discovery synthesis]` — *FigJam board, persona blocks, or competitor matrix.*

The product pursues four **design goals** for this segment:


| Goal                           | In practice                                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Low cost**                   | Core hiring loop only — no paid-for modules a small team will never adopt                                                                              |
| **Optimized UX and workflows** | Streamlined triage paths — resume and packet in one or two actions; week-scoped pipeline; honest status; governed transitions; no “back to Excel” days |
| **Reduced setup time**         | Time-to-value in days or weeks — sensible defaults, minimal admin configuration                                                                        |
| **Right-sized depth**          | Apply → triage → interview → hire/reject — not CRM nurture or reporting suites on day one                                                              |


**Outcome (as-built, May 2026):**


| Area                     | Shipped                                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Platform**             | 4 runtime apps · 123 feature backlog items (88 done) · monorepo + shared design system                                                    |
| **Backoffice**           | Applications hub (table + pipeline) · 10-status lifecycle · application detail · interviews calendar · jobs CRUD · administration lookups |
| **Candidate experience** | Public job browse + My Applications (register, CV, apply, track status)                                                                   |
| **Quality gate**         | WCAG 2.2 and GDPR/PDPA audits (rev 1.1) · IA and wireframe artefacts                                                                      |


AI-assisted ATS development — 5-stage process

*Process spec:* [process-diagrams/ats-ai-development-process.md](process-diagrams/ats-ai-development-process.md)

---

## Users & goals

### Personas

**Primary — Staff recruiter / hiring coordinator**

- Reviews new applications daily  
- Updates pipeline status as decisions progress  
- Schedules interviews and needs the **full application packet** in one place

**Secondary — Administrator**

- Maintains lookup data (departments, skills, locations) via Administration

**Candidate — Job seeker**

- Discovers roles on the public portal  
- Applies via My Applications with CV and optional cover letter  
- Tracks application status without re-contacting the employer

### Jobs to be done

- *When I open Applications, I want to see what’s new grouped by person so I don’t duplicate outreach.*  
- *When I work the funnel, I want a pipeline by time window so I focus on this week’s cohort.*  
- *When I need detail, I want one page for applicant, submission, documents, and history — with links to the job and candidate profile.*  
- *When I schedule an interview, I want that recorded before the pipeline shows Interview Scheduled.*

Full stories: [02-user-stories-and-jtbd.md](product-designer-ats-backoffice/02-user-stories-and-jtbd.md)

---

## What I owned

- Problem framing, **information architecture**, and primary user journeys across three web apps  
- Interaction model: **table vs pipeline**, **week-scoped pipeline**, **status workflow**, navigation return paths  
- Edge-case specification: future weeks, drag vs click, terminal states, interview gate, cross-linking candidate and job  
- Design system alignment: tokens, components, **layout templates**  
- AI-assisted process design: PRD, backlog, user stories, incremental build loop, compliance validation  
- Implementation collaboration: acceptance criteria, content model, API contract alignment

---

## Process: 5-stage AI-assisted lifecycle

The end-to-end framework paired human judgment with AI acceleration at each stage. The **backoffice applications slice** was one major increment within this loop — not a separate project.

### 1. Discovery — problem framing & insight

Ground the system in verifiable market and user needs before writing specs.

- Problem framing and use-case identification (resume bottlenecks, time-to-hire, triage overload)  
- Competitor analysis — enterprise and mid-market ATS benchmarks  
- Netnographic research — qualitative signals from recruiter and candidate communities

### 2. Define — scope, specification & design

AI drafted documentation and baseline markup; humans audited and locked product logic.


| Deliverable                       | Link                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Product requirements (as-built)   | [docs/specification/PRD.md](../docs/specification/PRD.md)                                                      |
| Feature backlog (123 TH codes)    | [docs/specification/FEATURE_BACKLOG.md](../docs/specification/FEATURE_BACKLOG.md)                              |
| User stories (plain language)     | [FEATURE_BACKLOG_CURSOR_PROMPTS.md](../docs/specification/FEATURE_BACKLOG_CURSOR_PROMPTS.md)                   |
| Platform information architecture | [docs/information-architecture.md](../docs/information-architecture.md)                                        |
| Backoffice navigation map         | [information-architecture/backoffice-navigation-map.md](information-architecture/backoffice-navigation-map.md) |
| Design system catalog             | [docs/design-system/index.html](../docs/design-system/index.html)                                              |
| Wireframes (6 screens)            | [wireframes/README.md](wireframes/README.md)                                                                   |


Also produced: task flows, interaction spec, content model, competitive notes, API contracts.

Backoffice navigation map

`[Screenshot: Design system]` — *Figma library beside code tokens, or design-system catalog + wireframe PNGs.*

### 3. Implement — incremental, prompt-driven cycles

Development followed strict micro-increments tied to the validated PRD — not a monolithic build.

$$\text{Review PRD} \longrightarrow \text{Isolate feature (TH code)} \longrightarrow \text{Expand spec / user story} \longrightarrow \text{Implement} \longrightarrow \text{Validate}$$

Feature increment loop

Each feature loop:

1. Pick a **TH-** code from the backlog by priority
2. Expand spec or user story
3. Implement in the monorepo (AI-assisted in Cursor)
4. Validate in browser against acceptance criteria
5. Update PRD status, design system, IA docs, and Git

*Diagram source:* [ats-feature-increment-loop.mmd](process-diagrams/ats-feature-increment-loop.mmd)

### 4. Validate — compliance & quality gate

Every increment was benchmarked against functional and legal intent before counting as shipped.


| Audit           | Summary (rev 1.1 · May 2026)   | Open backlog                       |
| --------------- | ------------------------------ | ---------------------------------- |
| **WCAG 2.2 AA** | 34 pass · 17 fail · 15 partial | TH-190, TH-191, TH-192             |
| **GDPR / PDPA** | 6 critical · 7 high · 6 medium | TH-009, TH-130–131, TH-192, TH-193 |


Full reports: [wcag22-audit.md](../docs/reports/wcag22-audit.md) · [pdpa-gdpr-audit.md](../docs/reports/pdpa-gdpr-audit.md) · [implementation-alignment-2026.md](../docs/reports/implementation-alignment-2026.md)

Continuous updates: design system catalog, IA docs, wireframes, and backlog status as edge-case UI emerged.

`[Screenshot: Compliance checklist]` — *axe/Lighthouse run or audit Pass/Fail export.*

### 5. Ship & iterate

Shipping opened the next discovery cycle — feedback and gaps routed back to Stage 1.

```
Discovery → Define → Implement → Validate → Ship
     ↑__________________________________________|
              (next increment / feedback)
```

---

## Solution — what shipped

### Applications hub (backoffice)

- **Table** and **Pipeline** views; pipeline default for funnel work  
- **Fullscreen pipeline** for focused review  
- Optional **AI relevance score** on cards when configured — with **human-review notice** (not for automated decisions)

### Pipeline — week-scoped

- Filters by **submitted week** (UTC Monday–Sunday)  
- **Previous week** · **Next week** (disabled into future) · **This week**  
- **Active columns:** Submitted → Under review → Shortlisted → Interview scheduled → … → Hired  
- **Terminal tabs:** Rejected · Withdrawn

### Status workflow

- Drag-and-drop with **server-validated** transitions (10 statuses)  
- **Reject** requires reason · **Reopen** from rejected is controlled  
- **Undo** last status change · **Audit history** on detail page  
- **Cancel interview** modal when moving backward from interview scheduled  
- Keyboard **Move to** menu as drag alternative (accessibility)

### Application detail — `/applications/[id]`

The **unit of work** for hiring decisions:

- Job context and timeline  
- Submission answers and screening responses  
- CV and cover letter download (staff-authenticated)  
- Status history  
- Schedule interview (date, time, duration, time zone, candidate local preview)  
- Links to candidate profile and job edit

### Interviews

- Schedule from application detail (**one interview per application**)  
- **Calendar** at `/interviews` with time-zone-aware display

### Trust & platform surfaces


| Surface              | Capability                                                                   |
| -------------------- | ---------------------------------------------------------------------------- |
| **Dashboard**        | KPIs, pipeline health, recent activity, stalled-interview insight            |
| **Jobs**             | Create, edit, review, publish, candidate-facing preview                      |
| **Candidates**       | Summary, searchable directory, profile, CV history, applications             |
| **Administration**   | CRUD for companies, departments, locations, types, skills, tags, benefits    |
| **Candidate portal** | Published listings, filters, search, job detail, apply CTA → My Applications |
| **My Applications**  | Register, OTP, dashboard journey, CV library, apply wizard, status list      |
| **Design system**    | HTML catalog with tokens, components, layout templates                       |


*[Screenshot: Applications — table view]* · *[Screenshot: Pipeline with week controls]* · *[Screenshot: Application detail]* · *[Screenshot: Interviews calendar]*

---

## Impact

*[Replace with your real data. Suggested signals:]*


| Signal                       | Before (typical ATS pain)   | After (TalentHub)                      |
| ---------------------------- | --------------------------- | -------------------------------------- |
| Open full application packet | Multiple navigations        | Single `/applications/[id]` page       |
| Pipeline focus               | All-time mix                | Week cohort                            |
| Status traceability          | Ad-hoc                      | Audit events + undo/reopen             |
| Interview alignment          | Status vs calendar mismatch | Schedule gate + calendar               |
| Navigation orientation       | Generic back links          | Context-aware return paths             |
| Spec ↔ code alignment        | Drift                       | PRD + 123-item backlog as ground truth |


Qualitative: *[1–2 recruiter or stakeholder quotes]*

Usability plan: [09-usability-test-plan.md](product-designer-ats-backoffice/09-usability-test-plan.md) — *[add results]*

---

## Reflection

### What worked

- **Two list modes** (table + pipeline) for different review rhythms  
- **Time scope** in the pipeline reduced ambient noise  
- **Application detail** as anchor reduced context switching  
- **Validated transitions** built trust with ops users  
- **5-stage AI-assisted loop** kept documentation, compliance, and code moving together  
- **PRD + backlog + user stories** gave every increment a traceable TH code

### Tradeoffs

- **UTC weeks** — may need local timezone toggle for global teams  
- **Drag + click** — required micro-interaction guard on pipeline cards  
- **AI relevance** — advisory only; human review notice mandatory  
- **BFF in Next.js** — fast to ship; central API domain routes still planned  
- **Email notifications** — UI flags exist; delivery not wired (TH-009)  
- **Reports / Settings** — nav placeholders until TH-165/166

### Next iteration

- Production email (OTP, status, interview)  
- WCAG remediation on modals and legal footer pages  
- Inline PDF preview · saved filters · team views  
- Candidate withdraw and timezone profile UI

Full write-up: [11-reflection-tradeoffs.md](product-designer-ats-backoffice/11-reflection-tradeoffs.md)

---

## Appendix — supporting artefacts

### Portfolio pack (`product-designer-ats-backoffice/`)


| File                                                                                                                 | Purpose                 |
| -------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| [01-problem-framing-and-role.md](product-designer-ats-backoffice/01-problem-framing-and-role.md)                     | Scope and role          |
| [02-user-stories-and-jtbd.md](product-designer-ats-backoffice/02-user-stories-and-jtbd.md)                           | Stories and JTBD        |
| [04-information-architecture.md](product-designer-ats-backoffice/04-information-architecture.md)                     | Platform IA notes       |
| [05-task-flows.md](product-designer-ats-backoffice/05-task-flows.md)                                                 | Step-by-step flows      |
| [06-wireframes-and-states.md](product-designer-ats-backoffice/06-wireframes-and-states.md)                           | Lo-fi states            |
| [07-interaction-spec-handoff.md](product-designer-ats-backoffice/07-interaction-spec-handoff.md)                     | Handoff spec            |
| [08-content-model.md](product-designer-ats-backoffice/08-content-model.md)                                           | Entities and statuses   |
| [15-ai-workflow-design-and-development.md](product-designer-ats-backoffice/15-ai-workflow-design-and-development.md) | Human vs AI roles       |
| [16-ai-workflow-process-diagram.md](product-designer-ats-backoffice/16-ai-workflow-process-diagram.md)               | Mermaid diagram sources |


### Repo documentation


| Document                                                                                     | Purpose              |
| -------------------------------------------------------------------------------------------- | -------------------- |
| [PRD](../docs/specification/PRD.md)                                                          | Product requirements |
| [Application state spec](../docs/specification/ATS_Application_State_UI_API_Requirements.md) | Pipeline rules       |
| [backoffice-applications API](../docs/specification/api/backoffice-applications.md)          | BFF contract         |
| [Design system](../docs/design-system/index.html)                                            | Component catalog    |


---

## Credits & confidentiality

**Your name:** *[Add]*  
**Links:** *[Figma · prototype · GitHub (if public)]*  
**Confidentiality:** If the repo is private, use blurred screenshots or redacted Figma for public portfolio.

---

*Final case study · May 2026 · Combines [case-study-ai-assisted-ats.md](case-study-ai-assisted-ats.md) and [NOTION_CASE_STUDY.md*](product-designer-ats-backoffice/NOTION_CASE_STUDY.md)