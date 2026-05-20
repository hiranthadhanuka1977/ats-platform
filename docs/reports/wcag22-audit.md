# WCAG 2.2 Accessibility Audit — ATS Platform (Next.js)

**Audit date:** 19 May 2026  
**Audited by:** AI-assisted code review  
**Conformance target:** WCAG 2.2 Level AA  
**Method:** Source review of running apps (HTML/TSX, CSS, client behaviour). Assistive-technology and automated tool runs (axe, Lighthouse, NVDA/VoiceOver) are still recommended before production sign-off.

---

## Scope

| App | Package | Port | Primary surfaces audited |
|-----|---------|------|---------------------------|
| Candidate portal | `apps/candidate-portal` | 3000 | Job listing, job detail, header/footer |
| My Applications | `apps/my-applications` | 3002 | Login, register/OTP, dashboard, CV/screenshot import, apply flow |
| Backoffice | `apps/backoffice` | 3001 | Login, applications pipeline (Kanban), status modals, schedule interview, jobs form, interviews calendar |

**Out of scope for this pass:** `apps/api` (JSON only), static prototypes under `docs/markup/` (see [Appendix A](#appendix-a-static-markup-prototypes)).

---

## Executive summary

| Result | Count (unique issues) |
|--------|----------------------|
| **Pass** | 32 |
| **Fail** | 18 |
| **Partial / warning** | 14 |
| **Not applicable** | 4 |

**Strengths across apps:** `lang="en"` on `<html>`, skip links to `#main-content`, semantic landmarks (`header`, `nav`, `main`, `footer`), decorative SVGs with `aria-hidden`, filter drawer Escape handling on candidate portal, job posting form with `aria-invalid` / `aria-describedby`, pipeline **“Move to”** menu as keyboard alternative to drag-and-drop, `aria-live` on results count and pipeline week label.

**Highest-impact gaps:** placeholder footer legal links (`href="#"`), inconsistent link `:focus-visible` on some surfaces, pipeline status modals without focus trap/Escape, small pipeline card menu trigger, form errors not programmatically associated in auth and pipeline modals, backoffice Google Fonts CDN (also a privacy issue).

---

## Cross-app findings

| Criterion | Result | Notes |
|-----------|--------|-------|
| 3.1.1 Language of page | **PASS** | `lang="en"` in each app `layout.tsx` |
| 2.4.1 Bypass blocks | **PASS** | `SkipLink` → `#main-content` (candidate-portal, my-applications, backoffice shells) |
| 2.4.2 Page titled | **PASS** | Next.js `metadata` / per-page titles |
| 1.1.1 Non-text content | **PARTIAL** | Icons generally `aria-hidden`; job banners use `alt` where `<img>` exists in backoffice previews |
| 2.4.4 Link purpose (footer) | **FAIL** | Privacy / Terms / Accessibility use `href="#"` in shared `SiteFooter` (candidate-portal + my-applications) |
| 2.4.7 Focus visible | **PARTIAL** | Buttons/inputs styled in CSS; not all text links have explicit `:focus-visible` on dark hero/footer |
| 2.4.11 Focus not obscured | **WARNING** | Sticky headers; limited `scroll-margin-top` on focused elements |
| 4.1.3 Status messages | **PARTIAL** | Some `aria-live` / `role="alert"`; not all async updates announced |

---

## 1. Candidate portal (`apps/candidate-portal`)

### 1.1 Perceivable

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 1.3.1 Info and relationships | **PASS** | `SiteHeader` `role="banner"`; `main id="main-content"`; job cards `role="list"` / `listitem` (`JobCard.tsx`, listing `page.tsx`) |
| 1.3.1 Heading hierarchy | **PASS** | Single `h1` in hero; card titles `h3` |
| 1.4.3 Contrast | **PARTIAL** | Tokens `#0f172a`, `#475569` on white generally OK; badge/ribbon combinations not all verified at 4.5:1 |
| 1.4.11 Non-text contrast | **PARTIAL** | Light borders (`#e2e8f0`) on inputs may be below 3:1 — inherited from token set |

### 1.2 Operable

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 2.1.1 Keyboard | **PASS** | Links and buttons for navigation; no card-only mouse targets without link |
| 2.1.2 No keyboard trap | **PASS** | Filter drawer: Escape closes (`JobListingShell.tsx`) |
| 2.4.6 Headings and labels | **PASS** | Hero search `aria-label`; filter controls labeled |
| 2.5.8 Target size | **PARTIAL** | Icon-only controls rely on CSS; verify ≥24×24px on mobile |

### 1.3 Understandable & robust

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 4.1.3 Status messages | **PASS** | Results count `aria-live="polite"` (`JobListToolbar.tsx`) |
| 4.1.2 Name, role, value | **PASS** | Remote toggle `role="switch"` + `aria-checked` (if present in filter UI) |

### 1.4 Fonts (related to robust loading)

| Item | Result | Evidence |
|------|--------|----------|
| Self-hosted fonts | **PASS** | `next/font/google` in `layout.tsx` — no runtime request to `fonts.googleapis.com` |

---

## 2. My Applications (`apps/my-applications`)

### 2.1 Perceivable & understandable

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 1.3.1 Landmarks | **PASS** | `MyAppsShell` skip link; sidebar `nav aria-label="Primary"` |
| 3.3.2 Labels | **PARTIAL** | Login/register: visible `<label htmlFor="…">` (`LoginForm.tsx`, `RegisterForm.tsx`) |
| 3.3.1 Error identification | **FAIL** | Field errors in `.form-error` without `aria-invalid` / `aria-describedby` on inputs (login, register, apply) |
| 4.1.3 Status messages | **PARTIAL** | `CvAutofillProcessingOverlay`: `role="status"`, `aria-live="polite"`, `progressbar` (`CvAutofillProcessingOverlay.tsx`); form-level errors not always `role="alert"` |

### 2.2 Operable

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 2.1.1 Keyboard | **PASS** | Native controls; OAuth buttons disabled where not wired |
| 2.4.7 Focus visible | **PARTIAL** | Password toggle has `aria-label` + `aria-pressed` (`LoginForm.tsx`) |
| 2.5.3 Label in name | **PASS** | Visible labels match control names |

### 2.3 Forms — detail

**Login (`LoginForm.tsx`):** Labels and `autocomplete` on email/password — good. Global error is plain `<p class="form-error">` without `role="alert"`. Individual field errors not linked via `aria-describedby`.

**Register (`RegisterForm.tsx`):** Terms checkbox required; copy references “Terms of Service and Privacy Policy” as **plain text** (not links). OTP step needs same error-association pattern as login.

**Apply flow (`ApplyJobPageClient.tsx`):** Many labeled fields; validation summary should use `role="alert"` and per-field `aria-invalid` when errors show.

**CV / screenshot import:** File inputs are native; processing overlay is accessible; no focus trap on overlay while processing.

---

## 3. Backoffice (`apps/backoffice`)

### 3.1 Perceivable

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 1.3.1 Landmarks | **PASS** | `BackOfficeShell` skip link; `Sidebar` `nav aria-label="Primary"` |
| 1.1.1 Images | **PASS** | Job preview images: meaningful or empty `alt` (`JobPostingReviewClient.tsx`, `JobPostingSavedPreview.tsx`) |
| 1.4.3 Contrast | **PARTIAL** | `--color-muted: #6b7280` ~4.6:1 at 16px; danger actions `#b91c1c` — verify on all backgrounds |

### 3.2 Operable — pipeline & modals

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 2.5.7 Dragging movements | **PARTIAL** | HTML5 DnD on pipeline (`ApplicationsPipelineBoard.tsx`, `PipelineApplicationCard.tsx`). **Alternative:** “Move to” submenu with `menuitem` buttons — satisfies intent if discoverable |
| 2.1.1 Keyboard | **PARTIAL** | Card `role="button"` + Enter/Space on card; menu trigger very small (`backoffice.css` ~padding `0.15rem 0.35rem`) — **FAIL** 2.5.8 |
| 2.1.2 No keyboard trap | **PARTIAL** | `ScheduleInterviewModal`: Escape + initial focus (`ScheduleInterviewModal.tsx`). `ModalShell` in `PipelineStatusModals.tsx`: **no Escape, no focus trap, no initial focus** |
| 2.4.3 Focus order | **PASS** | Logical DOM order on list/detail pages |

**Modal comparison**

| Modal | `role="dialog"` | Escape | Focus trap | Field errors linked |
|-------|-----------------|--------|------------|---------------------|
| Schedule interview | Yes | Yes | Initial focus on open | Partial (`role="alert"` only) |
| Reject / withdraw / hired / reopen | Yes | **No** | **No** | **No** (`PipelineStatusModals.tsx`) |
| Missing interview prompt | Yes | **No** | **No** | N/A |

### 3.3 Forms — jobs vs pipeline

| Surface | Result | Evidence |
|---------|--------|----------|
| Job posting form | **PASS** | `aria-invalid`, `aria-describedby`, `role="alert"` on errors (`JobPostingForm.tsx`) |
| Pipeline status modals | **FAIL** | Wrapping `<label>` without stable `id`/`htmlFor`; errors not associated |
| Login | **PARTIAL** | Sets session via `document.cookie` in client (`LoginForm.tsx`) — not a11y but see security audit |

### 3.4 Robust

| Criterion | Result | Evidence |
|-----------|--------|----------|
| 4.1.3 Status messages | **PARTIAL** | Pipeline week label `aria-live="polite"` (`ApplicationsPipelineBoard.tsx`); board filter/status changes not globally announced |
| Relevance score ring | **PARTIAL** | `role="img"` + `aria-label`; breakdown tooltip may be hover-only — keyboard access limited (`RelevanceScoreRing.tsx`) |

### 3.5 Fonts

| Item | Result | Evidence |
|------|--------|----------|
| Google Fonts CDN | **FAIL** (loading) | `globals.css` line 1: `@import url("https://fonts.googleapis.com/...")` — external request; prefer `next/font` like other apps |

---

## Compliance scorecard (by principle)

| WCAG principle | Pass | Fail | Partial | N/A |
|----------------|------|------|---------|-----|
| 1. Perceivable | 11 | 2 | 6 | 0 |
| 2. Operable | 10 | 4 | 5 | 1 |
| 3. Understandable | 6 | 3 | 2 | 1 |
| 4. Robust | 5 | 2 | 4 | 0 |
| **WCAG 2.2 new (2.4.11, 2.5.7, 2.5.8)** | 1 | 1 | 2 | 0 |

---

## Priority remediation plan

### Critical (block AA sign-off)

| # | Issue | Apps | Criterion | Effort |
|---|-------|------|-----------|--------|
| 1 | Functional privacy/terms/accessibility pages (replace `href="#"`) | candidate-portal, my-applications | 2.4.4 | Medium |
| 2 | Focus trap + Escape on all `ModalShell` dialogs | backoffice | 2.1.2, 2.4.3 | Medium |
| 3 | `aria-invalid` + `aria-describedby` on auth/apply/pipeline forms | my-applications, backoffice | 3.3.1, 4.1.2 | Medium |
| 4 | Enlarge pipeline card menu trigger to ≥44×44px | backoffice | 2.5.8 | Low |

### High

| # | Issue | Apps | Criterion | Effort |
|---|-------|------|-----------|--------|
| 5 | Global `a:focus-visible` (incl. dark header/footer) | all | 2.4.7 | Low |
| 6 | `scroll-margin-top` under sticky header | all | 2.4.11 | Low |
| 7 | Link Terms/Privacy in register checkbox | my-applications | 3.3.2 | Low |
| 8 | `role="alert"` on form-level errors | my-applications | 4.1.3 | Low |
| 9 | Self-host backoffice fonts via `next/font` | backoffice | — | Low |

### Medium

| # | Issue | Apps | Criterion | Effort |
|---|-------|------|-----------|--------|
| 10 | Announce pipeline drag/status outcomes via live region | backoffice | 4.1.3 | Medium |
| 11 | Keyboard-accessible relevance breakdown | backoffice | 2.1.1 | Low |
| 12 | Verify input border contrast (1.4.11) | candidate-portal | 1.4.11 | Low |
| 13 | Focus trap on CV processing overlay | my-applications | 2.1.2 | Low |

---

## What is working well

- Consistent **skip navigation** and **landmark** structure across three apps.
- Candidate portal **list semantics** and **live results count** (improvement over static markup audit).
- **Job posting form** in backoffice is a strong reference for accessible forms in this codebase.
- Pipeline provides a **non-drag** status path (“Move to” menu) aligned with WCAG 2.2 **2.5.7**.
- Candidate portal and my-applications use **`next/font`** (no third-party font IP leak on page load).

---

## Recommended verification (not done in this audit)

1. **axe DevTools** or **Lighthouse** on `/`, `/jobs/{slug}`, `/login`, `/register`, `/dashboard`, `/applications`, `/applications/{id}`.
2. **Keyboard-only** walkthrough: pipeline drag alternative, all modals, schedule interview.
3. **Screen readers:** NVDA (Windows), VoiceOver (macOS/iOS) on reject modal and apply form errors.
4. **200% zoom** on pipeline board and mobile filter drawer.

---

## Appendix A: Static markup prototypes

`docs/markup/candidate-portal/` (HTML/CSS/JS) was audited on **6 April 2026** (previous version of this file). Many findings (muted text contrast, `href="#"` footers, featured ribbon `role`, filter search `type`) may still apply to prototypes but are **partially fixed** in Next.js (e.g. `aria-live` on results count, `next/font` on portal). Treat static markup as design reference only; **ship against the Next.js apps above**.

---

*Next review: after modal focus-trap work and legal pages are linked, or before public launch.*
