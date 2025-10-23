# Next.js + TypeScript + Tailwind Scaffold

This repository contains a minimal Next.js App Router project configured with TypeScript, Tailwind CSS, ESLint, and Prettier. It provides a clean starting point for new services and front-end applications.

## Prerequisites

- Node.js 18 or later

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Run the production server. |
| `npm run lint` | Lint the project using the Next.js ESLint configuration. |
| `npm run format` | Format the codebase with Prettier. |

## Health Check

A simple health-check endpoint is available at `GET /api/healthz` and responds with:

```json
{
  "status": "ok"
}
```

## Project Structure

```
app/
  api/
    healthz/
      route.ts    # Health check endpoint
  globals.css      # Tailwind CSS entrypoint
  layout.tsx       # Root layout
  page.tsx         # Home page with Tailwind-styled hero
public/             # Static assets
```

Feel free to extend this scaffold with additional routes, components, and tooling as your project grows.
