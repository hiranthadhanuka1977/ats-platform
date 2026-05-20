# ATS Application State Management - UI & Backend API Implementation Requirements

## 1. Purpose

This document defines the implementation requirements for managing candidate application states in the ATS backoffice portal using a Trello/Kanban-style board.

It covers:

- Application states
- Valid and invalid state transitions
- UI drag-and-drop behavior
- Backend API validation
- Required business rules
- Audit logging
- Error handling
- Recommended implementation payloads

### 1.1 Implementation status (May 2026)

| Topic | Status |
|-------|--------|
| Backoffice Kanban pipeline | **Implemented** — `apps/backoffice` `/applications` (default view), list toggle, fullscreen |
| Status APIs | **Implemented** on Next.js BFF, not central Hono |
| Base path | **`/api/backoffice/applications/{applicationId}/...`** (staff session cookies) |
| Central API | `GET /api/v1/applications` remains a **stub** in `apps/api` |
| Detailed API contract | [api/backoffice-applications.md](api/backoffice-applications.md) |
| Shared transition rules | `@ats-platform/types` → `APPLICATION_STATUS_TRANSITIONS` |
| Interviews | **One** `application_interviews` row per application; schedule via `POST .../interviews` |

Section 8 below describes product intent; **§8.0** lists implemented endpoints and payload shapes.

---

## 2. Application States

The application lifecycle shall support the following states:

| State | Description |
|---|---|
| Submitted | Candidate has submitted the application successfully. |
| Under Review | Recruiter is reviewing the application. |
| Shortlisted | Candidate has passed initial screening and is selected for further evaluation. |
| Interview Scheduled | An interview has been scheduled for the candidate. |
| Interview Completed | Interview has been completed and feedback can be reviewed. |
| Offered | Candidate has been selected and an offer has been issued. |
| Hired | Candidate has accepted the offer and hiring is completed. |
| Rejected | Candidate is no longer being considered for the vacancy. |
| Withdrawn | Candidate has withdrawn from the application process. |

---

## 3. Recommended Active Kanban Board Columns

The main active pipeline board should show only active recruitment states:

```text
Submitted
Under Review
Shortlisted
Interview Scheduled
Interview Completed
Offered
Hired
```

The following states should be available as separate tabs or filtered views:

```text
Rejected
Withdrawn
```

This avoids cluttering the active hiring board.

---

## 4. State Transition Matrix

| Current State | Submitted | Under Review | Shortlisted | Interview Scheduled | Interview Completed | Offered | Hired | Rejected | Withdrawn |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Submitted | No | Yes | Yes | No | No | No | No | Yes | Yes |
| Under Review | No | No | Yes | Yes | No | No | No | Yes | Yes |
| Shortlisted | No | Yes | No | Yes | No | No | No | Yes | Yes |
| Interview Scheduled | No | No | No | No | Yes | No | No | Yes | Yes |
| Interview Completed | No | No | Yes | Yes | No | Yes | No | Yes | Yes |
| Offered | No | No | No | No | No | No | Yes | Yes | Yes |
| Hired | No | No | No | No | No | No | No | No | No |
| Rejected | No | Conditional | Conditional | No | No | No | No | No | No |
| Withdrawn | No | No | No | No | No | No | No | No | No |

Conditional = allowed only through a controlled “Reopen Application” action with mandatory reason and sufficient user permission. It should not be allowed by normal drag-and-drop.

---

## 5. Implementation-Friendly Transition Configuration

The following transition map should be used by both UI and backend validation.

```json
{
  "Submitted": ["Under Review", "Shortlisted", "Rejected", "Withdrawn"],
  "Under Review": ["Shortlisted", "Interview Scheduled", "Rejected", "Withdrawn"],
  "Shortlisted": ["Under Review", "Interview Scheduled", "Rejected", "Withdrawn"],
  "Interview Scheduled": ["Interview Completed", "Rejected", "Withdrawn"],
  "Interview Completed": ["Shortlisted", "Interview Scheduled", "Offered", "Rejected", "Withdrawn"],
  "Offered": ["Hired", "Rejected", "Withdrawn"],
  "Hired": [],
  "Rejected": ["Under Review", "Shortlisted"],
  "Withdrawn": []
}
```

Backend must treat transitions from `Rejected` as special controlled actions, not standard status updates.

---

## 6. Business Rules by State

### 6.1 Submitted

Allowed transitions:

- Submitted to Under Review
- Submitted to Shortlisted
- Submitted to Rejected
- Submitted to Withdrawn

Not allowed:

- Submitted to Interview Scheduled
- Submitted to Interview Completed
- Submitted to Offered
- Submitted to Hired

Reason: The application must be reviewed or shortlisted before interview and final decision stages.

---

### 6.2 Under Review

Allowed transitions:

- Under Review to Shortlisted
- Under Review to Interview Scheduled
- Under Review to Rejected
- Under Review to Withdrawn

Not allowed:

- Under Review to Offered
- Under Review to Hired

Reason: Offer or hire decisions should not be made before proper evaluation.

---

### 6.3 Shortlisted

Allowed transitions:

- Shortlisted to Under Review
- Shortlisted to Interview Scheduled
- Shortlisted to Rejected
- Shortlisted to Withdrawn

Not allowed:

- Shortlisted to Offered
- Shortlisted to Hired

Reason: Shortlisting confirms the candidate is selected for further evaluation, not final selection.

---

### 6.4 Interview Scheduled

Allowed transitions:

- Interview Scheduled to Interview Completed
- Interview Scheduled to Rejected
- Interview Scheduled to Withdrawn

Not allowed:

- Interview Scheduled to Offered
- Interview Scheduled to Hired
- Interview Scheduled to Shortlisted

Reason: The interview must be completed before offer or hiring decisions.

---

### 6.5 Interview Completed

Allowed transitions:

- Interview Completed to Offered
- Interview Completed to Shortlisted
- Interview Completed to Interview Scheduled
- Interview Completed to Rejected
- Interview Completed to Withdrawn

Reason: The candidate may be offered, rejected, returned to review, or scheduled for another interview round.

---

### 6.6 Offered

Allowed transitions:

- Offered to Hired
- Offered to Rejected
- Offered to Withdrawn

Not allowed:

- Offered to Under Review
- Offered to Shortlisted
- Offered to Interview Scheduled
- Offered to Interview Completed

Reason: Once an offer is issued, the process should move only to final outcome states.

---

### 6.7 Hired

Allowed transitions:

- None by default

Reason: `Hired` is a terminal state.

Special rule: Only an Admin should be able to reverse a hired application using a special correction process. This should not be available through normal drag-and-drop.

---

### 6.8 Rejected

Allowed transitions:

- Rejected to Under Review
- Rejected to Shortlisted

Condition: This must be handled only through a `Reopen Application` action.

Rules:

- Not allowed through drag-and-drop
- Mandatory reopen reason required
- User must have permission
- Audit log must be captured

---

### 6.9 Withdrawn

Allowed transitions:

- None by default

Reason: `Withdrawn` means the candidate has exited the process.

Special rule: If the candidate wants to apply again, the system may allow a new application only if business rules permit reapplication.

---

## 7. UI Implementation Requirements

### 7.1 Kanban Board Layout

The backoffice application management UI should display applications as cards grouped by status.

Recommended structure:

```text
Submitted | Under Review | Shortlisted | Interview Scheduled | Interview Completed | Offered | Hired
```

Each column should show:

- Status name
- Number of applications in the status
- Application cards
- Empty state if no applications are available

---

### 7.2 Application Card Requirements

Each card should display concise candidate and application information.

Recommended card fields:

| Field | Description |
|---|---|
| Candidate Name | Full name of applicant |
| Candidate Headline | Current role or profile headline |
| Applied Date | Date application was submitted |
| Location | Candidate location if available |
| Experience | Total years or experience level if available |
| CV Indicator | Shows whether CV is attached |
| Cover Letter Indicator | Shows whether cover letter is attached |
| Tags | Optional recruiter tags |
| Last Activity | Optional recent activity timestamp |

Example card layout:

```text
Dhanuka Silva
Senior Business Analyst

Colombo | 5+ Years
Applied: 05 Apr 2026

CV Attached | Cover Letter
```

---

### 7.3 Drag-and-Drop Rules

The UI must:

- Allow drag-and-drop only for valid transitions
- Prevent drop into invalid columns
- Show visual feedback for valid and invalid drop zones
- Restore card to original column if transition fails
- Call backend API before confirming final status update
- Show success or error message after API response

The UI must not rely only on frontend rules. Backend validation is mandatory.

---

### 7.4 Invalid Drop Behavior

If a user attempts an invalid transition:

- Block the drop
- Return card to original column
- Show a clear error message

Example:

```text
This application cannot be moved from Offered to Shortlisted.
```

---

### 7.5 Special Handling for Rejected

Rejected should preferably be excluded from the main active board.

When moving an application to Rejected:

- Show confirmation modal
- Require rejection reason
- Optional: allow sending rejection email
- Update status only after confirmation

Required modal fields:

| Field | Required |
|---|---|
| Rejection Reason | Yes |
| Notify Candidate | Optional |
| Internal Note | Optional |

---

### 7.6 Special Handling for Withdrawn

Withdrawn should preferably be excluded from the main active board.

If staff marks an application as withdrawn:

- Show confirmation modal
- Capture withdrawal source
- Capture reason where applicable

Recommended fields:

| Field | Required |
|---|---|
| Withdrawal Source | Yes |
| Withdrawal Reason | Optional / Configurable |
| Internal Note | Optional |

Withdrawal source options:

- Candidate Request
- Recruiter Update
- Duplicate Application
- Other

---

### 7.7 Special Handling for Hired

When moving to Hired:

- System should confirm that offer has been accepted
- Show confirmation modal
- Require confirmation before finalizing

Recommended validation:

```text
Offered to Hired requires offer acceptance confirmation.
```

Hired state should be treated as terminal in normal UI behavior.

---

### 7.8 Reopen Application Action

Rejected applications should not be draggable back into active stages.

Instead, provide a row/card action:

```text
Reopen Application
```

Allowed reopen targets:

- Under Review
- Shortlisted

Required fields:

| Field | Required |
|---|---|
| Target Status | Yes |
| Reopen Reason | Yes |
| Internal Note | Optional |

---

### 7.9 Card Detail Drawer

Clicking a card should open a side drawer instead of navigating away.

The drawer should include:

- Candidate basic details
- Application status
- CV download/view
- Cover letter preview/download
- Application questions and answers
- Status history
- Notes
- Available actions

Recommended actions:

- Move to next stage
- Reject
- Withdraw
- Schedule interview
- View candidate profile

---

### 7.10 Filtering and Search

The Kanban board should support:

- Candidate search
- Job-specific filter
- Application status filter
- Location filter
- Experience filter
- Skill filter
- Date applied filter
- Recruiter/owner filter if applicable

---

### 7.11 Board Tabs

Recommended tabs:

```text
Active Pipeline
Rejected
Withdrawn
All Applications
```

This keeps the active pipeline clean while still allowing access to terminal states.

---

### 7.12 Mobile and Responsive Behavior

For small screens:

- Columns should be horizontally scrollable
- Cards should remain readable
- Drag-and-drop may be replaced with status action menu
- Important actions should be accessible without precise dragging

Recommended mobile fallback:

```text
Open card -> Change Status -> Select allowed target status
```

---

## 8. Backend API Validation Requirements

### 8.0 Implemented endpoints (`apps/backoffice`)

| Action | Method | Path |
|--------|--------|------|
| Update status | `PATCH` | `/api/backoffice/applications/{applicationId}/status` |
| Undo | `POST` | `/api/backoffice/applications/{applicationId}/status/undo` |
| Reopen (from rejected) | `POST` | `/api/backoffice/applications/{applicationId}/reopen` |
| List / schedule interview | `GET` / `POST` | `/api/backoffice/applications/{applicationId}/interviews` |

Reject and withdraw use the status PATCH with `status: "rejected"` or `"withdrawn"` (no separate `/reject` or `/withdraw` routes). Full error codes and fields: [api/backoffice-applications.md](api/backoffice-applications.md).

---

### 8.1 Status Update API

```http
PATCH /api/backoffice/applications/{applicationId}/status
```

Purpose: Update application status after validating business rules.

---

### 8.2 Request Payload

```json
{
  "status": "shortlisted",
  "reason": "Candidate has relevant fintech experience",
  "note": "Move to shortlist for hiring manager review",
  "notifyCandidate": false,
  "expectedUpdatedAt": "2026-05-19T10:30:00.000Z"
}
```

Use snake_case status values matching Prisma `ApplicationStatus`.

---

### 8.3 Response Payload

#### Success

```json
{
  "data": {
    "id": "uuid",
    "status": "shortlisted",
    "previousStatus": "under_review",
    "updatedAt": "2026-05-19T10:30:00.000Z"
  }
}
```

#### Failure

```json
{
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Application cannot be moved from offered to shortlisted."
  }
}
```

---

### 8.4 Backend Validation Steps

Backend must perform the following validations:

1. Validate application exists
2. Validate user is authenticated
3. Validate user has permission to update application
4. Retrieve current application status from database
5. Validate target status exists
6. Validate transition is allowed
7. Validate special transition requirements
8. Update status in transaction
9. Create status history record
10. Create audit log
11. Trigger notification if applicable
12. Return updated status response

---

### 8.5 Transition Validation Logic

Pseudo logic:

```pseudo
currentStatus = application.status
targetStatus = request.targetStatus

allowedTargets = TRANSITION_MAP[currentStatus]

if targetStatus not in allowedTargets:
    reject INVALID_STATUS_TRANSITION

if currentStatus == "Rejected":
    reject USE_REOPEN_ACTION

if currentStatus == "Hired":
    reject TERMINAL_STATE

if currentStatus == "Withdrawn":
    reject TERMINAL_STATE
```

---

### 8.6 Special Validation Rules

| Transition | Required Validation |
|---|---|
| Any to Rejected | Rejection reason required |
| Any to Withdrawn | Withdrawal source required |
| Interview Scheduled to Interview Completed | Interview record must exist |
| Interview Completed to Offered | Interview feedback recommended/required based on configuration |
| Offered to Hired | Offer acceptance must be confirmed |
| Rejected to Under Review | Must use reopen action |
| Rejected to Shortlisted | Must use reopen action |
| Hired to Any | Admin correction only, not normal status update |
| Withdrawn to Any | Not allowed by default |

---

### 8.7 Reopen Application API

Recommended endpoint:

```http
POST /api/backoffice/applications/{applicationId}/reopen
```

Request:

```json
{
  "targetStatus": "under_review",
  "reason": "Candidate was rejected by mistake",
  "note": "Reopened after hiring manager review"
}
```

Validation:

- Current status must be Rejected
- Target status must be Under Review or Shortlisted
- Reason is mandatory
- User must have permission
- Audit log is mandatory

---

### 8.8 Reject Application API

**Implemented** via status PATCH:

```http
PATCH /api/backoffice/applications/{applicationId}/status
```

```json
{
  "status": "rejected",
  "reason": "Does not meet required experience level",
  "note": "Candidate has 1 year experience; role requires 5+",
  "notifyCandidate": true
}
```

---

### 8.9 Withdraw Application API

**Implemented** via status PATCH:

```json
{
  "status": "withdrawn",
  "withdrawalSource": "Candidate request",
  "note": "Updated by recruiter based on email confirmation"
}
```

---

## 9. Database Requirements

### 9.1 Applications Table

The `applications` table should store the current status.

Recommended fields:

| Column | Purpose |
|---|---|
| id | Application identifier |
| candidate_id | Candidate reference |
| job_posting_id | Job reference |
| status | Current application status |
| applied_at | Submission timestamp |
| updated_at | Last update timestamp |
| current_stage_updated_at | Optional status update timestamp |

---

### 9.2 Application Status History Table

A separate table should track every status movement.

Recommended table:

```text
application_status_history
```

Recommended fields:

| Column | Purpose |
|---|---|
| id | History record ID |
| application_id | Related application |
| from_status | Previous status |
| to_status | New status |
| reason | Reason for transition |
| note | Optional internal note |
| changed_by | Internal user who changed status |
| changed_at | Timestamp |
| change_source | UI/API/System |

---

### 9.3 Audit Log Table

A generic audit log should capture important events.

Recommended events:

- APPLICATION_STATUS_CHANGED
- APPLICATION_REJECTED
- APPLICATION_WITHDRAWN
- APPLICATION_REOPENED
- APPLICATION_HIRED
- INVALID_TRANSITION_ATTEMPT

Recommended fields:

| Column | Purpose |
|---|---|
| id | Audit ID |
| actor_user_id | Backoffice user |
| entity_type | Example: application |
| entity_id | Application ID |
| action | Audit action |
| old_value | Previous status/data |
| new_value | New status/data |
| metadata | JSON details |
| created_at | Timestamp |

---

## 10. Permissions and Role Rules

Recommended permission model:

| Action | Admin | Recruiter | Hiring Manager | Viewer |
|---|---:|---:|---:|---:|
| View Board | Yes | Yes | Yes | Yes |
| Move Active States | Yes | Yes | Yes | No |
| Reject Application | Yes | Yes | Yes | No |
| Withdraw Application | Yes | Yes | No | No |
| Reopen Rejected Application | Yes | Conditional | No | No |
| Mark as Hired | Yes | Conditional | No | No |
| Admin Correction | Yes | No | No | No |

Conditional = allowed only if organization policy permits.

---

## 11. Notification Requirements

Notifications should be configurable.

Recommended triggers:

| Transition | Candidate Notification |
|---|---|
| Submitted to Under Review | Optional |
| Shortlisted to Interview Scheduled | Yes |
| Interview Scheduled to Interview Completed | No |
| Interview Completed to Offered | Yes |
| Any to Rejected | Optional / Configurable |
| Offered to Hired | Optional |
| Any to Withdrawn | Optional |

Notifications must not be sent automatically for every status change unless configured.

---

## 12. Error Codes

Recommended backend error codes:

| Error Code | Meaning |
|---|---|
| APPLICATION_NOT_FOUND | Application does not exist |
| UNAUTHORIZED | User is not authenticated |
| FORBIDDEN | User does not have permission |
| INVALID_TARGET_STATUS | Target status is not valid |
| INVALID_STATUS_TRANSITION | Transition is not allowed |
| TERMINAL_STATE | Current state is terminal |
| REASON_REQUIRED | Required reason is missing |
| INTERVIEW_RECORD_REQUIRED | Interview record is required |
| OFFER_ACCEPTANCE_REQUIRED | Offer acceptance confirmation required |
| USE_REOPEN_ACTION | Rejected application must be reopened via special action |
| CONFLICT_STATUS_UPDATED | Application was updated by another user |

---

## 13. Concurrency Handling

To prevent conflicting updates:

- Backend should check current status before update
- API may accept `expectedCurrentStatus`
- If current status changed after UI loaded, reject update with conflict response

Example request:

```json
{
  "expectedCurrentStatus": "Under Review",
  "targetStatus": "Shortlisted",
  "reason": "Initial screening completed"
}
```

Example error:

```json
{
  "success": false,
  "errorCode": "CONFLICT_STATUS_UPDATED",
  "message": "Application status has changed. Please refresh the board."
}
```

---

## 14. Recommended API Response After Board Move

After successful move, API should return enough data for UI refresh:

```json
{
  "success": true,
  "application": {
    "id": "app_123",
    "status": "Shortlisted",
    "updatedAt": "2026-05-19T10:30:00Z",
    "candidateName": "Dhanuka Silva",
    "jobPostingId": "job_456"
  },
  "history": {
    "fromStatus": "Under Review",
    "toStatus": "Shortlisted",
    "changedBy": "recruiter_001",
    "changedAt": "2026-05-19T10:30:00Z"
  }
}
```

---

## 15. Recommended UI Feedback Messages

| Scenario | Message |
|---|---|
| Valid move success | Application moved successfully. |
| Invalid transition | This application cannot be moved to the selected status. |
| Missing rejection reason | Please enter a rejection reason before rejecting this application. |
| Missing interview record | Please schedule an interview before marking it as completed. |
| Hired terminal state | Hired applications cannot be moved using drag-and-drop. |
| Conflict | This application was updated by another user. Please refresh and try again. |

---

## 16. Final Implementation Checklist

### UI

- [ ] Kanban board created with active statuses
- [ ] Rejected and Withdrawn separated from main pipeline
- [ ] Drag-and-drop enabled only for valid transitions
- [ ] Invalid drop zones visually blocked
- [ ] Status update API called on drop
- [ ] Card reverts if API fails
- [ ] Confirmation modal for Rejected
- [ ] Confirmation modal for Withdrawn
- [ ] Confirmation modal for Hired
- [ ] Side drawer/card detail implemented
- [ ] Search and filters implemented
- [ ] Mobile fallback available

### Backend

- [ ] Status transition map implemented centrally
- [ ] API validates transition server-side
- [ ] Permissions enforced
- [ ] Special rules enforced
- [ ] Status update transaction implemented
- [ ] Status history table updated
- [ ] Audit log created
- [ ] Notification trigger handled
- [ ] Error codes standardized
- [ ] Concurrency check implemented

---

## 17. Final Recommendation

The ATS should use the Kanban board for active application management while enforcing all state transition rules in the backend API. The frontend should improve usability by preventing invalid drag-and-drop actions, but the backend must remain the source of truth for application status validation.

This ensures:

- Better recruiter experience
- Clean hiring workflow
- Strong data integrity
- Proper auditability
- Reduced risk of invalid application states
