# Infrastructure Guide

This document explains the core infrastructure patterns used in this application, including environment management, logging, and error handling.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Logging](#logging)
- [Error Handling](#error-handling)
- [API Development](#api-development)

## Environment Variables

### Overview

We use [@t3-oss/env-nextjs](https://env.t3.gg/) with [Zod](https://zod.dev/) for type-safe environment variable validation. This ensures that all required environment variables are present at build/runtime and provides autocomplete for environment variables throughout the codebase.

### Configuration

Environment variables are defined in `lib/env.ts` and validated on application startup.

### Adding New Environment Variables

1. **Define the variable in `lib/env.ts`:**

```typescript
export const env = createEnv({
  server: {
    // Add server-side variables here
    MY_NEW_VAR: z.string().min(1),
  },
  client: {
    // Add client-side variables with NEXT_PUBLIC_ prefix
    // NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    MY_NEW_VAR: process.env.MY_NEW_VAR,
  },
})
```

2. **Add the variable to `.env.example` with documentation:**

```bash
# My New Variable
# Description of what this variable does
MY_NEW_VAR=default-value
```

3. **Add the variable to your local `.env` file** (not committed to git)

4. **Use the variable in your code:**

```typescript
import { env } from '@/lib/env'

const myVar = env.MY_NEW_VAR
```

### Environment Variable Types

- **Server-only variables**: Accessible only on the server (API routes, server components)
- **Client variables**: Must have `NEXT_PUBLIC_` prefix and are exposed to the browser

### Validation Rules

- `z.string()` - Required string
- `z.string().optional()` - Optional string
- `z.string().url()` - Must be a valid URL
- `z.string().email()` - Must be a valid email
- `z.enum(["a", "b"])` - Must be one of the specified values
- `z.string().default("value")` - Provides a default value

## Logging

### Overview

We use [Pino](https://getpino.io/) for structured logging. The logger automatically adapts based on the environment:

- **Server-side**: JSON-structured logs (with pretty-printing in development)
- **Client-side**: Browser console-friendly logs

### Basic Usage

```typescript
import { logInfo, logError, logWarn, logDebug } from '@/lib/logger'

// Simple log messages
logInfo("User logged in")
logError("Failed to save data")
logWarn("Deprecated API called")
logDebug("Debug information")

// Logs with context
logInfo("User created", { userId: "123", email: "user@example.com" })
logError("Database error", error, { query: "SELECT * FROM users" })
```

### Structured Logging

Always include relevant context in your logs:

```typescript
logInfo("Processing payment", {
  userId: user.id,
  amount: 99.99,
  currency: "USD",
  paymentMethod: "card"
})
```

### Context Logger

For consistent context across multiple log statements:

```typescript
import { createContextLogger } from '@/lib/logger'

const logger = createContextLogger({ 
  userId: user.id, 
  requestId: req.headers.get('x-request-id') 
})

logger.info("Processing request")
logger.error("Request failed", error)
// All logs will include userId and requestId
```

### Best Practices

1. **Use appropriate log levels:**
   - `debug`: Detailed diagnostic information (development only)
   - `info`: General informational messages
   - `warn`: Warning messages for potentially harmful situations
   - `error`: Error events that might still allow the app to continue

2. **Include context:** Always add relevant metadata to help with debugging

3. **Don't log sensitive data:** Avoid logging passwords, tokens, credit card numbers, etc.

4. **Use structured data:** Pass objects rather than concatenating strings

## Error Handling

### Custom Error Classes

We provide custom error classes in `lib/errors.ts` for consistent error handling:

```typescript
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError
} from '@/lib/errors'

// Usage examples
throw new ValidationError("Invalid email format", { email })
throw new NotFoundError("User not found", { userId })
throw new ConflictError("Email already exists", { email })
```

### Error Properties

Each error includes:
- `message`: Human-readable error message
- `statusCode`: HTTP status code
- `isOperational`: Whether the error is expected/recoverable
- `context`: Additional context data (optional)

### Client-Side Error Boundaries

The root error boundary (`app/error.tsx`) catches errors in React components:

```tsx
// This error will be caught by the error boundary
function MyComponent() {
  throw new Error("Something went wrong!")
}
```

Error boundaries display:
- Friendly error message to users
- Detailed error info in development mode
- Options to retry or return home

### Not Found Pages

The `app/not-found.tsx` page is displayed for 404 errors. You can trigger it manually:

```typescript
import { notFound } from 'next/navigation'

if (!user) {
  notFound()
}
```

## API Development

### API Handler Wrapper

Use `apiHandler` to wrap your API routes for automatic error handling and logging:

```typescript
import { NextRequest } from 'next/server'
import { apiHandler, createSuccessResponse } from '@/lib/api-handler'
import { ValidationError } from '@/lib/errors'
import { z } from 'zod'

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

async function handler(req: NextRequest) {
  const body = await req.json()
  const data = requestSchema.parse(body) // Automatic validation
  
  // Your logic here
  const result = await doSomething(data)
  
  return createSuccessResponse(result)
}

export const POST = apiHandler(handler)
```

### Benefits of API Handler

- **Automatic error logging**: All errors are logged with context
- **Consistent error responses**: Errors are formatted consistently
- **Request/response logging**: All API calls are logged
- **Zod integration**: Validation errors are handled automatically

### Error Response Format

All API errors follow this format:

```json
{
  "error": "ValidationError",
  "message": "Request validation failed",
  "details": { ... },
  "statusCode": 400
}
```

### Creating API Responses

```typescript
import { createSuccessResponse, createErrorResponse } from '@/lib/api-handler'

// Success response
return createSuccessResponse({ data: "value" }, 200)

// Error response (use custom errors instead when possible)
return createErrorResponse("Something went wrong", 500)
```

### Validation with Zod

Define schemas for request validation:

```typescript
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
  role: z.enum(["user", "admin"]).default("user"),
})

// Parse and validate
const validatedData = createUserSchema.parse(body)
```

### Example: Complete API Route

```typescript
import { NextRequest } from 'next/server'
import { apiHandler, createSuccessResponse } from '@/lib/api-handler'
import { NotFoundError, ConflictError } from '@/lib/errors'
import { logInfo } from '@/lib/logger'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
})

async function handler(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const userId = context.params.id
  const body = await req.json()
  const data = updateUserSchema.parse(body)

  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!existingUser) {
    throw new NotFoundError("User not found", { userId })
  }

  if (data.email) {
    const emailTaken = await prisma.user.findFirst({
      where: { 
        email: data.email,
        id: { not: userId }
      }
    })
    
    if (emailTaken) {
      throw new ConflictError("Email already in use", { email: data.email })
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  })

  logInfo("User updated", { userId, changes: data })

  return createSuccessResponse(updatedUser)
}

export const PATCH = apiHandler(handler)
```

## Example: Health Check Endpoint

See `app/api/health/route.ts` for a complete example that demonstrates:
- API handler wrapper
- Logger usage
- Environment variable access
- Success response creation

You can test it:
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "environment": "development",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Best Practices Summary

1. **Always validate environment variables** in `lib/env.ts`
2. **Use structured logging** with appropriate context
3. **Throw custom errors** instead of generic Error instances
4. **Wrap API routes** with `apiHandler` for consistent error handling
5. **Validate input** using Zod schemas
6. **Log important events** (authentication, data changes, errors)
7. **Don't log sensitive data** (passwords, tokens, etc.)
8. **Use error boundaries** to catch and display React errors
9. **Test error scenarios** to ensure proper handling
10. **Document new patterns** in this file for team consistency
