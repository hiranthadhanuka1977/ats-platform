# Market research summary — ATS landscape (for case study)

**Use in portfolio:** Paste this section into `NOTION_CASE_STUDY.md` under **Discover** or **Problem**.  
**Full report:** [17-netnographic-ats-research.md](./17-netnographic-ats-research.md)  
**Date:** May 2026 · Secondary netnography (public reviews, recruiter blogs, candidate surveys)

---

## Product intent — SME / SMB first

**TalentHub is designed primarily for small and medium organizations** — lean hiring teams who must run recruitment reliably without enterprise cost, six-week implementations, or paying for CRM/analytics modules they will never use.

| Design goal | Research signal | Product response |
|-------------|-----------------|------------------|
| **Low cost** | Enterprise ATS bands ~$4K–$25K+; opaque setup fees; “priced out” discourse | Scope to core hiring loop; omit CRM, marketplace, tiered analytics |
| **Good UX** | “Too many clicks to the resume”; Excel as shadow ATS when UX fails | Week-scoped pipeline, packet page, governed Kanban, contextual navigation |
| **Reduced setup time** | 6+ week implementations; migration fear; first-time ATS buyers want speed to value | Local-first monorepo, sensible defaults, focused backoffice slice |
| **Right-sized depth** | Budget tools too shallow; enterprise tools too heavy | Mid-market workflow craft at SMB-appropriate scope |

---

## Why this research mattered

Before designing the Applications slice, I needed to understand how recruiters and candidates **actually talk about** ATS products—not just feature lists on vendor sites. I synthesised recurring themes from review platforms (G2, TrustRadius), recruiter-authored blogs, HR press, and candidate surveys.

**Headline finding:** ATS tools are **essential but resented**. Recruiters complain about click-heavy UX and shallow automation; candidates describe hiring as an **opaque black hole** after apply. Only **43%** of HR professionals rate their TA tech stack “good or excellent” (HR.com, 2025–26)—high replacement intent, low forgiveness for bad workflow design.

**SME-specific finding:** Small and medium buyers sit in a **squeeze** — enterprise tools are **too expensive and slow to implement**; budget tools are **too shallow** once hiring volume grows. Discourse shows they need **workflow honesty and triage speed** without enterprise packaging.

---

## Competitive snapshot

| Product | Praised for | Criticised for | Typical buyer |
|---------|-------------|----------------|---------------|
| **Greenhouse** | Structure, scorecards, scheduling, integrations | Cost, setup complexity, reporting/audit gaps | Mid–large enterprise |
| **Lever** | CRM + nurture, sleek UI, sourcing | Less reporting depth; mixed post-acquisition sentiment | Sourcing-heavy teams |
| **Ashby** | Modern UX, analytics, fast setup | Less enterprise compliance proof | Startups / Series A–C |
| **JazzHR / Workable** | Price, simplicity | Limited depth; outgrow quickly | Very small teams |
| **Workday / iCIMS / Bullhorn** | Scale, HRIS unity | “Clunky,” slow, dated UX | Legacy enterprise / agency |
| **TalentHub** | Core loop focus, pipeline craft, honest state | Not yet production SaaS; notifications/integrations TBD | **SME / SMB (20–200 employees, lean TA)** |

**Pattern:** Leaders split on **enterprise structure** (Greenhouse) vs **CRM + nurture** (Lever) vs **modern analytics** (Ashby). Legacy suites are the negative benchmark. **TalentHub targets the underserved middle** — better workflow integrity than budget SMB tools, without enterprise cost and setup.

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

### SME buyers (additional)

- **Enterprise pricing out of reach** — public cost bands and setup fees dominate first ATS purchase anxiety
- **Paying for unused modules** — CRM, nurture, and analytics bundles sit idle after go-live
- **No dedicated TA ops** — one recruiter plus hiring managers; the product must be self-explanatory
- **Wrong buy is costly** — SMEs cannot afford a six-month redo when adoption fails

---

## What users expect (2026)

| Audience | Core expectations |
|----------|-------------------|
| **Recruiters** | Table **and** board on same data · time-scoped pipeline · one **packet page** per application · governed status changes · in-product **scheduling** · fast document access |
| **Candidates** | Short mobile apply · reusable CV/profile · confirmation · **status visibility** (even automated) |
| **Buyers** | Adoption by hiring managers · verified integrations · RBAC + audit · honest TCO |
| **SME buyers** | **Low TCO** · **fast go-live** · **core loop only** · usable without a TA ops admin |

**Table stakes:** calendar/email integrations, pipeline views, application detail—not differentiators on their own. **Differentiators** in discourse: cohort scoping, trustworthy pipeline rules, auditability, and candidate communication — delivered at a scope SMEs can actually adopt.

---

## Design decisions informed by research

| Market pain | Design response in TalentHub |
|-------------|------------------------------|
| Enterprise cost / feature bloat | **Scope to core loop** — no CRM, marketplace, or tiered analytics in MVP |
| Infinite pipeline noise | **Week-scoped** pipeline (past + current week only; no future weeks) |
| Scattered packet review | **`/applications/[id]`** as single anchor for submission, documents, history |
| Scan vs funnel conflict | **Table + pipeline** tabs on one hub (pipeline default) |
| Invalid / untraceable status | **Ten statuses**, server-validated transitions, **audit events**, undo/reopen |
| Status vs interview mismatch | **Schedule interview** on detail; gate before “Interview Scheduled” |
| Lost navigation context | **`?from=applications`** back path from candidate profile |
| Drag vs click accidents | Interaction guard after drag (documented in spec) |
| Resume not focal | Documents + applicant summary prominent on detail page |
| SME “Excel fallback” | Fast triage surfaces so lean teams don’t maintain a shadow spreadsheet |

**Honest gaps (not claimed in portfolio):** enterprise CRM, deep analytics/reporting, email notifications to candidates, integration marketplace—these remain industry-wide or out of MVP scope. See [PRD](../../docs/specification/PRD.md).

---

## Portfolio takeaway (one paragraph)

> I designed TalentHub **for small and medium organizations** that need recruitment support at **low cost**, with **good UX** and **reduced setup time** — not a stripped-down enterprise clone. Netnographic research showed recruiters and candidates resent the same workflow failures whether the buyer is a 50-person company or a Fortune 500; SMEs simply **cannot afford to mis-buy**. I grounded the Applications workflow in that research — fast triage, honest pipeline state, a single packet surface — and scoped out enterprise CRM and analytics that inflate TCO without helping a lean TA team on day one.

---

## Sources (selected)

- NUROFILE — [Problems recruiters face with ATS](https://nurofile.ai/blog/problems-recruiters-face-with-ats/)
- TrustRadius — [Greenhouse vs Lever](https://www.trustradius.com/compare-products/greenhouse-vs-lever)
- HR Dive — [Opaque hiring process](https://www.hrdive.com/news/job-seekers-frustrated-by-opaque-impersonal-hiring-process/819898/)
- LiveCareer — [Job search frustration](https://www.livecareer.com/resources/job-search-frustration)
- Tracker RMS — [Choosing an ATS](https://www.tracker-rms.com/blog/essentials-to-consider-when-transitioning-to-a-new-ats/)

Full bibliography: [17-netnographic-ats-research.md §13](./17-netnographic-ats-research.md#13-sources)

---

*Summary version 1.1 · 19 May 2026*
