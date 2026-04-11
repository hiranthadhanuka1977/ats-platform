# Reference documentation

Static reference material: **specifications**, **API dictionary**, **static HTML/CSS markup**, and **compliance reports**.

| Path | Contents |
|------|----------|
| **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** | Monorepo layout: `apps/*`, `packages/*`, API modules, env, npm scripts |
| **[specification/](specification/)** | `db-schema.md`, REST API specs (`api/`), ER diagram, job templates, AI prompts — *see Prisma note below* |
| **[markup/](markup/)** | Static HTML prototypes: **`markup/candidate-portal/`** (public UI), **`markup/backoffice/`** (staff UI — add as needed) |
| **[reports/](reports/)** | WCAG / PDPA-GDPR audit notes |

### Prisma schema (source of truth)

The **Prisma schema and SQL migrations** are not under `docs/` — they live in the monorepo at:

- **`packages/db/prisma/schema.prisma`**
- **`packages/db/prisma/migrations/`**

The npm workspace package **`@ats-platform/db`** exports a shared `prisma` client. From the repo root:

```bash
npm run db:migrate
```

### Applications

Implementation apps live under **`../apps/`** at the repository root (`candidate-portal`, `backoffice`, `api`).
