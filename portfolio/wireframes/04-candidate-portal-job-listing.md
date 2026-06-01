# Wireframe 04 — Candidate portal job listing (careers home)

| Field | Value |
|-------|--------|
| **App** | `apps/candidate-portal` · port **3000** |
| **Route** | `/` |
| **PRD** | CP-01 – CP-03, CP-06 |
| **Implementation** | `src/app/page.tsx` · `JobListingShell.tsx` |

---

## Purpose

Public **job discovery** — search and filter published roles, scan cards, paginate. Apply flows redirect to My Applications (`:3002`).

---

## Desktop wireframe (1280px)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Skip to main content]                                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  HEADER: Logo TalentHub          Careers    [Login → MA :3002]                           │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  HERO — Find your next opportunity                                                       │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐│
│  │ 🔍  Search jobs by title or keyword…                              [ Search ]       ││
│  └────────────────────────────────────────────────────────────────────────────────────┘│
│  Quick filters: [ Department ▼ ] [ Location ▼ ] [ Type ▼ ] [ Experience ▼ ] [ Remote ☐]│
│                                                                                          │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  MAIN (two-column layout)                                                                │
│  ┌─ Filter drawer / sidebar ─────┐  ┌─ Results ──────────────────────────────────────┐  │
│  │ Filters                        │  │ 42 jobs found [A live]    Sort: [ Recent ▼ ]   │  │
│  │ Department                     │  │ ─────────────────────────────────────────────  │  │
│  │ ☐ Engineering                  │  │ ┌──────────────────────────────────────────┐ │  │
│  │ ☐ Product                      │  │ │ ★ FEATURED                               │ │  │
│  │ Location                       │  │ │ Senior Software Engineer                 │ │  │
│  │ ☐ Singapore                    │  │ │ Engineering · Singapore · Full-time      │ │  │
│  │ Employment type                │  │ │ Remote hybrid · $80k–$120k USD           │ │  │
│  │ …                              │  │ │ Build scalable systems…                  │ │  │
│  │ [ Apply filters ] [ Clear ]    │  │ │                        [ View role → ]   │ │  │
│  └────────────────────────────────┘  │ └──────────────────────────────────────────┘ │  │
│                                       │ ┌──────────────────────────────────────────┐ │  │
│  ┌─ Marketing banner ──────────────┐  │ │ Product Manager                          │ │  │
│  │ Stand out with a stronger       │  │ │ …                                        │ │  │
│  │ profile — upload resume once    │  │ └──────────────────────────────────────────┘ │  │
│  │ [ Upload resume → login ]       │  │ … more JobCard rows …                        │  │
│  └─────────────────────────────────┘  │ [ ← Prev ]  Page 1 of 4  [ Next → ]          │  │
│                                       └──────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  FOOTER: Privacy · Terms · Accessibility · © TalentHub                                 │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Job card (component)

```text
┌──────────────────────────────────────────────┐
│ ★ FEATURED  (ribbon if is_featured)          │
│ Senior Software Engineer                     │
│ [Engineering] [Singapore] [Full-time] [Remote]│
│ $80,000 – $120,000 USD  (if is_salary_visible)│
│ Short summary text truncated to two lines…   │
│                              [ View role → ] │
└──────────────────────────────────────────────┘
         → /jobs/[slug]
```

---

## Key states

| State | UI |
|-------|-----|
| **Results** | Toolbar `[N] jobs found` aria-live polite |
| **Empty** | Empty state icon + “No jobs match your filters” + clear filters |
| **Filter drawer (mobile)** | Overlay; Escape closes |
| **Pagination** | Prev disabled on page 1 |

---

## Mobile (≤768px)

```text
┌─────────────────────────┐
│ [≡]  TalentHub    Login │
├─────────────────────────┤
│ HERO search (stack)     │
│ [ Filters ]  ← opens drawer
├─────────────────────────┤
│ 42 jobs · Sort ▼        │
│ ┌─────────────────────┐ │
│ │ Job card (full)     │ │
│ └─────────────────────┘ │
│ Marketing banner        │
│ Pagination              │
└─────────────────────────┘
```

---

## Out of scope on this screen

- In-portal apply (CP-10) — Apply/login → **My Applications**
- Bookmarks (CP-11) — planned

---

## Design notes

- **URL-driven filters** — shareable search links for SME career pages.
- **Featured + salary visibility** — merchandising without cluttering every card.
