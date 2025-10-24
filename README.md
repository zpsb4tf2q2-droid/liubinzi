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
  schema.prisma    # Datasource + generator configuration (extend with models as needed)

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
| `NEXT_PUBLIC_API_BASE_URL` | Location of the API the browser should talk to. | `http://localhost:3000/api` |

### Server / API

| Variable | Description | Example |
| --- | --- | --- |
| `API_HOST` | Host binding for the Next.js server. | `0.0.0.0` |
| `API_PORT` | Port exposed by `pnpm dev` / `pnpm start`. | `3000` |
| `DATABASE_URL` | Connection string used by Prisma. | `postgresql://postgres:postgres@localhost:5432/project?schema=public` |

### Authentication (NextAuth & OAuth providers)

| Variable | Description | Example |
| --- | --- | --- |
| `NEXTAUTH_URL` | Base URL passed to NextAuth. Should match your deployment domain and include `/api/auth`. | `http://localhost:3000/api/auth` |
| `NEXTAUTH_SECRET` | Cryptographically secure secret used to sign NextAuth cookies. Generate per environment. | `openssl rand -base64 32` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID (if GitHub auth is enabled). | `ov1d123example` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret. | `super-secret` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (if Google auth is enabled). | `12345-example.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. | `super-secret` |

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

5. **Launch the dev server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to validate the app is running.

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

### Shared prerequisites

- Capture the environment variables from `.env.example` and configure them in your hosting provider. Leave provider-specific secrets blank unless you enable that integration.
- Ensure your production PostgreSQL instance is reachable via `DATABASE_URL`.
- Run `pnpm prisma migrate deploy` as part of your release pipeline after new migrations are merged.

### Web (Vercel)

[`vercel.json`](./vercel.json) records the build configuration so Vercel can compile the application with pnpm:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Output directory: `.next`

After connecting the repository in Vercel, populate the required environment variables through **Settings → Environment Variables**. Suggested values are listed below:

| Key | Example value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_NAME` | `Project Starter` | Optional display name surfaced in the UI. |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.example.com/api` | Point this to the API deployment (Render or Railway). |
| `NEXTAUTH_URL` | `https://your-web-app.vercel.app/api/auth` | Must match the Vercel domain including `/api/auth`. |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | Generate a unique secret per environment. |
| `GITHUB_CLIENT_ID` | _(optional)_ | Provider credential if GitHub auth is enabled. |
| `GITHUB_CLIENT_SECRET` | _(optional)_ | Provider credential if GitHub auth is enabled. |
| `GOOGLE_CLIENT_ID` | _(optional)_ | Provider credential if Google auth is enabled. |
| `GOOGLE_CLIENT_SECRET` | _(optional)_ | Provider credential if Google auth is enabled. |
| `DATABASE_URL` | `postgresql://user:password@host:5432/db?schema=public` | Required if the web runtime executes Prisma queries. |

You can paste the values in bulk using Vercel's **Import Variables** dialog with a payload similar to:

```json
{
  "NEXT_PUBLIC_APP_NAME": "Project Starter",
  "NEXT_PUBLIC_API_BASE_URL": "https://api.example.com/api",
  "NEXTAUTH_URL": "https://your-web-app.vercel.app/api/auth",
  "NEXTAUTH_SECRET": "openssl rand -base64 32",
  "GITHUB_CLIENT_ID": "",
  "GITHUB_CLIENT_SECRET": "",
  "GOOGLE_CLIENT_ID": "",
  "GOOGLE_CLIENT_SECRET": "",
  "DATABASE_URL": "postgresql://user:password@host:5432/db?schema=public"
}
```

### API (Render)

Use [`render.yaml`](./render.yaml) as a blueprint when creating a Render Web Service backed by Docker:

1. Select **Docker** as the runtime and point Render at the repository root—the blueprint references the root [`Dockerfile`](./Dockerfile).
2. The container exposes port `3000` and runs `pnpm start -- --hostname 0.0.0.0 --port 3000`.
3. Configure the environment variables defined in `render.yaml` (at minimum `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and any provider credentials).
4. Set the health check path to `/api/healthz` to reuse the built-in status endpoint.
5. Trigger `pnpm prisma migrate deploy` after provisioning the database to apply migrations.

### API (Railway)

For Railway deployments, import [`railway.json`](./railway.json) when creating a new service:

1. Railway builds the container using the repository [`Dockerfile`](./Dockerfile); no extra start command is required.
2. The service listens on port `3000` and consumes secrets from the deployment environment—populate the keys declared in `railway.json`.
3. Configure a health check against `/api/healthz` for uptime monitoring.
4. Include `pnpm prisma migrate deploy` in your deployment pipeline to keep the schema in sync.

Both Render and Railway rely on the same production-ready Docker image, which avoids bundling `.env` files so that runtime configuration always comes from the hosting platform.

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
