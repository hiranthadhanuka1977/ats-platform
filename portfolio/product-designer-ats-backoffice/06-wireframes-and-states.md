# Wireframes and key states (for Figma)

Use these as **Figma frame titles** or **annotation specs**. Replace dimensions with your grid system.

---

## Screen: Applications — Table

**Layout**

- Page title + short subtitle  
- **Tablist:** “Table view” | “Pipeline”  
- **Card:** “Application listing”  
- **Table:** Candidate (rowspan) | Email (rowspan) | Job | Status | Applied | Updated  

**States**

1. **Empty:** “No applications submitted yet.”  
2. **Populated:** multiple rows; one candidate with **two jobs** shows rowspan + “N applications” hint  
3. **Error banner** (optional): status patch failed (if surfaced globally on this page)  

**Links**

- Candidate name → `/candidates/[id]?from=applications`  
- Job title → `/applications/[id]`  

---

## Screen: Applications — Pipeline

**Layout**

- Same tabs  
- **Card:** “Applications pipeline”  
- **Toolbar row:** [ ← Previous week ] [ Next week → ] [ This week ] (conditional) + **Week: {label}** right-aligned  
- **Horizontal scroll:** status columns (min-width cards)  

**States**

1. **Current week, offset 0:** Next week **disabled** + tooltip “Future weeks are not available”  
2. **Past week:** “This week” visible; Next week **enabled** until offset reaches 0  
3. **Empty cohort:** muted message above columns; columns still accept **drop**  
4. **Dragging:** dragged card reduced opacity  
5. **Updating:** card non-draggable, cursor “progress”  

**Card**

- Title = job title  
- Sub = candidate name  
- Meta = Applied {datetime}  

---

## Screen: Application detail

**Layout**

- Back link: “← Back to applications”  
- Header: Job title + subtitle “Application for {name} · {status}”  
- **Grid of cards:**  
  - Job and timeline  
  - Submission details (+ motivation block if present)  
  - Documents (CV submitted, default CV, cover letter)  
  - Applicant (link to candidate)  
  - *(Conditional)* Cover letter text — full width if content exists  
  - Profile overview  
  - Account insights  
  - Experience list  
  - Education list  

**States**

1. No submitted CV → em dash in row  
2. No default CV → em dash  
3. File cover letter → download link with filename hint  
4. Text cover letter → body in “Cover letter text” section; hide section if nothing to show  
5. Legacy free-text cover letter in DB → show in same text section  

---

## Micro-interaction notes (for motion / prototype)

- **Drag end → click suppression:** ~200ms guard to prevent accidental navigation after drag.  
- **Week change:** polite `aria-live` on week label (accessibility).  

---

## Figma checklist

- [ ] Cover frame + project thumbnail  
- [ ] Flow arrows: 3 primary flows (A–C from `05-task-flows.md`)  
- [ ] Component styles aligned to existing tokens (`bo-card`, `bo-admin-table`, etc.) if matching implementation  
