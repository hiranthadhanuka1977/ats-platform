# User stories and jobs-to-be-done

*Aligned with [PRD §3–§5](../../docs/specification/PRD.md) — May 2026 as-built.*

## Personas

| Persona | Goal | PRD reference |
|---------|------|-----------------|
| Staff recruiter | Review and disposition applications quickly | §3.2 |
| Hiring coordinator | Ensure documents and answers are complete before scheduling | §3.2 |
| Hiring manager (occasional) | Sanity-check a candidate packet before interview | §3.2 |
| Administrator | Maintain lookup data (departments, skills, etc.) | §3.3 |

---

## User stories — Applications hub (implemented)

1. **As** a staff user, **I want** to switch between a table and a pipeline view of applications **so that** I can either scan rows or work the funnel by status.

2. **As** a staff user, **I want** the pipeline limited to applications submitted in a selected week **so that** I can focus on a cohort (e.g. this week’s intake).

3. **As** a staff user, **I want** to move backward and forward by week **so that** I can compare last week to this week—without selecting a future week.

4. **As** a staff user, **I want** to click a pipeline card to open application details **so that** I can read the full packet in one place.

5. **As** a staff user, **I want** to drag a card between columns **so that** I can update application status in a spatial model—with server validation when a transition is invalid.

6. **As** a staff user, **I want** a dedicated application detail page with applicant profile summary and links to CV and cover letter **so that** I don’t hunt across unrelated screens.

7. **As** a staff user, **I want** to open the candidate profile from the applications table **so that** I can see full history—and **return to Applications** when I arrived from there.

8. **As** a staff user, **I want** a link from application detail to the job edit screen **so that** I can correct posting issues without losing application context.

9. **As** a staff user, **I want** to toggle fullscreen pipeline mode **so that** I can work the board without page chrome distraction.

10. **As** a staff user, **I want** to see AI relevance scores on pipeline cards when available **so that** I can prioritise high-fit applications *(partial — requires OpenAI key)*.

---

## User stories — Status workflow (implemented)

11. **As** a staff user, **I want** rejection to require a reason **so that** decisions are auditable.

12. **As** a staff user, **I want** to undo my last status change **so that** I can recover from mistakes without admin intervention.

13. **As** a staff user, **I want** to reopen a rejected application through a controlled action **so that** I can reconsider without bypassing business rules.

14. **As** a staff user, **I want** status change history on the application **so that** I can see who moved whom and when.

15. **As** a staff user, **I want** the system to block moving to Interview Scheduled without a scheduled interview **so that** pipeline state matches reality.

---

## User stories — Interviews (implemented)

16. **As** a staff user, **I want** to schedule an interview from application detail **so that** I can progress the candidate without leaving the packet.

17. **As** a staff user, **I want** an interviews calendar page **so that** I can see upcoming sessions across applications.

---

## User stories — Platform context (implemented elsewhere)

18. **As** a candidate, **I want** to register, upload a CV, and apply **so that** staff receive a complete application packet *(my-applications — PRD §5.2)*.

19. **As** a staff user, **I want** to create and publish job postings **so that** candidates can discover and apply *(backoffice jobs — PRD §5.5)*.

20. **As** a staff user, **I want** a dashboard with pipeline health and recent activity **so that** I can orient at the start of the day *(PRD §5.4)*.

---

## Jobs-to-be-done (JTBD format)

**When** I start my day with a backlog of new applications,
**I want** to see them grouped and filterable by time and status,
**So I can** clear the queue without missing duplicates or wrong-job matches.

**When** I’m ready to make a decision on one person,
**I want** a single detail surface with documents, structured answers, and status history,
**So I can** move to the next step (interview, reject, hold) with confidence.

**When** I followed a link into a candidate profile from Applications,
**I want** the primary back action to return me to Applications,
**So I can** resume my list workflow without using the browser back button.

**When** I need to schedule an interview before advancing status,
**I want** the schedule action on the same page as the application packet,
**So I can** keep context and satisfy validation rules in one pass.

---

## Acceptance-style notes (for design QA)

- [ ] Pipeline “Next week” is **disabled** when viewing the **current** week (no future weeks).
- [ ] Clicking a pipeline card navigates to **`/applications/[id]`** without firing after a completed **drag** (no accidental navigation).
- [ ] Application detail shows **job title**, **status**, **applied/updated** timestamps, **submission fields**, **document** actions, and **status history**.
- [ ] Candidate name link from applications table includes **`?from=applications`** so back navigation targets Applications.
- [ ] Empty week: user sees an explicit **empty cohort** message; columns may remain for discoverability of drop targets.
- [ ] Reject modal requires **reason**; reopen from rejected requires **controlled action** (not drag-and-drop).
- [ ] PATCH to `interview_scheduled` blocked until **interview record** exists.
- [ ] Terminal columns **Rejected** and **Withdrawn** appear outside the active Kanban board.
