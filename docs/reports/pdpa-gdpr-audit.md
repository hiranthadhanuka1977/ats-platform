# PDPA (Sri Lanka) & GDPR (EU) Privacy Audit — ATS Platform (Next.js)

**Audit date:** 19 May 2026  
**Audited by:** AI-assisted code review  
**Regulations:** Sri Lanka Personal Data Protection Act No. 9 of 2022 (PDPA); EU GDPR 2016/679  
**Method:** Front-end UX, API routes, auth/storage patterns, and third-party integrations in running apps. Organizational policies, DPAs, and infrastructure reviews are out of scope but required for full compliance.

---

## Scope

| App | Port | Data subjects | Key processing |
|-----|------|---------------|----------------|
| `apps/candidate-portal` | 3000 | Visitors, applicants (browse) | Job search (URL/query), no account on this app |
| `apps/my-applications` | 3002 | Candidates | Registration, login, profile, CV/screenshot import, job applications |
| `apps/backoffice` | 3001 | Staff | Candidate/application data, status changes, interviews, AI relevance scoring |
| `apps/api` | 4000 | Candidates (auth) | Register, OTP, password reset, email delivery |

**Storage (repo):** `storage/cvs/{candidateAccountId}/`, `storage/cover-letters/{candidateAccountId}/` (see [ATS_Local_Environment_Specification.md](../specification/ATS_Local_Environment_Specification.md)).

**Out of scope:** Static HTML under `docs/markup/` (superseded for product behaviour by Next.js; see [Appendix A](#appendix-a-static-markup-vs-implementation)).

---

## Executive summary

| Severity | Count |
|----------|-------|
| **Critical** | 6 |
| **High** | 7 |
| **Medium** | 5 |
| **Informational** | 4 |

**Improved vs static markup (April 2026):** Candidate portal and my-applications load fonts via **`next/font`** (no Google Fonts CDN on those apps). Registration includes a **terms checkbox**. CV upload enforces type/size limits server-side.

**Still blocking compliance readiness:** No working **privacy policy** or **cookie consent**; **OpenAI** and **email** processing without in-product privacy notice; **candidate JWT in browser storage**; **backoffice** still loads **Google Fonts from CDN**; staff login sets tokens in **non-HttpOnly** `document.cookie` despite HttpOnly-capable API route.

---

## Data inventory (what the implementation processes)

### Candidate personal data

| Category | Examples | Where collected | Retention in UI |
|----------|----------|-----------------|-----------------|
| Identity & contact | Email, name, phone | Register, profile, apply | Not disclosed |
| Credentials | Password hash (server) | Register | N/A |
| Employment | CV, experience, education, motivation | Apply, CV import, screenshot import | Not disclosed |
| Preferences | Salary, notice, relocation, work auth | Apply form | Not disclosed |
| Behavioural | Search/filter (portal URL), dashboard usage | Portal, dashboard | Not disclosed |
| Auth tokens | JWT access/refresh | Login → `localStorage` / `sessionStorage` | Not disclosed |

### Staff / recruitment data

| Category | Examples | Where |
|----------|----------|-------|
| Candidate PII in recruitment | Name, email on pipeline cards | Backoffice applications |
| Application decisions | Status, rejection reason, notes | Status PATCH, modals |
| Interview | Start/end, notify email flag | Schedule interview API |
| AI scoring | Relevance score, breakdown | `GET .../relevance-score`, OpenAI |

### Subprocessors & third parties (technical)

| Processor | Purpose | Apps | Disclosed in UI? |
|-----------|---------|------|------------------|
| **OpenAI** | CV parse, LinkedIn text, screenshot extract, application relevance | my-applications, backoffice | Mentioned in dev copy only (`CvImportPrototype.tsx`); **not** in privacy policy |
| **Email (SMTP/API)** | OTP, password reset, interview/reject notifications | `apps/api`, backoffice modals | **No** |
| **Google Fonts CDN** | Web fonts | backoffice `globals.css` | **No** (IP transfer on load) |
| **PostgreSQL** | Primary datastore | All server routes | Infrastructure (not UI) |

---

## Critical findings

### C1. No functional privacy policy or terms (all candidate-facing apps)

**GDPR:** Art. 13–14 (Transparency)  
**PDPA:** S.7–8 (Duty to inform)

**Evidence:**

```7:9:apps/candidate-portal/src/components/SiteFooter.tsx
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Accessibility</a>
```

Same pattern in `apps/my-applications/src/components/SiteFooter.tsx`. Register requires agreeing to “Terms of Service and Privacy Policy” but they are **not linked** (`RegisterForm.tsx` ~436).

**Risk:** Processing without accessible privacy information before collection (register, apply, CV upload).

**Remediation:** Publish `/privacy` and `/terms` routes (or external URLs); link from footer, registration checkbox, and apply flow; include Art. 13 / PDPA S.8 content (controller, purposes, legal basis, retention, rights, transfers, subprocessors).

---

### C2. No cookie / consent mechanism

**GDPR:** Art. 6(1)(a), Art. 7; ePrivacy Directive  
**PDPA:** S.6–7

No consent banner or preference centre in any Next.js app. Any non-essential cookies, analytics, or third-party requests should be blocked until consent.

**Remediation:** Implement consent UI; default-deny non-essential scripts/requests; document essential cookies (session) vs optional.

---

### C3. Backoffice loads Google Fonts from Google CDN

**GDPR:** Art. 44–49 (Transfers)  
**PDPA:** S.25 (Cross-border transfers)

**Evidence:**

```1:1:apps/backoffice/src/app/globals.css
@import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap");
```

Each backoffice page load can send visitor IP to Google (US) without notice or consent. Candidate portal and my-applications use **`next/font`** and avoid this pattern.

**Remediation:** Mirror `apps/candidate-portal/src/app/layout.tsx` — `next/font/google` with self-hosted files.

---

### C4. OpenAI processing without privacy notice or explicit consent

**GDPR:** Art. 13(1)(e) (Recipients), Art. 28 (Processor), Art. 9 (Special categories — if CV contains health/etc.)  
**PDPA:** S.8(1)(d), S.5 (Sensitive data)

**Evidence (non-exhaustive):**

- `apps/my-applications/src/app/api/my-applications/cv/parse/route.ts` — CV text to OpenAI
- `apps/my-applications/src/app/api/my-applications/screenshot/extract/route.ts`
- `apps/my-applications/src/app/api/my-applications/text/extract/route.ts`
- `packages/db` / backoffice `ensureApplicationRelevanceScore` — relevance scoring

UI mentions OpenAI in prototype help text only; no privacy policy, no opt-in before sending CV/screenshot content.

**Remediation:** Name OpenAI as processor in privacy policy; lawful basis (consent or legitimate interest with LIA); explicit checkbox before AI-assisted import/scoring where required; data minimization (send only necessary fields); DPA with OpenAI.

---

### C5. Candidate session tokens in browser storage (XSS exposure)

**GDPR:** Art. 32 (Security)  
**PDPA:** S.18 (Security safeguards)

**Evidence:** `apps/my-applications/src/lib/auth-storage.ts` — JWT in `localStorage` / `sessionStorage`.

**Risk:** Any XSS can exfiltrate tokens; not equivalent to HttpOnly, Secure, SameSite cookies.

**Remediation:** Issue session via HttpOnly cookies from Next.js BFF or API; shorten access token TTL; CSP and XSS hardening; document in privacy notice.

---

### C6. Application / registration without layered consent at collection point

**GDPR:** Art. 6(1)(a), Art. 7; Art. 9 where special-category data possible in CV  
**PDPA:** S.6

Apply flow collects extensive PII (CV, cover letter, salary, work authorization) without just-in-time notice or separate consent for recruitment pool / AI / marketing.

**Remediation:** Before submit: purpose, categories, retention, who receives data (employer, processors), link to privacy policy, required checkbox(es).

---

## High findings

### H1. No data controller identification in UI

**GDPR:** Art. 13(1)(a)  
**PDPA:** S.8(1)(a)

Footer shows “TalentHub” only — no legal entity, address, or DPO/contact email.

**Remediation:** Add controller block to footer and privacy policy.

---

### H2. No data subject rights information

**GDPR:** Art. 15–22  
**PDPA:** S.9–17

No in-app explanation of access, rectification, erasure, portability, objection, or complaint to supervisory authority.

**Remediation:** “Your rights” section in privacy policy + short summary at register/apply.

---

### H3. No retention periods disclosed

**GDPR:** Art. 5(1)(e), Art. 13(2)(a)  
**PDPA:** S.5(1)(e)

Database holds applications, status events, interviews, CV files — no UI or policy stating how long data is kept after hire/reject.

**Remediation:** Define retention schedule; show at collection; implement deletion jobs.

---

### H4. Cross-border transfers not explained

**GDPR:** Art. 13(1)(f), Art. 44–49  
**PDPA:** S.25–27

Jobs may reference multiple locations; OpenAI and Google (fonts on backoffice) imply transfers outside Sri Lanka/EU without disclosure or mechanism (SCCs, etc.).

**Remediation:** Privacy policy transfer section; map each subprocessor region.

---

### H5. No legal basis stated

**GDPR:** Art. 6, Art. 13(1)(c)  
**PDPA:** S.5

Recruitment processing should document basis (typically **consent** or **legitimate interest** / pre-contractual steps for applicants).

**Remediation:** State basis per processing activity in privacy policy.

---

### H6. Staff authentication: HttpOnly cookies bypassed on client

**Evidence:**

- `apps/backoffice/src/app/api/auth/login/route.ts` — sets **HttpOnly** `bo_access` / `bo_refresh`
- `apps/backoffice/src/components/login/LoginForm.tsx` — also sets tokens via **`document.cookie`** (readable by JS)

**Risk:** Undermines secure cookie design; XSS can steal staff session.

**Remediation:** Use POST to `/api/auth/login` only; remove client-side cookie writes; rely on middleware (`middleware.ts`) with HttpOnly tokens.

---

### H7. Email notifications without transparency

Reject/schedule modals offer “notify candidate” (`PipelineStatusModals.tsx`, `ScheduleInterviewModal.tsx`). OTP and password email via `apps/api`. No privacy notice describing email content, provider, or opt-out.

**Remediation:** Disclose email processor; allow preference where appropriate.

---

## Medium findings

### M1. Terms checkbox without linkable policies

Register validates `terms` but policies are not URLs (`RegisterForm.tsx`). Fails “informed” consent under Art. 7.

### M2. OAuth / social login referenced in product copy; verify alternatives

Ensure email/password registration remains available; disclose profile fields imported from any future OAuth provider.

### M3. File uploads — partial technical controls

CV upload: MIME and size checks (`cv/upload/route.ts`). Good practice; still need privacy notice (what is stored, where, who can access in backoffice).

### M4. Candidate account status PATCH without staff auth guard

`PATCH /api/backoffice/candidates/{id}/status` — documented in API spec; no `requireStaffSession` in route. **Security/privacy risk** if exposed.

### M5. Search and dashboard behaviour

Logged-in job search and profile edits are personal data when linked to account — disclose in privacy policy (purpose: account management / application).

---

## Informational

| ID | Topic |
|----|--------|
| I1 | No DPIA reference in UI — may be required (GDPR Art. 35, PDPA S.21) for AI + recruitment at scale |
| I2 | No breach notification contact in UI |
| I3 | Backoffice has no footer legal links (staff-facing; internal policy may suffice) |
| I4 | `localStorage` used for jobs view preference in backoffice — low risk; classify in cookie policy |

---

## Compliance readiness scorecard

| Area | GDPR | PDPA | Status (May 2026) |
|------|------|------|-------------------|
| Privacy notice | Art. 13–14 | S.7–8 | **Not implemented** (placeholder links) |
| Cookie consent | Art. 6–7 | S.6–7 | **Not implemented** |
| Legal basis | Art. 6 | S.5 | **Not disclosed** |
| Data subject rights | Art. 15–22 | S.9–17 | **Not disclosed** |
| Controller identity | Art. 13(1)(a) | S.8(1)(a) | **Not disclosed** |
| Retention | Art. 5(1)(e) | S.5(1)(e) | **Not disclosed** |
| Cross-border transfers | Art. 44–49 | S.25–27 | **Partial fail** (backoffice fonts; OpenAI) |
| Consent at collection | Art. 6–7 | S.6 | **Partial** (terms checkbox only) |
| Processor transparency | Art. 13(1)(e), 28 | S.8(1)(d) | **Fail** (OpenAI, email) |
| Security | Art. 32 | S.18 | **Partial** (candidate tokens in storage; staff cookie issue) |
| Data minimization | Art. 5(1)(c) | S.5(1)(c) | **Reasonable** in forms |
| Self-hosted fonts (portal) | — | — | **Pass** (candidate-portal, my-applications) |

---

## Recommended next steps (priority)

1. **Privacy policy + terms** — real pages and footer/register/apply links (C1, H1, H2).
2. **Cookie consent** — block non-essential until accepted (C2).
3. **Backoffice fonts** — `next/font`, remove Google `@import` (C3).
4. **OpenAI & email** — privacy policy + consent/checkbox before CV/screenshot/relevance processing (C4).
5. **Candidate auth** — HttpOnly session cookies; remove JWT from `localStorage` (C5).
6. **Staff auth** — use HttpOnly login route only (H6).
7. **Apply flow notice** — just-in-time disclosure + retention (C6, H3).
8. **Retention & deletion** — policy + technical job to purge old applications/CV files.
9. **DPAs** — OpenAI, email provider, hosting.
10. **Secure candidate status API** — add staff auth on `PATCH .../candidates/{id}/status` (M4).

---

## Appendix A: Static markup vs implementation

| Topic | Static markup (Apr 2026) | Next.js (May 2026) |
|-------|--------------------------|---------------------|
| Google Fonts CDN | **Fail** (`tokens.css` @import) | **Pass** on portal & my-applications (`next/font`); **Fail** on backoffice |
| Privacy link | `href="#"` | Still `href="#"` in `SiteFooter` |
| Cookie banner | None | None |
| Registration consent | N/A in static job pages | Terms checkbox (unlinked) |
| CV / AI | N/A | OpenAI integrations — new compliance surface |

---

## Appendix B: Related documentation

- [implementation-alignment-2026.md](implementation-alignment-2026.md) — which app implements which API  
- [api/backoffice-applications.md](../specification/api/backoffice-applications.md) — staff processing of application data  
- [wcag22-audit.md](wcag22-audit.md) — accessibility (privacy information must be perceivable)

---

*This audit reflects code and UX as of 19 May 2026. Legal review by qualified counsel is required before claiming GDPR/PDPA compliance.*
