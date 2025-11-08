import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { registerSchema } from '@/lib/validations/auth'
import { errorResponse, successResponse, validationErrorResponse } from '@/lib/api-response'
import { AUTH_ERRORS, BCRYPT_SALT_ROUNDS } from '@/lib/constants'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const validatedData = registerSchema.parse(body)
    const { name, email, password } = validatedData

    logger.info('User registration attempt', { email })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      logger.warn('Registration failed: email already in use', { email })
      return errorResponse(AUTH_ERRORS.EMAIL_IN_USE, 400)
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        hashedPassword,
      }
    })

    logger.info('User registered successfully', { userId: user.id, email })

    return successResponse({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      const validationErrors = err.issues || []
      logger.warn('Registration validation failed', { errors: validationErrors })
      return validationErrorResponse(validationErrors)
    }

    logger.error('Registration failed', { error: err instanceof Error ? err.message : 'Unknown error' })
    return errorResponse(AUTH_ERRORS.REGISTRATION_FAILED, 500)
  }
}
