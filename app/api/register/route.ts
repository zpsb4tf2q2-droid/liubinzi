import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'
import { apiHandler, createSuccessResponse } from '@/lib/api-handler'
import { ValidationError, ConflictError } from '@/lib/errors'
import { logInfo } from '@/lib/logger'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

async function handler(req: NextRequest) {
  const body = await req.json()
  const { name, email, password } = registerSchema.parse(body)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError("Email already in use", { email })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: name || null,
      email,
      hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
    }
  })

  logInfo("User registered successfully", { userId: user.id, email: user.email })

  return createSuccessResponse({ ok: true, user })
}

export const POST = apiHandler(handler)
