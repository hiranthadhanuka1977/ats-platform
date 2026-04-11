# PDPA (Sri Lanka) & GDPR (EU) Content Audit — Candidate Portal

**Audit Date:** 06 April 2026  
**Audited By:** AI-assisted review  
**Portal:** TalentHub Candidate Portal  
**Files Audited:** `job-listing.html`, `job-detail.html`, `tokens.css`, `styles.css`, `main.js`  
**Regulations:** Sri Lanka Personal Data Protection Act No. 9 of 2022 (PDPA), EU General Data Protection Regulation 2016/679 (GDPR)  
**Conformance Target:** Full compliance readiness for a public-facing recruitment portal

---

## Summary

| Severity               | Count |
|------------------------|-------|
| **Critical (legal risk)** | 5     |
| **High (non-compliance)** | 5     |
| **Medium (best practice gap)** | 4 |
| **Informational**       | 3     |

---

## Critical Findings

### C1. Google Fonts loaded from external CDN — unlawful cross-border data transfer

**GDPR:** Art. 44–49 (International transfers), Art. 5(1)(a) (Lawfulness)  
**PDPA:** Section 25 (Cross-border transfers)

**Location:** `tokens.css`, line 1

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
```

Every page load transmits the visitor's IP address to Google LLC (USA) without consent, notice, or a lawful transfer mechanism. Following the *LG München* ruling (Jan 2022) and Austrian DPA decisions, this is a confirmed GDPR violation. Under PDPA Section 25, cross-border transfers require data subject consent or an adequacy finding by the Sri Lankan Data Protection Authority, neither of which are in place.

**Remediation:** Self-host both font families. Download the WOFF2 files and serve them from the same domain.

---

### C2. No cookie/consent banner anywhere on the portal

**GDPR:** Art. 6(1)(a) (Consent), Art. 7 (Conditions for consent), ePrivacy Directive Art. 5(3)  
**PDPA:** Section 6 (Consent), Section 7 (Duty to inform)

Neither page includes a consent mechanism for:

- Cookies or local storage (if the backend uses session cookies, analytics, etc.)
- The Google Fonts external request (see C1)
- Any future analytics or tracking

Both GDPR and PDPA require **prior, informed, specific, freely given** consent before non-essential processing. The portal currently starts processing (Google Fonts IP transfer) on first load with zero notice.

**Remediation:** Add a cookie consent banner that blocks non-essential external requests (including Google Fonts CDN) until consent is granted. Must include accept/reject options with granular categories.

---

### C3. Privacy Policy link is non-functional

**GDPR:** Art. 13–14 (Right to be informed)  
**PDPA:** Section 7 (Duty to inform), Section 8 (Information to be provided)

**Location:** `job-listing.html`, line 436; `job-detail.html`, line 232

```html
<a href="#">Privacy Policy</a>
```

The Privacy Policy link (`href="#"`) goes nowhere. Both regulations **require** a privacy notice to be accessible **before** any personal data is collected. The portal has a "Register" button and "Apply Now" CTA that lead to data collection, but no functional privacy notice exists. This is a fundamental compliance failure.

**Remediation:** Create a dedicated `privacy-policy.html` page covering all Article 13/14 GDPR requirements and PDPA Section 8 disclosures. Link it from the footer and from any data collection point.

---

### C4. No consent mechanism or privacy notice at the application point

**GDPR:** Art. 6(1)(a) (Consent), Art. 7 (Conditions for consent), Art. 13 (Information at collection)  
**PDPA:** Section 6 (Consent requirements), Section 7 (Duty to inform before collection)

**Location:** `job-detail.html`, lines 216–220

```html
<a href="#" class="btn btn-primary btn-lg btn-block">Apply Now</a>

<p class="sidebar-note">
  Candidates must register or log in using Google, LinkedIn, or email to apply.
</p>
```

The "Apply Now" CTA leads directly to action with:

- No consent checkbox or consent capture mechanism
- No mention of what personal data will be processed
- No stated purpose of processing
- No data retention period
- No mention of data subject rights
- No legal basis identified

A job application involves processing **sensitive categories** of data (employment history, qualifications, potentially health/disability if disclosed). This requires explicit consent under GDPR Art. 9 and PDPA Section 5.

**Remediation:** Before application submission, display a consent form with: purpose of processing, categories of data collected, retention period, data subject rights summary, and a link to the full privacy policy. Include an explicit opt-in checkbox.

---

### C5. OAuth providers mentioned without data sharing transparency

**GDPR:** Art. 13(1)(e)–(f) (Recipients, international transfers)  
**PDPA:** Section 8(1)(d) (Third parties), Section 25 (Cross-border transfers)

**Location:** `job-detail.html`, lines 218–220

```html
<p class="sidebar-note">
  Candidates must register or log in using Google, LinkedIn, or email to apply.
</p>
```

This casually references Google and LinkedIn as authentication providers without disclosing:

- What profile data is obtained from these providers (name, email, profile photo, etc.)
- That data is transferred to Google (US) and LinkedIn (US/Ireland)
- The legal basis for this third-party data sharing
- Whether the user can apply without using these third-party services (GDPR requires freely given consent — bundling with third-party OAuth without an alternative may not qualify)

**Remediation:** Add a disclosure explaining what data is shared with/received from each OAuth provider. Ensure email-only registration exists as a non-third-party alternative. Link to each provider's privacy policy.

---

## High Findings

### H1. No Data Controller identification

**GDPR:** Art. 13(1)(a) (Identity and contact details of the controller)  
**PDPA:** Section 8(1)(a) (Identity of the controller)

Neither page identifies who the Data Controller is. "TalentHub" appears as a brand name, but there is no:

- Registered company name or legal entity
- Registered address
- Data Protection Officer (DPO) contact details
- Contact email for data protection queries

**Remediation:** Add a data controller identification block (company name, registration number, address, DPO email) in the footer and/or privacy policy.

---

### H2. No data subject rights information

**GDPR:** Art. 13(2)(b)–(d) (Rights disclosure)  
**PDPA:** Sections 9–17 (Data subject rights)

Nowhere on the portal are candidates informed of their rights to:

| Right                          | GDPR Article | PDPA Section |
|--------------------------------|-------------|-------------|
| Access                         | Art. 15     | Section 9   |
| Rectification                  | Art. 16     | Section 10  |
| Erasure / "Right to be forgotten" | Art. 17  | Section 11  |
| Restriction of processing      | Art. 18     | Section 12  |
| Object to processing           | Art. 21     | Section 13  |
| Data portability               | Art. 20     | Section 14  |
| Withdraw consent               | Art. 7(3)   | Section 6(5)|
| Lodge complaint with authority  | Art. 13(2)(d) | Section 19 |

**Remediation:** Include a "Your Rights" section in the privacy policy and a brief summary near the application form.

---

### H3. No data retention / storage limitation disclosure

**GDPR:** Art. 5(1)(e) (Storage limitation), Art. 13(2)(a) (Retention period)  
**PDPA:** Section 5(1)(e) (Storage limitation)

There is no information about:

- How long application data is retained
- What happens to candidate data after a position is filled
- Whether data is kept in a talent pool (and if consent is sought for this)
- When data is anonymized or deleted

**Remediation:** State the retention period at the point of data collection (e.g., "We retain your application for 12 months after the position is filled") and in the privacy policy.

---

### H4. Cross-border data transfer implications undisclosed

**GDPR:** Art. 13(1)(f), Art. 44–49  
**PDPA:** Section 25–27

The portal advertises jobs in **four jurisdictions**: Colombo (Sri Lanka), London (UK), New York (USA), Singapore. This implies candidate data may be transferred between these jurisdictions. No information is provided about:

- Where data is stored and processed
- Whether adequate protection exists for each transfer route
- Transfer mechanisms in use (Standard Contractual Clauses, adequacy decisions, etc.)

Sri Lanka does not yet have adequacy status under GDPR. US transfers post-Schrems II require SCCs + supplementary measures.

**Remediation:** Disclose data transfer routes and legal mechanisms in the privacy policy.

---

### H5. No legal basis for processing stated anywhere

**GDPR:** Art. 6 (Lawfulness of processing), Art. 13(1)(c) (Legal basis disclosure)  
**PDPA:** Section 5(1)(a) (Lawful processing)

The portal does not state the legal basis for processing candidate data. For a recruitment portal, the relevant bases are:

- **Consent** (Art. 6(1)(a) / PDPA S.6) — for voluntary applications
- **Legitimate interest** (Art. 6(1)(f)) — for the employer's recruitment needs
- **Pre-contractual steps** (Art. 6(1)(b)) — for processing at the candidate's request

The chosen basis must be disclosed. If relying on consent, the consent mechanism must meet Art. 7 standards.

**Remediation:** State the legal basis in the privacy policy and summarize it at the point of data collection.

---

## Medium Findings

### M1. No equal opportunity / non-discrimination statement

While not strictly a PDPA/GDPR data protection requirement, both regulations have special provisions around **sensitive data** (GDPR Art. 9 "special categories"; PDPA Section 5 "sensitive personal data"). Job postings that collect location data, require qualifications from specific countries, or process applications from diverse jurisdictions should include an equal opportunity statement and disclose how sensitive data (if any) is handled.

---

### M2. "Terms of Service" link is non-functional

`href="#"` on the Terms of Service link. While not directly a data protection requirement, terms of service often contain data processing provisions and are referenced by privacy policies as the contractual basis for processing.

---

### M3. No age verification or children's data protection notice

**GDPR:** Art. 8 (Child's consent)  
**PDPA:** Section 20 (Processing data of children)

The portal has no age restriction notice. If internship positions (listed in the Employment Type filter) could attract applicants under 16/18, additional protections are needed.

---

### M4. Search and filter behavior data not disclosed

Job search queries, filter selections, and browsing patterns constitute personal data when associated with a logged-in user. Under GDPR Art. 13 and PDPA Section 7, the purpose and legal basis for processing this behavioral data should be disclosed.

---

## Informational

**I1.** The "Accessibility" link in the footer (`href="#"`) is non-functional. While not a PDPA/GDPR item, GDPR Recital 39 emphasizes that privacy information must be accessible to all individuals, including those with disabilities.

**I2.** No DPIA (Data Protection Impact Assessment) reference. Given the cross-border nature and potential volume of candidate data, a DPIA may be required under GDPR Art. 35 and PDPA Section 21. The front-end should reference this in the privacy policy.

**I3.** No breach notification mechanism visible. Both GDPR (Art. 34) and PDPA (Section 24) require notifying affected data subjects of high-risk breaches. Consider including a dedicated security/breach contact in the footer or privacy policy.

---

## Compliance Readiness Scorecard

| Area                      | GDPR Reference    | PDPA Reference | Status              |
|---------------------------|-------------------|----------------|---------------------|
| Cookie consent            | Art. 6-7, ePrivacy| S.6-7          | Not implemented     |
| Privacy notice            | Art. 13-14        | S.7-8          | Link exists, page missing |
| Legal basis               | Art. 6            | S.5            | Not disclosed       |
| Data subject rights       | Art. 15-22        | S.9-17         | Not disclosed       |
| Controller identity       | Art. 13(1)(a)     | S.8(1)(a)      | Not disclosed       |
| Retention periods         | Art. 5(1)(e)      | S.5(1)(e)      | Not disclosed       |
| Cross-border transfers    | Art. 44-49        | S.25-27        | Google Fonts violates; no disclosures |
| Consent at collection     | Art. 6(1)(a), 7   | S.6            | Not implemented     |
| Third-party disclosures   | Art. 13(1)(e)     | S.8(1)(d)      | Google/LinkedIn mentioned without detail |
| Data minimization         | Art. 5(1)(c)      | S.5(1)(c)      | Appears reasonable  |
| Security measures         | Art. 32           | S.18           | Cannot assess from front-end |

---

## Recommended Next Steps (Priority Order)

1. **Self-host Google Fonts** — eliminates the most clear-cut violation immediately
2. **Build a privacy policy page** — required before any data collection goes live
3. **Add a cookie consent banner** — must block non-essential processing until accepted
4. **Add consent capture to the application flow** — checkbox + disclosure before "Apply Now" submission
5. **Add data controller identification to the footer** — legal entity name, DPO email
6. **Disclose data subject rights** — in the privacy policy, with a summary near the application form
7. **Document cross-border transfer mechanisms** — especially for the multi-jurisdiction job postings
8. **Add OAuth provider data sharing disclosures** — before Google/LinkedIn authentication

---

*This audit covers front-end content and visible UX patterns only. A complete PDPA/GDPR compliance assessment requires reviewing backend data flows, server infrastructure, third-party processor agreements, and organizational policies.*
