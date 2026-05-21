# Portfolio pack — Product Designer (TalentHub ATS / backoffice)

This folder contains **evidence-oriented artefacts** from problem framing through implementation notes for the **TalentHub ATS** platform (`ats-platform` monorepo). Primary focus: the **staff backoffice applications slice** (Next.js on port 3001), with context from candidate portal (3000), my-applications (3002), and central API (4000).

**Product ground truth:** [PRD — TalentHub ATS Platform](../../docs/specification/PRD.md) (as-built, May 2026).

## How to use with Notion

1. Open **`NOTION_CASE_STUDY.md`** — this is the **primary case study** written for copy-paste into Notion.
2. In Notion: **New page → Import → Markdown**, or paste sections manually (Notion converts `#` headings into blocks).
3. Add your **screenshots** and **Figma links** where placeholders appear (`[Screenshot: …]`).
4. Use the appendix files for **depth** (flows, spec, usability) or export them as sub-pages.

## Files in this pack

| File | Purpose |
|------|---------|
| `NOTION_CASE_STUDY.md` | Full case study (Notion-friendly); start here |
| `01-problem-framing-and-role.md` | Problem statement, scope, role, PRD alignment |
| `02-user-stories-and-jtbd.md` | Stories and jobs-to-be-done (applications, status, interviews) |
| `03-competitive-and-pattern-notes.md` | Pattern library / competitive scan template |
| `17-netnographic-ats-research.md` | **Netnographic ATS research** — pain points, expectations, competitor synthesis (full) |
| `18-market-research-summary.md` | **Case study insert** — condensed market research summary for Notion/portfolio |
| `04-information-architecture.md` | IA, navigation map, platform context |
| `05-task-flows.md` | Step-by-step flows |
| `06-wireframes-and-states.md` | Lo-fi / state descriptions for Figma |
| `07-interaction-spec-handoff.md` | Designer–engineer handoff bullets |
| `08-content-model.md` | Entities, statuses, document handling |
| `09-usability-test-plan.md` | Lightweight test script |
| `10-before-after.md` | Narrative evolution |
| `11-reflection-tradeoffs.md` | Tradeoffs and next iteration |
| `12-presentation-deck-outline.md` | Slide-by-slide for PDF/Slides |
| `13-loom-video-script.md` | ~90s walkthrough script |
| `14-screen-and-route-inventory.md` | Ground truth from the repo |
| `15-ai-workflow-design-and-development.md` | AI-assisted design/dev process |
| `16-ai-workflow-process-diagram.md` | Process diagram notes |
| `diagrams/` | Exported Mermaid diagrams for deck and Notion |

## Related repo documentation

| Document | Purpose |
|----------|---------|
| [PRD](../../docs/specification/PRD.md) | As-built product requirements |
| [Design system](../../docs/design-system/index.html) | Tokens, components, layout templates |
| [Application state spec](../../docs/specification/ATS_Application_State_UI_API_Requirements.md) | Pipeline rules and API behaviour |
| [Backoffice applications API](../../docs/specification/api/backoffice-applications.md) | Staff BFF contract |

## Optional assets to add yourself

- Exported **Figma** frames (cover, flow, UI).
- **Screenshots** of running apps: applications pipeline, application detail, interviews calendar, dashboard.
- **Analytics or quotes** if you run usability tests with real users.

---

**Credit line (suggested):** Product Designer — end-to-end ownership from discovery and IA through UI patterns, specification, design system, and collaboration on implementation within a multi-app hiring platform.
