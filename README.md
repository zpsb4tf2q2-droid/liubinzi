# NextAuth + Prisma Credentials & GitHub OAuth Demo

A Next.js application demonstrating authentication with NextAuth.js using Prisma adapter, supporting both credentials-based and GitHub OAuth authentication methods.

## Prerequisites

- Node.js 18+ (Node.js 20.x recommended)
- pnpm 10+

## Getting Started

### Installation

```bash
# Install dependencies using pnpm
pnpm install
```

### Environment Setup

Create a `.env.local` file in the project root using `.env.example` as a reference:

```bash
cp .env.example .env.local
```

Configure your environment variables:

- Database connection string (for SQLite or PostgreSQL)
- NextAuth secret
- GitHub OAuth credentials (ID and secret)

### Development

```bash
# Start the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

### Database

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
```

## Development Tooling

This project uses a comprehensive tooling setup to maintain code quality and consistency.

### Linting

ESLint is configured with TypeScript and Prettier integration for code quality checks.

```bash
# Run ESLint
pnpm lint

# Fix linting errors automatically
pnpm lint:fix
```

### Code Formatting

Prettier is configured for consistent code formatting across the project.

```bash
# Format all code files
pnpm format

# Check if code is already formatted
pnpm format:check
```

### Type Checking

TypeScript strict mode is enabled for type safety.

```bash
# Run TypeScript type checks
pnpm typecheck
```

### Building

Build the Next.js application for production.

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## Pre-commit Hooks

This project uses Husky and lint-staged to automatically run linting and formatting on staged files before commits.

The pre-commit hook ensures:

- ESLint runs on staged TypeScript and JavaScript files
- Prettier formats staged code files
- Only properly formatted and linted code is committed

If you need to bypass these checks (not recommended), use:

```bash
git commit --no-verify
```

## CI/CD Pipeline

A GitHub Actions workflow is configured to automatically run quality checks on push and pull requests.

The CI pipeline runs the following checks:

1. Dependencies installation with pnpm
2. Prisma Client generation
3. ESLint for code quality
4. TypeScript type checking
5. Prettier formatting check
6. Next.js build verification

The workflow runs on:

- All pushes to `main` and `develop` branches
- All pull requests targeting `main` and `develop` branches
- Node.js versions: 18.x and 20.x

### Viewing CI Results

CI results are displayed in pull requests and commit status checks. Failed checks must be resolved before merging.

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable React components
- `/lib` - Utility functions and configurations
- `/types` - TypeScript type definitions
- `/prisma` - Prisma schema and migrations
- `.github/workflows` - GitHub Actions CI configuration

## Configuration Files

- `tsconfig.json` - TypeScript configuration with strict type checking
- `eslint.config.js` - ESLint configuration with TypeScript and Prettier integration
- `.prettierrc.json` - Prettier formatting configuration
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration

## Contributing

When contributing to this project:

1. Create a feature branch from `develop`
2. Run `pnpm install` to ensure all dependencies are up to date
3. Make your changes
4. Ensure all checks pass:
   ```bash
   pnpm lint
   pnpm format:check
   pnpm typecheck
   pnpm build
   ```
5. Commit your changes (pre-commit hooks will automatically lint and format)
6. Push to your branch and create a pull request

## License

This project is private and proprietary.
