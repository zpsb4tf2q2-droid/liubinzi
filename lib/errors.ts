export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly context?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.context = context
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed", context?: Record<string, any>) {
    super(message, 400, true, context)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication failed", context?: Record<string, any>) {
    super(message, 401, true, context)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", context?: Record<string, any>) {
    super(message, 403, true, context)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found", context?: Record<string, any>) {
    super(message, 404, true, context)
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict", context?: Record<string, any>) {
    super(message, 409, true, context)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database operation failed", context?: Record<string, any>) {
    super(message, 500, false, context)
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = "External service unavailable", context?: Record<string, any>) {
    super(message, 503, true, context)
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
