export const PASSWORD_MIN_LENGTH = 6
export const BCRYPT_SALT_ROUNDS = 10

export const AUTH_PAGES = {
  SIGN_IN: '/login',
  SIGN_UP: '/register',
  DASHBOARD: '/dashboard',
} as const

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_IN_USE: 'Email already in use',
  VALIDATION_FAILED: 'Validation failed',
  REGISTRATION_FAILED: 'Failed to register',
  UNAUTHORIZED: 'Unauthorized',
} as const
