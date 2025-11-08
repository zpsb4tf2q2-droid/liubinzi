# NextAuth.js + Prisma Authentication System

A complete authentication scaffold built with Next.js 14, NextAuth.js, Prisma, and PostgreSQL. This project implements a secure authentication flow with email/password credentials and optional GitHub OAuth.

## Features

- 🔐 **Secure Authentication**: Email/password registration and login with bcrypt hashing
- 🎫 **Session Management**: JWT-based sessions with NextAuth.js
- 🗄️ **Database Integration**: Prisma ORM with PostgreSQL
- 🔒 **Protected Routes**: Server-side and middleware-based route protection
- 📝 **Input Validation**: Zod schema validation for all inputs
- 📊 **Logging**: Structured logging for authentication events
- 🌐 **OAuth Support**: Optional GitHub OAuth integration
- ⚡ **Type Safety**: Full TypeScript support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth.js v4
- **Database**: PostgreSQL with Prisma ORM
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the required variables:

```env
# REQUIRED: Your app URL
NEXTAUTH_URL=http://localhost:3000

# REQUIRED: Generate a secure secret (minimum 32 characters)
# Use: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-here

# REQUIRED: PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/dbname?schema=public
```

**Important**: Never commit your `.env` file. The `NEXTAUTH_SECRET` should be at least 32 characters long.

### 3. Database Setup

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
npx prisma generate
```

This creates the following tables:
- `User` - User accounts with hashed passwords
- `Account` - OAuth provider accounts
- `Session` - Active user sessions
- `VerificationToken` - Email verification tokens

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Authentication Flow

### Registration Flow

1. User submits email, password (and optional name) via `/register` page
2. Input is validated using Zod schema (email format, password length)
3. System checks if email already exists
4. Password is hashed using bcrypt (salt rounds: 10)
5. User record is created in database
6. User is automatically signed in and redirected to dashboard

### Login Flow

1. User submits email and password via `/login` page
2. NextAuth credentials provider validates input
3. User record is fetched from database
4. Password is compared with stored hash using bcrypt
5. On success, JWT token is issued and session is created
6. User is redirected to dashboard (or callback URL)

### Session Management

- Sessions use JWT strategy (stored in secure HTTP-only cookies)
- JWT includes user ID for database lookups
- Session data includes: `id`, `name`, `email`, `image`
- Tokens are automatically refreshed on each request

### Logout Flow

1. User clicks "Sign out" button
2. NextAuth `signOut()` is called
3. Session token is cleared
4. User is redirected to login page

### Protected Routes

Routes are protected at two levels:

**1. Middleware Protection** (`middleware.ts`)
- Blocks unauthenticated access to `/dashboard/*`
- Redirects authenticated users away from `/login` and `/register`
- Preserves callback URL for post-login redirect

**2. Server Component Protection**
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  // Protected content here
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts  # NextAuth API routes
│   │   └── register/route.ts           # Registration endpoint
│   ├── (auth)/
│   │   ├── login/page.tsx              # Login page
│   │   └── register/page.tsx           # Registration page
│   ├── dashboard/page.tsx              # Protected dashboard
│   ├── layout.tsx                      # Root layout with SessionProvider
│   └── page.tsx                        # Homepage
├── components/
│   ├── LoginForm.tsx                   # Login form (client component)
│   ├── RegisterForm.tsx                # Registration form (client component)
│   ├── SignOutButton.tsx               # Sign out button
│   └── Providers.tsx                   # SessionProvider wrapper
├── lib/
│   ├── auth.ts                         # NextAuth configuration
│   ├── prisma.ts                       # Prisma client singleton
│   ├── logger.ts                       # Logging utility
│   ├── env.ts                          # Environment validation
│   └── validations/
│       └── auth.ts                     # Zod validation schemas
├── prisma/
│   └── schema.prisma                   # Database schema
├── types/
│   └── next-auth.d.ts                  # NextAuth type extensions
└── middleware.ts                       # Route protection middleware
```

## API Endpoints

### POST `/api/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe" // optional
}
```

**Success Response (200):**
```json
{
  "ok": true
}
```

**Error Responses:**
- `400` - Validation failed or email already in use
- `500` - Server error

### POST `/api/auth/signin`

Sign in with credentials (handled by NextAuth).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### POST `/api/auth/signout`

Sign out current user (handled by NextAuth).

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | No | Environment mode | `development` |
| `NEXTAUTH_URL` | Yes | Application URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Secret for JWT encryption (min 32 chars) | Generate with `openssl rand -base64 32` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `GITHUB_ID` | No | GitHub OAuth Client ID | From GitHub Developer Settings |
| `GITHUB_SECRET` | No | GitHub OAuth Client Secret | From GitHub Developer Settings |

## Extending the System

### Adding a New OAuth Provider

1. Install the provider package (if needed)
2. Add provider credentials to `.env`:
   ```env
   GOOGLE_ID=your-client-id
   GOOGLE_SECRET=your-client-secret
   ```

3. Update `lib/auth.ts`:
   ```typescript
   import GoogleProvider from 'next-auth/providers/google'
   
   providers: [
     GoogleProvider({
       clientId: process.env.GOOGLE_ID!,
       clientSecret: process.env.GOOGLE_SECRET!
     }),
     // ... existing providers
   ]
   ```

### Adding Custom User Fields

1. Update Prisma schema:
   ```prisma
   model User {
     // ... existing fields
     role String @default("user")
   }
   ```

2. Run migration:
   ```bash
   npx prisma migrate dev --name add_user_role
   ```

3. Update NextAuth types in `types/next-auth.d.ts`:
   ```typescript
   interface Session {
     user: {
       id?: string
       role?: string
       // ... other fields
     }
   }
   ```

### Creating Protected API Routes

```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Protected logic here
  return NextResponse.json({ data: 'Protected data' })
}
```

## Security Best Practices

✅ **Implemented:**
- Passwords hashed with bcrypt (10 salt rounds)
- Secure HTTP-only cookies for sessions
- CSRF protection via NextAuth
- SQL injection prevention via Prisma
- Input validation with Zod
- Generic error messages (no user enumeration)

⚠️ **Recommendations for Production:**
- Use HTTPS in production (set `NEXTAUTH_URL` to `https://`)
- Rotate `NEXTAUTH_SECRET` regularly
- Implement rate limiting for auth endpoints
- Add email verification flow
- Implement password reset functionality
- Enable two-factor authentication (2FA)
- Set up monitoring and alerting for suspicious login attempts
- Use environment-specific database credentials

## Database Management

### View Data
```bash
npx prisma studio
```

### Create Migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

### Generate Prisma Client
```bash
npx prisma generate
```

## Logging

Authentication events are logged with structured data:

- **Registration attempts** - Records email (success/failure)
- **Login attempts** - Records email and outcome
- **Validation failures** - Records validation errors
- **System errors** - Records error messages

Logs include timestamps and context data. In development, logs are human-readable. In production, logs are JSON formatted for log aggregation tools.

## Testing

See [TESTING.md](./TESTING.md) for detailed testing instructions and manual test plan.

## Troubleshooting

### "Environment validation failed"
- Ensure all required environment variables are set in `.env`
- Verify `NEXTAUTH_SECRET` is at least 32 characters
- Check `DATABASE_URL` format is correct

### Database Connection Errors
- Verify PostgreSQL is running
- Check connection string in `DATABASE_URL`
- Ensure database exists: `createdb yourdbname`
- Run migrations: `npx prisma migrate dev`

### Session Issues
- Clear browser cookies
- Verify `NEXTAUTH_URL` matches your app URL
- Check `NEXTAUTH_SECRET` is set and consistent

### "Email already in use"
- Email addresses are unique
- Use different email or reset database

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
