# Database Schema — TalentHub ATS Platform

**Version:** 1.9  
**Date:** 19 May 2026  
**Status:** As-built — aligned with [`schema.prisma`](../../packages/db/prisma/schema.prisma) in `@ats-platform/db`

**v1.9:** Full platform alignment — `companies` lookup; `job_postings.company_id` and `salary_period`; CV import tables (`candidate_cv_parses`, `candidate_cv_educations`, `candidate_cv_experiences`); `candidate_cover_letters`; extended `candidate_profiles`; `application_interviews.scheduling_time_zone`; updated ER quick reference and Mermaid diagram (removed legacy monolithic `candidates` table).  
**v1.8:** Application pipeline — full `ApplicationStatus` enum, application screening/relevance columns, `application_status_events`, `application_interviews` (one interview per application).

**Canonical source of truth:** [`packages/db/prisma/schema.prisma`](../../packages/db/prisma/schema.prisma). This document is the human-readable companion. Hand-written SQL in §5 is a **reference draft** — see §5.1 for differences.

**Derived from:** Static markup (`docs/markup/candidate-portal/`), [`PRD.md`](PRD.md), and live monorepo implementation.  
**Database:** PostgreSQL (Prisma migrations)

**v1.7:** Updated candidate domain to the split-account model used in code: `candidate_accounts`, `candidate_profiles`, `candidate_auth_providers`, `candidate_sessions`, `candidate_verification_tokens`, and `candidate_password_reset_tokens`.

**v1.6:** Aligned [`schema.prisma`](../../packages/db/prisma/schema.prisma) with §5 (index naming / partial indexes) and added §5.1 DDL vs Prisma notes.

**v1.5:** Added §10 link to HTTP API dictionary ([`API_Dictionary.md`](API_Dictionary.md)).

**v1.4:** Added Prisma ORM schema ([`schema.prisma`](../../packages/db/prisma/schema.prisma)) — see §9.

**v1.3:** Documented that `users` + `role` column is a valid phase-1 RBAC model and how it can evolve (see §4.1).

**v1.2:** Embedded Mermaid ER diagram aligned with [`er-diagram.html`](er-diagram.html) (full entity attributes and relationship labels).

**v1.1:** Documented the job detail **poster / image banner** (`.image-banner` in `job-detail.html`): `banner_image_url` + optional `banner_image_alt` for accessible `<img alt>` text.

---

## Entity Relationship Overview

> **Interactive version:** Open [`er-diagram.html`](er-diagram.html) in a browser for a pannable, zoomable ER diagram.

### Quick Reference

```
companies ────────┐
departments ──────┤
locations ────────├──▶ job_postings
employment_types ─┤         │
experience_levels ┘         ├──▶ job_responsibilities / job_qualifications
                            ├──▶ job_posting_skills ──▶ skills
                            ├──▶ job_posting_benefits ──▶ benefits
                            ├──▶ job_posting_tags ──▶ tags
                            ├──▶ applications ◀── candidate_accounts
                            └──▶ bookmarks ◀── candidate_accounts

candidate_accounts ──▶ candidate_profiles
                   ├──▶ candidate_auth_providers / sessions / tokens
                   ├──▶ candidate_cv_parses ──▶ cv educations & experience
                   ├──▶ candidate_cover_letters
                   └──▶ applications ──▶ application_status_events
                                      └──▶ application_interviews (1:1)

users ──▶ job_postings (created_by)
      └──▶ application_status_events / application_interviews (staff actions)
```

*Job detail poster:* `job_postings.banner_image_url` and `banner_image_alt` power the horizontal image banner above “Job Overview” (see `job-detail.html` `.image-banner`).

### Model inventory (Prisma)

| Domain | Tables / models |
|--------|-------------------|
| Lookups | `companies`, `departments`, `locations`, `employment_types`, `experience_levels`, `skills`, `benefits`, `tags` |
| Staff | `users` |
| Jobs | `job_postings`, `job_responsibilities`, `job_qualifications`, `job_posting_skills`, `job_posting_benefits`, `job_posting_tags` |
| Candidates | `candidate_accounts`, `candidate_profiles`, `candidate_auth_providers`, `candidate_sessions`, `candidate_verification_tokens`, `candidate_password_reset_tokens`, `candidate_cv_parses`, `candidate_cv_educations`, `candidate_cv_experiences`, `candidate_cover_letters` |
| Applications | `applications`, `application_status_events`, `application_interviews` |
| Engagement | `bookmarks` |

### ER Diagram (Mermaid)

The following diagram is a high-level reference. For naming and columns, treat §3 and [`schema.prisma`](../../packages/db/prisma/schema.prisma) as source of truth (`candidate_accounts` split model — **not** the legacy monolithic `candidates` table in §5 DDL).

```mermaid
erDiagram

    companies {
        SERIAL id PK
        VARCHAR name
        VARCHAR logo_url
        BOOLEAN is_active
    }

    departments {
        SERIAL id PK
        VARCHAR name
        VARCHAR slug
    }

    locations {
        SERIAL id PK
        VARCHAR city
        VARCHAR country
        VARCHAR slug
    }

    job_postings {
        UUID id PK
        VARCHAR title
        VARCHAR slug
        INT company_id FK
        INT department_id FK
        INT location_id FK
        VARCHAR status
        TIMESTAMPTZ posted_at
        VARCHAR banner_image_url
    }

    users {
        UUID id PK
        VARCHAR email
        VARCHAR name
        VARCHAR role
    }

    candidate_accounts {
        UUID id PK
        VARCHAR email_normalized
        VARCHAR status
        TIMESTAMPTZ last_login_at
    }

    candidate_profiles {
        UUID candidate_account_id PK
        VARCHAR first_name
        VARCHAR last_name
        VARCHAR current_title
    }

    applications {
        UUID id PK
        UUID candidate_account_id FK
        UUID job_posting_id FK
        VARCHAR status
        SMALLINT relevance_score
        TIMESTAMPTZ applied_at
    }

    application_status_events {
        UUID id PK
        UUID application_id FK
        VARCHAR to_status
        TIMESTAMPTZ changed_at
    }

    application_interviews {
        UUID id PK
        UUID application_id FK
        TIMESTAMPTZ starts_at
        TIMESTAMPTZ ends_at
    }

    candidate_cv_parses {
        UUID id PK
        UUID candidate_account_id FK
        VARCHAR stored_path
        VARCHAR status
    }

    companies ||--o{ job_postings : "employer"
    departments ||--o{ job_postings : "categorises"
    locations ||--o{ job_postings : "locates"
    users ||--o{ job_postings : "creates"

    job_postings ||--o{ applications : "receives"
    candidate_accounts ||--o{ applications : "submits"
    candidate_accounts ||--|| candidate_profiles : "has"
    candidate_accounts ||--o{ candidate_cv_parses : "uploads"

    applications ||--o{ application_status_events : "audit"
    applications ||--o| application_interviews : "schedules"
```

---

## 1. Lookup / Reference Tables

### 1.0 `companies`

Employer branding on job postings (backoffice Administration CRUD).

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `name` | `VARCHAR(200)` | NOT NULL, UNIQUE | IdeaHub |
| `logo_url` | `VARCHAR(500)` | NULL | CDN URL |
| `website_url` | `VARCHAR(500)` | NULL | https://example.com |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | true |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

### 1.1 `departments`

Stores organisational departments used for filtering and categorisation.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE | Product & Delivery |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE | product |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | true |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

**Seed data:** Engineering, Product & Delivery, Design, Marketing, Human Resources, Data & Analytics, Finance, Operations

---

### 1.2 `locations`

Physical or virtual office locations.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `city` | `VARCHAR(100)` | NOT NULL | Colombo |
| `country` | `VARCHAR(100)` | NOT NULL | Sri Lanka |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE | colombo |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | true |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

**Computed display:** `city || ', ' || country` → "Colombo, Sri Lanka"

**Seed data:** Colombo (Sri Lanka), London (UK), New York (USA), Singapore (Singapore)

---

### 1.3 `employment_types`

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `name` | `VARCHAR(50)` | NOT NULL, UNIQUE | Full-time |
| `slug` | `VARCHAR(50)` | NOT NULL, UNIQUE | full-time |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |

**Seed data:** Full-time, Part-time, Contract, Internship

---

### 1.4 `experience_levels`

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `name` | `VARCHAR(50)` | NOT NULL, UNIQUE | Senior (5+ Years) |
| `slug` | `VARCHAR(50)` | NOT NULL, UNIQUE | senior |
| `min_years` | `SMALLINT` | DEFAULT 0 | 5 |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 3 |

**Seed data:** No Experience (0), Entry Level (0–2), Mid Level (2–5), Senior (5+), Lead / Principal (8+)

---

### 1.5 `skills`

Normalised skill tags that can be reused across postings.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE | Requirement Analysis |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

---

### 1.6 `benefits`

Reusable benefits offered by the company.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `description` | `VARCHAR(255)` | NOT NULL | Competitive salary and performance-based bonuses |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |

---

### 1.7 `tags`

Visual badges shown on listing cards (e.g., Remote, Hybrid, On-site).

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `name` | `VARCHAR(50)` | NOT NULL, UNIQUE | Remote |
| `variant` | `VARCHAR(20)` | NOT NULL | success |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |

`variant` maps to CSS badge classes: `primary`, `accent`, `success`, `warning`

**Seed data:** On-site (accent), Hybrid (warning), Remote (success)

---

## 2. Core Tables

### 2.1 `job_postings`

The central table storing each job opening.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | a1b2c3d4-... |
| `title` | `VARCHAR(200)` | NOT NULL | Senior Business Analyst |
| `slug` | `VARCHAR(220)` | NOT NULL, UNIQUE | senior-business-analyst |
| `company_id` | `INT` | FK → companies.id, NOT NULL | 1 |
| `department_id` | `INT` | FK → departments.id, NOT NULL | 2 |
| `location_id` | `INT` | FK → locations.id, NOT NULL | 1 |
| `employment_type_id` | `INT` | FK → employment_types.id, NOT NULL | 1 |
| `experience_level_id` | `INT` | FK → experience_levels.id, NOT NULL | 4 |
| `summary` | `VARCHAR(500)` | NOT NULL | We are looking for a Senior BA... |
| `overview` | `TEXT` | NULL | We are seeking a Senior BA to lead... |
| `role_summary` | `TEXT` | NULL | The candidate will work closely... |
| `application_info` | `TEXT` | NULL | Candidates must register or log in... |
| `salary_min` | `DECIMAL(12,2)` | NULL | 80000.00 |
| `salary_max` | `DECIMAL(12,2)` | NULL | 120000.00 |
| `salary_currency` | `CHAR(3)` | NULL | USD |
| `salary_period` | `SalaryPeriod` enum (Prisma) | DEFAULT `annual` | annual, monthly |
| `is_salary_visible` | `BOOLEAN` | DEFAULT FALSE | false |
| `is_remote` | `BOOLEAN` | DEFAULT FALSE | false |
| `is_featured` | `BOOLEAN` | DEFAULT FALSE | true |
| `status` | `VARCHAR(20)` (DDL) / `JobPostingStatus` enum (Prisma) | DEFAULT `draft` | published |
| `posted_at` | `TIMESTAMPTZ` | NULL | 2026-04-05T00:00:00Z |
| `expires_at` | `TIMESTAMPTZ` | NULL | 2026-05-05T00:00:00Z |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `created_by` | `UUID` | FK → users.id, NULL | |
| `banner_image_url` | `VARCHAR(500)` | NULL | `software-developer.jpg` or CDN URL |
| `banner_image_alt` | `VARCHAR(255)` | NULL | Short accessible description for the poster image |

**Detail poster / image banner:** On `job-detail.html`, the horizontal strip above “Job Overview” (`.image-banner` → `<img>`) is driven by `banner_image_url` (`src`) and `banner_image_alt` (`alt`). If `banner_image_url` is NULL, the UI should omit the banner block. If `banner_image_alt` is NULL but a URL is set, the app may use a generic fallback alt (e.g. job title + “role banner”) to satisfy WCAG.

**Status enum values:** `draft`, `published`, `closed`, `archived`

**Indexes:**

```sql
CREATE INDEX idx_postings_status_posted ON job_postings (status, posted_at DESC);
CREATE INDEX idx_postings_department    ON job_postings (department_id);
CREATE INDEX idx_postings_location      ON job_postings (location_id);
CREATE INDEX idx_postings_emp_type      ON job_postings (employment_type_id);
CREATE INDEX idx_postings_experience    ON job_postings (experience_level_id);
CREATE INDEX idx_postings_remote        ON job_postings (is_remote) WHERE is_remote = TRUE;
CREATE INDEX idx_postings_featured      ON job_postings (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_postings_slug          ON job_postings (slug);
CREATE INDEX idx_postings_fulltext      ON job_postings USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(overview, ''))
);
```

---

### 2.2 `job_responsibilities`

Ordered list of key responsibilities for a posting.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `job_posting_id` | `UUID` | FK → job_postings.id, ON DELETE CASCADE | a1b2c3d4-... |
| `description` | `TEXT` | NOT NULL | Gather and document functional... |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |

---

### 2.3 `job_qualifications`

Stores both required and preferred qualifications.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `SERIAL` | PK | 1 |
| `job_posting_id` | `UUID` | FK → job_postings.id, ON DELETE CASCADE | a1b2c3d4-... |
| `description` | `TEXT` | NOT NULL | Bachelor's degree in CS... |
| `type` | `VARCHAR(20)` (DDL) / `QualificationType` enum (Prisma) | NOT NULL | required |
| `sort_order` | `SMALLINT` | DEFAULT 0 | 1 |

`type` values: `required`, `preferred`

---

### 2.4 `job_posting_skills` (Junction)

Many-to-many: postings ↔ skills.

| Column | Type | Constraints |
|--------|------|-------------|
| `job_posting_id` | `UUID` | FK → job_postings.id, ON DELETE CASCADE |
| `skill_id` | `INT` | FK → skills.id, ON DELETE CASCADE |
| `sort_order` | `SMALLINT` | DEFAULT 0 |

**PK:** (`job_posting_id`, `skill_id`)

---

### 2.5 `job_posting_benefits` (Junction)

Many-to-many: postings ↔ benefits.

| Column | Type | Constraints |
|--------|------|-------------|
| `job_posting_id` | `UUID` | FK → job_postings.id, ON DELETE CASCADE |
| `benefit_id` | `INT` | FK → benefits.id, ON DELETE CASCADE |
| `sort_order` | `SMALLINT` | DEFAULT 0 |

**PK:** (`job_posting_id`, `benefit_id`)

---

### 2.6 `job_posting_tags` (Junction)

Many-to-many: postings ↔ visual badge tags.

| Column | Type | Constraints |
|--------|------|-------------|
| `job_posting_id` | `UUID` | FK → job_postings.id, ON DELETE CASCADE |
| `tag_id` | `INT` | FK → tags.id, ON DELETE CASCADE |
| `sort_order` | `SMALLINT` | DEFAULT 0 |

**PK:** (`job_posting_id`, `tag_id`)

---

## 3. Candidate & Interaction Tables

### 3.1 `candidate_accounts`

Core candidate identity and login state.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `email` | `VARCHAR(255)` | NOT NULL |
| `email_normalized` | `VARCHAR(255)` | NOT NULL, UNIQUE |
| `password_hash` | `VARCHAR(255)` | NULL |
| `status` | `CandidateAccountStatus` | DEFAULT `pending_verification` |
| `email_verified_at` | `TIMESTAMPTZ` | NULL |
| `last_login_at` | `TIMESTAMPTZ` | NULL |
| `failed_login_attempts` | `INTEGER` | DEFAULT 0 |
| `locked_until` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

`status` values: `pending_verification`, `active`, `locked`, `disabled`.

### 3.2 `candidate_profiles`

Candidate profile data separated from auth identity (1:1 with `candidate_accounts`).

| Column | Type | Constraints |
|--------|------|-------------|
| `candidate_account_id` | `UUID` | PK, FK → `candidate_accounts.id`, ON DELETE CASCADE |
| `first_name` | `VARCHAR(100)` | NULL |
| `last_name` | `VARCHAR(100)` | NULL |
| `avatar_url` | `VARCHAR(500)` | NULL |
| `phone` | `VARCHAR(30)` | NULL |
| `resume_url` | `VARCHAR(500)` | NULL |
| `location` | `VARCHAR(200)` | NULL |
| `current_title` | `VARCHAR(200)` | NULL |
| `time_zone` | `VARCHAR(64)` | NULL | IANA e.g. `Asia/Colombo` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

### 3.3 `candidate_auth_providers`

OAuth provider links (Google/LinkedIn) per candidate account.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `candidate_account_id` | `UUID` | FK → `candidate_accounts.id`, ON DELETE CASCADE |
| `provider` | `CandidateAuthProviderType` | NOT NULL |
| `provider_user_id` | `VARCHAR(255)` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

### 3.4 `candidate_sessions`

Refresh-session persistence for candidates.

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `candidate_account_id` | `UUID` | FK → `candidate_accounts.id`, ON DELETE CASCADE |
| `refresh_token_hash` | `VARCHAR(255)` | NOT NULL |
| `user_agent` | `VARCHAR(512)` | NULL |
| `ip_address` | `VARCHAR(64)` | NULL |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `revoked_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

### 3.5 `candidate_verification_tokens`

One-time verification tokens (OTP hashes).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `candidate_account_id` | `UUID` | FK → `candidate_accounts.id`, ON DELETE CASCADE |
| `token_hash` | `VARCHAR(255)` | NOT NULL |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `used_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

### 3.6 `candidate_password_reset_tokens`

Password reset tokens (stored hashed).

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `UUID` | PK, DEFAULT `gen_random_uuid()` |
| `candidate_account_id` | `UUID` | FK → `candidate_accounts.id`, ON DELETE CASCADE |
| `token_hash` | `VARCHAR(255)` | NOT NULL |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `used_at` | `TIMESTAMPTZ` | NULL |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

---

### 3.7 `bookmarks`

Candidate-saved jobs (bookmark/favourite feature).

| Column | Type | Constraints |
|--------|------|-------------|
| `candidate_account_id` | `UUID` | FK → candidate_accounts.id, ON DELETE CASCADE |
| `job_posting_id` | `UUID` | FK → job_postings.id, ON DELETE CASCADE |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() |

**PK:** (`candidate_account_id`, `job_posting_id`)

---

### 3.8 `applications`

Job applications submitted by candidates.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | |
| `candidate_account_id` | `UUID` | FK → candidate_accounts.id, NOT NULL | |
| `job_posting_id` | `UUID` | FK → job_postings.id, NOT NULL | |
| `status` | `VARCHAR(30)` (DDL) / `ApplicationStatus` enum (Prisma) | DEFAULT `submitted` | submitted |
| `cover_letter` | `TEXT` | NULL | |
| `resume_url` | `VARCHAR(500)` | NULL | File reference (`?id=` for stored CV) |
| `experience_years` | `INT` | NULL | Screening |
| `experience_months` | `INT` | NULL | Screening |
| `has_domain_experience` | `BOOLEAN` | NULL | |
| `notice_periods` | `TEXT` | NULL | |
| `salary_expectation_annual` | `DECIMAL(12,2)` | NULL | |
| `willing_to_relocate` | `BOOLEAN` | NULL | |
| `is_legally_authorized_to_work` | `BOOLEAN` | NULL | |
| `work_mode_preference` | `VARCHAR(50)` | NULL | |
| `short_motivation` | `TEXT` | NULL | |
| `relevance_score` | `SMALLINT` | NULL | AI match 0–100 |
| `relevance_breakdown` | `TEXT` | NULL | JSON/text breakdown |
| `relevance_scored_at` | `TIMESTAMPTZ` | NULL | |
| `relevance_input_hash` | `VARCHAR(64)` | NULL | Cache invalidation |
| `applied_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Optimistic concurrency in API |

`status` values (`ApplicationStatus`): `submitted`, `under_review`, `shortlisted`, `interview` (legacy — treat as `interview_scheduled` in pipeline rules), `interview_scheduled`, `interview_completed`, `offered`, `hired`, `rejected`, `withdrawn`

**Indexes:**

```sql
CREATE UNIQUE INDEX idx_applications_unique ON applications (candidate_account_id, job_posting_id);
CREATE INDEX idx_applications_status        ON applications (status);
CREATE INDEX idx_applications_job           ON applications (job_posting_id, applied_at DESC);
```

### 3.9 `application_status_events`

Audit trail for pipeline status changes (and schedule-driven updates).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK | |
| `application_id` | `UUID` | FK → applications.id, NOT NULL | |
| `from_status` | `ApplicationStatus` | NULL | First event may be null |
| `to_status` | `ApplicationStatus` | NOT NULL | |
| `reason` | `TEXT` | NULL | e.g. rejection reason |
| `note` | `TEXT` | NULL | Internal note / metadata |
| `change_source` | `VARCHAR(50)` | NULL | e.g. `pipeline`, `reopen` |
| `changed_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `changed_by_staff_id` | `UUID` | FK → users.id, NULL | |

```sql
CREATE INDEX idx_application_status_events_app_time
  ON application_status_events (application_id, changed_at DESC);
```

### 3.10 `application_interviews`

At most **one** scheduled interview per application (`application_id` UNIQUE).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK | |
| `application_id` | `UUID` | FK → applications.id, UNIQUE | One row per application |
| `starts_at` | `TIMESTAMPTZ` | NOT NULL | |
| `ends_at` | `TIMESTAMPTZ` | NOT NULL | Must be after `starts_at` |
| `scheduling_time_zone` | `VARCHAR(64)` | DEFAULT `UTC` | IANA zone for display |
| `notify_candidate_email` | `BOOLEAN` | DEFAULT true | |
| `notification_sent_at` | `TIMESTAMPTZ` | NULL | Set when notification queued |
| `scheduled_by_staff_id` | `UUID` | FK → users.id, NULL | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

```sql
CREATE INDEX idx_application_interviews_starts_at ON application_interviews (starts_at DESC);
```

API: [api/backoffice-applications.md](api/backoffice-applications.md). Transition rules require an interview row before `interview_scheduled` via PATCH when no schedule POST has run.

---

### 3.11 `candidate_cv_parses`

CV upload and parse pipeline (My Applications).

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `UUID` | PK | |
| `candidate_account_id` | `UUID` | FK → candidate_accounts.id | |
| `original_filename` | `VARCHAR(500)` | NOT NULL | |
| `stored_path` | `VARCHAR(1000)` | NOT NULL | Under `storage/cvs/{accountId}/` |
| `mime_type` | `VARCHAR(100)` | NOT NULL | PDF or Word |
| `extracted_text` | `TEXT` | NULL | After text extraction |
| `parsed_json` | `JSONB` | NULL | Structured parse draft |
| `status` | `CandidateCvParseStatus` | DEFAULT `draft` | `draft`, `confirmed` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | | |

### 3.12 `candidate_cv_educations` / `candidate_cv_experiences`

Structured rows saved from confirmed CV parse or screenshot import.

| Table | Key columns |
|-------|-------------|
| `candidate_cv_educations` | `qualification`, `institution`, `start_date`, `end_date` |
| `candidate_cv_experiences` | `company`, `role`, `start_date`, `end_date` |

Both FK → `candidate_accounts.id` ON DELETE CASCADE.

### 3.13 `candidate_cover_letters`

Cover letter library (file or text mode) for apply flow.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID` | PK |
| `candidate_account_id` | `UUID` | FK |
| `mode` | `CandidateCoverLetterMode` | `file` or `text` |
| `body` | `TEXT` | Text mode content |
| `file_url` / `file_name` | `VARCHAR` | File mode reference |
| `created_at` | `TIMESTAMPTZ` | |

---

## 4. Admin / Internal Tables

### 4.1 `users`

Internal admin users who create and manage postings.

| Column | Type | Constraints | Example |
|--------|------|-------------|---------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | dhanuka@ideahub.lk |
| `name` | `VARCHAR(200)` | NOT NULL | Dhanuka De Silva |
| `password_hash` | `VARCHAR(255)` | NOT NULL | |
| `role` | `VARCHAR(30)` (DDL) / `UserRole` enum ([`schema.prisma`](../../packages/db/prisma/schema.prisma)) | NOT NULL, DEFAULT `recruiter` | admin |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | |

`role` values: `admin`, `recruiter`, `hiring_manager`

**Authentication / authorisation (current vs future):** This table is intentionally minimal. The `role` column is enough for **simple role-based access control (RBAC)** at launch: map each value to a fixed set of allowed actions in your API or admin UI. You do **not** need to redesign this table before shipping.

When you need **finer-grained permissions** (per-resource actions, custom roles, delegation, audit), you can evolve without losing existing users:

- **Option A — keep `users.role` during migration:** Introduce `roles` and `permissions` tables, backfill rows, then replace `role` with `role_id` FK (or keep `role` as a denormalised cache until cutover).
- **Option B — user ↔ roles junction:** Many-to-many `user_roles` if a user can hold multiple roles.
- **Option C — external IdP:** Sync group/role claims from Okta/Azure AD and store only `subject` + metadata in `users`, with permission rules elsewhere.

The current schema stays valid as the **identity anchor** (`id`, `email`, credentials, `is_active`) whichever path you choose.

---

## 5. SQL DDL (PostgreSQL)

```sql
-- Lookup tables
CREATE TABLE departments (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE locations (
    id          SERIAL PRIMARY KEY,
    city        VARCHAR(100) NOT NULL,
    country     VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order  SMALLINT     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE employment_types (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    slug        VARCHAR(50) NOT NULL UNIQUE,
    sort_order  SMALLINT    NOT NULL DEFAULT 0
);

CREATE TABLE experience_levels (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    slug        VARCHAR(50) NOT NULL UNIQUE,
    min_years   SMALLINT    NOT NULL DEFAULT 0,
    sort_order  SMALLINT    NOT NULL DEFAULT 0
);

CREATE TABLE skills (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE benefits (
    id          SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    sort_order  SMALLINT     NOT NULL DEFAULT 0
);

CREATE TABLE tags (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE,
    variant     VARCHAR(20) NOT NULL DEFAULT 'primary',
    sort_order  SMALLINT    NOT NULL DEFAULT 0
);

-- Admin users
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    name          VARCHAR(200) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(30)  NOT NULL DEFAULT 'recruiter',
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Core posting
CREATE TABLE job_postings (
    id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title                VARCHAR(200)  NOT NULL,
    slug                 VARCHAR(220)  NOT NULL UNIQUE,
    department_id        INT           NOT NULL REFERENCES departments(id),
    location_id          INT           NOT NULL REFERENCES locations(id),
    employment_type_id   INT           NOT NULL REFERENCES employment_types(id),
    experience_level_id  INT           NOT NULL REFERENCES experience_levels(id),
    summary              VARCHAR(500)  NOT NULL,
    overview             TEXT,
    role_summary         TEXT,
    application_info     TEXT,
    salary_min           DECIMAL(12,2),
    salary_max           DECIMAL(12,2),
    salary_currency      CHAR(3),
    is_salary_visible    BOOLEAN       NOT NULL DEFAULT FALSE,
    is_remote            BOOLEAN       NOT NULL DEFAULT FALSE,
    is_featured          BOOLEAN       NOT NULL DEFAULT FALSE,
    status               VARCHAR(20)   NOT NULL DEFAULT 'draft',
    posted_at            TIMESTAMPTZ,
    expires_at           TIMESTAMPTZ,
    created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by           UUID          REFERENCES users(id),
    banner_image_url     VARCHAR(500),
    banner_image_alt     VARCHAR(255),

    CONSTRAINT chk_status CHECK (status IN ('draft','published','closed','archived')),
    CONSTRAINT chk_salary CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max)
);

CREATE INDEX idx_postings_status_posted ON job_postings (status, posted_at DESC);
CREATE INDEX idx_postings_department    ON job_postings (department_id);
CREATE INDEX idx_postings_location      ON job_postings (location_id);
CREATE INDEX idx_postings_emp_type      ON job_postings (employment_type_id);
CREATE INDEX idx_postings_experience    ON job_postings (experience_level_id);
CREATE INDEX idx_postings_remote        ON job_postings (is_remote) WHERE is_remote = TRUE;
CREATE INDEX idx_postings_featured      ON job_postings (is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_postings_slug          ON job_postings (slug);
CREATE INDEX idx_postings_fulltext      ON job_postings USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(overview, ''))
);

-- Posting detail lists
CREATE TABLE job_responsibilities (
    id              SERIAL  PRIMARY KEY,
    job_posting_id  UUID    NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    description     TEXT    NOT NULL,
    sort_order      SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE job_qualifications (
    id              SERIAL      PRIMARY KEY,
    job_posting_id  UUID        NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    description     TEXT        NOT NULL,
    type            VARCHAR(20) NOT NULL DEFAULT 'required',
    sort_order      SMALLINT    NOT NULL DEFAULT 0,

    CONSTRAINT chk_qual_type CHECK (type IN ('required', 'preferred'))
);

CREATE TABLE job_posting_skills (
    job_posting_id UUID     NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    skill_id       INT      NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    sort_order     SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (job_posting_id, skill_id)
);

CREATE TABLE job_posting_benefits (
    job_posting_id UUID     NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    benefit_id     INT      NOT NULL REFERENCES benefits(id) ON DELETE CASCADE,
    sort_order     SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (job_posting_id, benefit_id)
);

CREATE TABLE job_posting_tags (
    job_posting_id UUID     NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    tag_id         INT      NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    sort_order     SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (job_posting_id, tag_id)
);

-- Candidates
CREATE TABLE candidates (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email            VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100),
    last_name        VARCHAR(100),
    password_hash    VARCHAR(255),
    auth_provider    VARCHAR(20),
    auth_provider_id VARCHAR(255),
    avatar_url       VARCHAR(500),
    phone            VARCHAR(30),
    resume_url       VARCHAR(500),
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_login_at    TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_candidates_email    ON candidates (LOWER(email));
CREATE INDEX idx_candidates_provider        ON candidates (auth_provider, auth_provider_id)
    WHERE auth_provider IS NOT NULL;

-- Bookmarks
CREATE TABLE bookmarks (
    candidate_id   UUID        NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_posting_id UUID        NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (candidate_id, job_posting_id)
);

-- Applications
CREATE TABLE applications (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id    UUID         NOT NULL REFERENCES candidates(id),
    job_posting_id  UUID         NOT NULL REFERENCES job_postings(id),
    status          VARCHAR(30)  NOT NULL DEFAULT 'submitted',
    cover_letter    TEXT,
    resume_url      VARCHAR(500),
    applied_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_app_status CHECK (
        status IN ('submitted','under_review','shortlisted','interview','offered','rejected','withdrawn')
    )
);

CREATE UNIQUE INDEX idx_applications_unique ON applications (candidate_id, job_posting_id);
CREATE INDEX idx_applications_status        ON applications (status);
CREATE INDEX idx_applications_job           ON applications (job_posting_id, applied_at DESC);
```

### 5.1 Hand-written DDL vs [`schema.prisma`](../../packages/db/prisma/schema.prisma)

For current implementation, [`schema.prisma`](../../packages/db/prisma/schema.prisma) is the **canonical source of truth**. The SQL above is a reference draft and may use older candidate naming (`candidates`).

| Topic | §5 DDL | `schema.prisma` |
|-------|--------|-----------------|
| **Legacy `candidates` table** | Still shown in §5 SQL below | **Removed** — use `candidate_accounts` + `candidate_profiles` (since v1.7) |
| **`companies`** | Not in §5 SQL | Implemented — required FK on `job_postings` |
| **CV / cover letter tables** | Not in §5 SQL | `candidate_cv_parses`, educations, experiences, `candidate_cover_letters` |
| **Constrained columns** | `VARCHAR` + `CHECK` | Native Prisma / PostgreSQL **ENUM** types |
| **`idx_postings_remote` / `idx_postings_featured`** | Partial indexes (`WHERE …`) | Prisma declares **non-partial** indexes — add raw migration for parity |
| **`idx_candidates_provider`** | Partial index on legacy table | N/A — use `candidate_auth_providers` composite unique |
| **`idx_postings_fulltext`** | GIN | Not in Prisma file — add via raw SQL |
| **`chk_salary`** | `salary_min <= salary_max` | Enforce in application code or raw migration |

---

## 6. UI → Schema Mapping

### Job Listing Card

| UI Element | Source |
|------------|--------|
| Job title | `job_postings.title` |
| Department | `departments.name` |
| Location | `locations.city \|\| ', ' \|\| locations.country` |
| Employment type | `employment_types.name` |
| Experience level | `experience_levels.name` |
| Posted date | `job_postings.posted_at` |
| Summary | `job_postings.summary` |
| Tags (badges) | `tags.name` + `tags.variant` via `job_posting_tags` |
| Featured star | `job_postings.is_featured` |
| "New" badge | `posted_at > NOW() - INTERVAL '7 days'` |
| Bookmark state | `bookmarks` (if authenticated) |

### Job Detail Page

| UI Section | Source |
|------------|--------|
| Title + meta | `job_postings` + joins to lookups |
| Poster / image banner (`<img>` in `.image-banner`) | `job_postings.banner_image_url` → `src`; `job_postings.banner_image_alt` → `alt` |
| Job Overview | `job_postings.overview` |
| Role Summary | `job_postings.role_summary` |
| Key Responsibilities | `job_responsibilities` (ordered) |
| Required Qualifications | `job_qualifications WHERE type = 'required'` (ordered) |
| Preferred Qualifications | `job_qualifications WHERE type = 'preferred'` (ordered) |
| Required Skills | `skills` via `job_posting_skills` (ordered) |
| What We Offer | `benefits` via `job_posting_benefits` (ordered) |
| Application info | `job_postings.application_info` |
| Sidebar summary | Same as listing meta (from joins) |
| Bookmark / Share | `bookmarks` table |
| Apply Now | Creates row in `applications` |

### Filter Panel

| Filter | Query |
|--------|-------|
| Search | Full-text search on `title`, `summary`, `overview` |
| Location | `WHERE location_id = ?` |
| Department | `WHERE department_id = ?` |
| Employment Type | `WHERE employment_type_id = ?` |
| Experience Level | `WHERE experience_level_id = ?` |
| Date Posted | `WHERE posted_at >= NOW() - INTERVAL ?` |
| Remote Only | `WHERE is_remote = TRUE` |
| Sort: Most Recent | `ORDER BY posted_at DESC` |
| Sort: Title A–Z | `ORDER BY title ASC` |

---

## 7. Sample Listing Query

```sql
SELECT
    jp.id,
    jp.title,
    jp.slug,
    jp.summary,
    jp.posted_at,
    jp.is_featured,
    jp.is_remote,
    d.name   AS department_name,
    l.city || ', ' || l.country AS location_display,
    et.name  AS employment_type,
    el.name  AS experience_level,
    CASE WHEN jp.posted_at >= NOW() - INTERVAL '7 days' THEN TRUE ELSE FALSE END AS is_new,
    EXISTS (
        SELECT 1 FROM bookmarks b
        WHERE b.job_posting_id = jp.id AND b.candidate_account_id = :candidate_account_id
    ) AS is_bookmarked,
    ARRAY(
        SELECT jsonb_build_object('name', t.name, 'variant', t.variant)
        FROM job_posting_tags jpt
        JOIN tags t ON t.id = jpt.tag_id
        WHERE jpt.job_posting_id = jp.id
        ORDER BY jpt.sort_order
    ) AS tags
FROM job_postings jp
JOIN departments       d  ON d.id  = jp.department_id
JOIN locations         l  ON l.id  = jp.location_id
JOIN employment_types  et ON et.id = jp.employment_type_id
JOIN experience_levels el ON el.id = jp.experience_level_id
WHERE jp.status = 'published'
  AND (jp.expires_at IS NULL OR jp.expires_at > NOW())
ORDER BY jp.is_featured DESC, jp.posted_at DESC
LIMIT 15 OFFSET 0;
```

### Sample Job Detail Query (includes poster banner)

```sql
SELECT
    jp.id,
    jp.title,
    jp.slug,
    jp.summary,
    jp.overview,
    jp.role_summary,
    jp.application_info,
    jp.posted_at,
    jp.expires_at,
    jp.is_remote,
    jp.banner_image_url,
    jp.banner_image_alt,
    d.name   AS department_name,
    l.city || ', ' || l.country AS location_display,
    et.name  AS employment_type,
    el.name  AS experience_level
FROM job_postings jp
JOIN departments       d  ON d.id  = jp.department_id
JOIN locations         l  ON l.id  = jp.location_id
JOIN employment_types  et ON et.id = jp.employment_type_id
JOIN experience_levels el ON el.id = jp.experience_level_id
WHERE jp.slug = :slug
  AND jp.status = 'published'
  AND (jp.expires_at IS NULL OR jp.expires_at > NOW());
```

Render rule: if `banner_image_url` IS NULL, do not output the `.image-banner` section.

---

## 8. Design Decisions

| Decision | Rationale |
|----------|-----------|
| UUID for `job_postings`, `candidate_accounts`, `applications` | Safe for distributed systems, non-guessable in URLs |
| SERIAL for lookup tables | Small cardinality, efficient joins and indexing |
| `companies` lookup | Employer branding on postings; Administration CRUD |
| Separate candidate auth/profile tables | Email login, OTP, lockout, OAuth links without overloading profile rows |
| CV parse + education/experience tables | File import pipeline with draft → confirmed lifecycle |
| `candidate_cover_letters` | Reusable file or text cover letters on apply |
| Separate `job_responsibilities` / `job_qualifications` tables | Ordered lists that vary per posting; avoids JSON blobs |
| Junction tables for skills, benefits, tags | Normalised many-to-many; enables filtering and reuse |
| `slug` on postings | SEO-friendly URLs (`/jobs/senior-business-analyst`) |
| `sort_order` columns | Preserves admin-defined display order |
| `status` on postings | Supports draft → publish → close workflow |
| `is_featured` flag | Drives homepage/listing featured badge |
| `posted_at` vs `created_at` | Decouples publication date from record creation (drafts) |
| Full-text index (GIN) | Powers the hero search and filter keyword search |
| `banner_image_url` + `banner_image_alt` on postings | Maps to the job detail poster strip (`.image-banner`); alt supports WCAG-compliant non-decorative imagery |
| `users.role` | Phase-1 RBAC; DDL uses `VARCHAR(30)`; Prisma uses `UserRole` enum — see §5.1 |
| `application_status_events` | Audit trail for pipeline moves; supports undo and compliance |
| One `application_interviews` row per application | Enforces schedule-before-status business rule |

---

## 9. Prisma ORM

The SQL DDL in §5 is **Prisma-ready**: [`schema.prisma`](../../packages/db/prisma/schema.prisma) mirrors tables, columns, relations, composite keys, and most indexes for PostgreSQL.

### Is `db-schema.md` “Prisma ready”?

**Yes**, with these intentional differences and follow-ups:

| Topic | SQL / doc (`db-schema.md`) | Prisma (`schema.prisma`) |
|--------|----------------------------|---------------------------|
| **Enums** | `CHECK` on `status`, `type`, `role`, application `status` | Native Prisma `enum` types (`JobPostingStatus`, `QualificationType`, `ApplicationStatus`, `UserRole`) — migrate creates PostgreSQL enums |
| **Candidate email uniqueness** | `candidate_accounts.email_normalized` unique | Prisma uses `@@unique([emailNormalized])` with normalized lowercase email |
| **Salary rule** | `CHECK (salary_min <= salary_max)` | Enforce in app or add raw SQL in a migration |
| **GIN full-text index** | `idx_postings_fulltext` | Not expressible in `schema.prisma`; add via `prisma migrate` SQL or `prisma db execute` |
| **Partial indexes** | `WHERE is_remote`, `WHERE is_featured` | Prisma emits **full** B-tree indexes (no `WHERE`); see §5.1. Same logical columns; different physical index definitions unless you add raw SQL. |

### Prisma enums (API string values)

| Enum | Values |
|------|--------|
| `JobPostingStatus` | `draft`, `published`, `closed`, `archived` |
| `ApplicationStatus` | `submitted`, `under_review`, `shortlisted`, `interview`, `interview_scheduled`, `interview_completed`, `offered`, `hired`, `rejected`, `withdrawn` |
| `UserRole` | `admin`, `recruiter`, `hiring_manager` |
| `CandidateAccountStatus` | `pending_verification`, `active`, `locked`, `disabled` |
| `CandidateCvParseStatus` | `draft`, `confirmed` |
| `CandidateCoverLetterMode` | `file`, `text` |
| `SalaryPeriod` | `annual`, `monthly` |
| `QualificationType` | `required`, `preferred` |

### Commands (from repo root)

Validated with **Prisma 6** (Prisma 7 moves `DATABASE_URL` to `prisma.config.ts` — see [Prisma Config](https://www.prisma.io/docs/orm/reference/prisma-config-reference)):

```bash
set DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
npx prisma@6 validate --schema=packages/db/prisma/schema.prisma
npx prisma@6 migrate dev --schema=packages/db/prisma/schema.prisma
npx prisma@6 generate --schema=packages/db/prisma/schema.prisma
```

The **`@ats-platform/db`** workspace package sets `"prisma": { "schema": "prisma/schema.prisma" }` relative to `packages/db/`, so from `packages/db` you can run `npx prisma migrate dev` without `--schema`. This document remains the human-readable companion to that schema file.

---

## 10. HTTP API (REST dictionary)

REST-style endpoints are documented separately: **[API_Dictionary.md](API_Dictionary.md)** (index), portfolio **[api-dictionary.html](../../portfolio/case-study/api-dictionary.html)**, and **[api/](api/)** — candidate auth, [api/my-applications-routes.md](api/my-applications-routes.md), and staff pipeline [api/backoffice-applications.md](api/backoffice-applications.md).
