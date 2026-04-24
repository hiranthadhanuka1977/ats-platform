# AI-Optimized Front-End Prompt for Candidate Portal

**Version:** 2.0  
**Last Updated:** 06 April 2026  
**Status:** Implemented

> Note (22 Apr 2026): This prompt is a static frontend reference for the original candidate portal markup workflow. Current runtime apps are split: `apps/candidate-portal` (public jobs) and `apps/my-applications` (candidate auth/dashboard).

## Overview
This prompt is designed for AI coding tools such as Cursor, Claude Code, GPT, and Copilot to generate production-quality front-end code for a Candidate Portal.

---

## Instructions

You are a senior front-end engineer and UX engineer.

Your task is to build a production-quality, fully responsive, accessible Candidate Portal UI using:

- HTML (no frameworks)
- Custom CSS with design tokens (emulating Tailwind utility principles)
- Vanilla JavaScript (separate file)

---

## Context

This system is part of an ATS (Applicant Tracking System).

Use the file:
`Job_Posting_Templates.md`

as the source of truth for:
- job listing structure
- job detail structure
- content hierarchy

Do NOT invent your own structure.

---

## Output Files

Generate the following files:

1. `job-listing.html` — Job listing page with hero, filters, and job cards
2. `job-detail.html` — Full job detail page with sidebar and banner image
3. `tokens.css` — Design tokens (CSS custom properties)
4. `styles.css` — Component and layout styles
5. `main.js` — All client-side interactivity

---

## Architecture Rules

- No inline CSS
- No inline JS
- Use semantic HTML5
- Reusable class patterns (BEM-influenced)
- Section-based structure
- Mobile-first responsive approach

---

## Design System (tokens.css)

### Colors
- `--color-primary`, `--color-secondary`, `--color-accent`
- `--color-bg`, `--color-surface`
- `--color-text`, `--color-muted` (min 4.5:1 contrast), `--color-border`
- `--color-success`, `--color-warning`, `--color-error`
- `--color-featured`, `--color-featured-light` (for featured job ribbons)
- `--color-border-input` (min 3:1 non-text contrast for form controls)

### Typography
- Google Font pairing: display (`--font-display`) + body (`--font-body`)
- Font sizes: `--text-xs` through `--text-4xl`
- Font weights: `--weight-normal`, `--weight-medium`, `--weight-semibold`, `--weight-bold`
- Line heights: `--leading-tight`, `--leading-normal`, `--leading-relaxed`

### Spacing
- Consistent scale: `--space-1` (4px) through `--space-16` (64px)

### Radius & Shadows
- Radii: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` (subtly rounded, not overly curved)
- Shadows: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`

### Layout
- `--header-height`, `--container-max`, `--sidebar-width`

### Transitions
- `--transition-fast`, `--transition-base`

### Buttons
- Primary (`.btn-primary`) and secondary/ghost (`.btn-ghost`) variants
- Small (`.btn-sm`) size modifier

---

## Design Requirements

- Clean, modern, professional UI
- Premium SaaS look and feel
- Strong visual hierarchy
- Generous spacing and white space
- Card-based layout for job listings
- Subtle border radii (not fully rounded — rectangular aesthetic preference)

---

## UX Principles (Gestalt)

Apply:
- Proximity — group related elements
- Similarity — consistent card styling
- Hierarchy — clear heading levels, visual weight
- Alignment — grid-based layouts
- Common region — cards, sections, panels
- Figure-ground — overlay/drawer patterns

---

## Accessibility (WCAG 2.2 Level AA)

### Semantic HTML
- Proper heading hierarchy (`h1` → `h2` → `h3`)
- Landmark roles (`banner`, `main`, `contentinfo`, `navigation`)
- `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`

### Keyboard Support
- All interactive elements reachable via Tab
- Escape key closes mobile nav and filter drawer
- Focus trap within filter drawer when open
- Focus restored to trigger element on close
- `role="switch"` + `aria-checked` for toggle controls
- `role="group"` for grouped controls (text resizer, department pills)

### Focus Visibility
- `:focus-visible` with `outline: 2px solid` + `outline-offset: 2px`
- White outlines on dark backgrounds (hero, footer)
- `scroll-margin-top` on `:target` and `section[id]` to prevent sticky header occlusion

### Colour Contrast
- All text meets 4.5:1 contrast ratio minimum
- Form control borders meet 3:1 non-text contrast
- Muted text (`--color-muted`) darkened to pass 4.5:1

### ARIA
- `aria-label` on all icon-only buttons (with specific context, e.g., "Bookmark Senior Business Analyst")
- `aria-expanded` on toggle buttons (menu, filter)
- `aria-pressed` on bookmark buttons
- `aria-current="page"` on active navigation and pagination
- `aria-live="polite"` on results count
- Live status region (`role="status"`) for bookmark/share announcements
- `role="list"` / `role="listitem"` on job card containers
- `role="img"` on decorative badge elements
- `<span class="sr-only">` for additional link context (e.g., "View Details — Senior Business Analyst")

### Forms
- `type="search"` for search inputs
- Associated `<label>` elements
- Accessible select dropdowns

### Other
- Skip-to-content link (`.skip-link`)
- `prefers-reduced-motion` media query support

---

## Responsiveness

Mobile-first approach with breakpoints at 768px and 1024px.

### Mobile (< 768px)
- Hamburger menu with dropdown navigation
- Filter panel → slide-in drawer with overlay
- Stacked card layout
- Toolbar: filter button + sort dropdown + results count in row
- Hero department pills: horizontal scroll
- Search icon alignment within hero search box

### Desktop (≥ 768px)
- Full horizontal navigation
- Sidebar filter panel (always visible)
- Multi-column job card grid
- Hero department pills: centered wrap layout

---

## Page 1: Job Listing (`job-listing.html`)

### Header
- Logo with icon (`.logo`, `.logo-icon`)
- Primary navigation (Jobs, About Us, Culture, Contact)
- Text resizer (`A−` / `A` / `A+`) with `sessionStorage` persistence
- Log In / Register buttons
- Mobile hamburger menu button

### Hero Section
- Large heading (`h1`)
- Description tagline
- Search bar with icon + submit button (syncs to filter panel on submit)
- Department selection pills (All Departments, Engineering, Product & Delivery, Design, Marketing, HR, Data & Analytics, Finance, Operations) — glass-morphism style with `backdrop-filter`
- Active pill syncs to department filter `<select>` and scrolls to listings

### Toolbar (above listings)
- Filter toggle button (mobile)
- Sort dropdown (Most Recent, Oldest First, Title A–Z, Title Z–A)
- Results count (`aria-live="polite"`)

### Filter Panel
- Search input (`type="search"`)
- Location dropdown
- Department dropdown
- Employment Type dropdown
- Experience Level dropdown
- Date Posted dropdown (Last 24 hours / 7 days / 30 days / All time)
- Remote Only toggle (`role="switch"`, `aria-checked`)
- Clear Filters button
- Close button (mobile, header row)

### Job Cards
- Container has `role="list"`, each card is `role="listitem"`
- Featured card: ribbon with star icon (`role="img"`)
- Card content: title (as link), department, location, employment type, experience level, posted date, summary
- Tags/badges: Remote, Hybrid, On-site, New (colour-coded via `variant`)
- Action row: "View Details" link + "Apply Now" link (both with `sr-only` job title context)
- Bookmark button (`aria-pressed`, with per-job `aria-label`)
- Share button (Web Share API with clipboard fallback + live announcement)
- Entire card is clickable (JS-enhanced mouse interaction, links remain keyboard-accessible)

### Pagination
- Numbered page buttons with Previous / Next
- `aria-current="page"` on active page

### Empty State
- Illustration, heading, description, and clear-filters CTA

### Footer
- Company info, quick links, legal links
- Social media icons
- Copyright

### Sample Data
- 15 job entries across departments (1 marked featured)

---

## Page 2: Job Detail (`job-detail.html`)

### Header
- Same as listing page (logo, nav, text resizer, auth buttons, mobile menu)

### Detail Hero (dark background)
- Breadcrumb navigation (`All Jobs / [Job Title]`)
- Job title (`h1`)
- Meta: department, location, employment type, experience level (with SVG icons)
- Bookmark button + Share button (`.icon-btn--on-dark` variant)
- "Apply Now" primary CTA button

### Banner Image
- Full-width image banner below hero (`.detail-banner > img`)
- `object-fit: cover`, responsive height

### Content Section (two-column on desktop)

#### Main Column
- **Job Overview** — paragraph block
- **Role Summary** — paragraph block
- **Key Responsibilities** — ordered/unordered list
- **Required Qualifications** — list
- **Preferred Qualifications** — list
- **Required Skills** — inline pill badges
- **What We Offer** — list with check icons
- **Application Information** — paragraph + login methods

#### Sidebar (sticky on desktop)
- Job summary card: department, location, type, experience, posted date, deadline
- "Apply for this Position" CTA button
- Share this Job section with social-style share buttons

---

## Code Quality

- Clean, well-structured code
- Reusable CSS classes with design tokens
- No duplication
- Maintainable and scalable
- CSS organised by component (header, hero, filters, cards, detail, footer)
- JS organised by feature (text resizer, mobile nav, filter drawer, remote toggle, pagination, bookmarks, share, department pills, clickable cards)

---

## JavaScript Features (`main.js`)

| Feature | Details |
|---------|---------|
| Text Resizer | 5-step scale (87.5% → 137.5%), persists to `sessionStorage` |
| Mobile Navigation | Toggle open/close, Escape key, outside click to close |
| Hero Search Sync | Form submit copies query to filter search input, scrolls to listings |
| Filter Drawer | Open/close with overlay, focus trap, Escape key, body scroll lock |
| Remote Toggle | `role="switch"` with `aria-checked`, keyboard Enter/Space |
| Pagination | Active state toggle with `aria-current` |
| Clear Filters | Resets all inputs, selects, and remote toggle |
| Bookmark Toggle | `aria-pressed` toggle, live region announcement |
| Share Button | Web Share API → clipboard fallback, live region announcement |
| Hero Department Pills | Active state, syncs to filter select, smooth scroll to listings |
| Clickable Job Cards | Delegated click on card (excludes interactive elements), triggers title link |
| A11y Live Region | Hidden `role="status"` div for announcing state changes to screen readers |

---

## Related Files

| File | Purpose |
|------|---------|
| `docs/specification/Job_Posting_Templates.md` | Content structure and data field reference |
| `docs/specification/db-schema.md` | PostgreSQL database schema supporting the UI |
| `packages/db/prisma/schema.prisma` | Prisma schema (source of truth for migrations) |
| `docs/specification/er-diagram.html` | Interactive ER diagram (Mermaid.js) |
| `reports/wcag22-audit.md` | WCAG 2.2 audit report and remediation log |
| `reports/pdpa-gdpr-audit.md` | Privacy compliance audit |

---

## Final Checklist

- [x] Fully responsive (mobile, tablet, desktop)
- [x] WCAG 2.2 Level AA accessible
- [x] Token-based design system
- [x] Production-ready code quality
- [x] Text resizer with session persistence
- [x] Bookmark and share functionality
- [x] Featured job highlighting
- [x] Hero department pills with filter sync
- [x] Clickable job cards
- [x] Mobile hamburger menu
- [x] Mobile filter drawer with focus trap
- [x] Banner image on job detail page
- [x] Live screen reader announcements
- [x] 15 diverse sample job entries
- [x] Must look like a real SaaS product
