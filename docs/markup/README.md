# Static HTML markup

| Folder | Purpose |
|--------|---------|
| **`candidate-portal/`** | Legacy prototypes for the public candidate experience (jobs, login, shared CSS/JS). |
| **`backoffice/`** | Internal staff UI — **`index.html`** (dashboard), **`login.html`** (split layout: image + email/password, Google & LinkedIn, forgot password). Uses `tokens.css` + per-page CSS. |

Open `.html` files in a browser **from that folder** so relative links to CSS/JS resolve. API specs reference **`candidate-portal/`** markup unless noted otherwise.
