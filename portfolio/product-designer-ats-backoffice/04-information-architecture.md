# Information architecture

## Platform context (monorepo)

High-level (from `docs/PROJECT_STRUCTURE.md`):

| App | Port | Audience |
|-----|------|----------|
| `apps/candidate-portal` | 3000 | Public candidates |
| `apps/backoffice` | 3001 | Staff |
| `apps/my-applications` | 3002 | Authenticated candidates |
| `apps/api` | 4000 | HTTP API |

This portfolio slice focuses on **`apps/backoffice`** applications workflow and its relationship to **candidates** and **jobs**.

---

## Backoffice — primary navigation (conceptual)

```
Dashboard (home)
├── Jobs
│   ├── List
│   ├── New
│   └── [id] / Edit
├── Candidates
│   ├── All (list)
│   └── [id] / Detail (+ edit)
├── Applications  ← slice focus
│   ├── /applications (table | pipeline)
│   └── /applications/[id] (detail)
├── Interviews
├── Reports
├── Administration
└── Settings
```

---

## Key routes (implementation-aligned)

| Route | Purpose |
|-------|---------|
| `/applications` | Applications hub: **Table** and **Pipeline** tabs |
| `/applications/[id]` | **Application detail** — packet review |
| `/candidates/all` | Candidate directory |
| `/candidates/[id]` | Candidate profile & history |
| `/jobs/[id]/edit` | Job posting edit (linked from application detail) |

---

## Cross-links (design intent)

| From | To | Parameter / note |
|------|-----|------------------|
| Applications table — candidate name | Candidate detail | `?from=applications` → back link returns to **Applications** |
| Applications table — job title | Application detail | `/applications/[id]` |
| Pipeline card | Application detail | `/applications/[id]` |
| Application detail — applicant | Candidate detail | `?from=applications` |
| Application detail — job | Job edit | `/jobs/[id]/edit` |

---

## Depth vs breadth

- **Breadth:** `/applications` for throughput  
- **Depth:** `/applications/[id]` for adjudication  
- **Person context:** `/candidates/[id]` when history across jobs matters  
