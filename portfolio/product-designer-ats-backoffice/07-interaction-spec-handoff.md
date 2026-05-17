# Interaction spec and handoff (designer → engineering)

## 1. Applications hub

### Tabs

- **Table view** and **Pipeline** are mutually exclusive views on the same data set.  
- Default tab: **Table** (conservative; matches spreadsheet mental model).  

### Data volume

- Initial list load capped (e.g. 500) — **design note:** surface “showing recent N” if you add UI later.  

---

## 2. Pipeline — week logic

### Definition

- **Week:** UTC calendar week **Monday 00:00** through **Sunday 23:59:59.999** (inclusive of full Sunday), implemented as `[weekStart, weekStart+7days)` for comparisons.  
- **Filter field:** `appliedAt` on the application (submission time).  

### Controls

| Control | Behaviour |
|---------|-----------|
| Previous week | Decrements week offset by 1 |
| Next week | Increments offset, **capped at 0** (cannot enter future week) |
| This week | Visible when `offset !== 0`; resets offset to **0** |

### Disabled state

- When `offset >= 0`, **Next week** is **disabled** (not hidden) with reduced opacity and `cursor: not-allowed`.  

### Copy

- Pipeline subtitle states: cohort by **submitted** week, UTC, Monday–Sunday; **click** card for details; **drag** to change status.  

---

## 3. Pipeline cards — drag vs click

### Drag

- `draggable=true` except while that card’s status is **patching**.  
- On drag start: set `text/plain` payload to **application id**.  
- On drop on column: `PATCH` status to column’s status.  

### Click

- Navigate to `/applications/[id]`.  
- **Guard:** ignore click for ~200ms after drag end to avoid mis-navigation.  

### Keyboard

- Card is focusable; **Enter** / **Space** opens detail (when not disabled).  

---

## 4. Status update API

- Client optimistic update; rollback on error; inline error region optional.  
- Server: staff-authenticated route; status enum alignment with product vocabulary.  

---

## 5. Navigation — `from=applications`

### When

- Links from **Applications table** candidate name to **`/candidates/[id]`** append `?from=applications`.  
- Links from **Application detail** to candidate also use `?from=applications` for consistency.  

### Candidate page behaviour

- If `from=applications`: back link → `/applications`, label “Back to applications”.  
- Else: back → `/candidates/all`, label “Back to candidates”.  

**Security note:** fixed literal comparison only — no open redirect from arbitrary `returnTo` query values.  

---

## 6. Application detail — documents

### Submitted CV

- Staff downloads via **`GET /api/backoffice/applications/[id]/attachments/cv`** (session required).  
- Resolve CV id from application `resumeUrl` query pattern; verify CV row belongs to same **candidateAccountId** as application.  

### Cover letter file

- **`GET /api/backoffice/applications/[id]/attachments/cover-letter`** when application stores `cover_letter_id:{uuid}` and DB row is **file** mode.  

### Default CV (profile)

- Uses **my-applications** base URL + profile `resumeUrl` path (same pattern as candidate detail page).  

### Empty states

- Use em dash (—) in definition lists when missing.  

---

## 7. Content formatting

- **Dates in listings:** UTC `Intl` formatting for hydration consistency where applied.  
- **Salary:** formatted for display (confirm locale/currency with product owner in production).  

---

## Handoff checklist

- [ ] Figma frames named to match routes  
- [ ] Annotated edge cases on pipeline week and disabled next  
- [ ] Annotated empty states for documents  
- [ ] Link to **`14-screen-and-route-inventory.md`** for route truth  
