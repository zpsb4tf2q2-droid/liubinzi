# Next.js 14 App Router Starter

This repository contains a minimal Next.js 14 project configured with the App Router, TypeScript, Tailwind CSS, ESLint, and Prettier. It provides a productive baseline with strict typing, absolute imports, and a health-check API route.

## Getting Started

Install dependencies and start the local development server:

```bash
pnpm install
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000). The root page renders a placeholder marketing layout showcasing the configured Tailwind utility classes.

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
2. Start PostgreSQL for local development: `docker compose up -d db`.
3. Generate the Prisma Client (optional, runs automatically on install): `pnpm prisma:generate`.
4. Apply the latest migrations: `pnpm prisma:migrate`.
5. Seed the database with a demo user: `pnpm prisma:seed`.

## API

A simple health-check endpoint is available at `/api/health` and responds with a JSON payload containing status information.

```
GET /api/health -> { "status": "ok", "timestamp": "2024-01-01T00:00:00.000Z" }
```

Use this route for infrastructure monitoring or load balancer health probes.
