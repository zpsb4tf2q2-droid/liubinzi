import { PrismaClient } from '@prisma/client'
import { env } from './env'
import { logInfo } from './logger'

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  logInfo("Prisma client initialized in development mode")
}
