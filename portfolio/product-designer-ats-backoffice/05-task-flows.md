# Task flows

## Flow A — Triage in table, open packet

1. Staff logs into **backoffice** (session-gated).  
2. Navigates to **Applications**.  
3. Keeps default **Table** tab (or switches to it).  
4. Scans rows; candidate rows may **group** multiple applications under one person.  
5. Clicks **job title** → lands on **`/applications/[id]`**.  
6. Reviews **submission**, **documents**, **applicant** summary.  
7. Clicks **Back to applications** → returns to list.  

**Design intent:** Fast path from “what’s in the queue” to “full packet” without opening candidate profile first.

---

## Flow B — Pipeline by week, update status

1. Staff opens **Applications** → **Pipeline** tab.  
2. Reads **week label** (cohort context).  
3. Optionally goes **Previous week** to compare cohorts.  
4. **Next week** remains available until current week; **cannot** advance into a **future** week.  
5. Drags a card from column A to column B → status updates (optimistic UI with error recovery).  
6. Clicks a card (without dragging) → **`/applications/[id]`** for deep read.  

**Design intent:** Spatial status work + temporal focus; avoid impossible “future week” selection.

---

## Flow C — Applications → candidate → back

1. From **Applications** table, staff clicks **candidate name** (`/candidates/[id]?from=applications`).  
2. Reviews full **candidate profile** (history, bookmarks, etc.).  
3. Clicks **Back to applications** (not “Back to candidates”).  
4. Resumes table triage.  

**Design intent:** Preserve **wayfinding** using a lightweight query param rather than a heavy navigation stack.

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

**Design intent:** Honest empty states; staff downloads go through **authenticated** backoffice endpoints where designed.
