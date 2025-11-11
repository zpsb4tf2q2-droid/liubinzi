# Authentication Implementation Guide

## Overview

This application uses **Supabase Auth** for user authentication with Next.js 14 App Router. The implementation includes:

- Email/password authentication
- Automatic profile creation on registration
- Protected routes via middleware
- Server-side session validation
- Secure sign-out functionality

## Architecture

### Components

1. **Supabase Clients** (`/lib/supabase/`)
   - `client.ts` - Browser-side client for client components
   - `server.ts` - Server-side client for server components
   - `middleware.ts` - Middleware client with route protection

2. **Auth Actions** (`/lib/actions/auth.ts`)
   - `signIn(email, password, callbackUrl?)` - User login
   - `signUp(email, password, name?)` - User registration
   - `signOut()` - User logout

3. **UI Components** (`/components/`)
   - `LoginForm.tsx` - Login form with validation
   - `RegisterForm.tsx` - Registration form with profile creation
   - `Navigation.tsx` - Auth-aware navigation header

4. **Pages** (`/app/`)
   - `/login` - Login page
   - `/register` - Registration page
   - `/dashboard` - Protected user dashboard
   - `/analytics` - Protected analytics page

## Database Schema

### Profiles Table

The `profiles` table stores user profile information:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Auto-Profile Creation

A database trigger automatically creates a profile when a user signs up:

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Authentication Flow

### Registration Flow

1. User fills out registration form (`/register`)
2. Client-side validation checks:
   - Email is provided
   - Password is at least 6 characters
3. Form calls `signUp()` server action
4. Server action:
   - Creates user via `supabase.auth.signUp()`
   - Passes name in user metadata
   - Database trigger creates profile row
5. User is redirected to `/dashboard`

### Login Flow

1. User fills out login form (`/login`)
2. Client-side validation checks:
   - Email and password provided
3. Form calls `signIn()` server action with optional callback URL
4. Server action:
   - Authenticates via `supabase.auth.signInWithPassword()`
   - Revalidates layout cache
5. User is redirected to callback URL or `/dashboard`

### Sign Out Flow

1. User clicks "Sign out" in navigation
2. `signOut()` server action is called
3. Server action:
   - Calls `supabase.auth.signOut()`
   - Revalidates layout cache
4. User is redirected to homepage

## Middleware Protection

The middleware (`/lib/supabase/middleware.ts`) provides automatic route protection:

### Protected Routes

Routes requiring authentication:
- `/dashboard/*` - User dashboard
- `/analytics/*` - Analytics pages

Unauthenticated users are redirected to `/login?callbackUrl=/original-path`

### Auth Page Redirects

Authenticated users accessing auth pages are automatically redirected:
- `/login` → `/dashboard`
- `/register` → `/dashboard`

### Session Refresh

Middleware automatically refreshes the user session on every request using `supabase.auth.getUser()`.

## Security Features

### Row Level Security (RLS)

Profiles table has RLS policies:

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Authenticated users can read all profiles (for author names)
CREATE POLICY "Authenticated users can read all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Server-Side Validation

- All auth operations use server actions (not client-side)
- Session validation occurs server-side
- Sensitive operations use `createServerSupabaseClient()`

### Error Handling

- Auth errors are caught and displayed to users
- Generic error messages prevent information leakage
- NEXT_REDIRECT errors are properly handled

## Usage Examples

### Protecting a Page

```typescript
// app/my-protected-page/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div>Protected content for {user.email}</div>
}
```

### Getting Current User in Client Component

```typescript
'use client'

import { createClientSupabaseClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  return <div>{user?.email}</div>
}
```

### Getting Current User in Server Component

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <div>{user?.email}</div>
}
```

## Testing

Auth tests are located in `/lib/actions/__tests__/auth.test.ts`:

- Login with valid credentials
- Login with invalid credentials
- Registration with valid data
- Registration with duplicate email
- Sign out functionality
- Callback URL handling

Run tests:

```bash
npm test
```

## Configuration

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Dashboard Setup

1. **Enable Email Provider**:
   - Go to Authentication → Providers
   - Enable "Email" provider

2. **Configure Site URL**:
   - Go to Authentication → URL Configuration
   - Set Site URL to your production domain
   - Add redirect URLs for local development

3. **Email Templates** (Optional):
   - Go to Authentication → Email Templates
   - Customize confirmation and password reset emails

## Troubleshooting

### "User already registered" error

- Email is already in use
- Check if user exists in Supabase dashboard
- Try password reset if forgotten

### Profile not created after signup

- Check database trigger is active
- Verify profiles table exists
- Check Supabase logs for errors

### Redirects not working

- Verify middleware is running (check `middleware.ts`)
- Check browser network tab for redirect responses
- Ensure environment variables are set

### Session not persisting

- Check cookies are enabled in browser
- Verify middleware is refreshing sessions
- Check for CORS issues if using custom domain

## Best Practices

1. **Always validate server-side**: Never trust client-side validation alone
2. **Use server actions**: Keep auth logic on the server
3. **Handle errors gracefully**: Display user-friendly error messages
4. **Revalidate after mutations**: Use `revalidatePath()` after auth changes
5. **Protect sensitive routes**: Use middleware for route-level protection
6. **Keep service role key secret**: Never expose it client-side
7. **Use RLS policies**: Always enable RLS on user-related tables

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
