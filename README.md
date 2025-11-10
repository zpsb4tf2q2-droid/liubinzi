# Next.js + Supabase Application

A modern web application built with Next.js 14.2.5 and Supabase, featuring a responsive design with Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14.2.5 (App Router)
- **Backend/Auth**: Supabase
- **Styling**: Tailwind CSS with plugins (@tailwindcss/forms, @tailwindcss/typography)
- **Language**: TypeScript

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account (sign up at [https://supabase.com](https://supabase.com))
- npm or yarn package manager

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

#### Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in your project details (name, database password, region)
4. Wait for the project to be set up (usually takes 1-2 minutes)

#### Get your Supabase credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL** (looks like `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

### 4. Configure environment variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: 
- Never commit `.env.local` to version control
- The `service_role` key has admin privileges - keep it secure and only use it server-side

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes (if needed)
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── LoginForm.tsx      # Login form component
│   └── RegisterForm.tsx   # Registration form component
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client configurations
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server component client
│   │   └── middleware.ts # Middleware helper
│   └── types.ts          # Shared TypeScript types
├── middleware.ts          # Next.js middleware for auth
└── .env.example          # Environment variables template
```

## Supabase Helpers

The project includes pre-configured Supabase client helpers:

### Client Component Usage

For client components (marked with `"use client"`):

```typescript
import { createClientSupabaseClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const supabase = createClientSupabaseClient()
  // Use supabase client...
}
```

### Server Component Usage

For server components:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createServerSupabaseClient()
  // Use supabase client...
}
```

### Middleware Usage

The middleware automatically handles session refresh. It's configured in `middleware.ts`.

## Setting Up Authentication

The authentication forms are currently placeholders. To implement full authentication:

1. **Enable Email/Password Auth in Supabase**:
   - Go to Authentication → Providers in your Supabase dashboard
   - Enable "Email" provider

2. **Implement Sign Up**:
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: 'user@example.com',
     password: 'password123',
   })
   ```

3. **Implement Sign In**:
   ```typescript
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password123',
   })
   ```

4. **Implement Sign Out**:
   ```typescript
   const { error } = await supabase.auth.signOut()
   ```

5. **Get Current User**:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   ```

## Using Supabase CLI (Optional)

For local development with database migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Generate TypeScript types from your database
supabase gen types typescript --linked > lib/database.types.ts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Next Steps

1. Set up your Supabase database schema
2. Implement authentication logic in the login/register forms
3. Add protected routes using the middleware
4. Create your database tables and APIs
5. Build out your application features

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Support

For issues or questions:
- Next.js: [GitHub Issues](https://github.com/vercel/next.js/issues)
- Supabase: [GitHub Discussions](https://github.com/supabase/supabase/discussions)
