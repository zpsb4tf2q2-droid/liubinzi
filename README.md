# Project Documentation (Initial Draft)

Status: This repository is currently being initialized. Core application code, scripts, and configuration will be added in subsequent commits. This README captures the intended setup and will be kept in sync as the implementation lands.

If a command or file mentioned here does not yet exist (for example: docker-compose.yml, pnpm scripts, or migration tools), it is planned and will be introduced with the initial scaffolding.

---

## Overview

A modern, containerized Node.js service with pnpm for package management. Local development can run directly (pnpm dev) or via Docker Compose. A relational database (PostgreSQL) is planned for persistence with an ORM and migration/seed workflow. Automated tests and CI will ensure quality and prevent regressions.

## Tech Stack (planned)
- Runtime: Node.js (LTS)
- Package manager: pnpm
- Language: TypeScript (planned)
- Web framework: TBD (Express/Fastify are common choices)
- Database: PostgreSQL (via Docker)
- ORM/migrations: TBD (Prisma or Knex are common choices)
- Testing: TBD (Vitest or Jest)
- Linting/formatting: ESLint + Prettier
- Containerization: Docker + Docker Compose
- CI: GitHub Actions (planned)

Once the stack is finalized in code, this section will be updated to reflect the exact choices and versions.

## Repository Structure (planned)
- src/ — application source code
- tests/ — unit/integration tests
- prisma/ or migrations/ — schema and migration files
- docker/ — docker-related assets (optional)
- .github/workflows/ — CI pipelines (when added)
- .env.example — template of required environment variables (when added)

This will be updated as directories are added.

## Prerequisites
- Node.js LTS (recommend using nvm for version management)
- pnpm (https://pnpm.io/installation)
- Docker Desktop (macOS/Windows) or Docker Engine + Docker Compose Plugin (Linux)

Verify your setup:
- node -v
- pnpm -v
- docker --version
- docker compose version

## Getting Started (local, without Docker)
When the project is scaffolded, the following commands are expected to work:

1) Install dependencies
   pnpm install

2) Start the dev server (hot reload)
   pnpm dev

3) Build and run (production mode)
   pnpm build
   pnpm start

Note: Until package.json and scripts are added, these commands are placeholders.

## Running with Docker Compose
When docker-compose.yml is added, you will be able to run the full stack via:

- Start services in the background
  docker compose up -d
  # legacy Compose V1 (hyphenated) alternative:
  docker-compose up -d

- View app logs
  docker compose logs -f app
  # legacy Compose V1 (hyphenated) alternative:
  docker-compose logs -f app

- Stop and remove containers (and volumes)
  docker compose down -v
  # legacy Compose V1 (hyphenated) alternative:
  docker-compose down -v

Typical services (planned):
- app (Node.js service, exposed on port 3000 by default)
- db (PostgreSQL, exposed on port 5432 by default)

## Database: Migrations and Seeding
The exact tooling will be confirmed once the ORM is chosen. Below are the common options:

Option A: Prisma
- Apply migrations in dev
  pnpm prisma migrate dev
- Generate client
  pnpm prisma generate
- Seed database
  pnpm prisma db seed

Option B: Knex
- Apply latest migrations
  pnpm knex migrate:latest
- Rollback last batch
  pnpm knex migrate:rollback
- Run seeds
  pnpm knex seed:run

This README will be updated to one definitive workflow once the implementation lands.

## Testing
Test tooling will be added with the initial scaffolding. Common commands:
- Run tests once
  pnpm test
- Watch mode
  pnpm test:watch
- Coverage
  pnpm coverage

## Continuous Integration (CI) — Summary
CI will be configured (e.g., GitHub Actions) to:
- Install dependencies (pnpm install)
- Lint and format check (pnpm lint, pnpm format:check)
- Typecheck (pnpm typecheck)
- Run tests (pnpm test)
- Build (pnpm build)
- Optionally build and push Docker images on main branch

Until a workflow file exists under .github/workflows/, CI is not active.

## Environment Variables
Environment configuration will be provided through a .env file at the repo root and/or container environment variables. A .env.example will be committed with the required keys. Common variables you can expect:
- NODE_ENV=development|test|production
- PORT=3000
- DATABASE_URL=postgres://user:password@localhost:5432/database
- LOG_LEVEL=info
- JWT_SECRET=replace-with-strong-secret (if auth is implemented)

Do not commit real secrets. Keep only .env.example under version control. The actual .env should be git-ignored.

## Troubleshooting
- Docker not running
  Ensure Docker Desktop (or Docker Engine) is running. Check: docker ps

- docker compose command not found
  Install the Docker Compose plugin or use Docker Desktop. On Linux, ensure docker-compose V2 is installed so docker compose version works.

- Port is already in use (e.g., 3000 or 5432)
  Stop the conflicting process or change ports in docker-compose.yml and/or .env.

- Node version mismatch
  Use nvm to install the LTS version: nvm install --lts && nvm use --lts. Reinstall deps: pnpm install

- Dependency issues after switching Node versions
  Remove lockfile and node_modules, then reinstall: rm -rf node_modules pnpm-lock.yaml && pnpm install

- Database persistence issues with Docker
  If schema changes aren’t reflected, you may need to recreate containers/volumes during early development:
  docker compose down -v && docker compose up -d

- Prisma client not generated (if using Prisma)
  Run: pnpm prisma generate

## Contributing
- Use feature branches and open Pull Requests.
- Keep documentation updated when adding scripts or changing behavior.
- Add or adjust .env.example when environment variables change.

## License
TBD.
