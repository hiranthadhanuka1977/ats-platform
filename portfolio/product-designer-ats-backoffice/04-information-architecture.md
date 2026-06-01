# Information architecture

*Aligned with [PRD §4](../../docs/specification/PRD.md) and `docs/PROJECT_STRUCTURE.md`.*

## Platform context (monorepo)

| App | Port | Audience | PRD section |
|-----|------|----------|-------------|
| `apps/candidate-portal` | 3000 | Public candidates | §5.1 |
| `apps/my-applications` | 3002 | Authenticated candidates | §5.2 |
| `apps/backoffice` | 3001 | Staff | §5.3–§5.9 |
| `apps/api` | 4000 | Auth + candidate registration | §5.10 |

This portfolio slice focuses on **`apps/backoffice`** applications workflow and its relationships to **candidates**, **jobs**, and **interviews**. Candidate apply flow lives in **my-applications**; public browse in **candidate-portal**.

---

## Backoffice — primary navigation

Order matches `Sidebar.tsx` (Applications before Interviews).

```
Dashboard (home)                    ← KPIs, pipeline health, recent activity [Done]
├── Applications                    ← portfolio slice focus
│   ├── /applications (table | pipeline) [Done]
│   └── /applications/[id] (detail) [Done]
├── Interviews                      [Done]
├── Jobs
│   ├── List                        [Done]
│   ├── New → Review → Success      [Done]
│   ├── [id] / Edit                 [Done]
│   └── [id] / Preview              [Done]
├── Candidates
│   ├── Summary + All (list)        [Done]
│   └── [id] / Detail (+ edit status) [Done]
├── Reports                         [Placeholder]
├── Administration                  [Done — lookup CRUD]
└── Settings                        [Placeholder]
```

**Visual IA map (PNG + Mermaid):** [portfolio/information-architecture/backoffice-navigation-map.md](../information-architecture/backoffice-navigation-map.md)

---

## Key routes (implementation-aligned)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Dashboard — stats, pipeline snapshot, activity | Done |
| `/applications` | Applications hub: **Table** and **Pipeline** (pipeline default) | Done |
| `/applications/[id]` | **Application detail** — packet review, status, interview | Done |
| `/interviews` | Interview calendar | Done |
| `/candidates`, `/candidates/all` | Candidate summary and directory | Done |
| `/candidates/[id]` | Candidate profile & history | Done |
| `/jobs`, `/jobs/new`, `/jobs/[id]/edit` | Job posting lifecycle | Done |
| `/administration/[section]` | Lookup CRUD (departments, skills, etc.) | Done |
| `/reports`, `/settings` | Placeholder copy | Planned |

---

## Application lifecycle (IA implication)

Active Kanban columns (PRD §6):

```text
Submitted → Under Review → Shortlisted → Interview Scheduled → Interview Completed → Offered → Hired
```

Terminal views: **Rejected**, **Withdrawn** (separate tabs/filters, not active board clutter).

---

## Cross-links (design intent)

| From | To | Parameter / note |
|------|-----|------------------|
| Applications table — candidate name | Candidate detail | `?from=applications` → back link returns to **Applications** |
| Applications table — job title | Application detail | `/applications/[id]` |
| Pipeline card | Application detail | `/applications/[id]` |
| Application detail — applicant | Candidate detail | `?from=applications` |
| Application detail — job | Job edit | `/jobs/[id]/edit` |
| Application detail — schedule interview | Modal → `/interviews` calendar | One interview per application |
| Dashboard — recent activity | Application or job detail | Contextual deep links |

---

## Depth vs breadth

- **Breadth:** `/applications` for throughput; `/interviews` for schedule overview
- **Depth:** `/applications/[id]` for adjudication and status actions
- **Person context:** `/candidates/[id]` when history across jobs matters
- **Platform context:** `/` dashboard for daily orientation

---

## Design system

Layout templates and components documented in [design-system/index.html](../../docs/design-system/index.html): portal shell, job listing, auth split, dashboard shell, pipeline full viewport.
