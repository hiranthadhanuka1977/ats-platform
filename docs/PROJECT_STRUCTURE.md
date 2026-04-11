# Project structure

This document describes the **ats-platform** monorepo: applications, shared packages, reference documentation, and how they fit together.

| | |
|--|--|
| **Workspace name** | `ats-platform` (root `package.json`) |
| **Repo folder on disk** | May be `markup_v1`, `ats-platform`, or any name — npm uses the workspace name above. |

---

## Contents

1. [Run all apps at once](#run-all-apps-at-once)
2. [High-level layout](#high-level-layout)
3. [Tooling](#tooling)
4. [Applications (`apps/`)](#applications-apps)
5. [Shared packages (`packages/`)](#shared-packages-packages)
6. [Reference documentation (`docs/`)](#reference-documentation-docs)
7. [Environment variables](#environment-variables)
8. [Root npm scripts](#root-npm-scripts)
9. [Dependency rules](#dependency-rules)
10. [Related links](#related-links)

---

## Run all apps at once

From the **repository root**:

```bash
npm run dev:all
```

This uses **`concurrently`** to start **candidate portal** (port **3000**), **backoffice** (port **3001**), and **API** (port **4000**) in the **same terminal**, with prefixes `candidate`, `backoffice`, and `api` on each log line.

If you prefer **separate terminals**, run `npm run dev`, `npm run dev:backoffice`, and `npm run dev:api` in three windows.

---

## High-level layout

```
ats-platform/                         # repo root — npm workspaces
├── apps/
│   ├── candidate-portal/             # Next.js — public candidate UI (port 3000)
│   │   └── src/                      # app/, components/, features/, lib/
│   ├── backoffice/                   # Next.js — internal staff UI (port 3001)
│   │   └── src/                      # app/, components/, features/, lib/
│   └── api/                          # Hono — HTTP API (port 4000 default)
│       └── src/                      # routes/, middlewares/, lib/, modules/
├── packages/                         # @ats-platform/* shared libraries
│   ├── auth/
│   ├── config/
│   ├── db/                           # prisma/schema.prisma, prisma/migrations/
│   ├── types/
│   ├── ui/
│   ├── utils/
│   └── validators/
├── docs/                             # specs, API dictionary, markup, audits, this file
│   ├── PROJECT_STRUCTURE.md          # ← you are here
│   ├── README.md
│   ├── specification/
│   ├── markup/
│   │   ├── candidate-portal/         # static HTML/CSS/JS — public candidate UI
│   │   └── backoffice/               # static HTML — internal staff UI (placeholder)
│   └── reports/
├── package.json                      # workspaces: apps/*, packages/*; postinstall → db:generate
├── package-lock.json
├── .env.example                      # template for root DATABASE_URL
├── .gitignore
└── README.md                         # quick start
```

---

## Tooling

| Concern | Choice |
|--------|--------|
| **Package manager** | npm **workspaces** (`apps/*`, `packages/*`) |
| **Web apps** | Next.js 16 (App Router, TypeScript, Tailwind CSS v4) |
| **API** | Hono on Node (`@hono/node-server`), dev via **`tsx watch`** |
| **Database ORM** | Prisma 6 (`@ats-platform/db`) |
| **Validation** | Zod (`@ats-platform/validators`) |

---

## Applications (`apps/`)

| Directory | npm name | Purpose | Dev port |
|-----------|----------|---------|----------|
| `apps/candidate-portal/` | `@ats-platform/candidate-portal` | Public careers / candidate experience | **3000** (Next default) |
| `apps/backoffice/` | `@ats-platform/backoffice` | Internal ATS / company back office | **3001** (`next dev -p 3001`) |
| `apps/api/` | `@ats-platform/api` | HTTP API for web clients and integrations | **4000** (`PORT` env) |

### Next.js apps (`candidate-portal`, `backoffice`)

Both use the **App Router** under `src/app/`. Shared folder conventions:

| Folder | Purpose |
|--------|---------|
| **`src/app/`** | Routes, layouts, `globals.css` |
| **`src/components/`** | Reusable UI (presentational pieces used across pages) |
| **`src/features/`** | Vertical slices (e.g. job search, auth flows); pages compose features |
| **`src/lib/`** | App-only helpers; **`prisma.ts`** re-exports **`@ats-platform/db`** |

`components/` and `features/` may start empty (tracked with `.gitkeep`) until you add files.

**Turbopack:** each Next app sets `turbopack.root` to the **repository root** so tooling resolves the monorepo lockfile correctly.

### HTTP API (`apps/api`)

#### Source tree

```
src/
├── index.ts              # Hono app, middleware, registerRoutes(), serve()
├── routes/
│   ├── index.ts          # registerRoutes(app) — mounts health, demo, all modules
│   ├── health.ts         # liveness payload
│   └── demo.ts           # example: pagination query validation
├── middlewares/
│   ├── index.ts
│   └── logger.ts         # requestLogger
├── lib/
│   └── prisma.ts         # re-export prisma from @ats-platform/db
└── modules/              # domain Hono sub-apps (one folder per area)
    ├── auth/
    ├── jobs/
    ├── candidates/
    ├── applications/
    ├── interviews/
    ├── users/            # internal staff
    └── notifications/
```

Each **`modules/<name>/index.ts`** exports a **`Hono`** instance. **`routes/index.ts`** mounts them with **`app.route("/<prefix>", module)`**. Add services, handlers, and tests inside each module as you build features.

#### Route map (stubs)

Mounted paths follow **`routes/index.ts`**. Inner routers use `GET /` on the sub-app unless you add nested paths.

| HTTP | Path | Source |
|------|------|--------|
| `GET` | `/health` | `routes/health.ts` (JSON: ok, service, ts) |
| `GET` | `/demo/pagination` | `routes/demo.ts` (query: `page`, `pageSize` via Zod) |
| `POST` | `/api/v1/auth/login`, `GET` `/api/v1/auth/me`, … | `modules/auth` |
| `GET` | `/jobs/` | `modules/jobs` |
| `GET` | `/candidates/` | `modules/candidates` |
| `GET` | `/applications/` | `modules/applications` |
| `GET` | `/interviews/` | `modules/interviews` |
| `GET` | `/users/` | `modules/users` |
| `GET` | `/notifications/` | `modules/notifications` |

**TypeScript:** `apps/api/tsconfig.json` uses **`moduleResolution: "bundler"`** so local imports do not require explicit `.js` extensions for `tsc`.

---

## Shared packages (`packages/`)

All are **private** npm packages scoped **`@ats-platform/<name>`** (linked via workspaces).

| Package | Role |
|---------|------|
| **`@ats-platform/db`** | Prisma **`prisma/schema.prisma`**, **`prisma/migrations/`**, shared **`prisma`** export in **`src/index.ts`**. Single source of truth for the relational model. |
| **`@ats-platform/ui`** | Shared React UI primitives; peer dependency on React 19. |
| **`@ats-platform/config`** | Shared **`tsconfig.base.json`** for packages to extend. |
| **`@ats-platform/types`** | Cross-app TypeScript types (DTOs, API contracts). |
| **`@ats-platform/utils`** | Small pure helpers. |
| **`@ats-platform/auth`** | Shared auth/session abstractions (stubs until wired). |
| **`@ats-platform/validators`** | Zod schemas for API and optional Next server code. |

### Database package (`@ats-platform/db`)

- Prisma config: **`packages/db/package.json`** → `"prisma": { "schema": "prisma/schema.prisma" }`.
- **`packages/db/scripts/create-database.js`** creates the DB named in **`DATABASE_URL`** if missing (via `postgres` DB). Reads **`DATABASE_URL` from the repo root `.env`**.
- Root **`postinstall`** runs **`npm run db:generate`** so `@prisma/client` is generated after install.

**Import example (apps or packages):**

```ts
import { prisma } from "@ats-platform/db";
```

---

## Reference documentation (`docs/`)

| Path | Contents |
|------|----------|
| **`docs/specification/`** | `db-schema.md`, REST specs under **`api/`**, **`API_Dictionary.md`**, ER diagram, templates, prompts. |
| **`docs/markup/candidate-portal/`** | Static HTML/CSS/JS prototypes for the candidate UI. |
| **`docs/markup/backoffice/`** | Static markup for the back office (add files as you go). |
| **`docs/reports/`** | Compliance / audit notes. |

The **canonical Prisma schema** is **`packages/db/prisma/schema.prisma`**, not under `docs/specification/`. Markdown specs link to that file where needed.

---

## Environment variables

| Location | Typical use |
|----------|-------------|
| **Repo root `.env`** | **`DATABASE_URL`** for Prisma CLI (`npm run db:*`) and **`db:create`**. Gitignored. |
| **`apps/candidate-portal/.env.local`** | Next.js secrets; include **`DATABASE_URL`** if server code uses Prisma. |
| **`apps/backoffice/.env.local`** | Same for back office. |
| **`apps/api`** | **`PORT`** (optional, default **4000**); **`DATABASE_URL`** when using Prisma in the API. |

Use **`.env.example`** at the repo root as a template; copy values into app-specific env files as needed.

---

## Root npm scripts

Run from the **repository root**:

| Script | Action |
|--------|--------|
| `npm run dev` | **Candidate portal** dev server (port **3000**) |
| `npm run dev:candidate` | Same |
| `npm run dev:backoffice` | **Back office** dev server (port **3001**) |
| `npm run dev:api` | **API** (`tsx watch`) |
| `npm run dev:all` | **All three** in one terminal ([`concurrently`](https://www.npmjs.com/package/concurrently)) — **3000**, **3001**, **4000** |
| `npm run build` | `build` in all workspaces that define it |
| `npm run db:create` | Create PostgreSQL database (from root `.env`) |
| `npm run db:migrate` | `prisma migrate dev` in `@ats-platform/db` |
| `npm run db:deploy` | `prisma migrate deploy` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:studio` | Prisma Studio |
| `npm run db:push` | `prisma db push` (prototyping only; prefer migrations in production) |

Per-workspace scripts: `npm run <script> -w @ats-platform/<name>`.

---

## Dependency rules

1. **`apps/*`** may depend on **`packages/*`**; packages must not depend on apps.
2. Keep **`packages/*`** focused; avoid circular dependencies between packages.
3. **`@ats-platform/db`** is the **only** owner of Prisma schema and migrations.
4. **`docs/`** is reference-only — not part of the runtime dependency graph.

---

## Related links

- **[README.md](../README.md)** — quick start and ports  
- **[docs/README.md](README.md)** — specification and markup index  
- **[docs/specification/db-schema.md](specification/db-schema.md)** — database design (companion to `packages/db/prisma/schema.prisma`)

---

**Document:** `docs/PROJECT_STRUCTURE.md` — structure of the `ats-platform` monorepo (apps, packages, API modules, env, scripts).
