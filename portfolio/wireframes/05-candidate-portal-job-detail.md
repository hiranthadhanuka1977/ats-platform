# Wireframe 05 — Candidate portal job detail

| Field | Value |
|-------|--------|
| **App** | `apps/candidate-portal` · port **3000** |
| **Route** | `/jobs/[slug]` |
| **PRD** | CP-04 – CP-08 |
| **Implementation** | `src/app/jobs/[slug]/page.tsx` |

---

## Purpose

Full **role narrative** for job seekers — overview, responsibilities, qualifications, skills, benefits, tags — with a persistent apply path to My Applications.

---

## Desktop wireframe (1280px)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Skip to main content]                                                                   │
│  HEADER: Logo · Careers · Login                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  HERO BANNER (banner_image_url + alt, or gradient fallback)                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  Senior Software Engineer                                                          │  │
│  │  Engineering · Singapore · Posted 1 May 2026                                       │  │
│  │  [ Full-time ] [ Hybrid remote ] [ ★ Featured ]                                    │  │
│  └────────────────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  DETAIL LAYOUT (main + sidebar)                                                          │
│  ┌─ Main column (~2/3) ─────────────────────────────┐  ┌─ Sidebar (~1/3) ────────────┐  │
│  │                                                  │  │  AT A GLANCE               │  │
│  │  Overview                                        │  │  Location: Singapore       │  │
│  │  We are looking for…                             │  │  Type: Full-time           │  │
│  │                                                  │  │  Experience: Senior        │  │
│  │  Responsibilities                                │  │  Salary: $80k–$120k USD    │  │
│  │  • Gather requirements                           │  │  ─────────────────────     │  │
│  │  • Design and implement…                       │  │  [ Apply now → MA ]        │  │
│  │  • …                                             │  │  (links to :3002 login/    │  │
│  │                                                  │  │   apply with job context)  │  │
│  │  Qualifications                                  │  │  [ Share ]                 │  │
│  │  • 5+ years…                                     │  └────────────────────────────┘  │
│  │                                                  │                                  │
│  │  Skills                                          │                                  │
│  │  [ TypeScript ] [ React ] [ Node.js ] …          │                                  │
│  │                                                  │                                  │
│  │  Benefits                                        │                                  │
│  │  • Health insurance · Flexible hours …           │                                  │
│  │                                                  │                                  │
│  │  Tags                                            │                                  │
│  │  [ backend ] [ startup-culture ]                 │                                  │
│  └──────────────────────────────────────────────────┘                                  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Activity / meta card (below hero, optional)

```text
┌─ About this role ────────────────────────────────────────┐
│  Open · 24 applicants · Closes 30 Jun 2026  (if in data) │
└──────────────────────────────────────────────────────────┘
```

---

## Key states

| State | UI |
|-------|-----|
| Valid slug | Full layout |
| Unknown slug | 404 / not found |
| Salary hidden | Omit range in sidebar and hero |
| No banner | Placeholder gradient + aria-label |

---

## Mobile

Sidebar **stacks below** main content; **Apply now** sticky bar optional at bottom:

```text
┌─────────────────────────┐
│ Banner / title          │
│ Overview…               │
│ Responsibilities…       │
│ …                       │
├─────────────────────────┤
│ At a glance (stack)     │
│ [ Apply now — full width]│
└─────────────────────────┘
```

---

## Apply flow (cross-app)

```text
Candidate portal /jobs/acme-senior-dev
        │
        ▼
My Applications :3002/jobs/acme-senior-dev/apply
        (login/register if needed)
```

---

## Design notes

- **Content hierarchy** from `Job_Posting_Templates.md` — same structure staff preview in backoffice (`/jobs/[id]/preview`).
- **Trust** — salary visibility flag respects employer preference.
