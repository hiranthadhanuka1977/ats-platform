# Job Posting Templates Documentation

**Version:** 2.0  
**Last Updated:** 06 April 2026  
**Status:** Implemented

## Overview
This document defines the standard templates and structure for displaying job postings in the ATS system. It includes:

- Job Listing Template (Summary View)
- Job Details Template (Full View)
- Recommended Data Fields
- Interactive Features
- UX Best Practices

---

# 1. Job Listing Template (Summary View)

## Purpose
Provide a concise overview of available jobs to help candidates quickly scan and select relevant roles.

---

## Template Structure

### Card Layout

```
┌─────────────────────────────────────────────────────┐
│ ★  (featured ribbon — conditional)                  │
│                                                     │
│  [Job Title]                        [🔖] [↗ Share] │
│                                                     │
│  📁 Department    📍 Location    🕐 Employment Type │
│  👤 Experience    📅 Posted Date                    │
│                                                     │
│  [Short summary — 2–3 lines, max 250 chars]        │
│                                                     │
│  [Remote] [Hybrid] [New]  ← badge tags              │
│                                                     │
│  [View Details]             [Apply Now]              │
└─────────────────────────────────────────────────────┘
```

### Fields

| Field | Source | Notes |
|-------|--------|-------|
| Job Title | `job_postings.title` | Linked to detail page |
| Department | `departments.name` | Icon prefix |
| Location | `locations.city, country` | Icon prefix |
| Employment Type | `employment_types.name` | Icon prefix |
| Experience Level | `experience_levels.name` | Icon prefix |
| Posted Date | `job_postings.posted_at` | Relative or absolute format |
| Summary | `job_postings.summary` | Max 250 characters |
| Tags | `tags` via `job_posting_tags` | Colour-coded badges (Remote, Hybrid, On-site) |
| "New" Badge | Derived | Shown if `posted_at` within last 7 days |
| Featured Ribbon | `job_postings.is_featured` | Star icon on card |
| Bookmark State | `bookmarks` table | Per-authenticated-user |

### Interactive Elements on Each Card

- **Bookmark button** — toggles saved state (`aria-pressed`), announces to screen readers
- **Share button** — triggers Web Share API or copies link to clipboard
- **Entire card is clickable** — clicking any non-interactive area navigates to job detail
- **View Details link** — explicit link to detail page (with `sr-only` job title for accessibility)
- **Apply Now link** — explicit link to application (with `sr-only` job title for accessibility)

---

## Example

### Senior Business Analyst

**Department:** Product & Delivery  
**Location:** Colombo, Sri Lanka  
**Employment Type:** Full-time  
**Experience Level:** 5+ Years  
**Posted:** 05 Apr 2026

We are looking for a Senior Business Analyst to work closely with stakeholders and delivery teams to define digital solutions.

**Tags:** `On-site`

[🔖 Bookmark]  [↗ Share]  [View Details]  [Apply Now]

---

## Listing Card Guidelines

- Show only essential information (title, meta, summary, tags, CTAs)
- Limit summary to 200–250 characters
- Use colour-coded badges for quick identification (e.g., Full-time, Remote, New)
- Always include clear CTAs (View Details + Apply Now)
- Featured jobs display a star ribbon and may be sorted to the top
- Include bookmark and share actions on every card
- Cards should be fully clickable (mouse) while preserving keyboard access to individual links

---

# 2. Job Details Template (Full View)

## Purpose
Provide complete information about the job role and allow candidates to apply.

---

## Template Structure

### Detail Hero

```
┌─────────────────────────────────────────────────────┐
│  All Jobs / Senior Business Analyst  ← breadcrumb   │
│                                                     │
│  # [Job Title]                                      │
│                                                     │
│  📁 Department  📍 Location  🕐 Type  👤 Experience│
│                                                     │
│  [🔖 Bookmark]  [↗ Share]  [Apply Now →]           │
└─────────────────────────────────────────────────────┘
```

### Banner Image

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              [ Full-width banner image ]             │
│              (object-fit: cover)                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Source: `job_postings.banner_image_url`

### Content Area (Two-Column Layout on Desktop)

**Main Column:**

#### Job Overview
[Paragraph description of the role]

#### Role Summary
[Paragraph explaining responsibilities and impact]

#### Key Responsibilities
- Responsibility 1
- Responsibility 2
- Responsibility 3

#### Required Qualifications
- Qualification 1
- Qualification 2

#### Preferred Qualifications
- Preferred qualification 1

#### Required Skills
`Skill 1`  `Skill 2`  `Skill 3`  ← displayed as inline pills/badges

#### What We Offer
- ✓ Benefit 1
- ✓ Benefit 2

#### Application Information
Candidates must register or log in using Google, LinkedIn, or email to apply.

**Sidebar (sticky on desktop):**

| Field | Value |
|-------|-------|
| Department | Product & Delivery |
| Location | Colombo, Sri Lanka |
| Type | Full-time |
| Experience | 5+ Years |
| Posted | 05 Apr 2026 |
| Deadline | 05 May 2026 |

[Apply for this Position →]

Share this Job: [Facebook] [Twitter] [LinkedIn] [Copy Link]

---

## Example

# Senior Business Analyst

**Department:** Product & Delivery  
**Location:** Colombo, Sri Lanka  
**Employment Type:** Full-time  
**Experience Level:** 5+ Years  
**Posted Date:** 05 Apr 2026

---

## Job Overview
We are seeking a Senior Business Analyst to lead requirement gathering and stakeholder coordination.

## Role Summary
The candidate will work closely with business and technical teams to deliver enterprise solutions.

## Key Responsibilities
- Gather requirements
- Conduct stakeholder discussions
- Prepare documentation

## Required Qualifications
- Bachelor's degree
- 5+ years experience

## Required Skills
`Requirement Analysis`  `Stakeholder Management`  `Agile Methodologies`

## What We Offer
- ✓ Competitive salary
- ✓ Career growth
- ✓ Flexible working arrangements

---

[🔖 Bookmark]  [↗ Share]  [Apply Now]

---

# 3. Recommended Data Fields (Admin Input)

## Core Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Job Title | VARCHAR(200) | Yes | Display name |
| Slug | VARCHAR(220) | Yes | Auto-generated, SEO-friendly URL |
| Department | FK → departments | Yes | Select from lookup |
| Location | FK → locations | Yes | Select from lookup |
| Employment Type | FK → employment_types | Yes | Full-time, Part-time, Contract, Internship |
| Experience Level | FK → experience_levels | Yes | Select from lookup |
| Summary | VARCHAR(500) | Yes | Card preview text (max 250 chars recommended) |
| Job Overview | TEXT | No | Detailed description |
| Role Summary | TEXT | No | Context and impact |
| Responsibilities | Separate table | No | Ordered list (1 row per item) |
| Required Qualifications | Separate table | No | Ordered list, `type = 'required'` |
| Preferred Qualifications | Separate table | No | Ordered list, `type = 'preferred'` |
| Required Skills | Junction table → skills | No | Many-to-many, displayed as pills |
| Benefits | Junction table → benefits | No | Many-to-many, displayed as check-list |
| Tags | Junction table → tags | No | Remote, Hybrid, On-site (with colour variant) |
| Status | ENUM | Yes | draft, published, closed, archived |
| Posted Date | TIMESTAMPTZ | No | When published (decoupled from created_at) |
| Expiry Date | TIMESTAMPTZ | No | Auto-close after this date |
| Salary Range | DECIMAL × 2 + CHAR(3) | No | min, max, currency — visibility toggle |
| Is Remote | BOOLEAN | No | Powers "Remote Only" filter |
| Is Featured | BOOLEAN | No | Drives featured ribbon + sort priority |
| Banner Image URL | VARCHAR(500) | No | Full-width image on detail page |
| Application Info | TEXT | No | Instructions for candidates |
| Created By | FK → users | No | Admin who created the posting |

---

# 4. Listing Page Features

## Hero Section

| Element | Description |
|---------|-------------|
| Heading | Large `h1` title |
| Tagline | Brand description paragraph |
| Search Bar | Keyword search with icon, syncs to filter panel |
| Department Pills | Clickable pill buttons for each department, syncs to filter dropdown, glass-morphism style |

## Filter Panel

| Filter | Type | Field |
|--------|------|-------|
| Search | Text input (`type="search"`) | Full-text search on title, summary, overview |
| Location | Dropdown | `locations` lookup |
| Department | Dropdown | `departments` lookup |
| Employment Type | Dropdown | `employment_types` lookup |
| Experience Level | Dropdown | `experience_levels` lookup |
| Date Posted | Dropdown | Last 24 hours / 7 days / 30 days / All time |
| Remote Only | Toggle switch | `job_postings.is_remote` |

**Mobile:** Filter panel slides in as a drawer with overlay, focus trap, and Escape-to-close.  
**Desktop:** Filter panel displayed as a sidebar column alongside job listings.

## Toolbar

| Element | Description |
|---------|-------------|
| Filter Button | Mobile-only, opens filter drawer |
| Sort Dropdown | Most Recent, Oldest First, Title A–Z, Title Z–A |
| Results Count | Dynamic count with `aria-live="polite"` |

## Pagination

- Numbered page buttons with Previous / Next navigation
- Active page indicated with `aria-current="page"`

## Empty State

- Displayed when no results match current filters
- Includes illustration, heading, description, and "Clear Filters" CTA

---

# 5. Global Interactive Features

## Text Resizer

| Setting | Details |
|---------|---------|
| Location | Header, available on all pages |
| Controls | `A−` (decrease), `A` (reset), `A+` (increase) |
| Scale Steps | 87.5%, 100%, 112.5%, 125%, 137.5% |
| Persistence | `sessionStorage` (survives page navigation) |
| Accessibility | `role="group"`, `aria-label="Text size"` |

## Bookmark

| Setting | Details |
|---------|---------|
| Location | Job listing cards + job detail hero |
| Behaviour | Toggles saved state on click |
| Visual | Filled/unfilled bookmark icon |
| Accessibility | `aria-pressed` toggle, per-job `aria-label`, live screen reader announcement |
| Backend | Creates/deletes row in `bookmarks` table (when authenticated) |

## Share

| Setting | Details |
|---------|---------|
| Location | Job listing cards + job detail hero |
| Behaviour | Web Share API (mobile) → clipboard fallback (desktop) |
| Feedback | Tooltip "Link copied!" + live screen reader announcement |
| Accessibility | Per-job `aria-label` (e.g., "Share Senior Business Analyst") |

## Mobile Navigation

| Setting | Details |
|---------|---------|
| Trigger | Hamburger icon button |
| Behaviour | Dropdown menu overlay |
| Close | Toggle button, Escape key, or click outside |
| Accessibility | `aria-expanded`, `aria-label` toggles |

---

# 6. Listing vs Details Best Practice

## Listing Page
Include only:
- Title (linked)
- Key metadata (department, location, type, experience, date)
- Short summary
- Tags/badges
- Bookmark + Share actions
- CTAs (View Details + Apply Now)
- Featured ribbon (conditional)

## Details Page
Include:
- Full structured content (overview, role summary, responsibilities, qualifications, skills, benefits)
- Banner image
- Breadcrumb navigation
- Bookmark + Share actions in hero
- Sidebar with summary metadata
- Apply Now CTA (hero + sidebar)
- Share options (sidebar)
- Application info / login requirements

---

# 7. UX Recommendations

## Listing View
- Use card layout with consistent spacing
- Highlight job title as primary visual element
- Keep content scannable — limit text density
- Featured jobs sort to top with subtle visual distinction (star icon, not heavy borders)
- Cards are fully clickable to reduce friction
- Department pills in hero provide quick filtering without opening filter panel

## Details View
- Use section-based layout with clear headings
- Bullet points for readability (responsibilities, qualifications)
- Skills as inline pill badges
- Benefits with check-mark icons
- Sticky sidebar with "Apply" CTA always visible on desktop
- Breadcrumb for easy navigation back to listings
- Banner image establishes visual context

## Accessibility
- Skip-to-content link on every page
- Keyboard-navigable throughout (Tab, Escape, Enter, Space)
- Focus visible indicators on all interactive elements
- Screen reader announcements for state changes (bookmark, share, filter)
- Proper heading hierarchy and landmark regions
- WCAG 2.2 Level AA compliance

---

# 8. MVP Recommendation

## Listing Page Fields
- Job Title (linked, clickable card)
- Department, Location, Employment Type, Experience Level, Posted Date
- Short Summary
- Tags (Remote, Hybrid, On-site, New)
- Featured ribbon
- Bookmark + Share buttons
- View Details + Apply Now CTAs

## Detail Page Fields
- Full structured job content (all sections)
- Banner image
- Breadcrumb
- Bookmark + Share in hero
- Sidebar with metadata summary
- Apply Now CTA (hero + sidebar)
- Application information

## Global Features
- Text resizer
- Mobile navigation (hamburger menu)
- Mobile filter drawer
- Search (hero + filter panel)
- Pagination

---

# 9. Sample Data

The listing page includes 15 sample job entries spanning all departments:

| # | Title | Department | Featured |
|---|-------|------------|----------|
| 1 | Senior Business Analyst | Product & Delivery | ★ Yes |
| 2 | Full-Stack Engineer | Engineering | No |
| 3 | UX Designer | Design | No |
| 4 | Marketing Manager | Marketing | No |
| 5 | DevOps Engineer | Engineering | No |
| 6 | HR Coordinator | Human Resources | No |
| 7 | Data Analyst | Data & Analytics | No |
| 8 | Product Manager | Product & Delivery | No |
| 9 | QA Automation Engineer | Engineering | No |
| 10 | Content Strategist | Marketing | No |
| 11 | Finance Controller | Finance | No |
| 12 | Operations Manager | Operations | No |
| 13 | Machine Learning Engineer | Data & Analytics | No |
| 14 | UI Designer | Design | No |
| 15 | Solutions Architect | Engineering | No |

---

## Conclusion

This template ensures:
- Consistent job presentation across listing and detail views
- Better candidate experience with bookmarking, sharing, and text resizing
- Full WCAG 2.2 Level AA accessibility compliance
- Scalable structure backed by a normalised database schema (see `db-schema.md`)
- Production-ready front-end with no framework dependencies
