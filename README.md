# ats-platform

Monorepo for the ATS product: **candidate portal**, **company back office**, **HTTP API**, and **shared packages**.

> The repo folder on disk may still be named `markup_v1`; you can rename it to `ats-platform` to match this layout.

## Layout

| Path | Purpose |
|------|---------|
| **`apps/candidate-portal`** | Next.js — public candidate UI (port **3000**) |
| **`apps/backoffice`** | Next.js — internal staff UI (port **3001**) |
| **`apps/api`** | Hono + Node — REST/API service (port **4000** default) |
| **`packages/db`** | Prisma schema, migrations, `@ats-platform/db` client export |
| **`packages/ui`** | Shared React UI primitives |
| **`packages/config`** | Shared TS config (`tsconfig.base.json`) |
| **`packages/types`** | Shared TypeScript types |
| **`packages/utils`** | Shared utilities |
| **`packages/auth`** | Shared auth/session helpers (stubs) |
| **`packages/validators`** | Zod schemas shared by API and apps |
| **`docs/`** | Specifications, API dictionary, static HTML markup, audits |

## Quick start

```bash
npm install
# DATABASE_URL: use repo root .env (Prisma + db:create) and copy the same into each Next app as needed:
#   apps/candidate-portal/.env.local
#   apps/backoffice/.env.local
npm run dev                 # candidate portal (default)
npm run dev:backoffice      # back office
npm run dev:api             # API server
npm run dev:all             # all three at once (ports 3000, 3001, 4000)
```

## Database (Prisma)

Canonical schema: **`packages/db/prisma/schema.prisma`**. Migrations live in **`packages/db/prisma/migrations/`**.

```bash
npm run db:create
npm run db:migrate
npm run db:studio
```

`npm run db:create` reads **`DATABASE_URL` from the repo root `.env`**.

## Documentation

- **[`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md)** — full monorepo layout (apps, packages, env, scripts)  
- **[`docs/README.md`](docs/README.md)** — specifications and static markup index  
- **[`.cursor/rules/ats-platform.mdc`](.cursor/rules/ats-platform.mdc)** — Cursor AI rules (structure, Prisma, where to put code)
