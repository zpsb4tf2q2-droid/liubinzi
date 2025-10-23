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

prisma/
  migrations/      # Prisma migration history and SQL snapshots
  schema.prisma    # Datasource, generator, and NextAuth-compatible models
  seed.ts          # TypeScript seed script for local/demo data

tests/
  healthz-route.test.ts  # Example Vitest suite covering the health endpoint
```

The project uses the Next.js App Router, allowing you to colocate UI, server actions, and API routes. Prisma targets the `DATABASE_URL` from your environment, ships with a NextAuth-ready schema, and provides a seed script for demo data. Tests are executed with Vitest in a Node environment.

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
| `NEXT_PUBLIC_API_BASE_URL` | Location of the API the browser should talk to. | `http://localhost:3000/api` |

### Server / API

| Variable | Description | Example |
| --- | --- | --- |
| `API_HOST` | Host binding for the Next.js server. | `0.0.0.0` |
| `API_PORT` | Port exposed by `pnpm dev` / `pnpm start`. | `3000` |
| `DATABASE_URL` | Connection string used by Prisma. | `postgresql://postgres:postgres@localhost:5432/project?schema=public` |

### Authentication (NextAuth)

| Variable | Description | Example |
| --- | --- | --- |
| `NEXTAUTH_URL` | Base URL used for OAuth callbacks and email links. | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Random string for signing/encrypting NextAuth sessions. | `replace-with-a-strong-secret` |
| `NEXTAUTH_TRUST_HOST` | Set to `1` during local development to trust the incoming host header. | `1` |

#### OAuth provider placeholders

| Variable | Description | Example |
| --- | --- | --- |
| `GITHUB_ID` | GitHub OAuth application client ID. | `your-github-client-id` |
| `GITHUB_SECRET` | GitHub OAuth application client secret. | `your-github-client-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID. | `your-google-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. | `your-google-client-secret` |

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

4. **Apply database migrations**
   ```bash
   pnpm db:migrate
   ```

5. **Seed the database (optional but recommended for demo credentials)**
   ```bash
   pnpm db:seed
   ```

6. **Launch the dev server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to validate the app is running. See [Demo credentials](#demo-credentials) for the seeded login details.

---

## Demo credentials

Running `pnpm db:seed` will upsert a demo user that can be used for local authentication flows.

- **Email:** `demo.user@example.com`
- **Password:** `ChangeMe123!`

Re-run the seed command to restore the credentials if you change them during testing.

---

## Local development workflow

- Code formatting and linting are consolidated into reusable pnpm scripts.
- Husky hooks (installed automatically via the `prepare` script) run `lint-staged` on staged files before every commit and enforce Conventional Commits via Commitlint.
- Vitest provides fast feedback for unit tests. Add new tests under `tests/`.

---

## Database & migrations

Prisma is configured with a PostgreSQL datasource (`prisma/schema.prisma`) and the repository ships with an initial migration that provisions the NextAuth models. When you expand the schema:

- Update `schema.prisma` with your changes.
- Create and apply a new migration while Postgres is running:
  ```bash
  pnpm db:migrate -- --name add_your_model
  ```
- For quick experiments where you do not want to generate SQL, push the schema directly (may reset data for incompatible changes):
  ```bash
  pnpm db:push
  ```
- Reseed baseline data at any time:
  ```bash
  pnpm db:seed
  ```
- In CI/production, apply committed migrations deterministically:
  ```bash
  pnpm prisma migrate deploy
  ```

> Tip: When forwarding additional arguments to Prisma through the `pnpm db:*` scripts, separate them with `--` as shown above.

Running `db:migrate` or `db:push` automatically regenerates the Prisma client. If you need to trigger it manually, run `pnpm prisma generate`.

---

## Available scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm build` | Create a production build. |
| `pnpm start` | Run the production server (after `pnpm build`). |
| `pnpm typecheck` | Run the TypeScript compiler in `--noEmit` mode. |
| `pnpm lint` | Run type-checking and ESLint with `--max-warnings=0`. |
| `pnpm lint:eslint` | Run ESLint alone. |
| `pnpm lint:fix` | Auto-fix lint issues where possible. |
| `pnpm format` | Format the entire repository with Prettier. |
| `pnpm format:check` | Check formatting without writing changes. |
| `pnpm test` | Execute Vitest in run mode. |
| `pnpm db:migrate` | Run `prisma migrate dev` to create/apply migrations locally. |
| `pnpm db:push` | Push the Prisma schema to the database without generating SQL migrations. |
| `pnpm db:seed` | Execute the Prisma seed script and populate demo data. |
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
4. Provision PostgreSQL and apply migrations with `pnpm prisma migrate deploy` during deployment.
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
