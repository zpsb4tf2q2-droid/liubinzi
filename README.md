# liubinzi

This repository contains the base scaffold for a Next.js 14 application using the App Router, TypeScript, ESLint, and Prettier. The project is configured to use pnpm for dependency management and includes a minimal homepage to help you get started quickly.

## Prerequisites

- Node.js v20.19.5 (see [`.nvmrc`](./.nvmrc))
- [pnpm](https://pnpm.io/) (Corepack users can run `corepack enable pnpm`)

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app. Edit `app/page.tsx` to start building your UI; the page updates automatically as you save changes.

## Scripts

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Starts the Next.js development server |
| `pnpm build`     | Creates an optimized production build |
| `pnpm start`     | Runs the Next.js production server    |
| `pnpm lint`      | Runs ESLint with the Next.js config   |
| `pnpm typecheck` | Validates TypeScript types            |

## Project Structure

```
app/            # App Router routes and layout
public/         # Static assets served at the root URL
next.config.ts  # Next.js configuration
pnpm-lock.yaml  # Dependency lockfile for reproducible installs
```

## Linting & Formatting

- ESLint is configured with the Next.js Core Web Vitals and TypeScript rules.
- Prettier enforces consistent formatting across the codebase (see [`.prettierrc.json`](./.prettierrc.json)).

## Deployment

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for guidance on deploying to Vercel or your preferred platform.
