# AI-assisted design & development — ATS backoffice (portfolio writeup)

**Use this as:** a standalone portfolio section, a LinkedIn “featured project” blurb, or a supplement to `NOTION_CASE_STUDY.md`.  
**Tone:** honest about AI as accelerator, not autopilot.

---

## Headline (pick one)

- **From spec to working kanban: shipping an ATS applications workflow with AI pair programming**
- **Designing hiring ops in the open — and building it with AI-assisted development**
- **Staff ATS backoffice: product design + AI-accelerated implementation in one monorepo**

---

## Short summary (≈80 words)

I led product design and hands-on implementation for a **staff Applications** slice of an applicant tracking platform: list and pipeline views, a governed status model, interview scheduling, and application detail. I used **AI-assisted workflows** (Cursor, spec-driven prompts, iterative codegen) to move from written requirements to production-shaped UI and API behaviour quickly—while keeping **human ownership** of IA, transition rules, edge cases, and QA. The result is a coherent internal tool recruiters can actually use, not a mockup.

---

## Context

**Product:** **TalentHub** (`ats-platform`) — monorepo with staff **backoffice** (Next.js), candidate portal, my-applications, and Hono API, backed by PostgreSQL (Prisma). As-built scope: [PRD](../../docs/specification/PRD.md).

**Problem:** Recruiters need to triage applications at volume—see who applied, for which role, in which funnel stage, with documents and interviews in context—without dead-end navigation or invalid status changes.

**My contribution:** End-to-end ownership of the **Applications** experience: discovery and framing, interaction specification, visual patterns aligned to the existing design system, and **direct collaboration on implementation** using AI tools to ship faster without abandoning product judgment.

---

## What I shipped (concrete)

### Applications hub
- **Pipeline (default)** and **list** views with icon toggle in the page header (full-width layout).
- **Kanban board** aligned to active recruitment statuses (Submitted → Hired), plus Rejected / Withdrawn / All tabs.
- **Week-scoped pipeline** (UTC Monday–Sunday): previous / next / this week; no future weeks.
- **Drag-and-drop** with valid/invalid drop feedback; card menu for moves, reject, withdraw, reopen.
- **Confirmation modals** for reject, withdraw, hire, and reopen—with form validation and accessible layout.
- **Undo last pipeline move** (single-step, staff-scoped).
- **Relevance score** rings on cards with breakdown flyover.

### Interviews & business rules
- **Schedule interview** from application detail; status moves to Interview Scheduled.
- **Interviews calendar** page (month grid + day panel), full width.
- **One interview per application** (DB constraint + API guard + UI hides duplicate scheduling).
- **Drag to Interview Scheduled without an interview** → prompt: schedule now or cancel.

### Application detail & platform
- Application detail: applicant summary, submission fields, CV/cover letter access, job link, status history.
- Shared **transition matrix** in `@ats-platform/types`; API validates every status change.
- **Status event audit** metadata (reason, note, change source) for pipeline actions.

### Specification & structure
- Authored / maintained **`ATS_Application_State_UI_API_Requirements.md`** as the contract for states, transitions, drag rules, and API payloads.
- Portfolio pack under `portfolio/product-designer-ats-backoffice/` (IA, flows, handoff, usability plan).

---

## How I used AI workflows

### 1. Spec-first, then AI implementation

I treated the **state-management spec** as source of truth—not the chat. AI sessions started with:

- “Implement per `ATS_Application_State_UI_API_Requirements.md`…”
- Pasted acceptance criteria (valid transitions, modals, 409 on conflict, interview rules).

That kept generated code aligned with product intent and reduced rework.

### 2. Design in documents, UI in the repo

**Human-led (minimal AI):**

- Problem framing, JTBD, IA, task flows (`01–05` in this portfolio pack).
- Edge cases: week boundaries, `from=applications` return path, drag vs click, terminal columns.
- Content model: application as unit of work; documents via staff endpoints.

**AI-assisted:**

- Translating wireframe-level intent into **React components** and **CSS** inside existing tokens (`backoffice.css`, shared button/form patterns).
- Generating **Prisma migrations**, **API routes**, and **Zod validators** from described behaviour.
- Fixing runtime issues iteratively (modal layout, ellipsis on cards, full-width pages, prop wiring).

### 3. Tight feedback loops (the real workflow)

Typical cycle:

1. **Define** behaviour in spec or a one-line acceptance note.  
2. **Prompt** Cursor with file paths and constraints (“match Jobs page view toggle”, “portal modals to `document.body`”).  
3. **Run** `npm run dev:all` and click through backoffice.  
4. **Correct** AI output where it drifted (wrong transition, missing guard, broken destructuring).  
5. **Commit** when behaviour matches spec.

AI was fastest on **boilerplate and layout**; I stayed responsible for **rules, cohesion, and “does this match how recruiters work?”**

### 4. What I did *not* outsource to AI

- Which states belong on the active board vs terminal tabs.  
- Requiring an interview record before Interview Scheduled / Completed.  
- Undo scope (one move, same staff).  
- Navigation model and honest disable states (future weeks, second interview).  
- Copy and status labels via shared types (single vocabulary).  

---

## Tools

| Layer | Tools |
|--------|--------|
| Design & docs | Figma *(recommended for visuals)*, Notion, Markdown specs in `docs/specification/` |
| Development | Cursor, TypeScript, Next.js App Router, React |
| API & data | Hono, Prisma, PostgreSQL |
| AI | Cursor Agent / Composer for multi-file edits; chat for targeted fixes |
| Quality | Manual QA in browser, reading API responses, migration discipline |

---

## Outcomes (how to talk about impact)

*Replace brackets with your metrics or quotes.*

- **Velocity:** Moved from static markup / partial UI to a **working pipeline with API-backed status changes** in iterative AI-assisted sessions rather than a multi-sprint handoff-only model.  
- **Coherence:** One transition matrix drives **board, menus, and API**—fewer “design said X, code did Y” moments.  
- **Trust:** Invalid moves are blocked in UI and server; destructive actions need confirmation; interviews are constrained to one per application.  
- **Learnings:** AI is strong at **patterns and speed**; weak at **domain rules** unless you write them down first. Best results when I act as **product owner + editor**, not prompt-only operator.

---

## Reflection (good for interviews)

**What worked**

- Small, testable prompts tied to **real file paths** and existing components.  
- Written specs as **non-negotiable context** for every AI session.  
- Reusing design-system classes (`bo-candidate-tab`, `bo-jobs-view-toggle`, `bo-modal`) so AI output looked native.

**What I’d do again**

- Keep a living **“decisions log”** (even bullet points) when AI suggests scope creep.  
- Add screenshot-based QA checklist after each AI pass on visual surfaces.  
- Pair AI implementation with **one lightweight usability session** on pipeline + detail.

**One sentence for your portfolio footer**

> I designed the recruiter Applications workflow for an ATS backoffice and used AI-assisted development to implement it against a formal state spec—shipping kanban, interviews, and audit-friendly status changes while keeping product rules and UX quality explicitly human-led.

---

## Suggested visuals for the portfolio page

1. Applications page — pipeline view (week nav + columns).  
2. Drag invalid vs valid column highlight.  
3. Reject / “no interview scheduled” modals.  
4. Application detail with scheduled interview card.  
5. Interviews calendar (full width).  
6. Snippet of transition spec or shared types (shows rigour behind AI code).

---

## Credit line

**Product design & AI-assisted implementation** — Applications, pipeline, interviews, and application state management for TalentHub ATS backoffice (`ats-platform`).
