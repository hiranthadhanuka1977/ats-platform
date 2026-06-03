# TalentHub case study (static site)

Curated product-design case study for the TalentHub ATS portfolio — HTML, CSS, and shared assets.

## Serve locally

```bash
cd portfolio/case-study
npm install
npm run serve   # http://localhost:3456
```

Or:

```bash
npx serve portfolio/case-study -p 3456
```

## Scripts

- `npm run serve` — Static file server on port **3456**
- `npm run build` — Regenerate legacy sidebar pages under `pages/` (optional)
- `node scripts/generate-db-schema-html.mjs` — Regenerate `db-schema.html` from `packages/db/prisma/schema.prisma`

## Layout

| Path | Role |
|------|------|
| `index.html` | Main case study narrative |
| `appendix.html` | Artifact index |
| `*.html` | Artifact pages (PRD, API, wireframes, audits, etc.) |
| `styles.css`, `site.js` | Shared styles and chrome |
| `assets/` | Wireframes, IA map, process diagrams |
| `pages/` | Legacy generated sidebar site (not linked from main nav) |
