# Compliance & audit reports

**Last updated:** 19 May 2026

| Report | Scope |
|--------|--------|
| [wcag22-audit.md](wcag22-audit.md) | WCAG 2.2 AA — **`apps/candidate-portal`**, **`apps/my-applications`**, **`apps/backoffice`** (Next.js) |
| [pdpa-gdpr-audit.md](pdpa-gdpr-audit.md) | PDPA / GDPR — same three apps + `apps/api` auth/email and OpenAI integrations |
| [implementation-alignment-2026.md](implementation-alignment-2026.md) | Spec vs implementation matrix (APIs, storage, ports) |

Static HTML under `docs/markup/` is referenced only as an appendix inside the WCAG/PDPA reports (April 2026 prototype baseline). **Production sign-off should use the Next.js audits.**

**Dev URLs for manual re-test:** `http://localhost:3000` (portal), `3002` (my-applications), `3001` (backoffice).
