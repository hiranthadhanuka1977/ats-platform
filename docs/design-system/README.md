# TalentHub design system (HTML)

Browser-viewable catalog of UI tokens and components **as implemented** in the ATS monorepo (May 2026).

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
| [`index.html`](index.html) | Component catalog and live examples |
| [`tokens.css`](tokens.css) | Design tokens (`:root` + `[data-surface="backoffice"]`) |
| [`components.css`](components.css) | Shared component classes (extracted from app stylesheets) |
| [`ds-layout.css`](ds-layout.css) | Documentation page chrome only |

## Source of truth in code

| Product | Tokens | Components |
|---------|--------|------------|
| Candidate portal | `apps/candidate-portal/src/styles/candidate-tokens.css` | `candidate-portal.css` |
| My Applications | Same tokens (imports portal styles) | `my-applications-forms.css`, auth forms |
| Backoffice | `apps/backoffice/src/styles/tokens.css` | `backoffice.css`, `login.css` |

When you change production styles, update `tokens.css` / `components.css` here and bump the **Last updated** date in `index.html` (sidebar + `<time datetime="…">`).

## Surfaces

- Default sections use **portal** tokens (5px radius, stronger input borders).
- Sections with `data-surface="backoffice"` use **staff** token overrides (smaller radii, pill shapes).

## Not included

- React-specific behaviour (portals, drag-and-drop, client state)
- Tailwind utility classes used only in isolated components
- Every page layout — see app routes for full compositions

Related: [WCAG audit](../reports/wcag22-audit.md), [PROJECT_STRUCTURE](../PROJECT_STRUCTURE.md).
