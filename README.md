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
      server.ts    # Standalone Node.js API used during local development

prisma/
  schema.prisma    # Datasource + generator configuration (extend with models as needed)

scripts/
  wait-for-db.mjs  # Utility invoked by Docker Compose to block until Postgres is ready

tests/
  healthz-route.test.ts  # Example Vitest suite covering the health endpoint
```

The project uses the Next.js App Router, allowing you to colocate UI, server actions, and API routes. Prisma is configured to target the `DATABASE_URL` from your environment and is ready for further schema modelling. Tests are executed with Vitest in a Node environment.

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

Copy `.env.example` to `.env` and adjust values as necessary. The template is organised by concern and documented below.

```bash
cp .env.example .env
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
| `API_HOST` | Host binding for the standalone API server. | `0.0.0.0` |
| `API_PORT` | Port exposed by the API service. | `4000` |
| `WEB_HOST` | Host binding for the Next.js dev server. | `0.0.0.0` |
| `WEB_PORT` | Port exposed by the Next.js dev server. | `3000` |
| `DATABASE_URL` | Connection string used by Prisma. | `postgresql://postgres:postgres@localhost:5432/project?schema=public` |

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

3. **Launch the Docker Compose development stack (database + API + web)**
   ```bash
   pnpm dev:docker        # attach to logs
   # or start detached
   pnpm dev:docker:detach
   ```
   The stack waits for PostgreSQL to report healthy before booting the API/web containers. Application code is mounted from your working directory so hot reloading works out of the box.

4. **Run database migrations when the schema changes**
   ```bash
   pnpm db:migrate
   ```
   This script wraps `prisma migrate dev` and requires the Postgres container to be running. Until you add models to `schema.prisma` Prisma will remind you that nothing needs to be migrated.

5. **Visit the running services**
   - Web app: [http://localhost:3000](http://localhost:3000)
   - API health: [http://localhost:4000/healthz](http://localhost:4000/healthz)

Next.js still supports `pnpm dev` outside Docker if you prefer to run everything directly on your host machine.

---

## Local development workflow

- `pnpm dev:docker` orchestrates PostgreSQL, the standalone API, and the Next.js web app with hot reloading enabled in each container.
- Prefer `pnpm dev:api` and `pnpm dev` if you want to run the API or web server directly on your host without Docker.
- Code formatting and linting are consolidated into reusable pnpm scripts.
- Husky hooks (installed automatically via the `prepare` script) run `lint-staged` on staged files before every commit and enforce Conventional Commits via Commitlint.
- Vitest provides fast feedback for unit tests. Add new tests under `tests/`.

---

## Docker Compose stack

The root `docker-compose.yml` wires together the runtime dependencies used during development:

- **db** &mdash; PostgreSQL 16 with a persistent volume (`postgres-data`) and a built-in healthcheck.
- **api** &mdash; Node.js 20 container running `pnpm dev:api` after waiting for the database to become available.
- **web** &mdash; Node.js 20 container running the Next.js dev server with hot module reload.

All services join the `project` bridge network so they can reference each other by service name (e.g. the API reaches Postgres via `db:5432`). Ports 4000 (API) and 3000 (web) are published to the host, and both services expose health endpoints:

- API service: `http://localhost:4000/healthz`
- Next.js route: `http://localhost:3000/api/healthz`

The containers rely on the `.env` file in the project root. Copy the example file before running Docker Compose to avoid missing environment variables. Install dependencies with `pnpm install` on the host so `node_modules/` is available to the containers.

---

## Database & migrations

Prisma is configured with a PostgreSQL datasource (`prisma/schema.prisma`). When you add models:

1. Update `schema.prisma` with your changes.
2. Create a new migration once Postgres is running:
   ```bash
   pnpm db:migrate --name add_your_model
   ```
3. For CI/production, apply migrations deterministically:
   ```bash
   pnpm db:migrate:deploy
   ```
4. Regenerate the Prisma client whenever the schema changes:
   ```bash
   pnpm db:generate
   ```
   > The starter schema doesn't define models yet, so Prisma will print a reminder until you add your own models. Until you add models `pnpm db:migrate` will exit early with a descriptive message.

---

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server on the host machine. |
| `pnpm dev:api` | Run the standalone API server with hot reloading (via `tsx`). |
| `pnpm dev:docker` | Bring up the Docker Compose stack and attach to service logs. |
| `pnpm dev:docker:build` | Rebuild service images before starting the stack. |
| `pnpm dev:docker:detach` | Start the Docker Compose stack in the background. |
| `pnpm docker:down` | Stop the Docker Compose stack. |
| `pnpm docker:clean` | Stop the stack and remove volumes/orphaned containers. |
| `pnpm db:migrate` | Run `prisma migrate dev` (supports `--name` for migration labels). |
| `pnpm db:migrate:deploy` | Apply migrations in deploy mode (used for CI/production). |
| `pnpm db:reset` | Reset the local database using Prisma. |
| `pnpm db:generate` | Regenerate the Prisma client. |
| `pnpm db:studio` | Launch Prisma Studio. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Run the production server (after `pnpm build`). |
| `pnpm typecheck` | Run the TypeScript compiler in `--noEmit` mode. |
| `pnpm lint` | Run type-checking and ESLint with `--max-warnings=0`. |
| `pnpm lint:eslint` | Run ESLint alone. |
| `pnpm lint:fix` | Auto-fix lint issues where possible. |
| `pnpm format` | Format the entire repository with Prettier. |
| `pnpm format:check` | Check formatting without writing changes. |
| `pnpm test` | Execute Vitest in run mode. |
| `pnpm prisma ...` | Forward Prisma CLI commands (e.g. `pnpm prisma db pull`). |

`lint-staged` mirrors the `pnpm lint:eslint` and `pnpm format` behaviours but only against staged files, keeping feedback fast.

---

## Testing strategy

- **Unit tests:** Vitest (`tests/**/*.test.ts`).
- **API verification:** The example suite exercises the `/api/healthz` endpoint by calling the exported handler directly.
- **Extending coverage:** Create additional suites under `tests/` and rely on the Vitest Node environment. For React component tests, configure `@testing-library/react` and a jsdom environment.

Run locally with:

```bash
pnpm test
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

1. Capture environment variables from `.env.example` and configure them in your hosting provider (Vercel, Fly.io, Render, etc.).
2. Build the application: `pnpm build`.
3. Run the production server: `pnpm start` (uses the `API_PORT` specified in `.env`).
4. Provision PostgreSQL and apply migrations with `pnpm db:migrate:deploy` during deployment.
5. Monitor `/api/healthz` for liveness checks.

When containerising, mount the `docker-compose.yml` Postgres configuration as a reference for required variables.

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
