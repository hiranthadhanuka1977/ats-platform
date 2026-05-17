# User stories and jobs-to-be-done

## Personas

| Persona | Goal |
|---------|------|
| Staff recruiter | Review and disposition applications quickly |
| Hiring coordinator | Ensure documents and answers are complete before scheduling |
| Hiring manager (occasional) | Sanity-check a candidate packet before interview |

---

## User stories (Agile-style)

1. **As** a staff user, **I want** to switch between a table and a pipeline view of applications **so that** I can either scan rows or work the funnel by status.  

2. **As** a staff user, **I want** the pipeline limited to applications submitted in a selected week **so that** I can focus on a cohort (e.g. this week’s intake).  

3. **As** a staff user, **I want** to move backward and forward by week **so that** I can compare last week to this week—without selecting a future week.  

4. **As** a staff user, **I want** to click a pipeline card to open application details **so that** I can read the full packet in one place.  

5. **As** a staff user, **I want** to drag a card between columns **so that** I can update application status in a spatial model.  

6. **As** a staff user, **I want** a dedicated application detail page with applicant profile summary and links to CV and cover letter **so that** I don’t hunt across unrelated screens.  

7. **As** a staff user, **I want** to open the candidate profile from the applications table **so that** I can see full history—and **return to Applications** when I arrived from there.  

8. **As** a staff user, **I want** a link from application detail to the job edit screen **so that** I can correct posting issues without losing application context.  

---

## Jobs-to-be-done (JTBD format)

**When** I start my day with a backlog of new applications,  
**I want** to see them grouped and filterable by time and status,  
**So I can** clear the queue without missing duplicates or wrong-job matches.

**When** I’m ready to make a decision on one person,  
**I want** a single detail surface with documents and structured answers,  
**So I can** move to the next step (interview, reject, hold) with confidence.

**When** I followed a link into a candidate profile from Applications,  
**I want** the primary back action to return me to Applications,  
**So I can** resume my list workflow without using the browser back button.

---

## Acceptance-style notes (for design QA)

- [ ] Pipeline “Next week” is **disabled** when viewing the **current** week (no future weeks).  
- [ ] Clicking a pipeline card navigates to **`/applications/[id]`** without firing after a completed **drag** (no accidental navigation).  
- [ ] Application detail shows **job title**, **status**, **applied/updated** timestamps, **submission fields**, and **document** actions or empty states.  
- [ ] Candidate name link from applications table includes **`?from=applications`** so back navigation targets Applications.  
- [ ] Empty week: user sees an explicit **empty cohort** message; columns may remain for discoverability of drop targets.  
