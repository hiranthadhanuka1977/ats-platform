# API — Backoffice applications & pipeline

**Doc version:** 1.0  
**Date:** 19 May 2026  
**App:** `apps/backoffice` (origin e.g. `http://localhost:3001`)  
**Auth:** Staff session via `POST /api/auth/login` (httpOnly cookies). All routes below call `requireStaffSession()` unless noted.

These handlers are **Next.js Route Handlers**, not the central Hono API (`/api/v1`). Source of truth:

- `apps/backoffice/src/app/api/backoffice/applications/**`
- `apps/backoffice/src/lib/application-status-service.ts`
- `@ats-platform/types` — `APPLICATION_STATUS_TRANSITIONS`
- `@ats-platform/validators` — `applicationStatusPatchSchema`, `applicationReopenSchema`, `applicationStatusUndoSchema`

Product behaviour (Kanban, modals, drag-and-drop) is specified in [ATS_Application_State_UI_API_Requirements.md](../ATS_Application_State_UI_API_Requirements.md). Data model: [db-schema.md](../db-schema.md) §3.8–3.10.

---

## Application status values

| API / Prisma value | Pipeline column | Notes |
|--------------------|-----------------|-------|
| `submitted` | Submitted | Default on apply |
| `under_review` | Under Review | |
| `shortlisted` | Shortlisted | |
| `interview_scheduled` | Interview Scheduled | Legacy DB value `interview` is normalized to this in rules |
| `interview_completed` | Interview Completed | |
| `offered` | Offered | |
| `hired` | Hired | Terminal for pipeline PATCH |
| `rejected` | Rejected (terminal) | Use reopen flow to leave |
| `withdrawn` | Withdrawn (terminal) | |

**Active pipeline columns** (UI): submitted → under_review → shortlisted → interview_scheduled → interview_completed → offered → hired.  
**Terminal columns** (UI): rejected, withdrawn.

Transition matrix: `@ats-platform/types` → `APPLICATION_STATUS_TRANSITIONS`.

---

## Status update

| Key | Value |
|-----|--------|
| **Method** | `PATCH` |
| **Path** | `/api/backoffice/applications/{applicationId}/status` |
| **Auth** | Staff session |

### Request body

```json
{
  "status": "shortlisted",
  "reason": "Strong fintech background",
  "note": "Optional internal note",
  "notifyCandidate": false,
  "withdrawalSource": "Candidate request",
  "offerAccepted": true,
  "expectedUpdatedAt": "2026-05-19T10:30:00.000Z"
}
```

| Field | When required |
|-------|----------------|
| `status` | Always (snake_case enum) |
| `reason` | Required when `status` is `rejected` |
| `withdrawalSource` | Required when `status` is `withdrawn` |
| `offerAccepted` | Must be `true` when moving from `offered` → `hired` |
| `expectedUpdatedAt` | Optional optimistic concurrency (ISO 8601); mismatch → `409 STATUS_CONFLICT` |

Legacy request value `interview` is accepted by the validator and stored as `interview_scheduled`.

### Success `200`

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

### Error codes (`error.code`)

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Invalid id or body |
| `NOT_FOUND` | 404 | Application missing |
| `INVALID_TARGET_STATUS` | 400 | Unknown status |
| `INVALID_STATUS_TRANSITION` | 409 | Not in transition map |
| `USE_REOPEN_ACTION` | 409 | From `rejected` or reopen-only target |
| `TERMINAL_STATE` | 409 | From `hired` or `withdrawn` |
| `REJECTION_REASON_REQUIRED` | 400 | Reject without reason |
| `WITHDRAWAL_SOURCE_REQUIRED` | 400 | Withdraw without source |
| `OFFER_ACCEPTANCE_REQUIRED` | 400 | Hired without `offerAccepted: true` |
| `INTERVIEW_RECORD_REQUIRED` | 409 | Target is `interview_scheduled` (or completed from scheduled) without an `application_interviews` row |
| `STATUS_CONFLICT` | 409 | `expectedUpdatedAt` stale |
| `UPDATE_FAILED` | 500 | Transaction error |

Reject and withdraw are implemented via this endpoint (`status: "rejected"` / `"withdrawn"`), not separate POST routes.

---

## Undo last status change

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/backoffice/applications/{applicationId}/status/undo` |

### Request body

```json
{
  "previousStatus": "under_review",
  "currentStatus": "shortlisted",
  "expectedUpdatedAt": "2026-05-19T10:30:00.000Z"
}
```

Reverts to `previousStatus` when the latest status event matches `currentStatus` and undo is allowed by product rules.

### Errors

| Code | HTTP |
|------|------|
| `UNDO_NOT_AVAILABLE` | 409 |
| `STATUS_CONFLICT` | 409 |
| `NOT_FOUND` | 404 |

---

## Reopen rejected application

| Key | Value |
|-----|--------|
| **Method** | `POST` |
| **Path** | `/api/backoffice/applications/{applicationId}/reopen` |

### Request body

```json
{
  "targetStatus": "under_review",
  "reason": "Rejected in error after HM review",
  "note": "Optional",
  "expectedUpdatedAt": "2026-05-19T10:30:00.000Z"
}
```

`targetStatus` must be `under_review` or `shortlisted`. Current status must be `rejected`.

---

## Interviews (one per application)

| Key | Value |
|-----|--------|
| **GET** | `/api/backoffice/applications/{applicationId}/interviews` |
| **POST** | Same path — schedule interview |

**Constraint:** `application_interviews.application_id` is **unique** (at most one interview row per application). Second `POST` → `409 CONFLICT`.

### POST body

```json
{
  "startsAt": "2026-05-25T09:00:00.000Z",
  "endsAt": "2026-05-25T10:00:00.000Z",
  "notifyCandidateEmail": true
}
```

On success:

1. Creates `application_interviews` row.
2. If application status is not already `interview_scheduled`, updates status and appends `application_status_events` (schedule path does not set `changeSource` to `pipeline` today).

### GET success

```json
{
  "data": {
    "interviews": [
      {
        "id": "uuid",
        "startsAt": "2026-05-25T09:00:00.000Z",
        "endsAt": "2026-05-25T10:00:00.000Z",
        "notifyCandidateEmail": true,
        "notificationSentAt": "2026-05-19T12:00:00.000Z",
        "scheduledBy": "Staff Name"
      }
    ]
  }
}
```

**Not implemented:** DELETE interview, PATCH reschedule, central `/api/v1/interviews`.

---

## Relevance score

| Key | Value |
|-----|--------|
| **Method** | `GET` |
| **Path** | `/api/backoffice/applications/{applicationId}/relevance-score` |
| **Query** | `refresh=1` or `refresh=true` to bypass cache |

Requires `OPENAI_API_KEY` in repo root `.env` or `apps/backoffice/.env.local`. Without it → `503 SERVICE_UNAVAILABLE`.

Persists `applications.relevance_score`, `relevance_breakdown`, `relevance_scored_at`, `relevance_input_hash` (see db-schema §3.8).

---

## Attachments (CV & cover letter)

| Method | Path | Behaviour |
|--------|------|-----------|
| `GET` | `/api/backoffice/applications/{id}/attachments/cv` | Streams file from `storage/cvs/{candidateAccountId}/` using `resume_url` query `id` |
| `GET` | `/api/backoffice/applications/{id}/attachments/cover-letter` | Streams from `storage/cover-letters/{candidateAccountId}/` |

Both require staff session. `404` if application or file missing.

---

## UI integration (read-only)

| Route | Feature |
|-------|---------|
| `/applications` | Pipeline board (default) / list toggle; fullscreen board |
| `/applications/{id}` | Detail, status actions, schedule interview, relevance, attachments |
| `/interviews` | Calendar of scheduled interviews (`listInterviewsForCalendar`) |

List/detail pages expose `hasScheduledInterview` from `application._count.interviews` or `interviews.length` for pipeline guards and the “schedule before Interview Scheduled” modal.

---

## Candidate account status (not application status)

| Method | Path | Auth |
|--------|------|------|
| `PATCH` | `/api/backoffice/candidates/{id}/status` | **No staff session guard in current code** |

Body: `{ "status": "active" | "pending_verification" | "locked" | "disabled" }`. Updates `candidate_accounts.status`, not `applications.status`.

---

## Central API stubs

`GET /api/v1/applications` and `GET /api/v1/interviews` on `apps/api` return stub JSON only. Application lifecycle is implemented in the backoffice Next.js app until migrated to Hono.

---

## Related

- [README.md](README.md) — master index  
- [../ATS_Application_State_UI_API_Requirements.md](../ATS_Application_State_UI_API_Requirements.md)  
- [../db-schema.md](../db-schema.md) §3.8–3.10
