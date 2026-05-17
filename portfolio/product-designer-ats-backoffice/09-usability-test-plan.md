# Usability test plan (lightweight)

## Objective

Validate that staff users can **triage**, **scope by week**, **update status**, and **open a full application packet** without confusion—especially around **drag vs click** and **week navigation**.

## Participants

- **n = 3–5** internal or external users with recruiting / ops background  
- Mix: 2 frequent list users, 2 “funnel” users  

## Setup

- Staging or local `apps/backoffice` with seed data spanning **multiple weeks** and **multiple statuses**  
- Think-aloud encouraged; screen + audio recorded with consent  

## Tasks (timed)

| # | Task | Success criteria |
|---|------|------------------|
| 1 | “You need to see everyone who applied **last week** in the pipeline.” | Finds week control, navigates to previous week, identifies cohort |
| 2 | “Confirm you **cannot** open a week in the future.” | Next week disabled at current week; user articulates why |
| 3 | “Move one application from **Submitted** to **Under review**.” | Completes drag-drop; status reflects (or error understood) |
| 4 | “Open the **full packet** for one application from the pipeline.” | Lands on application detail; finds CV or cover letter area |
| 5 | “From the **applications table**, open the candidate, then return to **Applications**.” | Uses back control labelled for applications (not candidates list) |

## Post-task questions

1. Where would you expect **job editing** from the packet page? *(observe discoverability)*  
2. Was **UTC week** confusing? Would you want **local timezone**?  
3. Did you ever **accidentally** open detail when you meant to drag?  

## Metrics to capture

- Task completion (yes / partial / no)  
- Time on task (optional)  
- **Single usability issue** list ranked by severity  

## Reporting template

| Finding | Severity | Evidence (quote / timestamp) | Recommendation |
|---------|----------|------------------------------|----------------|
| | P0–P3 | | |  
