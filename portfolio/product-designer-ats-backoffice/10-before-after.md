# Before / after narrative

Use this as a **story slide** in interviews: problem → change → result.

*Grounded in [PRD §9–§10](../../docs/specification/PRD.md) as-built state.*

## Before

- **Applications** existed primarily as a **flat list** mental model; funnel work competed with triage in one undifferentiated view.
- **Pipeline** risked showing **all time** at once—hard to run a weekly hiring rhythm.
- **Deep links** into candidate context risked **losing place** in the applications queue (generic “back to candidates”).
- **Full packet review** required piecing together **job**, **person**, and **documents** across multiple pages.
- **Status changes** lacked a enforced transition model, audit trail, or interview gate.
- **Platform** documentation tracked static HTML markup more closely than the live Next.js apps.

## After

- **Dual mode hub:** same data, **table** for scanability (candidate grouping) and **pipeline** (default) for status-centric work with **fullscreen** option.
- **Week-scoped pipeline** with explicit **week label** and **bounded navigation** (no future weeks).
- **Application detail** as the **single anchor** for submission, documents, status history, interview scheduling, and links to job edit and candidate profile.
- **Ten-status lifecycle** with validated transitions, **undo**, **controlled reopen**, and **audit events**.
- **Interviews:** schedule from detail; calendar at `/interviews`; required before **Interview Scheduled** status.
- **Contextual back navigation** from candidate profile when arriving from Applications (`?from=applications`).
- **Staff-appropriate document access** via authenticated BFF routes.
- **Platform coherence:** candidate portal → my-applications apply → backoffice triage; shared Prisma schema, types, validators, and HTML **design system** with layout templates.
- **Dashboard** orients staff with KPIs, pipeline health, and recent activity.

## One-liner for portfolio hero

**“From weekly cohort triage to full packet review—with validated hiring stages and no dead-end navigation.”**

## Visual pairing (add to deck)

| Before (describe or screenshot) | After (screenshot) |
|--------------------------------|---------------------|
| Single undifferentiated list | Table + Pipeline tabs |
| Timeless pipeline | Week toolbar + cohort copy |
| Profile dead-end | Applications-aware back link |
| Scattered context | `/applications/[id]` packet page |
| Ad-hoc status changes | Kanban + rules + audit history |
| No interview linkage | Schedule modal + calendar |
| Markup-only docs | Live app + PRD + design system |

## Platform one-liner (optional second slide)

**“Publish → apply → triage → interview → hire—three candidate-facing and staff apps, one database.”**
