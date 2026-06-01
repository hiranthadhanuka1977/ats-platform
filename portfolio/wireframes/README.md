# TalentHub — Screen wireframes (portfolio)

Low-fidelity wireframes aligned with the **as-built** implementation (May 2026). Use for case study slides, Figma trace-over, or usability test scripts.

**Ground truth:** [PRD](../../docs/specification/PRD.md) · [Screen inventory](../product-designer-ats-backoffice/14-screen-and-route-inventory.md)

---

## Wireframe index

| # | Screen | App | Route | File |
|---|--------|-----|-------|------|
| 01 | Staff dashboard | Backoffice `:3001` | `/` | [01-backoffice-dashboard.md](./01-backoffice-dashboard.md) |
| 02 | Applications pipeline | Backoffice | `/applications` | [02-backoffice-applications-pipeline.md](./02-backoffice-applications-pipeline.md) |
| 03 | Application detail (packet) | Backoffice | `/applications/[id]` | [03-backoffice-application-detail.md](./03-backoffice-application-detail.md) |
| 04 | Job listing (careers) | Candidate portal `:3000` | `/` | [04-candidate-portal-job-listing.md](./04-candidate-portal-job-listing.md) |
| 05 | Job detail | Candidate portal | `/jobs/[slug]` | [05-candidate-portal-job-detail.md](./05-candidate-portal-job-detail.md) |
| 06 | Candidate dashboard | My Applications `:3002` | `/dashboard` | [06-my-applications-dashboard.md](./06-my-applications-dashboard.md) |

---

## Conventions

- **Frame width:** Desktop 1280px reference; mobile notes where layout stacks.
- **Shell:** Skip link → header/nav → `#main-content` → footer (portal/MA) or sidebar shell (backoffice).
- **Status vocabulary:** Ten application statuses per PRD §6.
- **Annotations:** `[A]` = aria label / live region; `→` = navigation; dashed = optional/conditional block.

---

## Related portfolio artefacts

- [06-wireframes-and-states.md](../product-designer-ats-backoffice/06-wireframes-and-states.md) — Figma frame titles and state list (backoffice applications slice)
- [04-information-architecture.md](../product-designer-ats-backoffice/04-information-architecture.md) — Sitemap and navigation

---

*Wireframes v1.0 · 19 May 2026*
