# Wireframe 03 — Backoffice application detail (packet page)

| Field | Value |
|-------|--------|
| **App** | `apps/backoffice` · port **3001** |
| **Route** | `/applications/[id]` |
| **PRD** | BO-38 – BO-40, BO-42 |
| **Implementation** | `src/app/(dashboard)/applications/[id]/page.tsx` |

---

## Purpose

**Single packet surface** — everything needed to decide on one application: who, which job, submission, documents, status history, interview, optional AI relevance, links to candidate/job.

---

## Desktop wireframe (1280px)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  ← Back to applications                                                         │
│         │                                                                               │
│         │  Senior Software Engineer                                                     │
│         │  Application for Jane Smith · Under Review                                    │
│         │                                                                               │
│         │  ┌─ Job & timeline ─────────────┐  ┌─ Applicant ──────────────────────────┐  │
│         │  │ Job: Senior Software Engineer │  │ Jane Smith                           │  │
│         │  │ Dept · Location · Remote      │  │ jane@example.com                     │  │
│         │  │ Applied: 14 May 2026          │  │ [ View candidate profile → ]         │  │
│         │  │ Updated: 15 May 2026          │  └──────────────────────────────────────┘  │
│         │  │ [ Edit job posting → ]        │                                           │
│         │  └───────────────────────────────┘                                           │
│         │                                                                               │
│         │  ┌─ Submission details ─────────────────────────────────────────────────────┐ │
│         │  │ Motivation: "I'm excited about…"                                         │ │
│         │  │ Screening Q1: …   Screening Q2: …                                        │ │
│         │  └──────────────────────────────────────────────────────────────────────────┘ │
│         │                                                                               │
│         │  ┌─ Documents ──────────────────┐  ┌─ Schedule interview ─────────────────┐  │
│         │  │ CV submitted    [ Download ] │  │ No interview scheduled               │  │
│         │  │ Default CV      [ Download ] │  │ [ Schedule interview ]               │  │
│         │  │ Cover letter    [ Download ] │  └──────────────────────────────────────┘  │
│         │  └──────────────────────────────┘                                           │
│         │                                                                               │
│         │  ┌─ Scheduled interviews ──────────────────────────────────────────────────┐ │
│         │  │ (when exists) 15 May · 10:00–10:45 · Asia/Singapore · [Preview for cand.]│ │
│         │  └──────────────────────────────────────────────────────────────────────────┘ │
│         │                                                                               │
│         │  ┌─ AI relevance (optional) ────────┐  ┌─ Status history ──────────────────┐  │
│         │  │  [score ring] 72% match          │  │ ● Submitted → Under Review        │  │
│         │  │  [ℹ Human review required]       │  │   Recruiter A · 15 May 10:00      │  │
│         │  │  Breakdown flyover on hover      │  │ ● …                               │  │
│         │  └──────────────────────────────────┘  └───────────────────────────────────┘  │
│         │                                                                               │
│         │  ┌─ Profile overview ───────────┐  ┌─ Experience ───┐  ┌─ Education ──────┐  │
│         │  │ Summary from parsed CV       │  │ Role · Co · Yr │  │ Degree · School  │  │
│         │  └──────────────────────────────┘  └────────────────┘  └──────────────────┘  │
│         │                                                                               │
│         │  ┌─ Cover letter text (full width, if text mode) ──────────────────────────┐ │
│         │  │ Dear hiring team, …                                                     │ │
│         │  └──────────────────────────────────────────────────────────────────────────┘ │
└─────────┴───────────────────────────────────────────────────────────────────────────────┘
```

---

## Schedule interview modal

```text
┌──────────────────────────────────────────────────────────────┐
│  Schedule interview                                       [×]│
├──────────────────────────────────────────────────────────────┤
│  ┌─ Candidate ─────────────────────────────────────────────┐│
│  │ Jane Smith · jane@example.com                             ││
│  └───────────────────────────────────────────────────────────┘│
│  Interview date *     [ 2026-05-20      📅 ]                   │
│  Start time *         [ 10:00           ▼ ]                   │
│  Duration *           [15][30][45][60][90][120] min           │
│  Time zone *          [ (GMT+8) Asia/Singapore        ▼ ]     │
│  ┌─ Candidate time preview ────────────────────────────────┐ │
│  │ Shows local time if profile timezone set (TH-056)       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ☐ Notify candidate by email                                  │
│                              [ Cancel ]  [ Schedule ]         │
└──────────────────────────────────────────────────────────────┘
```

---

## Key states

| State | UI |
|-------|-----|
| No CV on application | Em dash in document row |
| Interview exists | List row + gate allows `interview_scheduled` |
| AI key missing | Hide or empty relevance section |
| Text cover letter | Full-width section; hide if empty |
| Rejected terminal | Detail read-only for status; reopen via pipeline |

---

## Navigation

| Control | Target |
|---------|--------|
| Back | `/applications` (preserves view if encoded) |
| View candidate | `/candidates/[id]?from=applications` |
| Edit job | `/jobs/[id]/edit` |

---

## Design notes

- **Application as unit of work** — packet page is the anchor; candidate/job are secondary hops.
- **Honest state** — schedule CTA visible before status can advance to Interview Scheduled.
