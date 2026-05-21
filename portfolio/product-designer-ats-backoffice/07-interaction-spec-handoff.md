# Interaction spec and handoff (designer → engineering)

*Aligned with [PRD §5.6–§6](../../docs/specification/PRD.md) and [backoffice-applications.md](../../docs/specification/api/backoffice-applications.md).*

## 1. Applications hub

### Views

- **Table view** and **Pipeline** are mutually exclusive views on the same data set.
- **Default view:** Pipeline (status-centric work).
- **Fullscreen:** `bo-content--pipeline` modifier removes max-width and fills viewport below header.

### Data volume

- Initial list load capped at **500** applications — design note: surface “showing recent N” if pagination added later.

---

## 2. Pipeline — week logic

### Definition

- **Week:** UTC calendar week **Monday 00:00** through **Sunday 23:59:59.999**, implemented as `[weekStart, weekStart+7days)`.
- **Filter field:** `appliedAt` on the application (submission time).

### Controls

| Control | Behaviour |
|---------|-----------|
| Previous week | Decrements week offset by 1 |
| Next week | Increments offset, **capped at 0** (cannot enter future week) |
| This week | Visible when `offset !== 0`; resets offset to **0** |

### Disabled state

- When `offset >= 0`, **Next week** is **disabled** with reduced opacity and `cursor: not-allowed`.

### Copy

- Pipeline subtitle: cohort by **submitted** week, UTC, Monday–Sunday; **click** card for details; **drag** to change status.

---

## 3. Pipeline cards — drag vs click

### Drag

- `draggable=true` except while that card’s status is **patching**.
- On drag start: set `text/plain` payload to **application id**.
- On drop on column: `PATCH` status to column’s status enum.
- Rollback on `409` / `400` with user-visible error.

### Click

- Navigate to `/applications/[id]`.
- **Guard:** ignore click for ~200ms after drag end to avoid mis-navigation.

### Keyboard

- Card is focusable; **Enter** / **Space** opens detail (when not disabled).

---

## 4. Status update API

### PATCH `/api/backoffice/applications/{id}/status`

| Field | When required |
|-------|----------------|
| `status` | Always (snake_case enum) |
| `reason` | Required when `status` is `rejected` |
| `withdrawalSource` | Required when `status` is `withdrawn` |
| `offerAccepted` | Must be `true` when moving from `offered` → `hired` |
| `expectedUpdatedAt` | Optional optimistic concurrency |

### Special cases

- From **rejected:** use **reopen** endpoint, not PATCH.
- From **hired** / **withdrawn:** terminal — PATCH blocked.
- To **interview_scheduled:** requires `application_interviews` row (`409 INTERVIEW_RECORD_REQUIRED`).

### Undo / reopen

- **POST** `.../status/undo` — revert last change.
- **POST** `.../reopen` — from rejected only; mandatory reason.

Client: optimistic update; rollback on error. Each change writes **ApplicationStatusEvent**.

---

## 5. Active vs terminal pipeline

**Active columns:** submitted → under_review → shortlisted → interview_scheduled → interview_completed → offered → hired.

**Terminal:** rejected, withdrawn — separate tabs or filtered views, not mixed into active board.

---

## 6. Navigation — `from=applications`

### When

- Links from **Applications table** candidate name to **`/candidates/[id]`** append `?from=applications`.
- Links from **Application detail** to candidate also use `?from=applications`.

### Candidate page behaviour

- If `from=applications`: back link → `/applications`, label “Back to applications”.
- Else: back → `/candidates/all`, label “Back to candidates”.

**Security note:** fixed literal comparison only — no open redirect from arbitrary query values.

---

## 7. Application detail — documents

### Submitted CV

- Staff downloads via **`GET /api/backoffice/applications/[id]/attachments/cv`** (session required).

### Cover letter file

- **`GET /api/backoffice/applications/[id]/attachments/cover-letter`** when application stores `cover_letter_id:{uuid}`.

### Default CV (profile)

- Uses **my-applications** base URL + profile `resumeUrl` path.

### Empty states

- Use em dash (—) in definition lists when missing.

---

## 8. Interview scheduling

- **One** `application_interviews` row per application.
- Modal on application detail: date/time, location/link, notes.
- **POST** `/api/backoffice/applications/{id}/interviews`.
- Calendar page at `/interviews` reads scheduled rows.

---

## 9. AI relevance score *(partial)*

- When `OPENAI_API_KEY` configured, pipeline cards may show relevance score.
- Design states: loading, score displayed, unavailable — avoid blocking triage when AI absent.

---

## 10. Content formatting

- **Dates in listings:** UTC `Intl` formatting for hydration consistency.
- **Salary:** formatted for display (confirm locale/currency with product owner).

---

## Handoff checklist

- [ ] Figma frames named to match routes in `14-screen-and-route-inventory.md`
- [ ] Annotated edge cases: week navigation, disabled next, terminal states
- [ ] Annotated reject/reopen/undo modals and required fields
- [ ] Annotated interview schedule modal and validation gate
- [ ] Annotated empty states for documents
- [ ] Link to [design-system layout templates](../../docs/design-system/index.html#layouts)
- [ ] Link to [PRD](../../docs/specification/PRD.md) for requirement IDs (BO-*)
