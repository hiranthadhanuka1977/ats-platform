# Wireframe 02 — Backoffice applications pipeline (Kanban)

| Field | Value |
|-------|--------|
| **App** | `apps/backoffice` · port **3001** |
| **Route** | `/applications` (pipeline default) |
| **PRD** | BO-30 – BO-33, BO-43 |
| **Implementation** | `ApplicationsPageClient.tsx` · `ApplicationsPipelineBoard.tsx` |

---

## Purpose

**Week-scoped triage** — recruiters review who applied in a cohort, drag cards through governed statuses, or use keyboard **Move to** menu. Rejected/Withdrawn live outside the active board.

---

## Desktop wireframe — Pipeline view (1280px)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Applications                                                          [⛶ FS] │
│         │  Review and progress candidate applications                                   │
│         ├───────────────────────────────────────────────────────────────────────────────┤
│         │  [ Table view ]  [ Pipeline ● ]          ← tabs; pipeline is default           │
│         │                                                                               │
│         │  ┌─ Applications pipeline ─────────────────────────────────────────────────┐  │
│         │  │  [ ← Prev week ]  [ Next week → ]  [ This week ]     Week: 12–18 May [A]│  │
│         │  │  ─────────────────────────────────────────────────────────────────────  │  │
│         │  │  [ Rejected (4) ]  [ Withdrawn (1) ]   ← terminal tabs                    │  │
│         │  │                                                                           │  │
│         │  │  ┌ Submitted ┐ ┌ Under Review ┐ ┌ Shortlisted ┐ ┌ Interview Sched ┐ …    │  │
│         │  │  │  (3)     │ │  (5)         │ │  (2)        │ │  (4)            │    │  │
│         │  │  │ ┌──────┐ │ │ ┌──────┐     │ │ ┌──────┐    │ │ ┌──────┐        │    │  │
│         │  │  │ │Job   │ │ │ │Job   │     │ │ │Job   │    │ │ │Job   │  [⋮]   │    │  │
│         │  │  │ │title…│ │ │ │title…│     │ │ │title…│    │ │ │title…│        │    │  │
│         │  │  │ │Cand. │ │ │ │Cand. │     │ │ │Cand. │    │ │ │Cand. │        │    │  │
│         │  │  │ │Applied│ │ │ │Applied│     │ │ │Applied│    │ │ │Applied│        │    │  │
│         │  │  │ │[AI ○]│ │ │ │      │     │ │ │      │    │ │ │      │        │    │  │
│         │  │  │ └──────┘ │ │ └──────┘     │ │ └──────┘    │ │ └──────┘        │    │  │
│         │  │  │  …       │ │  …           │ │             │ │                 │    │  │
│         │  │  └──────────┘ └──────────────┘ └─────────────┘ └─────────────────┘    │  │
│         │  │         ← horizontal scroll for Interview Completed → Offered → Hired │  │
│         │  └───────────────────────────────────────────────────────────────────────┘  │
│         │                                                                               │
│         │  ┌─ Undo banner (amber, when last move undoable) ────────────────────────┐  │
│         │  │  Status updated to Shortlisted.              [ Undo last move ]      │  │
│         │  └───────────────────────────────────────────────────────────────────────┘  │
└─────────┴───────────────────────────────────────────────────────────────────────────────┘
```

---

## Card anatomy

```text
┌─────────────────────────────┐
│ Senior Software Engineer    │  ← job title (ellipsis + title tooltip)
│ Jane Smith                  │  ← candidate name
│ Applied 14 May 2026, 09:42  │
│ [optional relevance ring ○] │  ← AI score + bias tooltip (TH-128/129)
└─────────────────────────────┘
     click → /applications/[id]
     drag  → PATCH status (validated)
     [⋮]   → Move to… (keyboard path)
```

---

## Modals (overlay)

```text
┌─────────────────────────────────────┐
│  Reject application            [×]  │
│  Reason *  [________________]       │
│  Note      [________________]       │
│  ☐ Notify candidate                 │
│           [ Cancel ]  [ Reject ]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Cancel scheduled interview?   [×]  │
│  Moving backward will cancel the    │
│  interview for this application.    │
│  ☐ Cancel interview and notify      │
│  [ Cancel ]  [ Cancel interview ]   │
└─────────────────────────────────────┘
```

---

## Key states

| State | UI |
|-------|-----|
| Current week | **Next week** disabled + tooltip “Future weeks not available” |
| Past week | **This week** button visible |
| Empty cohort | Muted message; columns still accept drop |
| Drag in progress | Card opacity reduced |
| PATCH in flight | Card not draggable; wait cursor |
| Fullscreen | `[⛶]` expands pipeline; content class `bo-content--pipeline` |

---

## Table view (same URL, tab toggle)

```text
[ Table view ● ]  [ Pipeline ]

┌──────────────────────────────────────────────────────────────────┐
│ Candidate      │ Email           │ Job          │ Status │ Applied │
├────────────────┼─────────────────┼──────────────┼────────┼─────────┤
│ Jane Smith (2) │ jane@…          │ Senior Dev   │ Short… │ 14 May  │
│                │                 │ PM Intern    │ Subm…  │ 10 May  │
└──────────────────────────────────────────────────────────────────┘
         rowspan when one candidate, multiple applications
```

---

## Mobile

Pipeline horizontal scroll preserved; week toolbar stacks; card **Move to** menu preferred over drag on touch.
