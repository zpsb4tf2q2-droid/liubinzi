# Next.js 14 Application

A modern Next.js 14 application built with TypeScript, App Router, and Tailwind CSS.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20.19.5 or later (see `.nvmrc`)
- **pnpm**: v8.15.0 or later

### Installing pnpm

If you don't have pnpm installed, you can install it globally:

```bash
npm install -g pnpm
```

Or use corepack (comes with Node.js 16.13+):

```bash
corepack enable
corepack prepare pnpm@8.15.0 --activate
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

- `pnpm dev` - Start the development server on http://localhost:3000
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server (requires `pnpm build` first)
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm typecheck` - Run TypeScript type checking

## Project Structure

```
├── public/              # Static assets
├── src/
│   ├── app/            # App Router pages and layouts
│   │   ├── globals.css # Global styles
│   │   ├── layout.tsx  # Root layout
│   │   └── page.tsx    # Home page
│   ├── components/     # Reusable React components
│   └── lib/            # Utility functions and libraries
├── .nvmrc              # Node version specification
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── pnpm-lock.yaml      # Lockfile for pnpm
├── tailwind.config.ts  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Development Guidelines

### Path Aliases

This project uses path aliases configured in `tsconfig.json`:

- `@/*` maps to `src/*`

Example:

```typescript
import { MyComponent } from '@/components/MyComponent'
import { myUtil } from '@/lib/utils'
```

### Code Quality

The project uses:

- **ESLint** for code linting
- **TypeScript** for type checking

Run `pnpm lint` and `pnpm typecheck` before committing your changes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub Repository](https://github.com/vercel/next.js/)

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## License

This project is private and proprietary.
