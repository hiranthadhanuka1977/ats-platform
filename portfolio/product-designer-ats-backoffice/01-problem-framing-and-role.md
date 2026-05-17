# Problem framing and role

## Role

**Product Designer** — discovery, IA, interaction design, specification, and design QA through implementation for a **staff backoffice** slice of an applicant tracking style platform (`ats-platform` monorepo).

## Problem statement

Internal hiring staff must **triage and progress** job applications efficiently. Without clear structure, they face:

- Too many items in a single pipeline view (no temporal anchor)  
- Fragmented context when moving between **applications**, **candidates**, and **jobs**  
- Ambiguous return navigation after deep linking into a candidate profile from an applications context  

## Scope (in)

- **Applications** hub: table + pipeline views  
- **Week-scoped** pipeline browsing (past and current week only)  
- **Application detail** page: applicant summary, submission fields, documents, job link  
- **Navigation affordances**: back to applications; candidate link preserves list context where specified  

## Scope (out) — explicit

- Candidate-facing apply UX (separate app: `my-applications`) — referenced only for **document provenance**  
- Full analytics dashboard, interview scheduling UI, or enterprise RBAC beyond staff session gate  

## Success criteria (suggested — customise)

1. A staff user can open **one page** that answers: *who, which job, when, what they submitted, where are the files*  
2. Pipeline supports **cohort-based review** (week) without allowing impossible **future** cohorts  
3. No “trap” navigation: user can return to **Applications** after opening **Candidate** from the applications table  

## Design principles used

- **Progressive disclosure:** summary in list/pipeline; depth on detail page  
- **Consistent mental model:** “Application” is the unit of work; candidate and job are linked contexts  
- **Honest system state:** disable impossible actions rather than error after the fact  
