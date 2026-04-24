# Static HTML markup

| Folder | Purpose |
|--------|---------|
| **`candidate-portal/`** | Prototypes for public jobs browsing UX. Contains legacy login/register screens kept as static reference. |
| **`backoffice/`** | Internal staff UI — **`index.html`** (dashboard), **`login.html`** (split layout: image + email/password, Google & LinkedIn, forgot password). Uses `tokens.css` + per-page CSS. |

Open `.html` files in a browser **from that folder** so relative links to CSS/JS resolve.

Current app split:

- Public jobs app: `apps/candidate-portal`
- Candidate auth/dashboard app: `apps/my-applications` (uses React/Next implementation, not static HTML in this folder)
