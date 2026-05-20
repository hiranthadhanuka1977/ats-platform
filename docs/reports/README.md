# Compliance & audit reports

**Last updated:** 19 May 2026

This folder holds **static markup audits** and notes on how they relate to the running monorepo.

| Report | Scope | Target |
|--------|--------|--------|
| [wcag22-audit.md](wcag22-audit.md) | WCAG 2.2 AA checklist | `docs/markup/candidate-portal/` and `docs/markup/backoffice/` HTML prototypes |
| [pdpa-gdpr-audit.md](pdpa-gdpr-audit.md) | PDPA / GDPR-oriented review | Same static markup + stated data flows in specs |

These reports do **not** automatically cover:

- `apps/candidate-portal`, `apps/my-applications`, or `apps/backoffice` (Next.js)
- `apps/api` HTTP handlers
- Runtime file storage under repo `storage/`

For implementation vs specification alignment, see [implementation-alignment-2026.md](implementation-alignment-2026.md).

When re-auditing for production, repeat checks against deployed URLs (ports **3000**, **3002**, **3001**) and update or add dated report files here.
