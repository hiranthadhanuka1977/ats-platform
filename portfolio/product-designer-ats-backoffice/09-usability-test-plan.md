# Usability test plan (lightweight)

*Aligned with [PRD §5.6](../../docs/specification/PRD.md) and portfolio flows.*

## Objective

Validate that staff users can **triage**, **scope by week**, **update status** (including reject and interview gate), and **open a full application packet** without confusion—especially around **drag vs click**, **week navigation**, and **terminal states**.

## Participants

- **n = 3–5** internal or external users with recruiting / ops background  
- Mix: 2 frequent list users, 2 “funnel” users  

## Setup

- Staging or local `apps/backoffice` with seed data spanning **multiple weeks**, **multiple statuses**, and at least one application **without** a scheduled interview  
- Think-aloud encouraged; screen + audio recorded with consent  

## Tasks (timed)

| # | Task | Success criteria |
|---|------|------------------|
| 1 | “You need to see everyone who applied **last week** in the pipeline.” | Finds week control, navigates to previous week, identifies cohort |
| 2 | “Confirm you **cannot** open a week in the future.” | Next week disabled at current week; user articulates why |
| 3 | “Move one application from **Submitted** to **Under review**.” | Completes drag-drop; status reflects (or error understood) |
| 4 | “Reject an application—what does the system ask for?” | Reject modal requires reason; card moves to terminal view |
| 5 | “Try to move someone to **Interview Scheduled** without scheduling—what happens?” | User sees validation error or is guided to schedule first |
| 6 | “Schedule an interview, then move the application to **Interview Scheduled**.” | Interview modal + successful status change |
| 7 | “Open the **full packet** for one application from the pipeline.” | Lands on detail; finds CV, cover letter, status history |
| 8 | “From the **applications table**, open the candidate, then return to **Applications**.” | Uses back control labelled for applications |

## Post-task questions

1. Where would you expect **job editing** from the packet page? *(observe discoverability)*  
2. Was **UTC week** confusing? Would you want **local timezone**?  
3. Did you ever **accidentally** open detail when you meant to drag?  
4. Was **status history** useful? Would you trust **undo** in production?  
5. How does this compare to tools you use today for **pipeline** work?  

## Metrics to capture

- Task completion (yes / partial / no)  
- Time on task (optional)  
- **Single usability issue** list ranked by severity  

## Reporting template

| Finding | Severity | Evidence (quote / timestamp) | Recommendation |
|---------|----------|------------------------------|----------------|
| | P0–P3 | | |

## Reference scenarios

- Empty week cohort  
- Application with missing CV  
- Rejected application → reopen flow (advanced task, optional)  
