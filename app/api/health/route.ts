import { NextRequest } from 'next/server'
import { apiHandler, createSuccessResponse } from '@/lib/api-handler'
import { logInfo } from '@/lib/logger'
import { env } from '@/lib/env'

async function handler(req: NextRequest) {
  logInfo("Health check requested", { 
    url: req.url,
    method: req.method 
  })

  return createSuccessResponse({
    status: "healthy",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}

export const GET = apiHandler(handler)
