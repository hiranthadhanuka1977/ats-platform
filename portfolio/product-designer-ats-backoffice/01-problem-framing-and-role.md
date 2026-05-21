# Problem framing and role

## Role

**Product Designer** — discovery, IA, interaction design, specification, and design QA through implementation for the **TalentHub ATS** platform (`ats-platform` monorepo). Primary portfolio focus: the **staff backoffice applications slice**; work is grounded in the as-built [PRD](../../docs/specification/PRD.md) (May 2026).

## Platform context

| App | Port | Audience |
|-----|------|----------|
| Candidate portal | 3000 | Public job discovery |
| My Applications | 3002 | Candidate auth, CV, apply |
| Backoffice | 3001 | Staff hiring workflows |
| Central API | 4000 | Auth + candidate registration |

The platform supports the core hiring loop: **publish jobs → discover and apply → triage in Kanban → interview → offer → hire or reject**.

## Problem statement

Internal hiring staff must **triage and progress** job applications efficiently. Without clear structure, they face:

- Too many items in a single pipeline view (no temporal anchor)
- Fragmented context when moving between **applications**, **candidates**, and **jobs**
- Ambiguous return navigation after deep linking into a candidate profile from an applications context
- Invalid or untraceable status changes when moving candidates through the funnel

## Scope (in) — backoffice slice

- **Applications** hub: table + pipeline views (pipeline default); list ↔ pipeline toggle; fullscreen pipeline
- **Week-scoped** pipeline browsing (past and current week only)
- **Application detail**: applicant summary, submission fields, documents, job link, status history
- **Status workflow**: ten application statuses, drag-and-drop with server validation, undo, controlled reopen from rejected
- **Interviews**: schedule from application detail (one per application); calendar at `/interviews`
- **Navigation affordances**: back to applications; candidate link preserves list context (`?from=applications`)
- **Staff document access**: CV and cover letter download via authenticated BFF routes
- **Cross-surface consistency**: shared status vocabulary (`@ats-platform/types`), HTML design system with layout templates

## Scope (out) — explicit

- **Candidate-facing apply UX** — implemented in `my-applications`; referenced here for document provenance and journey context only
- **Reports and Settings** — backoffice placeholder pages (planned in PRD)
- **Enterprise RBAC** beyond staff session gate and role enum (admin, recruiter, hiring_manager)
- **Central Hono domain API** — jobs/applications/interviews remain stubs; logic lives in Next.js BFFs
- **Email notifications** on status change — field exists; delivery not wired
- **Multi-tenant / SSO** — single-tenant, email/password staff auth

## Success criteria (aligned with PRD §11)

1. A staff user can open **one page** that answers: *who, which job, when, what they submitted, where are the files*
2. Pipeline supports **cohort-based review** (week) without allowing impossible **future** cohorts
3. No “trap” navigation: user can return to **Applications** after opening **Candidate** from the applications table
4. Status changes follow a **defined transition matrix** with audit logging; terminal states and reopen flows are explicit
5. Interview can be scheduled before an application moves to **Interview Scheduled**

## Design principles used

- **Progressive disclosure:** summary in list/pipeline; depth on detail page
- **Application as unit of work:** candidate and job are linked contexts, not separate workflows
- **Honest system state:** disable impossible actions rather than error after the fact
- **Implementation-aligned documentation:** specs, design system, and portfolio track the Next.js apps, not legacy static markup alone

## Reference

- [PRD — TalentHub ATS Platform](../../docs/specification/PRD.md)
- [Application state requirements](../../docs/specification/ATS_Application_State_UI_API_Requirements.md)
- [Design system catalog](../../docs/design-system/index.html)
