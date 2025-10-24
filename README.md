# Platform Web – Developer Guide

This repository is a pnpm/Turborepo monorepo that currently contains a Next.js 14 web
application located in `apps/web`. The application uses passwordless authentication powered by
NextAuth, Prisma, and a reusable magic-link email flow. It also provides a protected dashboard that
proxies profile information from a NestJS backend via `/api/users/me`.

## Tech stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict) with Zod-based environment validation
- **Styling:** Tailwind CSS with shared UI primitives under `packages/ui`
- **Authentication:** NextAuth v4 with Prisma adapter (magic link + GitHub OAuth placeholders)
- **Database:** PostgreSQL via Prisma client in `packages/db`
- **Tooling:** pnpm, Turborepo, ESLint, Prettier, Vitest, Playwright, Husky, lint-staged, Commitlint

## Repository layout

```
apps/
  web/                 # Next.js application
    app/               # App Router routes
    src/               # Application libs, providers, env helpers, components
    tests/             # Vitest and Playwright tests
packages/
  db/                  # Prisma client + schema shared across apps
  ui/                  # Tailwind-powered UI primitives
```

## Prerequisites

- **Node.js 20.x** (installs `corepack` for pnpm)
- **pnpm 9.x**
- **Docker** (optional, for PostgreSQL or container builds)

Check versions:

```bash
node --version
pnpm --version
docker compose version
```

## Getting started

1. **Install dependencies**
   ```bash
   corepack enable   # one-time setup for pnpm
   pnpm install
   ```

2. **Configure environment variables**
   ```bash
   cp apps/web/.env.example.web apps/web/.env.local
   ```

   Update the copied file with values for:

   | Variable | Description |
   | --- | --- |
   | `NEXT_PUBLIC_APP_NAME` | Display name used across the UI |
   | `NEXT_PUBLIC_API_BASE_URL` | Base URL the browser calls (usually `http://localhost:3000/api`) |
   | `NEXTAUTH_SECRET` | Random string used to sign NextAuth tokens |
   | `NEXTAUTH_URL` | Public URL of the web app (e.g. `http://localhost:3000`) |
   | `EMAIL_FROM` | From address for magic link emails |
   | `BACKEND_API_URL` | Base URL for the NestJS service (e.g. `http://localhost:3333`) |
   | `GITHUB_ID` / `GITHUB_SECRET` | Optional GitHub OAuth credentials |

3. **(Optional) Run PostgreSQL**
   ```bash
   docker compose up db -d
   ```

4. **Generate the Prisma client**
   ```bash
   pnpm --filter @repo/db generate
   ```

5. **Start the dev server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to verify the application is running.

## Useful scripts

All commands are executed from the repository root unless otherwise noted.

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Next.js dev server for `apps/web` |
| `pnpm build` | Build all workspaces via Turborepo |
| `pnpm start` | Run the production server (after `pnpm build`) |
| `pnpm lint` | Execute ESLint across projects |
| `pnpm typecheck` | Run TypeScript in `--noEmit` mode |
| `pnpm test` | Run Vitest suites |
| `pnpm --filter web test:e2e` | Execute Playwright smoke tests |
| `pnpm --filter @repo/db migrate:dev` | Apply Prisma migrations locally |

> Husky + lint-staged ensure formatting and linting are enforced on commits.

## Testing

- **Unit & component tests:** Vitest with React Testing Library (`apps/web/tests/**/*.test.tsx`).
- **Auth/env logic tests:** Validated alongside component tests.
- **End-to-end smoke test:** Playwright script in
  `apps/web/tests/e2e/auth.spec.ts` walks through the magic-link login flow and verifies that the
  protected dashboard is reachable.

Run everything with:

```bash
pnpm test                     # Vitest
pnpm --filter web test:e2e     # Playwright
```

## Authentication flow

1. Users request a magic link from `/sign-in`. We use a development transport (`nodemailer`
   stream transport) and log magic links to the console.
2. During development, the latest link can be fetched via
   `/api/testing/verification-link?email=<user>` to support automated testing.
3. The dashboard (`/dashboard`) requires an active session. It proxies requests to
   `/api/users/me`, which forwards the bearer token to the NestJS service at
   `${BACKEND_API_URL}/v1/users/me`.

## Prisma / database management

The Prisma schema lives in `packages/db/prisma/schema.prisma` and powers the NextAuth models. To
adjust the schema:

```bash
pnpm --filter @repo/db migrate:dev -- --name add_table
pnpm --filter @repo/db generate
```

For production deployments, run `pnpm --filter @repo/db migrate:deploy`.

## Docker image

A production-ready container image can be built with:

```bash
docker build -t platform-web .
```

The `Dockerfile` performs a multi-stage, pnpm-based build optimised for Vercel-style deployments. It
runs the standalone Next.js server and exposes port `3000`.

Run the container:

```bash
docker run --env-file apps/web/.env.local -p 3000:3000 platform-web
```

## Turborepo pipelines

Turborepo orchestrates tasks via `turbo.json`:

- `build`, `lint`, `test`, and `typecheck` all cascade to dependencies before running a task in the
  target package.
- `dev` remains uncached to ensure fast iteration in development.

## Troubleshooting

| Issue | Resolution |
| --- | --- |
| Missing magic link email | Check server logs for the generated URL or query `/api/testing/verification-link`. |
| Dashboard proxy returns errors | Ensure `BACKEND_API_URL` is reachable and the session token is forwarded correctly. |
| Prisma client missing | Run `pnpm --filter @repo/db generate` after modifying the schema. |
| Playwright test hangs | Confirm the dev server started (Playwright manages this automatically via `webServer`). |

For questions or enhancements, open an issue or reach out to the maintainers.
