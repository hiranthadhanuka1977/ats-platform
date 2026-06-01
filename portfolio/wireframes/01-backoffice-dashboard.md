# Wireframe 01 — Backoffice staff dashboard

| Field | Value |
|-------|--------|
| **App** | `apps/backoffice` · port **3001** |
| **Route** | `/` |
| **PRD** | BO-10 – BO-14 |
| **Implementation** | `src/app/(dashboard)/page.tsx` · `DashboardGrid.tsx` |

---

## Purpose

Give recruiters a **single landing view** of hiring health: KPIs, pipeline distribution, recent status activity, efficiency signal, and stalled-interview nudge — before diving into Applications or Jobs.

---

## Desktop wireframe (1280px)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Skip to main content]                                                                   │
├──────────────┬───────────────────────────────────────────────────────────────────────────┤
│              │  TOP BAR                                          [User ▼] [Logout]       │
│  SIDEBAR     ├───────────────────────────────────────────────────────────────────────────┤
│              │                                                                           │
│  ● Dashboard │  Dashboard                                                                │
│    Applications│  Recruitment health overview                         [Date: today]      │
│    Jobs      │                                                                           │
│    Candidates│  ┌─────────────────────────────┐  ┌──────────────────────────────────┐  │
│    Interviews│  │  EFFICIENCY SCORE           │  │  KPI STAT ROW (4 tiles)          │  │
│    Admin ▼   │  │  ┌─────┐                    │  │  ┌────────┐ ┌────────┐ ┌──────┐ │  │
│    Reports   │  │  │ 78  │  Good pace this week │  │ Open   │ │ New    │ │ Int. │ │  │
│    Settings  │  │  └─────┘                    │  │ Jobs   │ │ Apps   │ │ sched│ │  │
│              │  │  [sparkline / hint text]    │  │  12    │ │  34    │ │  5   │ │  │
│              │  └─────────────────────────────┘  │  └────────┘ └────────┘ └──────┘ │  │
│              │                                    │  ┌────────┐                      │  │
│              │                                    │  │ Hired  │  (etc.)              │  │
│              │                                    │  │  2     │                      │  │
│              │                                    │  └────────┘                      │  │
│              │                                    └──────────────────────────────────┘  │
│              │                                                                           │
│              │  ┌────────────────────────────────────┐  ┌─────────────────────────────┐ │
│              │  │  RECENT ACTIVITY                   │  │  PIPELINE HEALTH            │ │
│              │  │  ─────────────────                 │  │  ────────────────           │ │
│              │  │  • Jane → Shortlisted              │  │  Submitted      ████  8     │ │
│              │  │    Senior Dev · 2h ago             │  │  Under Review   ██████ 12   │ │
│              │  │  • Alex → Interview Scheduled      │  │  Shortlisted    ███  6      │ │
│              │  │    PM Role · 5h ago                │  │  Interview…     ██  4       │ │
│              │  │  • …                               │  │  Offered        █  2        │ │
│              │  │                                    │  │  [View pipeline →]          │ │
│              │  │  [View all activity →]             │  └─────────────────────────────┘ │
│              │  └────────────────────────────────────┘                                   │
│              │                                                                           │
│              │  ┌─────────────────────────────────────────────────────────────────────┐ │
│              │  │  CURATOR INSIGHT — Stalled interviews                               │ │
│              │  │  3 applications in Interview Scheduled with no recent movement.     │ │
│              │  │  [Review applications →]                                          │ │
│              │  └─────────────────────────────────────────────────────────────────────┘ │
│              │                                                                           │
└──────────────┴───────────────────────────────────────────────────────────────────────────┘
```

---

## Region map

| Region | Content | Interaction |
|--------|---------|-------------|
| Sidebar | Primary nav; Dashboard active | → routes |
| Efficiency card | Composite score + narrative | Informational |
| Stat row | Open jobs, applications, interviews, hires | Tiles may link to filtered lists |
| Recent activity | Latest `application_status_events` | → application detail |
| Pipeline health | Count per active status | → `/applications` pipeline |
| Curator insight | Stalled `interview_scheduled` count | → filtered applications |

---

## Key states

| State | Behaviour |
|-------|-----------|
| **Loading** | Skeleton cards in grid |
| **Empty tenant** | Zeros in stats; muted activity “No recent changes” |
| **Insight zero** | Hide or collapse curator card when `stalledInterviewCount === 0` |

---

## Mobile (≤768px)

```text
┌─────────────────────────┐
│ [≡]  Dashboard    [User]│
├─────────────────────────┤
│ Efficiency score (full) │
│ KPI tiles (2×2 grid)    │
│ Recent activity (stack) │
│ Pipeline health (stack) │
│ Curator insight (full)  │
└─────────────────────────┘
```

Sidebar → hamburger overlay (`BackOfficeShell` mobile nav).

---

## Design notes (portfolio)

- **Progressive disclosure:** Dashboard summarizes; Applications holds operational depth.
- **SME fit:** One screen answers “how is hiring going?” without opening Reports (placeholder).
