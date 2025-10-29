# liubinzi

A TypeScript-first service skeleton for the future liubinzi platform.

> liubinzi currently ships a minimal HTTP service while we design the full product surface; the codebase will expand into a full-stack application over time.

## Table of contents

- [Overview](#overview)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Authentication](#authentication)
  - [Database](#database)
  - [Observability](#observability)
- [Prerequisites](#prerequisites)
- [Initial setup](#initial-setup)
- [Running the app locally](#running-the-app-locally)
  - [Via pnpm](#via-pnpm)
  - [Via Docker](#via-docker)
- [Database and migrations](#database-and-migrations)
- [Available scripts](#available-scripts)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Contribution guidelines](#contribution-guidelines)
- [License](#license)

## Overview

liubinzi is a Node.js + TypeScript foundation for the next generation of the liubinzi product. The current implementation exposes a lightweight HTTP server with a `/health` endpoint so that contributors can verify tooling, iterate on coding standards, and expand the platform safely. As we add features, this repository will grow into a full-stack application with a modern web frontend, authenticated APIs, a relational database, and production-ready observability.

## Tech stack

- [Node.js 20+](https://nodejs.org/) for the runtime (see the `.nvmrc` file for the preferred version).
- [TypeScript](https://www.typescriptlang.org/) for static typing.
- [pnpm](https://pnpm.io/) (enabled via [Corepack](https://nodejs.org/api/corepack.html)) as the primary package manager.
- [Jest](https://jestjs.io/) for unit testing.
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for linting and formatting.
- [Husky](https://typicode.github.io/husky/) for Git hook automation.

Planned additions as the product matures:

- [Next.js](https://nextjs.org/) for the frontend experience.
- [Prisma](https://www.prisma.io/) with PostgreSQL for data access and migrations.
- Structured logging, metrics, and tracing libraries to enhance observability.

## Architecture

### Frontend

A frontend package is not yet included. The plan is to introduce a Next.js 14+ application under a dedicated directory (for example, `apps/web`). When that lands, the frontend will communicate with the backend APIs described below and share TypeScript types via a common package. You can learn more about the framework we plan to adopt in the [Next.js documentation](https://nextjs.org/docs).

### Backend

The backend lives in [`src/index.ts`](./src/index.ts) and currently exposes a minimal HTTP surface while we bootstrap the rest of the stack:

- `GET /health` returns `{ "status": "ok" }` so uptime probes and local scripts can confirm the service is healthy.
- `POST /auth/login` accepts `{ "email": string, "password": string }` and authenticates against a placeholder secret (`password123`). Successful responses include a deterministic, hashed `userId` and echo the request identifier so you can trace the call through the structured logs.

It uses Node's built-in [`http`](https://nodejs.org/api/http.html) module to keep the footprint minimal while we iterate. Expect this layer to evolve into a richer REST or RPC surface and eventually move under a dedicated directory (for example, `apps/api`) once routing, controllers, and domain modules are added.

### Authentication

Authentication and authorization are not yet implemented. A mock `/auth/login` route exists purely to exercise the observability stack and validates credentials against a hard-coded secret. The intended design is to centralize auth in the backend service with stateless JWT or session token support and to enforce route-level access controls. We will document token issuance, refresh strategies, and client integration once the auth layer lands.

### Database

No database connection exists today. We plan to introduce PostgreSQL alongside Prisma Migrate to manage schema evolution. Database models, client access, and migration artifacts will live in a future `prisma/` directory. Until that is in place, the service operates purely in-memory.

### Observability

The service now ships with opt-in telemetry to make debugging and monitoring predictable.

#### Sentry instrumentation

- Export `SENTRY_DSN` to enable server-side error forwarding. Without a DSN the SDK stays inert so local development behaves exactly as before.
- Optionally set `SENTRY_ENV` and `SENTRY_TRACES_SAMPLE_RATE` (0–1) to control the environment tag and tracing sample rate.
- Request handlers attach the `requestId`, route metadata, and sanitized user context to every captured exception.

Browser clients can reuse the helper in [`src/observability/sentry.browser.ts`](./src/observability/sentry.browser.ts):

```ts
import { initBrowserSentry } from '../observability/sentry.browser';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  initBrowserSentry({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_APP_ENV,
  });
}
```

The helper safely no-ops when executed in environments without a `window` global or when no DSN is provided.

#### Structured logging

Structured logging is powered by [pino](https://getpino.io/#/) and enriches every entry with the `requestId`, HTTP metadata, and (when available) sanitized user identifiers. Responses emit an `x-request-id` header so clients can correlate their calls with log entries and Sentry events.

#### Configuration reference

| Variable | Purpose | Default |
| --- | --- | --- |
| `SENTRY_DSN` | Enables Sentry instrumentation when present. | _unset_ |
| `SENTRY_ENV` | Sentry environment tag. | `NODE_ENV` or `development` |
| `SENTRY_TRACES_SAMPLE_RATE` | Fraction (0–1) of requests captured for tracing. | _unset_ |
| `LOGGING_ENABLED` | Set to `false` to silence log output while keeping APIs functional. | `true` |
| `LOG_LEVEL` | Pino log level. | `debug` (non-production) / `info` (production) |
| `LOG_ENV` | Overrides the `environment` field in log output. | `NODE_ENV` |
| `SERVICE_NAME` | Sets the `service` field on every log entry. | `liubinzi-service` |

#### Consuming structured logs

Because log lines are JSON you can pipe them directly into tooling such as `jq`, Logstash, or your log aggregation platform:

```bash
pnpm dev 2>&1 | jq '. | {level, event, requestId, msg}'
```

To debug a single request end to end, grab the `x-request-id` header from the response and filter:

```bash
cat server.log | jq 'select(.requestId == "req-123")'
```

This workflow lets you test observability locally before wiring the output into your preferred monitoring stack.

## Prerequisites

Before you start, install the following tools locally:

- **Node.js 20 or newer** – manage versions with [nvm](https://github.com/nvm-sh/nvm) or the official installers.
- **pnpm 9+** – enable via `corepack enable` or install manually; see the [pnpm docs](https://pnpm.io/installation).
- **Docker** (optional) – [Docker Desktop](https://www.docker.com/products/docker-desktop/) or an equivalent runtime to run the project in a containerized environment.
- **Git** for version control operations.
- **curl** or any HTTP client to verify the `/health` endpoint.

## Initial setup

1. Clone the repository and enter the directory:
   ```bash
   git clone https://github.com/<your-org>/liubinzi.git
   cd liubinzi
   ```
2. Align with the recommended Node.js version:
   ```bash
   nvm install
   nvm use
   ```
   If you do not use `nvm`, ensure you are running Node 20 or newer.
3. Enable Corepack and activate pnpm (only required the first time):
   ```bash
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
4. Install dependencies:
   ```bash
   pnpm install
   ```
   A legacy `package-lock.json` remains for CI compatibility while we transition to pnpm everywhere; do not modify or commit changes to it unless instructed.
5. (Optional) Configure Git hooks locally so that Husky can run its checks:
   ```bash
   pnpm dlx husky install
   ```

## Running the app locally

### Via pnpm

1. (Optional) Export a custom port if you do not want to use the default:
   ```bash
   export PORT=4000
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```
   The server listens on `PORT` (defaults to `3000`) and restarts automatically on file changes via `ts-node-dev`.
3. Verify the health endpoint from another terminal:
   ```bash
   curl http://localhost:3000/health
   ```
   You should receive `{"status":"ok"}`.
4. Exercise the sample auth route to observe structured logs and Sentry context:
   ```bash
   curl -i -X POST http://localhost:3000/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"email":"demo@example.com","password":"password123"}'
   ```
   The response echoes a hashed `userId` and the `x-request-id` header. Try an invalid password to watch the warning log emitted for failed authentication attempts.

To run the production build locally:

```bash
pnpm build
pnpm start
```

### Via Docker

A dedicated Dockerfile is not yet checked in, but you can run the service inside an official Node container:

```bash
docker run --rm -it \
  -p 3000:3000 \
  -v "$(pwd)":/app \
  -w /app \
  node:20-bullseye-slim bash -lc "corepack enable && pnpm install && pnpm dev"
```

- Adjust the published port (`-p` flag) if you changed `PORT`.
- The command mounts your working copy so that code changes on the host trigger restarts in the container.

## Database and migrations

A database layer has not been introduced yet, so there are no migrations to run. When Prisma and PostgreSQL support land, migration files will live under `prisma/migrations`, and you will apply them with:

```bash
pnpm exec prisma migrate deploy
```

We will update this documentation once the database schema is available. For an overview of the tooling we plan to use, see the [Prisma Migrate documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate).

## Available scripts

| Command | Description |
| ------- | ----------- |
| `pnpm dev` | Starts the TypeScript development server with live reload. |
| `pnpm build` | Compiles the TypeScript source into JavaScript in `dist/`. |
| `pnpm start` | Runs the compiled production build (`dist/index.js`). |
| `pnpm lint` | Runs ESLint across the codebase. |
| `pnpm format` | Formats files with Prettier. |
| `pnpm test` | Executes the Jest test suite once. |
| `pnpm test:watch` | Runs Jest in watch mode for rapid feedback. |

## Testing

Unit tests live under [`src/__tests__`](./src/__tests__). Run them locally with:

```bash
pnpm test
```

During development, `pnpm test:watch` reruns tests affected by your latest changes. All tests must pass before opening a pull request; our CI pipeline runs `pnpm lint`, `pnpm test`, and `pnpm build` on every push.

## Troubleshooting

- **`pnpm: command not found`** – run `corepack enable` (Node 16.13+ ships Corepack) or install pnpm globally as described in the [official guide](https://pnpm.io/installation).
- **Port already in use** – change the port by exporting `PORT=<new-port>` before starting the server, or free the conflicting process.
- **Husky hooks are not executing** – ensure you ran `pnpm dlx husky install` after cloning. Hooks live under `.husky/`; reinstalling Husky rewrites `.git/hooks/` with the proper scripts.
- **`lint-staged` errors during commit** – the hook runs `npx lint-staged`. If configuration is missing, create a `.lintstagedrc` file that targets the files you care about or temporarily skip the hook with `HUSKY=0 git commit` (not recommended for regular development).
- **Docker on Apple Silicon** – when using the Docker command above on Apple Silicon, swap `node:20-bullseye-slim` with `node:20-bullseye` to take advantage of multi-architecture support.

## Contribution guidelines

We welcome contributions of all sizes:

- Discuss non-trivial changes in an issue first using the [bug report](.github/ISSUE_TEMPLATE/bug_report.md) or [feature request](.github/ISSUE_TEMPLATE/feature_request.md) templates.
- Create feature branches off `main` and open pull requests using the [PR template](.github/PULL_REQUEST_TEMPLATE.md).
- Run `pnpm lint`, `pnpm test`, and (if relevant) `pnpm build` before pushing.
- Husky's `pre-commit` hook runs `npx lint-staged`; keep your staged files clean so the hook can succeed.
- Prefer short, imperative commit messages (for example, `feat: add health endpoint`). Aligning with [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) makes changelog automation easier once we add release tooling.
- Avoid committing generated artifacts or lockfiles for tools we do not yet support.

## License

This project is licensed under the [MIT License](./LICENSE).
