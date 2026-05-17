# Competitive and pattern notes (template)

Use this as a **repeatable worksheet**. Replace bracketed sections with screenshots and your verdict.

## Purpose

Show hiring managers and design leads that you **grounded decisions** in market patterns—not arbitrary UI.

---

## Pattern 1 — Dual view (table + board)

| Product / pattern | Screenshot / link | What they do well | Risk |
|-------------------|-------------------|-------------------|------|
| e.g. Greenhouse, Lever, Jira | *[link]* | Familiar mental model for ops-heavy users | Board can overwhelm without filters |

**Decision for this project:** Offer **Table** and **Pipeline** tabs on one Applications page so users self-select mode without changing URL hierarchy.

---

## Pattern 2 — Kanban by hiring stage

| Example | Notes |
|---------|-------|
| *[ATS name]* | Columns = discrete stages; drag to advance |

**Decision:** Columns align to **application status** vocabulary shared across the product (`@ats-platform/types` labels/descriptions).

---

## Pattern 3 — Time-based cohorts

| Example | Notes |
|---------|-------|
| Inbox zero / weekly triage | Week or date range reduces noise |

**Decision:** Pipeline filters by **week of submission** with explicit week label and prev/next controls; **block future weeks** because empty future cohorts add no value and confuse trust.

---

## Pattern 4 — Candidate packet page

| Example | Notes |
|---------|-------|
| Application review | Single URL for “everything about this application” |

**Decision:** Introduce **`/applications/[id]`** as the **anchor** for packet review; link out to **candidate** and **job edit** as secondary hops.

---

## Anti-patterns avoided

- **Infinite mixed-time pipeline** without a cohort anchor (reduced via week scope)  
- **Click-drag ambiguity** on cards (mitigated via interaction timing / disabled navigation while updating)  
- **Orphan candidate profile** with no return path (mitigated via query param from Applications)  

---

## Your voice (add 3 bullets)

- What you **borrowed** from market leaders  
- What you **simplified** for MVP  
- What you would **validate** in usability tests next  
