# Next.js 14 App Router Starter

This repository contains a minimal Next.js 14 project configured with the App Router, TypeScript, Tailwind CSS, ESLint, and Prettier. It provides a productive baseline with strict typing, absolute imports, and a health-check API route.

## Getting Started

Install dependencies and start the local development server:

```bash
pnpm install
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000). The root page renders a placeholder marketing layout showcasing the configured Tailwind utility classes.

## Docker

A multi-stage Dockerfile and Compose configuration are included for both development and production workflows.

### Development profile

```bash
docker compose --profile dev up --build
```

This command builds the `app` service using the development target, starts the Next.js server with hot reload, and provisions the PostgreSQL database. Source changes are watched automatically thanks to the mounted project volume. Use <kbd>Ctrl</kbd> + <kbd>C</kbd> or `docker compose --profile dev down` to stop the stack.

You can run project scripts inside the development container, for example:

```bash
docker compose run --rm --profile dev app pnpm lint
docker compose run --rm --profile dev app pnpm typecheck
docker compose run --rm --profile dev app pnpm build
```

### Production profile

Build and run the optimized production image:

```bash
docker compose --profile prod up --build
```

This profile uses the multi-stage build output to run Next.js in production mode behind a non-root user while reusing the shared PostgreSQL database service. The application is exposed on port `3000` by default.

While the containers are running, Docker monitors the `/api/health` endpoint to ensure the application is healthy.

## Available Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Runs the Next.js development server.              |
| `pnpm lint`          | Lints the project using the Next.js ESLint preset. |
| `pnpm typecheck`     | Validates TypeScript types without emitting files. |
| `pnpm build`         | Creates a production build of the application.    |
| `pnpm start`         | Starts the production server.                     |
| `pnpm format`        | Formats all files with Prettier.                  |
| `pnpm format:check`  | Checks formatting without making changes.        |
| `pnpm prisma:migrate` | Runs Prisma migrations in development.           |
| `pnpm prisma:generate` | Generates the Prisma Client.                    |
| `pnpm prisma:seed`   | Seeds the database with demo data.                |

## Tooling

- **TypeScript** configured in `strict` mode with absolute imports via the `@/*` alias.
- **Tailwind CSS** with default configuration, custom theme extensions, and global base styles.
- **ESLint** using the Next.js + TypeScript presets with an additional rule to prevent accidental console logging.
- **Prettier** for consistent code formatting across the project.
- **pnpm workspace** root for future expansion.

## Database

1. Copy `.env.example` to `.env` and adjust any environment variables if necessary.
2. Start PostgreSQL for local development: `docker compose --profile dev up -d db`.
3. Generate the Prisma Client (optional, runs automatically on install): `pnpm prisma:generate`.
4. Apply the latest migrations: `pnpm prisma:migrate`.
5. Seed the database with a demo user: `pnpm prisma:seed`.

## API

A simple health-check endpoint is available at `/api/health` and responds with a JSON payload containing status information.

```
GET /api/health -> { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

Use this route for infrastructure monitoring or load balancer health probes.
