# Developer Onboarding

## Overview
This project is a minimal Next.js 14 application wired up with the App Router, TypeScript, Tailwind CSS, and Prisma. A PostgreSQL container (via Docker Compose) backs the Prisma schema and seeds a demo `User` record to help you test sign-in flows immediately.

## Prerequisites
- **Node.js ≥ 20.16.0** – run `nvm use` (a `.nvmrc` is provided) or install manually.
- **pnpm ≥ 9** – enable with `corepack enable pnpm` if pnpm is not already available.
- **Docker Desktop or Docker Engine + docker compose.**
- **OpenSSL (optional)** – handy for generating secure secrets.

> Verify your toolchain before proceeding:
> ```bash
> node --version
> pnpm --version
> docker --version
> ```

## 1. Install dependencies
```bash
pnpm install
```
This command also triggers `prisma generate`, ensuring the Prisma Client reflects the current schema.

## 2. Configure environment variables
1. Duplicate the example file:
   ```bash
   cp .env.example .env
   ```
2. Confirm the database settings match your local setup. The defaults expect the Docker Compose PostgreSQL service (`postgres:postgres@localhost:5432/next_app`).
3. Set `NEXTAUTH_SECRET` to a unique string. A quick option is:
   ```bash
   openssl rand -base64 32
   ```
4. Update any other secrets that differ between environments. Never commit plain-text secrets to version control.

## 3. Start the database (Docker)
```bash
docker compose up -d db
```
- Check container health: `docker compose ps`.
- Tail logs if the service fails: `docker compose logs -f db`.
- The database uses the `postgres-data` volume so that data persists between restarts.

## 4. Prepare the database schema
Run the Prisma helpers from the project root:
```bash
pnpm prisma:generate   # regenerates the Prisma Client (safe to re-run)
pnpm prisma:migrate    # applies migrations defined in prisma/migrations
pnpm prisma:seed       # inserts the demo user (demo@example.com)
```
You can re-seed safely; the script upserts the demo record.

## 5. Run the application
```bash
pnpm dev
```
The development server becomes available at <http://localhost:3000>. Hot reloading is enabled by default.

## Common scripts & workflows
| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server. |
| `pnpm test` | Runs linting followed by TypeScript type-checking to validate changes. |
| `pnpm build` | Produce an optimized production build. |
| `pnpm start` | Serve the production build locally (requires `pnpm build`). |
| `pnpm lint` | Run ESLint using the Next.js configuration. |
| `pnpm typecheck` | Perform a project-wide TypeScript check without emitting files. |
| `pnpm prisma:migrate` | Apply Prisma migrations to the database. |
| `pnpm prisma:seed` | Seed the database with the demo data set. |
| `docker compose up -d db` | Boot the PostgreSQL dependency in the background. |
| `docker compose down` | Stop containers and release network resources (data volume persists). |

> **End-to-end tests:** An automated E2E suite has not been introduced yet. Coordinate with product/QA for manual user flows until Playwright or Cypress coverage is added.

## Shutting everything down
When you finish working:
```bash
^C                     # stop pnpm dev if it is running
docker compose down    # stop the database container
```
Re-run the Docker and Prisma steps above the next time you return to the project.
