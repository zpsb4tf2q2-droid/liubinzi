# NextAuth + Prisma + PostgreSQL

A Next.js application with authentication using NextAuth.js, Prisma ORM, and PostgreSQL database.

## Features

- 🔐 Authentication with NextAuth.js
- 🗄️ PostgreSQL database with Prisma ORM
- 👤 User management with email/password
- 🐙 GitHub OAuth integration
- 🚀 Modern Next.js 14 with App Router
- 🎨 Tailwind CSS styling

## Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn
- PostgreSQL (local or Docker)

## Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd nextauth-prisma-credentials-github
pnpm install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d postgres
```

This will start a PostgreSQL instance on `localhost:5432` with:
- Database: `nextauth_db`
- User: `postgres`
- Password: `postgres`

#### Option B: Local PostgreSQL

If you have PostgreSQL installed locally, create a database:

```sql
CREATE DATABASE nextauth_db;
```

### 3. Environment Variables

Copy the example environment file and configure your variables:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-string-here

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextauth_db?schema=public

# GitHub OAuth (optional)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret
```

> **Note:** Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

### 4. Database Migrations

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
pnpm db:generate

# Run initial migration
pnpm db:migrate
```

### 5. Seed Database (Optional)

Seed the database with sample users for testing:

```bash
pnpm db:seed
```

This creates two users:
- `demo@example.com` with password `password123`
- `admin@example.com` with password `admin123`

### 6. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Available Scripts

- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate` - Create and apply database migrations
- `pnpm db:seed` - Seed database with sample data

### Creating New Migrations

When you modify the Prisma schema, create a new migration:

```bash
pnpm prisma migrate dev --name <migration-name>
```

### Resetting Database

To reset the database and reapply all migrations:

```bash
pnpm prisma migrate reset
```

### Viewing Database

Use Prisma Studio to view and edit your data:

```bash
pnpm prisma studio
```

## Project Structure

```
├── app/                 # Next.js app router pages
├── components/          # React components
├── lib/                 # Utility functions and configurations
├── prisma/             # Prisma schema and seed files
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Database seeding script
├── types/              # TypeScript type definitions
├── docker-compose.yaml # Docker configuration for PostgreSQL
└── scripts/            # Database initialization scripts
```

## Authentication

This application supports:
- **Credentials Provider**: Email and password authentication
- **GitHub Provider**: OAuth authentication via GitHub

### User Model

The User model includes:
- Basic fields: `id`, `email`, `name`, `emailVerified`
- Authentication: `hashedPassword` for credentials provider
- Profile: `image` for avatar
- Timestamps: `createdAt`, `updatedAt`

## Development

### Code Style

This project uses:
- TypeScript for type safety
- ESLint for code linting
- Tailwind CSS for styling

### Environment Variables

All required environment variables are documented in `.env.example`. Make sure to copy and configure them before running the application.

## Production Deployment

1. Set up a production PostgreSQL database
2. Configure all environment variables
3. Run database migrations: `pnpm db:migrate`
4. Build the application: `pnpm build`
5. Start the production server: `pnpm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
