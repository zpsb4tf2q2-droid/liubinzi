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

| Command               | Description                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`            | Runs the Next.js development server.                                        |
| `pnpm lint`           | Lints the project using the Next.js ESLint preset.                           |
| `pnpm typecheck`      | Validates TypeScript types without emitting files.                           |
| `pnpm build`          | Creates a production build of the application.                              |
| `pnpm start`          | Starts the production server.                                               |
| `pnpm format`         | Formats all files with Prettier.                                            |
| `pnpm format:check`   | Checks formatting without making changes.                                   |
| `pnpm test`           | Runs Vitest unit and integration suites against the Postgres test database. |
| `pnpm test:watch`     | Watches and re-runs Vitest suites on changes.                               |
| `pnpm e2e`            | Executes Playwright end-to-end tests.                                       |
| `pnpm prisma:migrate` | Runs Prisma migrations in development.                                      |
| `pnpm prisma:generate`| Generates the Prisma Client.                                                |
| `pnpm prisma:seed`    | Seeds the database with demo data.                                          |

## Tooling

- **TypeScript** configured in `strict` mode with absolute imports via the `@/*` alias.
- **Tailwind CSS** with default configuration, custom theme extensions, and global base styles.
- **ESLint** using the Next.js + TypeScript presets with an additional rule to prevent accidental console logging.
- **Prettier** for consistent code formatting across the project.
- **Vitest** for fast unit and integration testing with Prisma-backed routes.
- **Playwright** for end-to-end test coverage of the demo dashboard flow.
- **pnpm workspace** root for future expansion.

## Database

1. Copy `.env.example` to `.env` and adjust any environment variables if necessary.
2. Start PostgreSQL for local development: `docker compose up -d db`. The compose file provisions both the main database (`POSTGRES_DB`) and a fresh test database (`POSTGRES_TEST_DB`) on every start.
3. Generate the Prisma Client (optional, runs automatically on install): `pnpm prisma:generate`.
4. Apply the latest migrations: `pnpm prisma:migrate`.
5. Seed the database with demo data: `pnpm prisma:seed`.

## Demo Dashboard

Visit [`/dashboard`](http://localhost:3000/dashboard) to explore a simple authenticated workflow for managing projects and tasks. The UI exercises the Prisma-backed API routes and is used by the Playwright end-to-end test suite.

## API

- `GET /api/health` — Health-check endpoint that returns a JSON payload containing status information.
- `POST /api/auth/login` — Creates or updates a user by email and returns the user identifier for authenticated requests.
- `GET /api/projects` — Lists the authenticated user's projects and related tasks.
- `POST /api/projects` — Creates a project for the authenticated user.
- `DELETE /api/projects/:projectId` — Deletes a project and cascades associated tasks.
- `POST /api/projects/:projectId/tasks` — Adds a task to the project.
- `PATCH /api/projects/:projectId/tasks/:taskId` — Updates task metadata such as completion status or title.
- `DELETE /api/projects/:projectId/tasks/:taskId` — Removes a task from the project.

All project and task routes require an `x-user-id` header containing the user identifier returned by the login endpoint.

## Testing

- `pnpm test` loads `.env.test`, connects to the isolated Postgres test database, and runs both unit and integration suites with Vitest.
- `pnpm e2e` boots the Next.js dev server automatically and runs the Playwright scenario that covers authentication plus project and task CRUD interactions.
- Ensure PostgreSQL is running locally (`docker compose up -d db`) before executing either command so that the test database can be reset.
- On the first run, install browser binaries with `pnpm exec playwright install --with-deps`.
