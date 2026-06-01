# TalentHub — Feature Backlog: User Stories

**Companion to:** [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md)  
**Version:** 2.0 · 21 May 2026

Plain-language **user stories** for every **TH-** feature in the backlog. Use for product planning, case studies, stakeholder reviews, and sprint backlogs. For technical implementation detail, see [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) and [PRD.md](./PRD.md).

---

## How to use

1. Find a feature code in [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md) (e.g. **TH-043**).
2. Read the **user story** and **acceptance criteria** below that code.
3. For **Done** items, stories describe expected behaviour today — use for QA checklists or regression testing in plain language.
4. For **Partial** or **Planned** items, stories define what remains from the user's perspective.
5. For **Out of scope** items, stories explain why the capability is deferred.

### Status legend

| Status | Story intent |
|--------|----------------|
| **Done** | Describes behaviour candidates and recruiters should experience today |
| **Partial** | Core journey exists; acceptance criteria include the known gap |
| **Planned** | Future capability — not yet fully delivered |
| **Out of scope** | Explicitly deferred for the current SME product phase |

---

## 1. Platform & infrastructure

#### TH-001 — Unified product platform

**Status:** Done · **Audience:** Platform

**User story**

> As a **product team member**, I want **all parts of TalentHub (job site, candidate workspace, staff tools, and shared services) to run from one coordinated codebase**, so that **we can develop, test, and release features consistently without duplicate setup**.

**Acceptance criteria**

- All four product areas start together for local development
- Shared building blocks are reused across apps
- There is only one place to manage database structure

#### TH-002 — Single source of truth for hiring data

**Status:** Done · **Audience:** Platform

**User story**

> As a **product team member**, I want **one shared database schema for all hiring data**, so that **candidates, jobs, and applications stay in sync everywhere**.

**Acceptance criteria**

- Job and application data is consistent across all apps
- Database changes are applied in one place

#### TH-003 — Secure document storage (local)

**Status:** Done · **Audience:** Platform

**User story**

> As a **candidate**, I want **my CV and cover letters stored safely when I upload them**, so that **recruiters can review my documents and I can reuse them on future applications**.

**Acceptance criteria**

- Uploaded CVs and cover letters are saved and retrievable
- Staff can download documents they are authorised to view
- Unsupported or oversized files are rejected with a clear message

#### TH-004 — Consistent data validation

**Status:** Done · **Audience:** Platform

**User story**

> As a **product team member**, I want **the same rules applied when forms are submitted across the product**, so that **users see predictable errors and data quality stays high**.

**Acceptance criteria**

- Application status changes, interview scheduling, and sign-up follow shared validation rules
- Invalid submissions are blocked before they reach the database

#### TH-005 — Clear application status rules

**Status:** Done · **Audience:** Platform

**User story**

> As a **recruiter**, I want **only valid status moves allowed when I progress a candidate**, so that **the hiring pipeline stays trustworthy and auditable**.

**Acceptance criteria**

- Illegal status jumps are prevented
- Staff UI and server agree on the ten statuses and allowed transitions

#### TH-006 — Shared UI building blocks

**Status:** Done · **Audience:** Platform

**User story**

> As a **candidate and recruiter**, I want **familiar buttons, forms, and patterns across TalentHub apps**, so that **the product feels cohesive and is easier to learn**.

**Acceptance criteria**

- Common interface elements are reused where both candidate and staff apps need them

#### TH-007 — Clear setup guide for new developers

**Status:** Done · **Audience:** Platform

**User story**

> As a **product team member**, I want **accurate documentation for running TalentHub locally**, so that **new contributors can start without guesswork**.

**Acceptance criteria**

- Environment variables and startup steps match how the product actually runs
- A new developer can follow the guide end-to-end

#### TH-008 — Cloud file storage for production

**Status:** Planned · **Audience:** Platform · **Priority:** P2

**User story**

> As a **organisation admin**, I want **CVs and attachments stored in cloud storage when we deploy live**, so that **uploads remain reliable as we scale beyond a single server**.

**Acceptance criteria**

- Local development still works as today
- Production can use cloud storage without breaking existing file links
- Upload and download behaviour stays the same for users

#### TH-009 — Email delivery for hiring notifications

**Status:** Planned · **Audience:** Platform · **Priority:** P0

**User story**

> As a **candidate and recruiter**, I want **TalentHub to send real emails for verification, status updates, and interviews**, so that **candidates stay informed and recruiters' notify choices actually reach people**.

**Acceptance criteria**

- Verification codes can be sent by email in staging/production
- Status and interview notifications send when staff opt in
- If email is unavailable, the app still saves the hiring action and logs the failure

#### TH-010 — Product success metrics

**Status:** Planned · **Audience:** Platform · **Priority:** P2

**User story**

> As a **hiring manager**, I want **insight into how well our hiring funnel performs**, so that **we can improve apply completion, triage speed, and CV parsing success**.

**Acceptance criteria**

- Key events (apply completed, application opened by staff) can be measured
- Metrics respect privacy settings and work without third-party tools in dev

#### TH-011 — Multi-company data isolation

**Status:** Out of scope · **Audience:** Platform

**User story**

> As a **enterprise buyer**, I want **strict separation between different companies' data on one platform**, so that **each tenant's jobs and candidates would never mix**.

**Acceptance criteria**

- Not planned for the current SME release — TalentHub targets single-organisation use
- Only reconsider if product scope explicitly expands to multi-tenant

#### TH-012 — Production scaling guidance

**Status:** Planned · **Audience:** Platform · **Priority:** P3

**User story**

> As a **technical stakeholder**, I want **a documented path for scaling TalentHub in production**, so that **we can grow without redesigning from scratch**.

**Acceptance criteria**

- Architecture guidance covers hosting, storage, email, and optional job queues
- No forced infrastructure build unless specifically requested

## 2. Candidate portal

#### TH-020 — Browse open jobs with pages

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **to browse published job listings page by page**, so that **I can explore opportunities without seeing draft or internal roles**.

**Acceptance criteria**

- Only published jobs appear
- I can move between pages when many jobs exist
- An empty state appears when no jobs match

#### TH-021 — Filter jobs

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **to filter jobs by department, location, type, experience, and remote options**, so that **I quickly find roles that fit my situation**.

**Acceptance criteria**

- Each filter updates results and can be shared via the URL
- Browser back/forward restores my filter choices
- Filters can be combined

#### TH-022 — Search jobs by keyword

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **to search jobs by title or summary keywords**, so that **I find relevant roles without reading every listing**.

**Acceptance criteria**

- Search matches title and summary text
- Clearing search shows all jobs again
- Result count updates when search changes

#### TH-023 — Read full job details

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **to read the full job description before applying**, so that **I understand responsibilities, requirements, and benefits**.

**Acceptance criteria**

- Overview, responsibilities, qualifications, skills, benefits, and tags all display
- Invalid job links show a helpful not-found page

#### TH-024 — See salary when employer allows

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **to see salary information only when the employer chose to show it**, so that **I can compare compensation fairly without hidden surprises**.

**Acceptance criteria**

- Salary is hidden when the employer turned visibility off
- When visible, salary range displays in a readable format

#### TH-025 — Spot featured jobs

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **featured roles to stand out in the listing**, so that **I notice priority openings the employer wants to highlight**.

**Acceptance criteria**

- Featured jobs have distinct visual treatment
- Non-featured jobs look unchanged

#### TH-026 — See job banner image

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **a banner image on job pages when provided**, so that **I get a richer sense of the employer and role**.

**Acceptance criteria**

- Image shows with descriptive alt text when provided
- Layout stays stable when no banner exists

#### TH-027 — Apply via My Applications

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **Apply to take me to my candidate workspace to sign in and submit**, so that **I complete applications in one secure place built for that purpose**.

**Acceptance criteria**

- Apply does not open a form on the public job site
- I am directed to the candidate workspace to continue

#### TH-028 — Accessible public job site

**Status:** Done · **Audience:** Candidate portal

**User story**

> As a **job seeker with disabilities**, I want **an accessible layout with skip navigation and clear structure**, so that **I can browse jobs using keyboard and assistive technology**.

**Acceptance criteria**

- Skip link jumps to main content
- Header, navigation, and footer are clearly structured
- Legal footer links still need real destinations (see TH-192)

#### TH-029 — Save jobs for later (portal)

**Status:** Planned · **Audience:** Candidate portal · **Priority:** P2

**User story**

> As a **job seeker**, I want **to bookmark jobs while browsing**, so that **I can return and apply when I am ready**.

**Acceptance criteria**

- Signed-in candidates can save and unsave jobs
- Duplicate saves are prevented
- Saved jobs appear in my candidate workspace

#### TH-030 — Sign in on the public job site

**Status:** Out of scope · **Audience:** Candidate portal

**User story**

> As a **job seeker**, I want **not to manage account and apply on two different sites**, so that **my login and applications stay in one dedicated workspace**.

**Acceptance criteria**

- Public job site stays browse-only
- Apply always routes to the candidate workspace (TH-027)

## 3. My Applications

#### TH-040 — Create a candidate account

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to register with email and password**, so that **I can save my profile and track applications**.

**Acceptance criteria**

- Registration creates my account
- Password rules are enforced with clear errors

#### TH-041 — Verify my email

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to confirm my email with a one-time code**, so that **the employer knows my contact details are valid**.

**Acceptance criteria**

- I enter a verification code after registering
- I can request a new code if needed
- Unverified accounts cannot apply

#### TH-042 — Stay signed in securely

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to sign in, stay active, and sign out safely**, so that **my account stays protected on shared devices**.

**Acceptance criteria**

- I can log in and out
- Long idle periods sign me out automatically
- Protected pages require me to be signed in

#### TH-043 — Reset a forgotten password

**Status:** Partial · **Audience:** My Applications · **Priority:** P1

**User story**

> As a **job seeker**, I want **to reset my password if I forget it**, so that **I can regain access without contacting support**.

**Acceptance criteria**

- I can request a reset link from a forgot-password page
- I can set a new password from the link
- Success and error messages are easy to understand

#### TH-044 — See my hiring dashboard

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **a dashboard showing my next steps and recent applications**, so that **I know what to do to complete my profile and apply**.

**Acceptance criteria**

- New users see guided onboarding steps
- Returning users see recent application statuses

#### TH-045 — Search jobs in my workspace

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to search open jobs while signed in**, so that **I can apply without leaving my account area**.

**Acceptance criteria**

- Only published jobs appear
- I can open job details and start apply from here

#### TH-046 — Apply to a job

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to submit an application with my CV and optional cover letter**, so that **the employer receives a complete application packet**.

**Acceptance criteria**

- I must attach a CV to apply
- I can add a cover letter and answer screening questions
- I see confirmation after a successful submit
- I cannot apply twice to the same job

#### TH-047 — Track my application statuses

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to see where each application stands**, so that **I know if I am under review, shortlisted, or rejected**.

**Acceptance criteria**

- Statuses use the same words recruiters see
- Applications sort by most recent
- Empty state shows when I have not applied yet

#### TH-048 — Upload my CV

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to upload PDF or Word CVs up to 10 MB**, so that **recruiters receive a professional document**.

**Acceptance criteria**

- Supported file types upload successfully
- Oversized or wrong file types are rejected with guidance

#### TH-049 — Auto-fill profile from my CV

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **TalentHub to suggest profile details from my CV**, so that **I spend less time retyping experience and education**.

**Acceptance criteria**

- Parsed fields populate my profile when AI is available
- I can review and edit before saving
- If parsing fails, I can still enter details manually

#### TH-050 — Manage multiple CVs

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to keep several CVs and choose a default**, so that **I can tailor documents for different roles**.

**Acceptance criteria**

- I can list, download, and delete CVs
- One CV can be marked default for quick apply

#### TH-051 — Manage cover letters

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to save cover letters as files or text**, so that **I reuse strong letters across applications**.

**Acceptance criteria**

- I can create, edit, and attach library cover letters when applying

#### TH-052 — Answer employer screening questions

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **to answer job-specific questions on the apply form**, so that **recruiters get answers they need before reviewing me**.

**Acceptance criteria**

- Required questions block submit until answered
- Staff can see my answers on the application

#### TH-053 — Import profile from a screenshot

**Status:** Partial · **Audience:** My Applications · **Priority:** P3

**User story**

> As a **job seeker**, I want **to optionally import profile details from a LinkedIn-style screenshot**, so that **I can speed up profile setup from an existing profile**.

**Acceptance criteria**

- I am asked before any data is sent for extraction
- I confirm before changes merge into my profile
- Or the feature remains clearly marked as experimental

#### TH-054 — Save jobs for later (workspace)

**Status:** Planned · **Audience:** My Applications · **Priority:** P2

**User story**

> As a **job seeker**, I want **a saved jobs list in my dashboard**, so that **I return to interesting roles when I am ready to apply**.

**Acceptance criteria**

- I can save and remove bookmarks for published jobs only
- Saved jobs appear in a dedicated section

#### TH-055 — Withdraw my application

**Status:** Planned · **Audience:** My Applications · **Priority:** P1

**User story**

> As a **job seeker**, I want **to withdraw an application I no longer want pursued**, so that **employers know I am no longer interested**.

**Acceptance criteria**

- I confirm before withdrawing
- Withdrawn applications move to the employer's withdrawn list
- I cannot withdraw after being hired

#### TH-056 — Set my time zone

**Status:** Partial · **Audience:** My Applications · **Priority:** P1

**User story**

> As a **job seeker**, I want **to set my time zone on my profile**, so that **interview times shown to recruiters match my local time**.

**Acceptance criteria**

- I can pick my time zone from a standard list
- Recruiters scheduling interviews see an accurate local preview when set

#### TH-057 — Apply easily on my phone

**Status:** Partial · **Audience:** My Applications · **Priority:** P1

**User story**

> As a **job seeker on mobile**, I want **the apply flow to work comfortably on a small screen**, so that **I can apply without pinching, scrolling sideways, or missing buttons**.

**Acceptance criteria**

- Apply form is usable at phone widths
- Tap targets are large enough
- File upload works on mobile browsers

#### TH-058 — Receive real verification emails

**Status:** Planned · **Audience:** My Applications · **Priority:** P0 · **Depends on:** TH-009

**User story**

> As a **job seeker**, I want **to receive my verification code by email in production**, so that **I can verify my account without a developer-only shortcut**.

**Acceptance criteria**

- Registration sends a real OTP email when email is configured
- Development workflow remains documented for local testing

## 4. Backoffice — authentication & shell

#### TH-070 — Staff sign-in

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to sign in to the hiring workspace securely**, so that **only authorised staff access candidate data**.

**Acceptance criteria**

- Successful login opens the dashboard
- Sign-out ends my session
- Session cookies are protected from casual script access

#### TH-071 — Role-based access

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **admin**, I want **recruiters, hiring managers, and admins to have appropriate access**, so that **sensitive settings are limited to the right people**.

**Acceptance criteria**

- User roles exist and protect admin areas where required

#### TH-072 — Navigate the hiring workspace

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **clear navigation on desktop and mobile**, so that **I reach jobs, applications, candidates, and settings quickly**.

**Acceptance criteria**

- Sidebar and mobile menu link to all main areas
- Current page is visually indicated

#### TH-073 — Skip to main content

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter using assistive technology**, I want **a skip link and sensible session behaviour**, so that **I can work efficiently without tabbing through chrome**.

**Acceptance criteria**

- Skip link focuses main content
- Session activity follows product idle rules

#### TH-074 — Protected staff pages

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **hiring data hidden until I sign in**, so that **candidate information is not exposed publicly**.

**Acceptance criteria**

- Dashboard routes require authentication
- Unauthenticated users are redirected to login

#### TH-075 — Sign in with Google or Microsoft

**Status:** Out of scope · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **enterprise single sign-on**, so that **I would use my company identity provider**.

**Acceptance criteria**

- Not planned for SME MVP — email and password is sufficient
- Only add SSO if product scope changes

## 5. Backoffice — dashboard

#### TH-080 — See hiring KPIs at a glance

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **hiring manager**, I want **key counts like open jobs and applications on my dashboard**, so that **I understand workload without running reports**.

**Acceptance criteria**

- Stats reflect current database counts
- Loading and error states are handled gracefully

#### TH-081 — See pipeline health

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **hiring manager**, I want **a snapshot of how applications are distributed across stages**, so that **I spot bottlenecks early**.

**Acceptance criteria**

- Snapshot matches application statuses
- I can jump to applications when offered

#### TH-082 — See recent hiring activity

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **a feed of recent status changes**, so that **I stay aware of team actions without opening every record**.

**Acceptance criteria**

- Recent changes show with readable timestamps
- Empty state appears when nothing recent exists

#### TH-083 — See efficiency insight

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **hiring manager**, I want **an efficiency score or summary on the dashboard**, so that **I have a simple signal of how smoothly hiring is running**.

**Acceptance criteria**

- Card renders without errors
- Metric meaning is understandable

#### TH-084 — Spot stalled interviews

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to be alerted when interviews sit too long without progress**, so that **candidates are not left waiting**.

**Acceptance criteria**

- Insight highlights overdue interview-scheduled applications
- I can navigate to relevant records

## 6. Backoffice — job posting

#### TH-090 — Browse and search our job postings

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to search and filter our job list**, so that **I find postings to edit or review quickly**.

**Acceptance criteria**

- Search by title or summary works
- Draft and published jobs can be filtered
- Pagination handles large lists

#### TH-091 — Create a new job posting

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to create a job through a guided multi-section form**, so that **published roles are complete and consistent**.

**Acceptance criteria**

- Required fields are validated before save
- I can save as draft

#### TH-092 — Edit an existing job

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to update a job and all its related sections**, so that **live listings stay accurate**.

**Acceptance criteria**

- All sections load and save together without losing related content

#### TH-093 — Review before publishing

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to review the full posting before it goes live**, so that **I catch mistakes before candidates see them**.

**Acceptance criteria**

- Review shows what candidates will see
- I can go back to edit without losing data

#### TH-094 — Publish or keep as draft

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to control whether a job is visible to candidates**, so that **unfinished roles stay internal**.

**Acceptance criteria**

- Published jobs appear on the public site and candidate workspace
- Draft jobs stay hidden

#### TH-095 — Preview as a candidate

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to preview how a job will look to applicants**, so that **I verify formatting before publish**.

**Acceptance criteria**

- Preview matches the public job page layout

#### TH-096 — Rich job content sections

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to add responsibilities, qualifications, skills, benefits, and tags**, so that **candidates get a complete picture of the role**.

**Acceptance criteria**

- All sections save in order
- Skills and tags use managed lookup values

#### TH-097 — Salary range and visibility

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to set salary range and choose whether candidates see it**, so that **we control compensation transparency per role**.

**Acceptance criteria**

- Salary visibility toggle controls public display (TH-024)

#### TH-098 — Remote and featured flags

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to mark jobs as remote or featured**, so that **candidates can filter remote roles and see highlighted openings**.

**Acceptance criteria**

- Remote filter on public site matches the flag
- Featured styling appears when enabled

#### TH-099 — Job banner image

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to add a banner image and alt text**, so that **job pages look polished and accessible**.

**Acceptance criteria**

- Alt text is required or warned when an image URL is provided

## 7. Backoffice — applications & pipeline

#### TH-110 — Applications table view

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **a sortable, filterable table of applications**, so that **I triage in spreadsheet style when I prefer lists**.

**Acceptance criteria**

- Sort and filters match pipeline data

#### TH-111 — Kanban pipeline view

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to move candidates across stages on a visual board**, so that **I see funnel health and progress at a glance**.

**Acceptance criteria**

- Drag-and-drop triggers valid status changes only
- Invalid moves show feedback

#### TH-112 — Switch list and pipeline views

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to toggle between table and pipeline and use fullscreen pipeline**, so that **I choose the view that fits my task**.

**Acceptance criteria**

- View toggle works
- Fullscreen pipeline focuses on triage

#### TH-113 — Week-based pipeline

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **the pipeline scoped to past and current weeks only**, so that **I focus on actionable work, not future planning noise**.

**Acceptance criteria**

- Future weeks cannot be selected
- Week label updates accessibly when I navigate weeks

#### TH-114 — Ten hiring stages

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **a clear set of application stages with enforced rules**, so that **everyone follows the same hiring process**.

**Acceptance criteria**

- Ten statuses display correctly
- Illegal stage jumps are blocked

#### TH-115 — Record why status changed

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to add reasons and notes when changing status**, so that **the team has context for decisions**.

**Acceptance criteria**

- Rejections require a reason
- Simultaneous edits warn me if someone else changed the record first

#### TH-116 — Undo a status change

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to undo my last status change quickly**, so that **I fix mistakes without support**.

**Acceptance criteria**

- Undo appears after a change
- Undo restores the previous stage once and is logged

#### TH-117 — Reopen a rejected candidate

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to reopen a rejected application with a documented reason**, so that **strong candidates can re-enter the process fairly**.

**Acceptance criteria**

- Reopen requires a reason
- Candidate returns to an active review stage

#### TH-118 — Application detail page

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **one page with applicant, job, submission, files, and history**, so that **I decide without hunting across screens**.

**Acceptance criteria**

- Who, which job, when, answers, documents, and timeline are on one page

#### TH-119 — Download candidate documents

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to download CV and cover letter securely**, so that **I can review offline or share with hiring managers**.

**Acceptance criteria**

- Only signed-in staff can download
- Files open with correct type

#### TH-120 — Schedule an interview

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to schedule one interview per application**, so that **the team aligns on when to meet the candidate**.

**Acceptance criteria**

- Schedule modal saves interview details
- One interview record per application

#### TH-121 — Pick date, time, and duration

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to choose interview date, start time, and length**, so that **calendar holds are accurate**.

**Acceptance criteria**

- Duration options from 15 to 120 minutes
- Invalid date/time combinations are blocked

#### TH-122 — Schedule in the right time zone

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to set scheduling time zone and see the candidate's local time**, so that **we avoid timezone confusion**.

**Acceptance criteria**

- I pick a standard time zone
- Preview shows candidate local time when their profile time zone is set

#### TH-123 — Require interview before interview stage

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **the system to require a scheduled interview before marking interview scheduled**, so that **pipeline stages reflect reality**.

**Acceptance criteria**

- Cannot move to interview scheduled without scheduling first
- Clear message tells me to schedule

#### TH-124 — Cancel interview when moving back

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to cancel a scheduled interview when moving a candidate to an earlier stage**, so that **outdated interviews are not left on the calendar**.

**Acceptance criteria**

- Prompt asks if I want to cancel the interview
- Optional notify candidate checkbox
- Interview is removed on confirm

#### TH-125 — Audit trail of status changes

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **hiring manager**, I want **a history of who changed status, when, and why**, so that **we have accountability and compliance evidence**.

**Acceptance criteria**

- Timeline shows from/to status, actor, reason, and timestamp

#### TH-126 — Rejected and withdrawn lists

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **rejected and withdrawn applications separated from the active board**, so that **the active pipeline stays focused**.

**Acceptance criteria**

- Terminal applications appear in dedicated areas, not mixed with active triage

#### TH-127 — Move candidate without dragging

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter using keyboard**, I want **a Move to menu on each card**, so that **I can triage without a mouse**.

**Acceptance criteria**

- Menu lists only valid next stages
- Same outcome as drag-and-drop

#### TH-128 — AI relevance hint on applications

**Status:** Partial · **Audience:** Backoffice · **Priority:** P2

**User story**

> As a **recruiter**, I want **an optional AI-generated relevance hint for each application**, so that **I prioritise review when volume is high**.

**Acceptance criteria**

- Scoring is advisory only
- Pipeline still works when AI is unavailable
- Errors and loading states are handled

#### TH-129 — Human review reminder for AI scores

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **a clear reminder that AI scores require human judgment**, so that **we avoid biased or automated hiring decisions**.

**Acceptance criteria**

- Notice appears on relevance scores in pipeline and detail views
- Message states human review is required

#### TH-130 — Email candidate on status change

**Status:** Planned · **Audience:** Backoffice · **Priority:** P0 · **Depends on:** TH-009

**User story**

> As a **recruiter**, I want **candidates emailed when I choose to notify them of a status change**, so that **applicants are not left wondering**.

**Acceptance criteria**

- Notify checkbox sends a real email when email service is configured
- No email sent when I leave notify off

#### TH-131 — Email candidate when interview scheduled

**Status:** Planned · **Audience:** Backoffice · **Priority:** P0 · **Depends on:** TH-009

**User story**

> As a **recruiter**, I want **candidates emailed when I schedule an interview and opt to notify**, so that **they receive date, time, and time zone details**.

**Acceptance criteria**

- Email includes interview details when notify is checked
- System records when notification was sent

#### TH-132 — Reschedule an interview

**Status:** Planned · **Audience:** Backoffice · **Priority:** P2

**User story**

> As a **recruiter**, I want **to change interview date or time without cancel and recreate**, so that **last-minute changes are less error-prone**.

**Acceptance criteria**

- I can edit scheduled interviews from application detail
- Optional notify on reschedule

#### TH-133 — Quick view from pipeline card

**Status:** Planned · **Audience:** Backoffice · **Priority:** P3

**User story**

> As a **recruiter**, I want **a side panel summary when I click a pipeline card**, so that **I scan details without leaving the board**.

**Acceptance criteria**

- Click opens quick view; drag does not
- Full detail page remains available
- Escape closes the panel

## 8. Backoffice — candidates

#### TH-140 — Candidates overview

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **a summary dashboard for candidates**, so that **I see pool size before diving into records**.

**Acceptance criteria**

- Counts match reality
- Link to full candidate list works

#### TH-141 — Search all candidates

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to search candidates by name or email**, so that **I find people quickly across applications**.

**Acceptance criteria**

- Search and pagination work
- Rows link to candidate detail

#### TH-142 — Candidate profile and history

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **one place for profile, CV history, and applications**, so that **I understand a person beyond a single application**.

**Acceptance criteria**

- Profile, CVs, and application list display
- I can download CVs

#### TH-143 — Update candidate account status

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **admin**, I want **to activate or deactivate a candidate account**, so that **we control access when needed**.

**Acceptance criteria**

- Valid status changes save with clear feedback

#### TH-144 — Return to applications after viewing candidate

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to return to the applications list I came from**, so that **I do not lose my triage context**.

**Acceptance criteria**

- Back navigation returns to applications when I arrived from there

#### TH-145 — Protect candidate admin actions

**Status:** Planned · **Audience:** Backoffice · **Priority:** P1

**User story**

> As a **admin**, I want **only signed-in staff to change candidate account status**, so that **candidate records cannot be altered by unauthorised requests**.

**Acceptance criteria**

- Unauthenticated or unauthorised requests are rejected

## 9. Backoffice — interviews

#### TH-150 — Interviews calendar

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **a calendar of scheduled interviews**, so that **I see my week at a glance**.

**Acceptance criteria**

- Times respect time zones
- Entries link to the related application

#### TH-151 — Schedule from application page

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **recruiter**, I want **to schedule interviews from the application detail page**, so that **I do not context-switch while reviewing a candidate**.

**Acceptance criteria**

- Schedule opens from application detail and refreshes after save

#### TH-152 — Sync interviews to Google or Outlook

**Status:** Planned · **Audience:** Backoffice · **Priority:** P2

**User story**

> As a **recruiter**, I want **scheduled interviews on my personal work calendar**, so that **I avoid double-booking and missing interviews**.

**Acceptance criteria**

- Minimum: download calendar file
- Or full sync if OAuth scope is approved

## 10. Backoffice — administration

#### TH-160 — Manage companies

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **admin**, I want **to add and edit companies**, so that **job data stays organised by organisation**.

**Acceptance criteria**

- Create, edit, delete with validation messages

#### TH-161 — Manage departments and locations

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **admin**, I want **to maintain departments and locations**, so that **job postings and filters stay accurate**.

**Acceptance criteria**

- New values appear in job forms and filters

#### TH-162 — Manage employment types and experience levels

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **admin**, I want **to maintain employment types and experience levels**, so that **candidates filter jobs meaningfully**.

**Acceptance criteria**

- Lookups update job form and public filters

#### TH-163 — Manage skills, tags, and benefits

**Status:** Done · **Audience:** Backoffice

**User story**

> As a **admin**, I want **to maintain skills, tags, and benefits lists**, so that **job content stays consistent**.

**Acceptance criteria**

- Job postings can assign newly created values

#### TH-164 — Manage staff users

**Status:** Planned · **Audience:** Backoffice · **Priority:** P1

**User story**

> As a **admin**, I want **to add and manage recruiter accounts**, so that **the right people have access without developer help**.

**Acceptance criteria**

- Only admins access user management
- I can assign roles and deactivate users
- Passwords are stored securely

#### TH-165 — Hiring reports

**Status:** Planned · **Audience:** Backoffice · **Priority:** P2

**User story**

> As a **hiring manager**, I want **reports on applications and time-to-hire**, so that **I measure team performance**.

**Acceptance criteria**

- Reports show real data with date filters
- Empty state when no data exists

#### TH-166 — Workspace settings

**Status:** Planned · **Audience:** Backoffice · **Priority:** P2

**User story**

> As a **admin**, I want **to configure company name, default time zone, and email sender**, so that **TalentHub reflects our organisation in emails and scheduling**.

**Acceptance criteria**

- Settings persist and affect defaults where documented

## 11. Central API

#### TH-170 — Service health check

**Status:** Done · **Audience:** Central API

**User story**

> As a **operations**, I want **a health endpoint for monitoring**, so that **we know the auth service is up during deploys**.

**Acceptance criteria**

- Health check returns OK with documented response

#### TH-171 — Sign in staff and candidates via API

**Status:** Done · **Audience:** Central API

**User story**

> As a **job seeker and recruiter**, I want **secure login that knows whether I am staff or candidate**, so that **each app gets the right access**.

**Acceptance criteria**

- Staff and candidate logins issue appropriate credentials
- Wrong account type is rejected

#### TH-172 — Session refresh and logout

**Status:** Done · **Audience:** Central API

**User story**

> As a **job seeker**, I want **my session to refresh and end cleanly**, so that **I stay signed in during active use and can log out safely**.

**Acceptance criteria**

- Refresh extends session
- Logout ends access

#### TH-173 — Registration and verification API

**Status:** Done · **Audience:** Central API

**User story**

> As a **job seeker**, I want **registration and OTP verification handled reliably**, so that **my account is created and verified through standard steps**.

**Acceptance criteria**

- Register, verify, and resend OTP work as documented

#### TH-174 — Password reset API

**Status:** Done · **Audience:** Central API

**User story**

> As a **job seeker**, I want **password reset handled securely on the server**, so that **reset links work once and expire appropriately**.

**Acceptance criteria**

- Reset tokens are single-use and time-limited
- Responses do not reveal whether an email exists

#### TH-175 — Public jobs API

**Status:** Planned · **Audience:** Central API · **Priority:** P2

**User story**

> As a **integrator**, I want **a standard API for listing and reading jobs**, so that **external tools and future apps can consume job data**.

**Acceptance criteria**

- List and detail endpoints match documented contract
- Replaces placeholder stub

#### TH-176 — Applications API

**Status:** Planned · **Audience:** Central API · **Priority:** P2

**User story**

> As a **integrator**, I want **a standard API for application data**, so that **integrations can sync hiring records**.

**Acceptance criteria**

- Staff-authenticated list, detail, and status match backoffice behaviour

#### TH-177 — Interviews API

**Status:** Planned · **Audience:** Central API · **Priority:** P2

**User story**

> As a **integrator**, I want **a standard API for interview records**, so that **calendar and HR tools can connect**.

**Acceptance criteria**

- Interview CRUD aligned with in-product scheduling

#### TH-178 — Staff users API

**Status:** Planned · **Audience:** Central API · **Priority:** P2

**User story**

> As a **admin**, I want **API access to manage staff users**, so that **user provisioning can be automated**.

**Acceptance criteria**

- Admin-only user endpoints documented and functional

#### TH-179 — In-app notification inbox

**Status:** Out of scope · **Audience:** Central API

**User story**

> As a **recruiter**, I want **a notification centre inside TalentHub**, so that **I would see alerts without email**.

**Acceptance criteria**

- Not planned — transactional email covers MVP (TH-009)
- No notification inbox unless product adds a data model

#### TH-180 — Unified backend services

**Status:** Planned · **Audience:** Central API · **Priority:** P2

**User story**

> As a **product team**, I want **hiring logic moved into the central API over time**, so that **one backend serves web apps and future clients**.

**Acceptance criteria**

- Phased migration plan documented
- No single risky big-bang rewrite

## 12. Non-functional & compliance

#### TH-190 — Accessible experience (WCAG 2.2 AA)

**Status:** Partial · **Audience:** All apps · **Priority:** P1

**User story**

> As a **job seeker and recruiter with disabilities**, I want **TalentHub to meet WCAG 2.2 Level AA on critical paths**, so that **everyone can apply and hire without barriers**.

**Acceptance criteria**

- Accessibility audit failures are reduced on login, apply, and pipeline
- Keyboard and screen reader smoke tests pass on critical flows

#### TH-191 — Accessible dialogs on pipeline

**Status:** Planned · **Audience:** Backoffice · **Priority:** P1

**User story**

> As a **recruiter using keyboard**, I want **modals that trap focus and close with Escape**, so that **I can confirm status changes without getting lost in the page**.

**Acceptance criteria**

- Tab stays inside open dialogs
- Escape closes and focus returns to the button I used

#### TH-192 — Privacy, terms, and accessibility pages

**Status:** Planned · **Audience:** Candidate portal, My Applications · **Priority:** P2

**User story**

> As a **job seeker**, I want **working footer links to privacy, terms, and accessibility information**, so that **I understand my rights before I register or apply**.

**Acceptance criteria**

- Footer links open real pages on public and candidate sites
- Accessibility page states our target and contact

#### TH-193 — Stronger candidate session security

**Status:** Planned · **Audience:** My Applications · **Priority:** P2

**User story**

> As a **job seeker**, I want **my login session protected like staff sessions**, so that **my account is harder to steal if a page is compromised**.

**Acceptance criteria**

- Approach documented with tradeoffs
- If implemented, session tokens are not readable by page scripts

#### TH-194 — Secure passwords

**Status:** Done · **Audience:** Central API

**User story**

> As a **job seeker and recruiter**, I want **passwords stored and login attempts limited**, so that **accounts resist brute-force attacks**.

**Acceptance criteria**

- Passwords are never stored in plain text
- Repeated failed logins trigger lockout

#### TH-195 — Protected routes

**Status:** Done · **Audience:** Backoffice, My Applications

**User story**

> As a **job seeker and recruiter**, I want **private pages blocked until I sign in**, so that **my data and hiring tools are not public**.

**Acceptance criteria**

- Unauthenticated access returns appropriate errors or redirects

#### TH-196 — Safe file uploads

**Status:** Done · **Audience:** My Applications

**User story**

> As a **job seeker**, I want **only safe CV file types accepted**, so that **malicious files cannot be uploaded as documents**.

**Acceptance criteria**

- Wrong types and oversized files rejected
- Stored filenames are safe

#### TH-197 — Living design system catalog

**Status:** Done · **Audience:** All apps

**User story**

> As a **designer and developer**, I want **a visual catalog that matches shipped UI**, so that **new screens stay consistent**.

**Acceptance criteria**

- Catalog updated when tokens or layouts change

#### TH-198 — Works on phone and tablet

**Status:** Done · **Audience:** All apps

**User story**

> As a **job seeker and recruiter on mobile**, I want **responsive web layouts without a native app**, so that **I can hire or apply from any device**.

**Acceptance criteria**

- Critical flows usable at phone width
- Remaining mobile gaps tracked under TH-057

---

## Quick reference — open work stories

| Code | Section | Summary |
|------|---------|---------|
| TH-009 | §1 | Real email delivery for hiring notifications |
| TH-043 | §3 | Forgot / reset password for candidates |
| TH-055 | §3 | Candidate withdraw application |
| TH-056 | §3 | Set time zone on profile |
| TH-058 | §3 | Real verification emails |
| TH-130 | §7 | Email on status change |
| TH-131 | §7 | Email on interview schedule |
| TH-145 | §8 | Protect candidate admin actions |
| TH-164 | §10 | Manage staff users |
| TH-190 | §12 | WCAG 2.2 AA accessibility |
| TH-191 | §12 | Accessible pipeline dialogs |

---

*User stories v2.0 · 21 May 2026 · Sync with [FEATURE_BACKLOG.md](./FEATURE_BACKLOG.md)*

