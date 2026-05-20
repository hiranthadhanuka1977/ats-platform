# TalentHub design system (HTML)

Browser-viewable catalog of UI tokens, components, and **layout templates** **as implemented** in the ATS monorepo (May 2026).

## Open locally

**Option A — double-click**

Open [`index.html`](index.html) in Chrome, Edge, or Firefox.

**Option B — local server (recommended; avoids font/CORS quirks)**

From the repository root:

```bash
npx --yes serve docs/design-system -p 5199
```

Then visit [http://localhost:5199](http://localhost:5199).

## Files

| File | Purpose |
|------|---------|
| [`index.html`](index.html) | Component catalog, layout templates, and live examples |
| [`tokens.css`](tokens.css) | Design tokens (`:root` + `[data-surface="backoffice"]`) |
| [`components.css`](components.css) | Shared component classes (extracted from app stylesheets) |
| [`layouts.css`](layouts.css) | Page shells, content regions, and wireframe preview styles |
| [`ds-layout.css`](ds-layout.css) | Documentation page chrome only |

## Source of truth in code

| Product | Tokens | Components | Layouts |
|---------|--------|------------|---------|
| Candidate portal | `apps/candidate-portal/src/styles/candidate-tokens.css` | `candidate-portal.css` | `page.tsx`, `JobListingShell.tsx`, `SiteHeader` |
| My Applications | Same tokens (imports portal styles) | `my-applications-forms.css` | `MyAppsShell.tsx`, auth `login.css` |
| Backoffice | `apps/backoffice/src/styles/tokens.css` | `backoffice.css`, `login.css` | `BackOfficeShell.tsx`, `bo-content` modifiers |

When you change production styles, update `tokens.css`, `components.css`, and/or `layouts.css` here and bump the **Last updated** date in `index.html` (sidebar + `<time datetime="…">`).

Each component and layout subsection includes a **Markup** block with a **Copy** button — paste-ready HTML matching production class names.

## Layout templates

| Template | Key classes | App |
|----------|-------------|-----|
| Public portal | `site-header`, `main#main-content`, `site-footer` | candidate-portal |
| Job listing | `.container.content-layout`, `.filter-panel`, `.job-listings` | candidate-portal |
| Auth split | `.bo-login-split`, `.bo-login-visual`, `.bo-login-panel` | backoffice, my-applications |
| Dashboard shell | `.bo-app`, `.bo-shell`, `.bo-sidebar`, `.bo-topbar`, `.bo-content` | backoffice, my-applications |
| Standard page | `.bo-page-title`, `.bo-page-sub` | backoffice |
| Dashboard grid | `.bo-dash-grid`, `.bo-span-*` | backoffice |
| Full-width list | `.bo-content--applications`, `.bo-content--interviews` | backoffice |
| Pipeline viewport | `.bo-content--pipeline`, `.bo-applications-pipeline-slot` | backoffice |

## Surfaces

- Default sections use **portal** tokens (5px radius, stronger input borders).
- Sections with `data-surface="backoffice"` use **staff** token overrides (smaller radii, pill shapes).

## Not included

- React-specific behaviour (portals, drag-and-drop, client state)
- Tailwind utility classes used only in isolated components

Related: [WCAG audit](../reports/wcag22-audit.md), [PROJECT_STRUCTURE](../PROJECT_STRUCTURE.md).
