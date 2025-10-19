# Next.js + Prisma + PostgreSQL (Docker) Starter

This branch sets up a minimal Next.js application with Prisma and a local PostgreSQL database using Docker Compose. It includes an Auth.js-ready Prisma schema (User, Account, Session, VerificationToken) and a seed script to populate sample data for the auth flow.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and pnpm (optional when running outside Docker)

## Getting Started (with Docker)

1. Copy the environment example file:
   
   cp .env.example .env

2. Start the app and database:
   
   docker-compose up --build

   - App: http://localhost:3000
   - Postgres: localhost:5432 (user: postgres / password: postgres)

3. Run database migrations and seed data inside the app container:
   
   docker-compose exec app pnpm prisma:migrate
   docker-compose exec app pnpm prisma:seed

   This will generate the database schema and insert demo records.

## Prisma

- Schema location: prisma/schema.prisma
- Generate Prisma Client:
  
  pnpm prisma:generate

- Create/Apply migrations (dev):
  
  pnpm prisma:migrate

- Push schema (no migration history):
  
  pnpm prisma:push

- Seed database:
  
  pnpm prisma:seed

The seed script creates a demo user with email user@example.com and related auth records (Account, Session, VerificationToken).

## Running without Docker (optional)

If you have a local Postgres running, set DATABASE_URL in a .env file in the project root, then run:

pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev

App will be available at http://localhost:3000.

## Docker Compose Services

- db: PostgreSQL 15 (alpine)
- app: Next.js dev server (Node 20, pnpm)

Volumes persist database data and allow hot-reload for the Next.js app.

## Notes

- The Prisma schema is compatible with Auth.js providers and models.
- postinstall runs prisma generate to keep the client in sync after installs.
