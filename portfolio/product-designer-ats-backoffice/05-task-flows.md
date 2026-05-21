# Task flows

*Aligned with [PRD §9](../../docs/specification/PRD.md) user journeys.*

## Flow A — Triage in table, open packet

1. Staff logs into **backoffice** (session-gated).
2. Navigates to **Applications**.
3. Switches to **Table** tab (or stays if already there).
4. Scans rows; candidate rows may **group** multiple applications under one person.
5. Clicks **job title** → lands on **`/applications/[id]`**.
6. Reviews **submission**, **documents**, **status history**, **applicant** summary.
7. Clicks **Back to applications** → returns to list.

**Design intent:** Fast path from “what’s in the queue” to “full packet” without opening candidate profile first.

---

## Flow B — Pipeline by week, update status

1. Staff opens **Applications** → **Pipeline** tab (default view).
2. Reads **week label** (cohort context).
3. Optionally goes **Previous week** to compare cohorts.
4. **Next week** remains available until current week; **cannot** advance into a **future** week.
5. Drags a card from column A to column B → status updates (optimistic UI with error recovery).
6. If transition invalid (e.g. missing interview), server returns error; UI rolls back.
7. Clicks a card (without dragging) → **`/applications/[id]`** for deep read.

**Design intent:** Spatial status work + temporal focus; honest validation feedback.

---

## Flow C — Applications → candidate → back

1. From **Applications** table, staff clicks **candidate name** (`/candidates/[id]?from=applications`).
2. Reviews full **candidate profile** (history, applications, CV).
3. Clicks **Back to applications** (not “Back to candidates”).
4. Resumes table triage.

**Design intent:** Preserve **wayfinding** using a lightweight query param.

---

## Flow D — Application detail → job correction

1. From **`/applications/[id]`**, staff clicks **job** link → **`/jobs/[id]/edit`**.
2. Fixes posting typo or closing date.
3. Uses browser back or nav to return *(optional improvement: explicit “back to application” breadcrumb)*.

**Design intent:** Operational reality—recruiters fix job metadata mid-review.

---

## Flow E — Documents

1. On **`/applications/[id]`**, staff uses **Download submitted CV** when the application references a stored CV parse.
2. Uses **Open default CV** when profile default exists (may open **my-applications** base URL).
3. Cover letter: **download** for file mode; **text section** for text mode; legacy plain text if present.

**Design intent:** Honest empty states; staff downloads via authenticated backoffice endpoints.

---

## Flow F — Schedule interview, advance status

1. On **`/applications/[id]`**, staff opens **Schedule interview** modal.
2. Enters date/time, location or link, optional notes → **POST** creates `application_interviews` row.
3. Staff moves application to **Interview Scheduled** (drag on pipeline or status action on detail).
4. Optionally views scheduled session on **`/interviews`** calendar.

**Design intent:** Interview record required before pipeline status reflects scheduling (PRD BO-40, BO-62).

---

## Flow G — Reject, undo, reopen

1. Staff rejects application → modal requires **reason** → status moves to **Rejected** (terminal column).
2. Mistake: staff uses **Undo** to revert last change.
3. Reconsideration: staff uses **Reopen** action (not drag) with mandatory reason → returns to **Under Review** or **Shortlisted**.

**Design intent:** Auditable decisions; controlled paths out of terminal states.

---

## Flow H — Platform: candidate discover and apply *(context)*

1. Candidate browses jobs on **candidate-portal** (:3000).
2. Clicks Apply → redirected to **my-applications** (:3002) login/register.
3. Uploads and parses CV → applies with screening answers.
4. Tracks status on candidate dashboard.
5. Staff sees new application in backoffice pipeline (Flow A or B).

**Design intent:** End-to-end hiring loop across three apps (PRD §9.1).

---

## Flow I — Staff: publish job *(context)*

1. Staff logs into backoffice → **Jobs** → **New**.
2. Completes multi-section form → **Review** → **Publish**.
3. Job appears on candidate portal and my-applications job search.

**Design intent:** Staff-owned content feeds public discovery (PRD §9.2).
