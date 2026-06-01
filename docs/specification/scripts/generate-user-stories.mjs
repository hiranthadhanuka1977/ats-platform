/**
 * Generates FEATURE_BACKLOG_CURSOR_PROMPTS.md as non-technical user stories.
 * Run: node docs/specification/scripts/generate-user-stories.mjs
 */

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "FEATURE_BACKLOG_CURSOR_PROMPTS.md");

/** @type {Array<{code:string,title:string,section:string,status:string,app:string,priority?:string,depends?:string,role:string,want:string,benefit:string,acceptance:string[]}>} */
const stories = [
  // §1 Platform
  { code: "TH-001", title: "Unified product platform", section: "1", status: "Done", app: "Platform", role: "product team member", want: "all parts of TalentHub (job site, candidate workspace, staff tools, and shared services) to run from one coordinated codebase", benefit: "we can develop, test, and release features consistently without duplicate setup", acceptance: ["All four product areas start together for local development", "Shared building blocks are reused across apps", "There is only one place to manage database structure"] },
  { code: "TH-002", title: "Single source of truth for hiring data", section: "1", status: "Done", app: "Platform", role: "product team member", want: "one shared database schema for all hiring data", benefit: "candidates, jobs, and applications stay in sync everywhere", acceptance: ["Job and application data is consistent across all apps", "Database changes are applied in one place"] },
  { code: "TH-003", title: "Secure document storage (local)", section: "1", status: "Done", app: "Platform", role: "candidate", want: "my CV and cover letters stored safely when I upload them", benefit: "recruiters can review my documents and I can reuse them on future applications", acceptance: ["Uploaded CVs and cover letters are saved and retrievable", "Staff can download documents they are authorised to view", "Unsupported or oversized files are rejected with a clear message"] },
  { code: "TH-004", title: "Consistent data validation", section: "1", status: "Done", app: "Platform", role: "product team member", want: "the same rules applied when forms are submitted across the product", benefit: "users see predictable errors and data quality stays high", acceptance: ["Application status changes, interview scheduling, and sign-up follow shared validation rules", "Invalid submissions are blocked before they reach the database"] },
  { code: "TH-005", title: "Clear application status rules", section: "1", status: "Done", app: "Platform", role: "recruiter", want: "only valid status moves allowed when I progress a candidate", benefit: "the hiring pipeline stays trustworthy and auditable", acceptance: ["Illegal status jumps are prevented", "Staff UI and server agree on the ten statuses and allowed transitions"] },
  { code: "TH-006", title: "Shared UI building blocks", section: "1", status: "Done", app: "Platform", role: "candidate and recruiter", want: "familiar buttons, forms, and patterns across TalentHub apps", benefit: "the product feels cohesive and is easier to learn", acceptance: ["Common interface elements are reused where both candidate and staff apps need them"] },
  { code: "TH-007", title: "Clear setup guide for new developers", section: "1", status: "Done", app: "Platform", role: "product team member", want: "accurate documentation for running TalentHub locally", benefit: "new contributors can start without guesswork", acceptance: ["Environment variables and startup steps match how the product actually runs", "A new developer can follow the guide end-to-end"] },
  { code: "TH-008", title: "Cloud file storage for production", section: "1", status: "Planned", app: "Platform", priority: "P2", role: "organisation admin", want: "CVs and attachments stored in cloud storage when we deploy live", benefit: "uploads remain reliable as we scale beyond a single server", acceptance: ["Local development still works as today", "Production can use cloud storage without breaking existing file links", "Upload and download behaviour stays the same for users"] },
  { code: "TH-009", title: "Email delivery for hiring notifications", section: "1", status: "Planned", app: "Platform", priority: "P0", role: "candidate and recruiter", want: "TalentHub to send real emails for verification, status updates, and interviews", benefit: "candidates stay informed and recruiters' notify choices actually reach people", acceptance: ["Verification codes can be sent by email in staging/production", "Status and interview notifications send when staff opt in", "If email is unavailable, the app still saves the hiring action and logs the failure"] },
  { code: "TH-010", title: "Product success metrics", section: "1", status: "Planned", app: "Platform", priority: "P2", role: "hiring manager", want: "insight into how well our hiring funnel performs", benefit: "we can improve apply completion, triage speed, and CV parsing success", acceptance: ["Key events (apply completed, application opened by staff) can be measured", "Metrics respect privacy settings and work without third-party tools in dev"] },
  { code: "TH-011", title: "Multi-company data isolation", section: "1", status: "Out of scope", app: "Platform", role: "enterprise buyer", want: "strict separation between different companies' data on one platform", benefit: "each tenant's jobs and candidates would never mix", acceptance: ["Not planned for the current SME release — TalentHub targets single-organisation use", "Only reconsider if product scope explicitly expands to multi-tenant"] },
  { code: "TH-012", title: "Production scaling guidance", section: "1", status: "Planned", app: "Platform", priority: "P3", role: "technical stakeholder", want: "a documented path for scaling TalentHub in production", benefit: "we can grow without redesigning from scratch", acceptance: ["Architecture guidance covers hosting, storage, email, and optional job queues", "No forced infrastructure build unless specifically requested"] },

  // §2 Candidate portal
  { code: "TH-020", title: "Browse open jobs with pages", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "to browse published job listings page by page", benefit: "I can explore opportunities without seeing draft or internal roles", acceptance: ["Only published jobs appear", "I can move between pages when many jobs exist", "An empty state appears when no jobs match"] },
  { code: "TH-021", title: "Filter jobs", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "to filter jobs by department, location, type, experience, and remote options", benefit: "I quickly find roles that fit my situation", acceptance: ["Each filter updates results and can be shared via the URL", "Browser back/forward restores my filter choices", "Filters can be combined"] },
  { code: "TH-022", title: "Search jobs by keyword", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "to search jobs by title or summary keywords", benefit: "I find relevant roles without reading every listing", acceptance: ["Search matches title and summary text", "Clearing search shows all jobs again", "Result count updates when search changes"] },
  { code: "TH-023", title: "Read full job details", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "to read the full job description before applying", benefit: "I understand responsibilities, requirements, and benefits", acceptance: ["Overview, responsibilities, qualifications, skills, benefits, and tags all display", "Invalid job links show a helpful not-found page"] },
  { code: "TH-024", title: "See salary when employer allows", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "to see salary information only when the employer chose to show it", benefit: "I can compare compensation fairly without hidden surprises", acceptance: ["Salary is hidden when the employer turned visibility off", "When visible, salary range displays in a readable format"] },
  { code: "TH-025", title: "Spot featured jobs", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "featured roles to stand out in the listing", benefit: "I notice priority openings the employer wants to highlight", acceptance: ["Featured jobs have distinct visual treatment", "Non-featured jobs look unchanged"] },
  { code: "TH-026", title: "See job banner image", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "a banner image on job pages when provided", benefit: "I get a richer sense of the employer and role", acceptance: ["Image shows with descriptive alt text when provided", "Layout stays stable when no banner exists"] },
  { code: "TH-027", title: "Apply via My Applications", section: "2", status: "Done", app: "Candidate portal", role: "job seeker", want: "Apply to take me to my candidate workspace to sign in and submit", benefit: "I complete applications in one secure place built for that purpose", acceptance: ["Apply does not open a form on the public job site", "I am directed to the candidate workspace to continue"] },
  { code: "TH-028", title: "Accessible public job site", section: "2", status: "Done", app: "Candidate portal", role: "job seeker with disabilities", want: "an accessible layout with skip navigation and clear structure", benefit: "I can browse jobs using keyboard and assistive technology", acceptance: ["Skip link jumps to main content", "Header, navigation, and footer are clearly structured", "Legal footer links still need real destinations (see TH-192)"] },
  { code: "TH-029", title: "Save jobs for later (portal)", section: "2", status: "Planned", app: "Candidate portal", priority: "P2", role: "job seeker", want: "to bookmark jobs while browsing", benefit: "I can return and apply when I am ready", acceptance: ["Signed-in candidates can save and unsave jobs", "Duplicate saves are prevented", "Saved jobs appear in my candidate workspace"] },
  { code: "TH-030", title: "Sign in on the public job site", section: "2", status: "Out of scope", app: "Candidate portal", role: "job seeker", want: "not to manage account and apply on two different sites", benefit: "my login and applications stay in one dedicated workspace", acceptance: ["Public job site stays browse-only", "Apply always routes to the candidate workspace (TH-027)"] },

  // §3 My Applications
  { code: "TH-040", title: "Create a candidate account", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to register with email and password", benefit: "I can save my profile and track applications", acceptance: ["Registration creates my account", "Password rules are enforced with clear errors"] },
  { code: "TH-041", title: "Verify my email", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to confirm my email with a one-time code", benefit: "the employer knows my contact details are valid", acceptance: ["I enter a verification code after registering", "I can request a new code if needed", "Unverified accounts cannot apply"] },
  { code: "TH-042", title: "Stay signed in securely", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to sign in, stay active, and sign out safely", benefit: "my account stays protected on shared devices", acceptance: ["I can log in and out", "Long idle periods sign me out automatically", "Protected pages require me to be signed in"] },
  { code: "TH-043", title: "Reset a forgotten password", section: "3", status: "Partial", app: "My Applications", priority: "P1", role: "job seeker", want: "to reset my password if I forget it", benefit: "I can regain access without contacting support", acceptance: ["I can request a reset link from a forgot-password page", "I can set a new password from the link", "Success and error messages are easy to understand"] },
  { code: "TH-044", title: "See my hiring dashboard", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "a dashboard showing my next steps and recent applications", benefit: "I know what to do to complete my profile and apply", acceptance: ["New users see guided onboarding steps", "Returning users see recent application statuses"] },
  { code: "TH-045", title: "Search jobs in my workspace", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to search open jobs while signed in", benefit: "I can apply without leaving my account area", acceptance: ["Only published jobs appear", "I can open job details and start apply from here"] },
  { code: "TH-046", title: "Apply to a job", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to submit an application with my CV and optional cover letter", benefit: "the employer receives a complete application packet", acceptance: ["I must attach a CV to apply", "I can add a cover letter and answer screening questions", "I see confirmation after a successful submit", "I cannot apply twice to the same job"] },
  { code: "TH-047", title: "Track my application statuses", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to see where each application stands", benefit: "I know if I am under review, shortlisted, or rejected", acceptance: ["Statuses use the same words recruiters see", "Applications sort by most recent", "Empty state shows when I have not applied yet"] },
  { code: "TH-048", title: "Upload my CV", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to upload PDF or Word CVs up to 10 MB", benefit: "recruiters receive a professional document", acceptance: ["Supported file types upload successfully", "Oversized or wrong file types are rejected with guidance"] },
  { code: "TH-049", title: "Auto-fill profile from my CV", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "TalentHub to suggest profile details from my CV", benefit: "I spend less time retyping experience and education", acceptance: ["Parsed fields populate my profile when AI is available", "I can review and edit before saving", "If parsing fails, I can still enter details manually"] },
  { code: "TH-050", title: "Manage multiple CVs", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to keep several CVs and choose a default", benefit: "I can tailor documents for different roles", acceptance: ["I can list, download, and delete CVs", "One CV can be marked default for quick apply"] },
  { code: "TH-051", title: "Manage cover letters", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to save cover letters as files or text", benefit: "I reuse strong letters across applications", acceptance: ["I can create, edit, and attach library cover letters when applying"] },
  { code: "TH-052", title: "Answer employer screening questions", section: "3", status: "Done", app: "My Applications", role: "job seeker", want: "to answer job-specific questions on the apply form", benefit: "recruiters get answers they need before reviewing me", acceptance: ["Required questions block submit until answered", "Staff can see my answers on the application"] },
  { code: "TH-053", title: "Import profile from a screenshot", section: "3", status: "Partial", app: "My Applications", priority: "P3", role: "job seeker", want: "to optionally import profile details from a LinkedIn-style screenshot", benefit: "I can speed up profile setup from an existing profile", acceptance: ["I am asked before any data is sent for extraction", "I confirm before changes merge into my profile", "Or the feature remains clearly marked as experimental"] },
  { code: "TH-054", title: "Save jobs for later (workspace)", section: "3", status: "Planned", app: "My Applications", priority: "P2", role: "job seeker", want: "a saved jobs list in my dashboard", benefit: "I return to interesting roles when I am ready to apply", acceptance: ["I can save and remove bookmarks for published jobs only", "Saved jobs appear in a dedicated section"] },
  { code: "TH-055", title: "Withdraw my application", section: "3", status: "Planned", app: "My Applications", priority: "P1", role: "job seeker", want: "to withdraw an application I no longer want pursued", benefit: "employers know I am no longer interested", acceptance: ["I confirm before withdrawing", "Withdrawn applications move to the employer's withdrawn list", "I cannot withdraw after being hired"] },
  { code: "TH-056", title: "Set my time zone", section: "3", status: "Partial", app: "My Applications", priority: "P1", role: "job seeker", want: "to set my time zone on my profile", benefit: "interview times shown to recruiters match my local time", acceptance: ["I can pick my time zone from a standard list", "Recruiters scheduling interviews see an accurate local preview when set"] },
  { code: "TH-057", title: "Apply easily on my phone", section: "3", status: "Partial", app: "My Applications", priority: "P1", role: "job seeker on mobile", want: "the apply flow to work comfortably on a small screen", benefit: "I can apply without pinching, scrolling sideways, or missing buttons", acceptance: ["Apply form is usable at phone widths", "Tap targets are large enough", "File upload works on mobile browsers"] },
  { code: "TH-058", title: "Receive real verification emails", section: "3", status: "Planned", app: "My Applications", priority: "P0", depends: "TH-009", role: "job seeker", want: "to receive my verification code by email in production", benefit: "I can verify my account without a developer-only shortcut", acceptance: ["Registration sends a real OTP email when email is configured", "Development workflow remains documented for local testing"] },

  // §4 Backoffice auth
  { code: "TH-070", title: "Staff sign-in", section: "4", status: "Done", app: "Backoffice", role: "recruiter", want: "to sign in to the hiring workspace securely", benefit: "only authorised staff access candidate data", acceptance: ["Successful login opens the dashboard", "Sign-out ends my session", "Session cookies are protected from casual script access"] },
  { code: "TH-071", title: "Role-based access", section: "4", status: "Done", app: "Backoffice", role: "admin", want: "recruiters, hiring managers, and admins to have appropriate access", benefit: "sensitive settings are limited to the right people", acceptance: ["User roles exist and protect admin areas where required"] },
  { code: "TH-072", title: "Navigate the hiring workspace", section: "4", status: "Done", app: "Backoffice", role: "recruiter", want: "clear navigation on desktop and mobile", benefit: "I reach jobs, applications, candidates, and settings quickly", acceptance: ["Sidebar and mobile menu link to all main areas", "Current page is visually indicated"] },
  { code: "TH-073", title: "Skip to main content", section: "4", status: "Done", app: "Backoffice", role: "recruiter using assistive technology", want: "a skip link and sensible session behaviour", benefit: "I can work efficiently without tabbing through chrome", acceptance: ["Skip link focuses main content", "Session activity follows product idle rules"] },
  { code: "TH-074", title: "Protected staff pages", section: "4", status: "Done", app: "Backoffice", role: "recruiter", want: "hiring data hidden until I sign in", benefit: "candidate information is not exposed publicly", acceptance: ["Dashboard routes require authentication", "Unauthenticated users are redirected to login"] },
  { code: "TH-075", title: "Sign in with Google or Microsoft", section: "4", status: "Out of scope", app: "Backoffice", role: "recruiter", want: "enterprise single sign-on", benefit: "I would use my company identity provider", acceptance: ["Not planned for SME MVP — email and password is sufficient", "Only add SSO if product scope changes"] },

  // §5 Dashboard
  { code: "TH-080", title: "See hiring KPIs at a glance", section: "5", status: "Done", app: "Backoffice", role: "hiring manager", want: "key counts like open jobs and applications on my dashboard", benefit: "I understand workload without running reports", acceptance: ["Stats reflect current database counts", "Loading and error states are handled gracefully"] },
  { code: "TH-081", title: "See pipeline health", section: "5", status: "Done", app: "Backoffice", role: "hiring manager", want: "a snapshot of how applications are distributed across stages", benefit: "I spot bottlenecks early", acceptance: ["Snapshot matches application statuses", "I can jump to applications when offered"] },
  { code: "TH-082", title: "See recent hiring activity", section: "5", status: "Done", app: "Backoffice", role: "recruiter", want: "a feed of recent status changes", benefit: "I stay aware of team actions without opening every record", acceptance: ["Recent changes show with readable timestamps", "Empty state appears when nothing recent exists"] },
  { code: "TH-083", title: "See efficiency insight", section: "5", status: "Done", app: "Backoffice", role: "hiring manager", want: "an efficiency score or summary on the dashboard", benefit: "I have a simple signal of how smoothly hiring is running", acceptance: ["Card renders without errors", "Metric meaning is understandable"] },
  { code: "TH-084", title: "Spot stalled interviews", section: "5", status: "Done", app: "Backoffice", role: "recruiter", want: "to be alerted when interviews sit too long without progress", benefit: "candidates are not left waiting", acceptance: ["Insight highlights overdue interview-scheduled applications", "I can navigate to relevant records"] },

  // §6 Jobs
  { code: "TH-090", title: "Browse and search our job postings", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to search and filter our job list", benefit: "I find postings to edit or review quickly", acceptance: ["Search by title or summary works", "Draft and published jobs can be filtered", "Pagination handles large lists"] },
  { code: "TH-091", title: "Create a new job posting", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to create a job through a guided multi-section form", benefit: "published roles are complete and consistent", acceptance: ["Required fields are validated before save", "I can save as draft"] },
  { code: "TH-092", title: "Edit an existing job", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to update a job and all its related sections", benefit: "live listings stay accurate", acceptance: ["All sections load and save together without losing related content"] },
  { code: "TH-093", title: "Review before publishing", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to review the full posting before it goes live", benefit: "I catch mistakes before candidates see them", acceptance: ["Review shows what candidates will see", "I can go back to edit without losing data"] },
  { code: "TH-094", title: "Publish or keep as draft", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to control whether a job is visible to candidates", benefit: "unfinished roles stay internal", acceptance: ["Published jobs appear on the public site and candidate workspace", "Draft jobs stay hidden"] },
  { code: "TH-095", title: "Preview as a candidate", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to preview how a job will look to applicants", benefit: "I verify formatting before publish", acceptance: ["Preview matches the public job page layout"] },
  { code: "TH-096", title: "Rich job content sections", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to add responsibilities, qualifications, skills, benefits, and tags", benefit: "candidates get a complete picture of the role", acceptance: ["All sections save in order", "Skills and tags use managed lookup values"] },
  { code: "TH-097", title: "Salary range and visibility", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to set salary range and choose whether candidates see it", benefit: "we control compensation transparency per role", acceptance: ["Salary visibility toggle controls public display (TH-024)"] },
  { code: "TH-098", title: "Remote and featured flags", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to mark jobs as remote or featured", benefit: "candidates can filter remote roles and see highlighted openings", acceptance: ["Remote filter on public site matches the flag", "Featured styling appears when enabled"] },
  { code: "TH-099", title: "Job banner image", section: "6", status: "Done", app: "Backoffice", role: "recruiter", want: "to add a banner image and alt text", benefit: "job pages look polished and accessible", acceptance: ["Alt text is required or warned when an image URL is provided"] },

  // §7 Applications
  { code: "TH-110", title: "Applications table view", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "a sortable, filterable table of applications", benefit: "I triage in spreadsheet style when I prefer lists", acceptance: ["Sort and filters match pipeline data"] },
  { code: "TH-111", title: "Kanban pipeline view", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to move candidates across stages on a visual board", benefit: "I see funnel health and progress at a glance", acceptance: ["Drag-and-drop triggers valid status changes only", "Invalid moves show feedback"] },
  { code: "TH-112", title: "Switch list and pipeline views", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to toggle between table and pipeline and use fullscreen pipeline", benefit: "I choose the view that fits my task", acceptance: ["View toggle works", "Fullscreen pipeline focuses on triage"] },
  { code: "TH-113", title: "Week-based pipeline", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "the pipeline scoped to past and current weeks only", benefit: "I focus on actionable work, not future planning noise", acceptance: ["Future weeks cannot be selected", "Week label updates accessibly when I navigate weeks"] },
  { code: "TH-114", title: "Ten hiring stages", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "a clear set of application stages with enforced rules", benefit: "everyone follows the same hiring process", acceptance: ["Ten statuses display correctly", "Illegal stage jumps are blocked"] },
  { code: "TH-115", title: "Record why status changed", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to add reasons and notes when changing status", benefit: "the team has context for decisions", acceptance: ["Rejections require a reason", "Simultaneous edits warn me if someone else changed the record first"] },
  { code: "TH-116", title: "Undo a status change", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to undo my last status change quickly", benefit: "I fix mistakes without support", acceptance: ["Undo appears after a change", "Undo restores the previous stage once and is logged"] },
  { code: "TH-117", title: "Reopen a rejected candidate", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to reopen a rejected application with a documented reason", benefit: "strong candidates can re-enter the process fairly", acceptance: ["Reopen requires a reason", "Candidate returns to an active review stage"] },
  { code: "TH-118", title: "Application detail page", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "one page with applicant, job, submission, files, and history", benefit: "I decide without hunting across screens", acceptance: ["Who, which job, when, answers, documents, and timeline are on one page"] },
  { code: "TH-119", title: "Download candidate documents", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to download CV and cover letter securely", benefit: "I can review offline or share with hiring managers", acceptance: ["Only signed-in staff can download", "Files open with correct type"] },
  { code: "TH-120", title: "Schedule an interview", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to schedule one interview per application", benefit: "the team aligns on when to meet the candidate", acceptance: ["Schedule modal saves interview details", "One interview record per application"] },
  { code: "TH-121", title: "Pick date, time, and duration", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to choose interview date, start time, and length", benefit: "calendar holds are accurate", acceptance: ["Duration options from 15 to 120 minutes", "Invalid date/time combinations are blocked"] },
  { code: "TH-122", title: "Schedule in the right time zone", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to set scheduling time zone and see the candidate's local time", benefit: "we avoid timezone confusion", acceptance: ["I pick a standard time zone", "Preview shows candidate local time when their profile time zone is set"] },
  { code: "TH-123", title: "Require interview before interview stage", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "the system to require a scheduled interview before marking interview scheduled", benefit: "pipeline stages reflect reality", acceptance: ["Cannot move to interview scheduled without scheduling first", "Clear message tells me to schedule"] },
  { code: "TH-124", title: "Cancel interview when moving back", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "to cancel a scheduled interview when moving a candidate to an earlier stage", benefit: "outdated interviews are not left on the calendar", acceptance: ["Prompt asks if I want to cancel the interview", "Optional notify candidate checkbox", "Interview is removed on confirm"] },
  { code: "TH-125", title: "Audit trail of status changes", section: "7", status: "Done", app: "Backoffice", role: "hiring manager", want: "a history of who changed status, when, and why", benefit: "we have accountability and compliance evidence", acceptance: ["Timeline shows from/to status, actor, reason, and timestamp"] },
  { code: "TH-126", title: "Rejected and withdrawn lists", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "rejected and withdrawn applications separated from the active board", benefit: "the active pipeline stays focused", acceptance: ["Terminal applications appear in dedicated areas, not mixed with active triage"] },
  { code: "TH-127", title: "Move candidate without dragging", section: "7", status: "Done", app: "Backoffice", role: "recruiter using keyboard", want: "a Move to menu on each card", benefit: "I can triage without a mouse", acceptance: ["Menu lists only valid next stages", "Same outcome as drag-and-drop"] },
  { code: "TH-128", title: "AI relevance hint on applications", section: "7", status: "Partial", app: "Backoffice", priority: "P2", role: "recruiter", want: "an optional AI-generated relevance hint for each application", benefit: "I prioritise review when volume is high", acceptance: ["Scoring is advisory only", "Pipeline still works when AI is unavailable", "Errors and loading states are handled"] },
  { code: "TH-129", title: "Human review reminder for AI scores", section: "7", status: "Done", app: "Backoffice", role: "recruiter", want: "a clear reminder that AI scores require human judgment", benefit: "we avoid biased or automated hiring decisions", acceptance: ["Notice appears on relevance scores in pipeline and detail views", "Message states human review is required"] },
  { code: "TH-130", title: "Email candidate on status change", section: "7", status: "Planned", app: "Backoffice", priority: "P0", depends: "TH-009", role: "recruiter", want: "candidates emailed when I choose to notify them of a status change", benefit: "applicants are not left wondering", acceptance: ["Notify checkbox sends a real email when email service is configured", "No email sent when I leave notify off"] },
  { code: "TH-131", title: "Email candidate when interview scheduled", section: "7", status: "Planned", app: "Backoffice", priority: "P0", depends: "TH-009", role: "recruiter", want: "candidates emailed when I schedule an interview and opt to notify", benefit: "they receive date, time, and time zone details", acceptance: ["Email includes interview details when notify is checked", "System records when notification was sent"] },
  { code: "TH-132", title: "Reschedule an interview", section: "7", status: "Planned", app: "Backoffice", priority: "P2", role: "recruiter", want: "to change interview date or time without cancel and recreate", benefit: "last-minute changes are less error-prone", acceptance: ["I can edit scheduled interviews from application detail", "Optional notify on reschedule"] },
  { code: "TH-133", title: "Quick view from pipeline card", section: "7", status: "Planned", app: "Backoffice", priority: "P3", role: "recruiter", want: "a side panel summary when I click a pipeline card", benefit: "I scan details without leaving the board", acceptance: ["Click opens quick view; drag does not", "Full detail page remains available", "Escape closes the panel"] },

  // §8 Candidates
  { code: "TH-140", title: "Candidates overview", section: "8", status: "Done", app: "Backoffice", role: "recruiter", want: "a summary dashboard for candidates", benefit: "I see pool size before diving into records", acceptance: ["Counts match reality", "Link to full candidate list works"] },
  { code: "TH-141", title: "Search all candidates", section: "8", status: "Done", app: "Backoffice", role: "recruiter", want: "to search candidates by name or email", benefit: "I find people quickly across applications", acceptance: ["Search and pagination work", "Rows link to candidate detail"] },
  { code: "TH-142", title: "Candidate profile and history", section: "8", status: "Done", app: "Backoffice", role: "recruiter", want: "one place for profile, CV history, and applications", benefit: "I understand a person beyond a single application", acceptance: ["Profile, CVs, and application list display", "I can download CVs"] },
  { code: "TH-143", title: "Update candidate account status", section: "8", status: "Done", app: "Backoffice", role: "admin", want: "to activate or deactivate a candidate account", benefit: "we control access when needed", acceptance: ["Valid status changes save with clear feedback"] },
  { code: "TH-144", title: "Return to applications after viewing candidate", section: "8", status: "Done", app: "Backoffice", role: "recruiter", want: "to return to the applications list I came from", benefit: "I do not lose my triage context", acceptance: ["Back navigation returns to applications when I arrived from there"] },
  { code: "TH-145", title: "Protect candidate admin actions", section: "8", status: "Planned", app: "Backoffice", priority: "P1", role: "admin", want: "only signed-in staff to change candidate account status", benefit: "candidate records cannot be altered by unauthorised requests", acceptance: ["Unauthenticated or unauthorised requests are rejected"] },

  // §9 Interviews
  { code: "TH-150", title: "Interviews calendar", section: "9", status: "Done", app: "Backoffice", role: "recruiter", want: "a calendar of scheduled interviews", benefit: "I see my week at a glance", acceptance: ["Times respect time zones", "Entries link to the related application"] },
  { code: "TH-151", title: "Schedule from application page", section: "9", status: "Done", app: "Backoffice", role: "recruiter", want: "to schedule interviews from the application detail page", benefit: "I do not context-switch while reviewing a candidate", acceptance: ["Schedule opens from application detail and refreshes after save"] },
  { code: "TH-152", title: "Sync interviews to Google or Outlook", section: "9", status: "Planned", app: "Backoffice", priority: "P2", role: "recruiter", want: "scheduled interviews on my personal work calendar", benefit: "I avoid double-booking and missing interviews", acceptance: ["Minimum: download calendar file", "Or full sync if OAuth scope is approved"] },

  // §10 Administration
  { code: "TH-160", title: "Manage companies", section: "10", status: "Done", app: "Backoffice", role: "admin", want: "to add and edit companies", benefit: "job data stays organised by organisation", acceptance: ["Create, edit, delete with validation messages"] },
  { code: "TH-161", title: "Manage departments and locations", section: "10", status: "Done", app: "Backoffice", role: "admin", want: "to maintain departments and locations", benefit: "job postings and filters stay accurate", acceptance: ["New values appear in job forms and filters"] },
  { code: "TH-162", title: "Manage employment types and experience levels", section: "10", status: "Done", app: "Backoffice", role: "admin", want: "to maintain employment types and experience levels", benefit: "candidates filter jobs meaningfully", acceptance: ["Lookups update job form and public filters"] },
  { code: "TH-163", title: "Manage skills, tags, and benefits", section: "10", status: "Done", app: "Backoffice", role: "admin", want: "to maintain skills, tags, and benefits lists", benefit: "job content stays consistent", acceptance: ["Job postings can assign newly created values"] },
  { code: "TH-164", title: "Manage staff users", section: "10", status: "Planned", app: "Backoffice", priority: "P1", role: "admin", want: "to add and manage recruiter accounts", benefit: "the right people have access without developer help", acceptance: ["Only admins access user management", "I can assign roles and deactivate users", "Passwords are stored securely"] },
  { code: "TH-165", title: "Hiring reports", section: "10", status: "Planned", app: "Backoffice", priority: "P2", role: "hiring manager", want: "reports on applications and time-to-hire", benefit: "I measure team performance", acceptance: ["Reports show real data with date filters", "Empty state when no data exists"] },
  { code: "TH-166", title: "Workspace settings", section: "10", status: "Planned", app: "Backoffice", priority: "P2", role: "admin", want: "to configure company name, default time zone, and email sender", benefit: "TalentHub reflects our organisation in emails and scheduling", acceptance: ["Settings persist and affect defaults where documented"] },

  // §11 API
  { code: "TH-170", title: "Service health check", section: "11", status: "Done", app: "Central API", role: "operations", want: "a health endpoint for monitoring", benefit: "we know the auth service is up during deploys", acceptance: ["Health check returns OK with documented response"] },
  { code: "TH-171", title: "Sign in staff and candidates via API", section: "11", status: "Done", app: "Central API", role: "job seeker and recruiter", want: "secure login that knows whether I am staff or candidate", benefit: "each app gets the right access", acceptance: ["Staff and candidate logins issue appropriate credentials", "Wrong account type is rejected"] },
  { code: "TH-172", title: "Session refresh and logout", section: "11", status: "Done", app: "Central API", role: "job seeker", want: "my session to refresh and end cleanly", benefit: "I stay signed in during active use and can log out safely", acceptance: ["Refresh extends session", "Logout ends access"] },
  { code: "TH-173", title: "Registration and verification API", section: "11", status: "Done", app: "Central API", role: "job seeker", want: "registration and OTP verification handled reliably", benefit: "my account is created and verified through standard steps", acceptance: ["Register, verify, and resend OTP work as documented"] },
  { code: "TH-174", title: "Password reset API", section: "11", status: "Done", app: "Central API", role: "job seeker", want: "password reset handled securely on the server", benefit: "reset links work once and expire appropriately", acceptance: ["Reset tokens are single-use and time-limited", "Responses do not reveal whether an email exists"] },
  { code: "TH-175", title: "Public jobs API", section: "11", status: "Planned", app: "Central API", priority: "P2", role: "integrator", want: "a standard API for listing and reading jobs", benefit: "external tools and future apps can consume job data", acceptance: ["List and detail endpoints match documented contract", "Replaces placeholder stub"] },
  { code: "TH-176", title: "Applications API", section: "11", status: "Planned", app: "Central API", priority: "P2", role: "integrator", want: "a standard API for application data", benefit: "integrations can sync hiring records", acceptance: ["Staff-authenticated list, detail, and status match backoffice behaviour"] },
  { code: "TH-177", title: "Interviews API", section: "11", status: "Planned", app: "Central API", priority: "P2", role: "integrator", want: "a standard API for interview records", benefit: "calendar and HR tools can connect", acceptance: ["Interview CRUD aligned with in-product scheduling"] },
  { code: "TH-178", title: "Staff users API", section: "11", status: "Planned", app: "Central API", priority: "P2", role: "admin", want: "API access to manage staff users", benefit: "user provisioning can be automated", acceptance: ["Admin-only user endpoints documented and functional"] },
  { code: "TH-179", title: "In-app notification inbox", section: "11", status: "Out of scope", app: "Central API", role: "recruiter", want: "a notification centre inside TalentHub", benefit: "I would see alerts without email", acceptance: ["Not planned — transactional email covers MVP (TH-009)", "No notification inbox unless product adds a data model"] },
  { code: "TH-180", title: "Unified backend services", section: "11", status: "Planned", app: "Central API", priority: "P2", role: "product team", want: "hiring logic moved into the central API over time", benefit: "one backend serves web apps and future clients", acceptance: ["Phased migration plan documented", "No single risky big-bang rewrite"] },

  // §12 Compliance
  { code: "TH-190", title: "Accessible experience (WCAG 2.2 AA)", section: "12", status: "Partial", app: "All apps", priority: "P1", role: "job seeker and recruiter with disabilities", want: "TalentHub to meet WCAG 2.2 Level AA on critical paths", benefit: "everyone can apply and hire without barriers", acceptance: ["Accessibility audit failures are reduced on login, apply, and pipeline", "Keyboard and screen reader smoke tests pass on critical flows"] },
  { code: "TH-191", title: "Accessible dialogs on pipeline", section: "12", status: "Planned", app: "Backoffice", priority: "P1", role: "recruiter using keyboard", want: "modals that trap focus and close with Escape", benefit: "I can confirm status changes without getting lost in the page", acceptance: ["Tab stays inside open dialogs", "Escape closes and focus returns to the button I used"] },
  { code: "TH-192", title: "Privacy, terms, and accessibility pages", section: "12", status: "Planned", app: "Candidate portal, My Applications", priority: "P2", role: "job seeker", want: "working footer links to privacy, terms, and accessibility information", benefit: "I understand my rights before I register or apply", acceptance: ["Footer links open real pages on public and candidate sites", "Accessibility page states our target and contact"] },
  { code: "TH-193", title: "Stronger candidate session security", section: "12", status: "Planned", app: "My Applications", priority: "P2", role: "job seeker", want: "my login session protected like staff sessions", benefit: "my account is harder to steal if a page is compromised", acceptance: ["Approach documented with tradeoffs", "If implemented, session tokens are not readable by page scripts"] },
  { code: "TH-194", title: "Secure passwords", section: "12", status: "Done", app: "Central API", role: "job seeker and recruiter", want: "passwords stored and login attempts limited", benefit: "accounts resist brute-force attacks", acceptance: ["Passwords are never stored in plain text", "Repeated failed logins trigger lockout"] },
  { code: "TH-195", title: "Protected routes", section: "12", status: "Done", app: "Backoffice, My Applications", role: "job seeker and recruiter", want: "private pages blocked until I sign in", benefit: "my data and hiring tools are not public", acceptance: ["Unauthenticated access returns appropriate errors or redirects"] },
  { code: "TH-196", title: "Safe file uploads", section: "12", status: "Done", app: "My Applications", role: "job seeker", want: "only safe CV file types accepted", benefit: "malicious files cannot be uploaded as documents", acceptance: ["Wrong types and oversized files rejected", "Stored filenames are safe"] },
  { code: "TH-197", title: "Living design system catalog", section: "12", status: "Done", app: "All apps", role: "designer and developer", want: "a visual catalog that matches shipped UI", benefit: "new screens stay consistent", acceptance: ["Catalog updated when tokens or layouts change"] },
  { code: "TH-198", title: "Works on phone and tablet", section: "12", status: "Done", app: "All apps", role: "job seeker and recruiter on mobile", want: "responsive web layouts without a native app", benefit: "I can hire or apply from any device", acceptance: ["Critical flows usable at phone width", "Remaining mobile gaps tracked under TH-057"] },
];

const sectionTitles = {
  "1": "Platform & infrastructure",
  "2": "Candidate portal",
  "3": "My Applications",
  "4": "Backoffice — authentication & shell",
  "5": "Backoffice — dashboard",
  "6": "Backoffice — job posting",
  "7": "Backoffice — applications & pipeline",
  "8": "Backoffice — candidates",
  "9": "Backoffice — interviews",
  "10": "Backoffice — administration",
  "11": "Central API",
  "12": "Non-functional & compliance",
};

function formatStory(s) {
  const meta = [`**Status:** ${s.status}`, `**Audience:** ${s.app}`];
  if (s.priority) meta.push(`**Priority:** ${s.priority}`);
  if (s.depends) meta.push(`**Depends on:** ${s.depends}`);

  const acceptance = s.acceptance.map((a) => `- ${a}`).join("\n");

  return `#### ${s.code} — ${s.title}

${meta.join(" · ")}

**User story**

> As a **${s.role}**, I want **${s.want}**, so that **${s.benefit}**.

**Acceptance criteria**

${acceptance}
`;
}

let md = `# TalentHub — Feature Backlog: User Stories

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

`;

let currentSection = "";
for (const s of stories) {
  if (s.section !== currentSection) {
    currentSection = s.section;
    const n = currentSection;
    const slug = sectionTitles[n].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-");
    md += `## ${n}. ${sectionTitles[n]}\n\n`;
  }
  md += formatStory(s) + "\n";
}

md += `---

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

`;

writeFileSync(outPath, md, "utf8");
console.log(`Wrote ${stories.length} user stories to ${outPath}`);
