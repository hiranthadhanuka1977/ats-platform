# Wireframe 06 — My Applications candidate dashboard

| Field | Value |
|-------|--------|
| **App** | `apps/my-applications` · port **3002** |
| **Route** | `/dashboard` |
| **PRD** | MA-05 |
| **Implementation** | `CandidateDashboardClient.tsx` · journey + activity components |

---

## Purpose

Authenticated **candidate home** — onboarding journey (profile, CV, apply), recent application activity, shortcuts to job search and my applications list.

---

## Desktop wireframe (1280px)

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [Skip to main content]                                                                   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│  HEADER: TalentHub My Applications     Dashboard · Jobs · Applications · Profile  [Logout]│
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  Welcome back, Jane                                                                      │
│  Track your applications and complete your profile.                                      │
│                                                                                          │
│  ┌─ Your journey ──────────────────────────────────────────────────────────────────────┐ │
│  │  Get ready to apply                                                                 │ │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐         │ │
│  │  │ 1 Profile│───│ 2 Upload │───│ 3 Cover  │───│ 4 Search │───│ 5 Apply  │         │ │
│  │  │   ✓      │   │   CV ✓   │   │  letter  │   │   jobs   │   │          │         │ │
│  │  │ [Edit]   │   │ [Manage] │   │ [Add]    │   │ [Browse] │   │          │         │ │
│  │  └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘         │ │
│  │  Progress bar ████████████░░░░░░  60% complete                                    │ │
│  └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                          │
│  ┌─ Recent application activity ─────────────────────┐  ┌─ Quick actions ────────────┐ │
│  │  Senior Software Engineer                         │  │  [ Search jobs ]           │ │
│  │  Acme Corp · Under Review · Updated 2 days ago    │  │  [ My applications ]       │ │
│  │  [ View → ]                                       │  │  [ Upload CV ]             │ │
│  │  ─────────────────────────────────────────────    │  │  [ My profile ]            │ │
│  │  Product Manager Intern                           │  └────────────────────────────┘ │
│  │  Acme Corp · Submitted · Updated 1 week ago       │                                   │
│  │  [ View → ]                                       │                                   │
│  │  … (up to 4 items)                                │                                   │
│  │  [ View all applications → ]                      │                                   │
│  └───────────────────────────────────────────────────┘                                   │
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Journey step states

| Step | Complete when | CTA |
|------|---------------|-----|
| 1 Profile | basicProfileComplete | → `/my-profile` |
| 2 Upload CV | hasCv | → `/cv-upload` |
| 3 Cover letter | hasCoverLetter (optional) | → `/cover-letters` |
| 4 Search jobs | user visited job search | → `/job-search` |
| 5 Apply | ≥1 application submitted | → `/my-applications` |

Visual: ✓ done · ○ pending · current step highlighted.

---

## Key states

| State | UI |
|-------|-----|
| **Loading** | Skeleton journey + activity |
| **No applications** | Empty activity “You haven’t applied yet” + [ Search jobs ] |
| **Unauthenticated** | Redirect to `/login` |
| **Error** | Banner “Unable to load your dashboard” |

---

## Mobile

```text
┌─────────────────────────┐
│ [≡]  My Applications    │
├─────────────────────────┤
│ Welcome, Jane           │
│ Journey (horizontal     │
│  scroll steps)          │
│ Progress bar            │
│ Recent activity (stack) │
│ Quick actions (stack)   │
└─────────────────────────┘
```

---

## Related screens (not wireframed here)

| Route | Purpose |
|-------|---------|
| `/my-applications` | Full application list with statuses |
| `/jobs/[slug]/apply` | Apply flow (CV, cover letter, screening) |
| `/cv-upload` | CV library and parse |

---

## Design notes

- **Self-service onboarding** — SME candidates complete setup without recruiter help (MA-01–03).
- **Status visibility** — mirrors backoffice vocabulary so candidates see the same pipeline language (candidate trust theme from netnography research).
