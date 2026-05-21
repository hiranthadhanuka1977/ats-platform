# Market research summary — ATS landscape (for case study)

**Use in portfolio:** Paste this section into `NOTION_CASE_STUDY.md` under **Discover** or **Problem**.  
**Full report:** [17-netnographic-ats-research.md](./17-netnographic-ats-research.md)  
**Date:** May 2026 · Secondary netnography (public reviews, recruiter blogs, candidate surveys)

---

## Why this research mattered

Before designing the Applications slice, I needed to understand how recruiters and candidates **actually talk about** ATS products—not just feature lists on vendor sites. I synthesised recurring themes from review platforms (G2, TrustRadius), recruiter-authored blogs, HR press, and candidate surveys.

**Headline finding:** ATS tools are **essential but resented**. Recruiters complain about click-heavy UX and shallow automation; candidates describe hiring as an **opaque black hole** after apply. Only **43%** of HR professionals rate their TA tech stack “good or excellent” (HR.com, 2025–26)—high replacement intent, low forgiveness for bad workflow design.

---

## Competitive snapshot

| Product | Praised for | Criticised for | Typical buyer |
|---------|-------------|----------------|---------------|
| **Greenhouse** | Structure, scorecards, scheduling, integrations | Cost, setup complexity, reporting/audit gaps | Mid–large enterprise |
| **Lever** | CRM + nurture, sleek UI, sourcing | Less reporting depth; mixed post-acquisition sentiment | Sourcing-heavy teams |
| **Ashby** | Modern UX, analytics, fast setup | Less enterprise compliance proof | Startups / Series A–C |
| **Workday / iCIMS / Bullhorn** | Scale, HRIS unity | “Clunky,” slow, dated UX | Legacy enterprise / agency |

**Pattern:** Leaders split on **enterprise structure** (Greenhouse) vs **CRM + nurture** (Lever) vs **modern analytics** (Ashby). Legacy suites are the negative benchmark recruiters compare against.

---

## Top pain points

### Recruiters (staff)

- **Too many clicks** to reach a resume or contact info; slow load times push work back to **Excel**
- **Search and ranking** rely on keywords—rigid filters hide good candidates; duplicates clutter results
- **Automation overpromised**—bulk reject exists; scheduling, follow-ups, and outreach stay manual
- **Pipeline noise**—all-time boards with no cohort anchor; status can disagree with reality (e.g. “Interview Scheduled” with no interview)
- **Weak reporting and audit**—exports and change history often require workarounds

### Candidates

- **Application black hole**—~60% say not knowing if a human reviewed their resume is among the most exasperating parts of job search (Monster / HR Dive)
- **Form abandonment**—~57–60% quit when apply flows are long or complex
- **Silence after submit**—~65% rarely or never receive updates; ghosting tops frustration lists
- **Distrust of automation**—many believe most applications are never seen by a recruiter

---

## What users expect (2026)

| Audience | Core expectations |
|----------|---------------------|
| **Recruiters** | Table **and** board on same data · time-scoped pipeline · one **packet page** per application · governed status changes · in-product **scheduling** · fast document access |
| **Candidates** | Short mobile apply · reusable CV/profile · confirmation · **status visibility** (even automated) |
| **Buyers** | Adoption by hiring managers · verified integrations · RBAC + audit · honest TCO |

**Table stakes:** calendar/email integrations, pipeline views, application detail—not differentiators on their own. **Differentiators** in discourse: cohort scoping, trustworthy pipeline rules, auditability, and candidate communication.

---

## Design decisions informed by research

| Market pain | Design response in TalentHub |
|-------------|------------------------------|
| Infinite pipeline noise | **Week-scoped** pipeline (past + current week only; no future weeks) |
| Scattered packet review | **`/applications/[id]`** as single anchor for submission, documents, history |
| Scan vs funnel conflict | **Table + pipeline** tabs on one hub (pipeline default) |
| Invalid / untraceable status | **Ten statuses**, server-validated transitions, **audit events**, undo/reopen |
| Status vs interview mismatch | **Schedule interview** on detail; gate before “Interview Scheduled” |
| Lost navigation context | **`?from=applications`** back path from candidate profile |
| Drag vs click accidents | Interaction guard after drag (documented in spec) |
| Resume not focal | Documents + applicant summary prominent on detail page |

**Honest gaps (not claimed in portfolio):** enterprise CRM, deep analytics/reporting, email notifications to candidates, integration marketplace—these remain industry-wide or out of MVP scope. See [PRD](../../docs/specification/PRD.md).

---

## Portfolio takeaway (one paragraph)

> I grounded the Applications workflow in **netnographic research** showing that recruiters need fast triage, honest pipeline state, and a single packet surface—while candidates punish opacity and silence. Rather than copying a full enterprise ATS, I prioritised the **highest-friction recruiter moments** (cohort triage, governed Kanban, packet review, contextual navigation) where public discourse shows the most resentment—and scoped enterprise extras honestly.

---

## Sources (selected)

- NUROFILE — [Problems recruiters face with ATS](https://nurofile.ai/blog/problems-recruiters-face-with-ats/)
- TrustRadius — [Greenhouse vs Lever](https://www.trustradius.com/compare-products/greenhouse-vs-lever)
- HR Dive — [Opaque hiring process](https://www.hrdive.com/news/job-seekers-frustrated-by-opaque-impersonal-hiring-process/819898/)
- LiveCareer — [Job search frustration](https://www.livecareer.com/resources/job-search-frustration)
- Tracker RMS — [Choosing an ATS](https://www.tracker-rms.com/blog/essentials-to-consider-when-transitioning-to-a-new-ats/)

Full bibliography: [17-netnographic-ats-research.md §13](./17-netnographic-ats-research.md#13-sources)

---

*Summary version 1.0 · 21 May 2026*
