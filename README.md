# Project Developer Experience Guide

This repository provides a production-ready Next.js 16 application with TypeScript, Tailwind CSS, a lightweight API surface, and Prisma for data access. The goal is to offer a dependable baseline for new services with a consistent developer experience, tooling, and documentation.

- **Framework:** Next.js App Router (SSR + API routes)
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (managed locally through Docker Compose)
- **ORM:** Prisma
- **Tooling:** pnpm, ESLint, Prettier, Vitest, Husky, lint-staged, Commitlint

> ℹ️ All commands below assume you are in the repository root.

---

## Table of Contents

1. [Architecture overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment variables](#environment-variables)
4. [Initial setup](#initial-setup)
5. [Local development workflow](#local-development-workflow)
6. [Database & migrations](#database--migrations)
7. [Available scripts](#available-scripts)
8. [Testing strategy](#testing-strategy)
9. [Continuous integration](#continuous-integration)
10. [Deployment notes](#deployment-notes)
11. [Contribution guidelines](#contribution-guidelines)
12. [Troubleshooting](#troubleshooting)

---

## Architecture overview

```
app/
  api/
    healthz/
      route.ts    # Lightweight API route used by monitoring checks
  globals.css      # Tailwind CSS entry point
  layout.tsx       # Root layout shared across the app router
  page.tsx         # Home page

apps/
  api/
    src/
      main.ts
      health/       # Health checks for the NestJS API service
      users/        # Authenticated user profile endpoint

prisma/
  schema.prisma    # Datasource + generator configuration (extend with models as needed)

tests/
  healthz-route.test.ts  # Example Vitest suite covering the health endpoint
```

The project now includes a standalone NestJS service alongside the Next.js application. Prisma is configured to target the `DATABASE_URL` from your environment and is ready for further schema modelling. Browser-focused tests are executed with Vitest, while the API exposes dedicated Jest suites under `apps/api/test`.

---

## Prerequisites

- **Node.js 20.x** (use [`corepack`](https://nodejs.org/api/corepack.html) to manage package managers)
- **pnpm 9** (`corepack enable` enables pnpm globally)
- **Docker + Docker Compose v2** for running PostgreSQL locally

Check your versions:

```bash
node --version
pnpm --version
docker compose version
```

---

## Environment variables

Copy `.env.example` to `.env` and adjust values as necessary. The template is organised by concern and documented below. The NestJS service reads its own environment file; copy `.env.example.api` to `.env.api` if you plan to run it standalone.

```bash
cp .env.example .env
cp .env.example.api .env.api
```

### Root (repository-wide)

| Variable | Description | Example |
| --- | --- | --- |
| `NODE_ENV` | Runtime mode used by Next.js and tooling. | `development` |
| `NEXT_TELEMETRY_DISABLED` | Opt-out of Next.js telemetry during development/CI. | `1` |

### Web (client-facing Next.js code)

| Variable | Description | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | Display name surfaced in the UI. | `Project Starter` |
| `NEXT_PUBLIC_API_BASE_URL` | Location of the API the browser should talk to. | `http://localhost:4000` |

### Server / API

| Variable | Description | Example |
| --- | --- | --- |
| `API_HOST` | Host binding for the API server. | `0.0.0.0` |
| `API_PORT` | Port exposed by `pnpm dev:api` / Docker. | `4000` |
| `DATABASE_URL` | Connection string used by Prisma. | `postgresql://postgres:postgres@localhost:5432/project?schema=public` |
| `AUTH_JWT_SECRET` | Secret used to validate JWT bearer tokens. | `super-secret-key` |
| `SESSION_HEADER_NAME` | Header forwarded from the web app that carries a session token. | `x-session-token` |

### PostgreSQL (Docker Compose)

| Variable | Description | Example |
| --- | --- | --- |
| `POSTGRES_USER` | Username for the local Postgres container. | `postgres` |
| `POSTGRES_PASSWORD` | Password for the local Postgres container. | `postgres` |
| `POSTGRES_DB` | Database created for the application. | `project` |
| `POSTGRES_HOST` | Hostname applications should connect to. | `localhost` |
| `POSTGRES_PORT` | Port exposed by the container. | `5432` |
| `POSTGRES_SCHEMA` | Default schema Prisma targets. | `public` |

---

## Initial setup

1. **Install dependencies**
   ```bash
   corepack enable    # one-time, enables pnpm
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Update any secrets/URLs specific to your machine
   ```

3. **Start Postgres (optional but required for Prisma migrations)**
   ```bash
   docker compose up db -d
   ```

4. **Generate Prisma client (runs automatically on first `prisma` command)**
   ```bash
   pnpm prisma generate
   ```

5. **Launch the dev servers**
   ```bash
   pnpm dev          # Next.js frontend
   pnpm dev:api      # NestJS API (runs on http://localhost:4000)
   ```

Visit [http://localhost:3000](http://localhost:3000) to validate the app is running and hit [http://localhost:4000/health](http://localhost:4000/health) for the API health check.

---

## Local development workflow

- Code formatting and linting are consolidated into reusable pnpm scripts.
- Husky hooks (installed automatically via the `prepare` script) run `lint-staged` on staged files before every commit and enforce Conventional Commits via Commitlint.
- Vitest provides fast feedback for unit tests. Add new tests under `tests/`.

---

## Database & migrations

Prisma is configured with a PostgreSQL datasource (`prisma/schema.prisma`). When you add models:

1. Update `schema.prisma` with your changes.
2. Create a new migration once Postgres is running:
   ```bash
   pnpm prisma migrate dev --name add_your_model
   ```
3. For CI/production, apply migrations deterministically:
   ```bash
   pnpm prisma migrate deploy
   ```
4. Regenerate the Prisma client whenever the schema changes:
   ```bash
   pnpm prisma generate
   ```
   > The starter schema doesn't define models yet, so Prisma will print a reminder until you add your own models.

---

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm dev:api` | Start the NestJS API with live reload. |
| `pnpm build` | Create a production build of the Next.js app. |
| `pnpm build:api` | Build the NestJS API through Turborepo. |
| `pnpm start` | Run the Next.js production server (after `pnpm build`). |
| `pnpm start:api` | Run the compiled NestJS API (`apps/api/dist/main.js`). |
| `pnpm typecheck` | Run the TypeScript compiler in `--noEmit` mode. |
| `pnpm lint` | Run type-checking and ESLint with `--max-warnings=0`. |
| `pnpm lint:eslint` | Run ESLint alone. |
| `pnpm lint:fix` | Auto-fix lint issues where possible. |
| `pnpm format` | Format the entire repository with Prettier. |
| `pnpm format:check` | Check formatting without writing changes. |
| `pnpm test` | Execute Vitest in run mode. |
| `pnpm test:api` | Run the NestJS API Jest suites via Turborepo. |
| `pnpm prisma ...` | Forward Prisma CLI commands (e.g. `pnpm prisma db pull`). |

`lint-staged` mirrors the `pnpm lint:eslint` and `pnpm format` behaviours but only against staged files, keeping feedback fast.

---

## Testing strategy

- **Unit tests (web):** Vitest (`tests/**/*.test.ts`).
- **Unit tests (API):** Jest (`apps/api/test/**/*.spec.ts`) with ts-jest.
- **API verification:** The NestJS service exposes `/health` and `/v1/users/me`; compose higher-level tests by hitting the compiled server or mocking services.
- **Extending coverage:** Create additional suites under `tests/` for web code and `apps/api/test/` for API modules.

Run locally with:

```bash
pnpm test          # Web Vitest suites
pnpm test:api      # NestJS Jest suites
```

---

## Continuous integration

CI is configured via `.github/workflows/ci.yml` and runs on every push to `main` and each pull request:

1. Install dependencies with npm (Node.js 20 with caching).
2. Run `npm run lint` (which delegates to the shared linting/typecheck scripts).
3. Run `npm run build` to ensure the production bundle compiles.

> Although CI uses npm today, the underlying scripts are package-manager agnostic, so you can run `pnpm lint`, `pnpm build`, etc. locally without discrepancies.

Keep the CI green by ensuring the lint/typecheck/test/build commands pass locally before opening a pull request.

---

## Deployment notes

1. Capture environment variables from `.env.example` (web) and `.env.example.api` (NestJS) and configure them in your hosting provider (Vercel, Fly.io, Render, etc.).
2. Build the application: `pnpm build`.
3. Build the API: `pnpm build:api`.
4. Run the production servers: `pnpm start` for web, `pnpm start:api` (or `node apps/api/dist/main.js`) for the API.
5. Provision PostgreSQL and apply migrations with `pnpm prisma migrate deploy` during deployment.
6. Monitor `/health` for the API and `/api/healthz` for the Next.js route-level health check.

When containerising, mount the `docker-compose.yml` Postgres configuration as a reference for required variables or use the multi-stage `apps/api/Dockerfile` for the NestJS service.

---

## Contribution guidelines

1. **Branching strategy**
   - `main` stays deployable at all times.
   - Use topic branches prefixed by type, e.g. `feature/<ticket>`, `fix/<issue>`, `chore/<description>`.

2. **Commit style**
   - Follow [Conventional Commits](https://www.conventionalcommits.org/) enforced by Commitlint.
   - Examples: `feat: add onboarding hero`, `fix(api): handle missing auth header`, `chore: update dependencies`.

3. **Pre-commit checks**
   - Husky runs automatically after `pnpm install` thanks to the `prepare` script.
   - `lint-staged` applies Prettier and ESLint fixes to staged files before the commit is created.

4. **Pull requests**
   - Rebase on the latest `main` before requesting review.
   - Ensure `pnpm lint`, `pnpm test`, and `pnpm build` succeed locally.
   - Update documentation (`README.md`, `.env.example`, etc.) when behaviour or configuration changes.

---

## Troubleshooting

| Issue | Symptoms | Resolution |
| --- | --- | --- |
| Prisma cannot reach the database | `P1001` errors during `pnpm prisma` commands | Confirm `docker compose up db` is running, check `POSTGRES_HOST/PORT` values, ensure the container port is not already in use. |
| `prisma migrate dev` fails due to existing migrations | Error indicating drift or unapplied changes | Run `pnpm prisma migrate status` to inspect drift. If resetting locally is acceptable, execute `pnpm prisma migrate reset` (this wipes local data). |
| Postgres container fails to start | Container exits immediately | Remove the volume with `docker compose down --volumes` and try again; stale data can prevent boot. |
| `pnpm test` cannot find modules | Typings mismatch or missing install | Run `pnpm install` to regenerate `node_modules` and `pnpm prisma generate` if the client types changed. |
| Husky hooks not executing | No pre-commit linting/formatting occurs | Ensure you have run `pnpm install` (installs hooks via `prepare`) and that the scripts inside `.husky/` remain executable (`chmod +x .husky/*`). |

Need more help? Open an issue or reach out to the project maintainers with reproduction steps.
