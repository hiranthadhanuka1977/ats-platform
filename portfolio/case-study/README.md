# TalentHub — Portfolio case study site

A **curated, senior UX portfolio presentation** for the TalentHub ATS project—not a full documentation mirror.

## View locally

From repo root:

```bash
npx serve portfolio/case-study -p 3456
```

Open [http://localhost:3456](http://localhost:3456)

Or open `index.html` directly in a browser (relative image paths assume this folder layout).

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Main scroll narrative: context → research → approach → solution → impact |
| `wireframes.html` | Wireframe gallery (6 screens) |
| `appendix.html` | Secondary links to specs, research, audits |
| `information-architecture.html` | Platform IA — routes, nav, cross-app map |
| `netnographic-research.html` | Netnographic research — ATS discourse synthesis |
| `styles.css` | Editorial layout, TalentHub blue accent |
| `site.js` | Header scroll state, mobile nav |
| `assets/` | Self-contained images (process diagrams, IA map, wireframe SVGs) |

Deploy the entire `case-study/` folder—it includes all assets needed for hosting.

## Portfolio tips

- Swap wireframe PNGs for **Figma embeds** or hi-fi screenshots when ready.
- Replace placeholder impact stats with real metrics or user quotes.
- Add your name, photo, and contact in the hero or footer.
- Host on Netlify/Vercel/GitHub Pages from `portfolio/case-study/`.

## Source content

Narrative distilled from `portfolio/final-case-study.md` and netnographic research. Full markdown and specs remain linked from the appendix.
