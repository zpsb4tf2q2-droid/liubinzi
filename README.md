# Next.js Authentication App

A modern authentication application built with Next.js, NextAuth.js, Prisma, and TypeScript.

## Features

- 🔐 Authentication with NextAuth.js (Credentials + GitHub OAuth)
- 💾 Database integration with Prisma ORM
- 🛡️ Type-safe environment variables with Zod
- 📝 Structured logging with Pino
- 🚨 Comprehensive error handling with custom error classes
- 🎨 Styled with Tailwind CSS
- 📱 Responsive UI components

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or another database supported by Prisma)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:
- `DATABASE_URL`: Your database connection string
- `NEXTAUTH_SECRET`: Generate a random secret (e.g., `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for development)
- Optional: `GITHUB_ID` and `GITHUB_SECRET` for GitHub OAuth

4. Set up the database:

```bash
npm run prisma:migrate
npm run prisma:generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                   # Next.js App Router pages and API routes
│   ├── api/              # API route handlers
│   ├── dashboard/        # Protected dashboard page
│   ├── login/           # Login page
│   ├── register/        # Registration page
│   ├── error.tsx        # Root error boundary
│   └── not-found.tsx    # 404 page
├── components/           # React components
├── lib/                  # Utility libraries and infrastructure
│   ├── env.ts           # Environment variable validation
│   ├── logger.ts        # Logging utilities
│   ├── errors.ts        # Custom error classes
│   ├── api-handler.ts   # API route error handling
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── docs/                 # Documentation
│   ├── README.md        # Documentation index
│   └── INFRASTRUCTURE.md # Infrastructure guide
├── prisma/              # Prisma schema and migrations
└── types/               # TypeScript type definitions
```

## Documentation

Detailed documentation is available in the [`docs/`](./docs) directory:

- **[Infrastructure Guide](./docs/INFRASTRUCTURE.md)**: Learn about environment variables, logging, error handling, and API development patterns

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Logging**: [Pino](https://getpino.io/)
- **Environment Variables**: [@t3-oss/env-nextjs](https://env.t3.gg/)

## Contributing

1. Read the [Infrastructure Guide](./docs/INFRASTRUCTURE.md) to understand the codebase patterns
2. Follow the established patterns for environment variables, logging, and error handling
3. Write tests for new features
4. Update documentation when adding new patterns or features

## License

[Your License Here]
